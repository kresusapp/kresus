"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testing = exports.ofxToKresus = exports.parseOfxDate = void 0;
const ofxConverter = __importStar(require("ofx"));
const helpers_1 = require("../helpers");
const manual_1 = require("../providers/manual");
const log = (0, helpers_1.makeLogger)('controllers/ofx');
const accountsTypesMap = {
    CHECKING: 'account-type.checking',
    SAVINGS: 'account-type.savings',
    CREDITLINE: 'account-type.loan',
    MONEYMRKT: 'account-type.unknown',
    CD: 'account-type.unknown', // certificate of deposit
};
const transactionsTypesMap = {
    CREDIT: 'type.card',
    DEBIT: 'type.card',
    INT: 'type.bankfee',
    DIV: 'type.bankfee',
    FEE: 'type.bankfee',
    SRVCHG: 'type.bankfee',
    DEP: 'type.cash_deposit',
    ATM: 'type.withdrawal',
    POS: 'type.card',
    XFER: 'type.transfer',
    CHECK: 'type.check',
    PAYMENT: 'type.card',
    CASH: 'type.withdrawal',
    DIRECTDEP: 'type.withdrawal',
    DIRECTDEBIT: 'type.cash_deposit',
    REPEATPMT: 'type.card',
    OTHER: 'type.unknown',
    HOLD: 'type.unknown',
};
// Parse an OFX DateTimeType value and returns a Date. This relies on Date.parse to check invalid
// date values.
function parseOfxDate(date) {
    if (typeof date !== 'string') {
        return null;
    }
    // See OFX_Common.xsd in https://www.ofx.net/downloads/OFX%202.2.0%20schema.zip
    // eslint-disable-next-line max-len
    const parsedDate = /(\d{4})(\d{2})(\d{2})(?:(\d{2})(\d{2})(\d{2}))?(?:\.(\d{3}))?(?:\[([-+]?\d{1,2}):\w{3}\])?/.exec(date);
    if (!parsedDate) {
        return null;
    }
    // The first line refers to the whole string
    const [, year, month, day, hours = '00', minutes = '00', seconds = '00', milliseconds = '000', timezoneOffset = 'Z',] = parsedDate;
    let normalizedTimezoneOffset = timezoneOffset;
    if (timezoneOffset !== 'Z') {
        const parsedTimezoneOffset = parseInt(timezoneOffset, 10);
        if (parsedTimezoneOffset < -12 || parsedTimezoneOffset > 14) {
            return null;
        }
        const timezoneOffsetFirstChar = timezoneOffset[0];
        if (timezoneOffsetFirstChar === '+' || timezoneOffsetFirstChar === '-') {
            if (timezoneOffset.length === 2) {
                normalizedTimezoneOffset = `${timezoneOffsetFirstChar}0${timezoneOffset[1]}`;
            }
        }
        else {
            if (timezoneOffset.length === 1) {
                normalizedTimezoneOffset = `0${timezoneOffset}`;
            }
            normalizedTimezoneOffset = `+${normalizedTimezoneOffset}`;
        }
        normalizedTimezoneOffset = `${normalizedTimezoneOffset}:00`;
    }
    // Transform it to a parsable ISO string and then to a timestamp to assure its validity.
    const timestamp = Date.parse(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${normalizedTimezoneOffset}`);
    if (!isNaN(timestamp)) {
        return new Date(timestamp);
    }
    return null;
}
exports.parseOfxDate = parseOfxDate;
function ofxToKresus(ofx) {
    // See http://www.ofx.net/downloads/OFX%202.2.pdf.
    let data = null;
    try {
        data = ofxConverter.parse(ofx);
        if (data === null) {
            throw 'invalid';
        }
        data = data.OFX.BANKMSGSRSV1.STMTTRNRS;
    }
    catch (err) {
        throw new helpers_1.KError('Invalid OFX file.');
    }
    (0, helpers_1.assert)(data !== null, 'data must be non null');
    // If there is only one account it is an object, else an array of object.
    if (!(data instanceof Array)) {
        data = [data];
    }
    else if (!data.length) {
        return null;
    }
    let accountId = 0;
    const accounts = [];
    let transactions = [];
    for (let account of data) {
        account = account.STMTRS;
        if (!account) {
            throw new helpers_1.KError('Cannot find state response message in OFX file.');
        }
        const currencyCode = account.CURDEF;
        if (!currencyCode) {
            throw new helpers_1.KError('Cannot find currency code in OFX file.');
        }
        const accountInfo = account.BANKACCTFROM;
        const vendorAccountId = accountInfo.ACCTID;
        if (!vendorAccountId) {
            throw new helpers_1.KError('Cannot find account id in OFX file.');
        }
        const accountType = accountsTypesMap[accountInfo.ACCTTYPE] || 'account-type.unknown';
        const balance = parseFloat(account.AVAILBAL.BALAMT) || 0;
        let accountTransactions = account.BANKTRANLIST.STMTTRN;
        if (!(accountTransactions instanceof Array)) {
            accountTransactions = [accountTransactions];
        }
        if (accountTransactions.length) {
            let oldestTransactionDate = Date.now();
            const dateNow = new Date();
            transactions = transactions.concat(accountTransactions
                // eslint-disable-next-line no-loop-func
                .map((transaction) => {
                const debitDate = parseOfxDate(transaction.DTPOSTED);
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
                    type: transactionsTypesMap[transaction.TRNTYPE] ||
                        transactionsTypesMap.OTHER,
                };
            })
                .filter((transaction) => transaction !== null &&
                typeof transaction.amount !== 'undefined' &&
                !isNaN(transaction.amount)));
            accounts.push({
                id: accountId,
                vendorAccountId,
                accessId: 0,
                type: accountType,
                initialBalance: balance,
                currency: currencyCode,
                importDate: new Date(oldestTransactionDate),
                label: `OFX imported account - ${accountInfo.ACCTTYPE}`,
            });
        }
        ++accountId;
    }
    return {
        accesses: [
            {
                id: 0,
                vendorId: manual_1.SOURCE_NAME,
                login: '',
            },
        ],
        accounts,
        transactions,
    };
}
exports.ofxToKresus = ofxToKresus;
exports.testing = {
    parseOfxDate,
};
