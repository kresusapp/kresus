import {module as americano} from '../db';

let BankAccess = americano.getModel('bankaccess', {
    bank: String,
    login: String,
    password: String,
    website: String
});

BankAccess.all = function(callback) {
    BankAccess.request("all", callback);
}

BankAccess.allFromBank = function(bank, callback) {
    let params = {
        key: bank.uuid
    };
    BankAccess.request("allByBank", params, callback);
}

BankAccess.allLike = function(access, callback) {
    let params = {
        key: [access.bank, access.login, access.password]
    };
    BankAccess.request("allLike", params, callback);
}

export default BankAccess;

