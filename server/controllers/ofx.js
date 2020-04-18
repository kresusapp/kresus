import * as ofxConverter from 'ofx';

import { KError, makeLogger } from '../helpers';

let log = makeLogger('controllers/ofx');

const accountsTypesMap = {
    CHECKING: 'account-type.checking',
    SAVINGS: 'account-type.savings',
    CREDITLINE: 'account-type.loan', // line of credit
    MONEYMRKT: 'account-type.unknown', // money market
    CD: 'account-type.unknown' // certificate of deposit
};

const transactionsTypesMap = {
    CREDIT: 'type.card',
    DEBIT: 'type.card',
    INT: 'type.bankfee', // Interest earned or paid (depends on signage of amount)
    DIV: 'type.bankfee', // Dividend
    FEE: 'type.bankfee',
    SRVCHG: 'type.bankfee',
    DEP: 'type.cash_deposit',
    ATM: 'type.withdrawal', // ATM debit or credit (depends on signage of amount)
    POS: 'type.card', // Point of sale debit or credit (depends on signage of amount)
    XFER: 'type.transfer',
    CHECK: 'type.check',
    PAYMENT: 'type.card',
    CASH: 'type.withdrawal', // Actually an electronic payment
    DIRECTDEP: 'type.withdrawal',
    DIRECTDEBIT: 'type.cash_deposit',
    REPEATPMT: 'type.card', // Repeating payment/standing order
    OTHER: 'type.unknown',
    HOLD: 'type.unknown'
};

// Parse an OFX DateTimeType value and returns a Date. This relies on Date.parse to check invalid
// date values.
export function parseOfxDate(date) {
    if (typeof date !== 'string') {
        return null;
    }
    // See OFX_Common.xsd in https://www.ofx.net/downloads/OFX%202.2.0%20schema.zip
    // eslint-disable-next-line max-len
    const parsedDate = /(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(\d{2}))?(?:\.(\d{3}))?(?:\[([-+]?\d{1,2}):\w{3}\])?/.exec(
        date
    );

    if (!parsedDate) {
        return null;
    }

    // The first line refers to the whole string
    let [
        ,
        year,
        month,
        day,
        hours = '00',
        minutes = '00',
        seconds = '00',
        milliseconds = '000',
        timezoneOffset = 'Z'
    ] = parsedDate;

    if (timezoneOffset !== 'Z') {
        const parsedTimezoneOffset = parseInt(timezoneOffset, 10);
        if (parsedTimezoneOffset < -12 || parsedTimezoneOffset > 14) {
            return null;
        }

        const timezoneOffsetFirstChar = timezoneOffset[0];
        if (timezoneOffsetFirstChar === '+' || timezoneOffsetFirstChar === '-') {
            if (timezoneOffset.length === 2) {
                timezoneOffset = `${timezoneOffsetFirstChar}0${timezoneOffset[1]}`;
            }
        } else {
            if (timezoneOffset.length === 1) {
                timezoneOffset = `0${timezoneOffset}`;
            }

            timezoneOffset = `+${timezoneOffset}`;
        }

        timezoneOffset = `${timezoneOffset}:00`;
    }

    // Transform it to a parsable ISO string and then to a timestamp to assure its validity.
    const timestamp = Date.parse(
        `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${timezoneOffset}`
    );
    if (!isNaN(timestamp)) {
        return new Date(timestamp);
    }

    return null;
}

export function ofxToKresus(ofx) {
    // See http://www.ofx.net/downloads/OFX%202.2.pdf.
    let data = null;
    try {
        data = ofxConverter.parse(ofx);
        data = data.OFX.BANKMSGSRSV1.STMTTRNRS;
    } catch (err) {
        throw new KError('Invalid OFX file.');
    }

    // If there is only one account it is an object, else an array of object.
    if (!(data instanceof Array)) {
        data = [data];
    } else if (!data.length) {
        return null;
    }

    let accountId = 0;
    let accounts = [];
    let transactions = [];

    for (let account of data) {
        account = account.STMTRS;
        if (!account) {
            throw new KError('Cannot find state response message in OFX file.');
        }

        let currencyCode = account.CURDEF;
        if (!currencyCode) {
            throw new KError('Cannot find currency code in OFX file.');
        }

        let accountInfo = account.BANKACCTFROM;

        let vendorAccountId = accountInfo.ACCTID;
        if (!vendorAccountId) {
            throw new KError('Cannot find account id in OFX file.');
        }

        let accountType = accountsTypesMap[accountInfo.ACCTTYPE] || 'account-type.unknown';

        let balance = parseFloat(account.AVAILBAL.BALAMT) || 0;

        let accountTransactions = account.BANKTRANLIST.STMTTRN;
        if (!(accountTransactions instanceof Array)) {
            accountTransactions = [accountTransactions];
        }

        if (accountTransactions.length) {
            let oldestTransactionDate = Date.now();
            let dateNow = new Date();

            transactions = transactions.concat(
                accountTransactions
                    // eslint-disable-next-line no-loop-func
                    .map(transaction => {
                        let debitDate = parseOfxDate(transaction.DTPOSTED);
                        let realizationDate = parseOfxDate(transaction.DTUSER);

                        if (!realizationDate) {
                            if (!debitDate) {
                                log.info('Transaction missing both date and debitDate, skipping');
                                return null;
                            }
                            realizationDate = debitDate;
                        }

                        oldestTransactionDate = Math.min(+realizationDate, oldestTransactionDate);

                        return {
                            accountId,
                            date: realizationDate,
                            debitDate,
                            importDate: dateNow,
                            rawLabel: transaction.NAME || transaction.MEMO,
                            label: transaction.MEMO || transaction.NAME,
                            amount: parseFloat(transaction.TRNAMT),
                            type:
                                transactionsTypesMap[transaction.TRNTYPE] ||
                                transactionsTypesMap.OTHER
                        };
                    })
                    .filter(transaction => transaction !== null && !isNaN(transaction.amount))
            );

            accounts.push({
                id: accountId,
                vendorId: 'manual',
                vendorAccountId,
                accessId: 0,
                type: accountType,
                initialBalance: balance,
                currency: currencyCode,
                importDate: new Date(oldestTransactionDate),
                label: `OFX imported account - ${accountInfo.ACCTTYPE}`
            });
        }

        ++accountId;
    }

    return {
        accesses: [
            {
                id: 0,
                vendorId: 'manual',
                login: ''
            }
        ],
        accounts,
        operations: transactions
    };
}

export const testing = {
    parseOfxDate
};
