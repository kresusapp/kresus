import * as ofxConverter from 'ofx';
import moment from 'moment';

import { KError } from '../../helpers';

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
            transactions = transactions.concat(
                accountTransactions
                    // eslint-disable-next-line no-loop-func
                    .map(transaction => {
                        let debitDate = transaction.DTPOSTED;
                        let realizationDate = transaction.DTUSER;

                        if (!realizationDate) {
                            realizationDate = debitDate;
                        }

                        return {
                            accountId,
                            date: moment(realizationDate).toISOString(),
                            debitDate: debitDate ? moment(debitDate).toISOString() : null,
                            rawLabel: transaction.NAME || transaction.MEMO,
                            label: transaction.MEMO || transaction.NAME,
                            amount: parseFloat(transaction.TRNAMT),
                            type:
                                transactionsTypesMap[transaction.TRNTYPE] ||
                                transactionsTypesMap.OTHER
                        };
                    })
                    .filter(transaction => !isNaN(transaction.amount))
            );

            accounts.push({
                id: accountId,
                vendorId: 'manual',
                vendorAccountId,
                accessId: 0,
                type: accountType,
                initialBalance: balance,
                currency: currencyCode,
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
