const DEBUG = true;
var ASSERTS = true;

/*
 * HELPERS
 */
function debug() {
    DEBUG && console.log.apply(console, arguments);
}

function assert(x, wat) {
    if (!x) {
        ASSERTS && alert('assertion error: ' + (wat?wat+'\n':'') + new Error().stack);
        return false;
    }
    return true;
}

function has(obj, prop) {
    return assert(obj.hasOwnProperty(prop));
}

/*
 * Templating
 */
var template = (function() {
    var rgx = /\$\{([a-zA-Z0-9]+)\}/;
    return function (context, str) {
        var ret = str;
        var match = null;
        assert(typeof context !== 'undefined', 'template context is undefined');
        while (match = ret.match(rgx)) {
            // The original str is also in the match array
            assert(match.length > 1, 'match is inconsistent');
            var key = match[1];
            assert(typeof context[key] !== 'undefined', 'missing key in template:' + key);
            ret = ret.replace('${' + key + '}', context[key]);
        }
        return ret;
    }
})();

/*
 * MODELS
 */
function Bank(arg) {
    this.id   = has(arg, 'id')   && arg.id;
    this.name = has(arg, 'name') && arg.name;
    this.uuid = has(arg, 'uuid') && arg.uuid;

    this.accounts = [];
}

Bank.prototype.addAccount = function(arg) {
    assert(arg instanceof Account);
    this.accounts.push(arg);
}

function Account(arg) {
    this.bank          = has(arg, 'bank') && arg.bank;
    this.bankAccess    = has(arg, 'bankAccess') && arg.bankAccess;
    this.title         = has(arg, 'title') && arg.title;
    this.accountNumber = has(arg, 'accountNumber') && arg.accountNumber;
    this.initialAmount = has(arg, 'initialAmount') && arg.initialAmount;
    this.lastChecked   = has(arg, 'lastChecked') && new Date(arg.lastChecked);
    this.id            = has(arg, 'id') && arg.id;
    this.amount        = has(arg, 'amount') && arg.amount;

    this.operations = [];
}

Account.prototype.addOperation = function(arg) {
    assert(arg instanceof Operation);
    this.operations.push(arg);
}

function Operation(arg) {
    this.bankAccount = has(arg, 'bankAccount') && arg.bankAccount;
    this.title       = has(arg, 'title') && arg.title;
    this.date        = has(arg, 'date') && new Date(arg.date);
    this.amount      = has(arg, 'amount') && arg.amount;
    this.raw         = has(arg, 'raw') && arg.raw;
    this.dateImport  = has(arg, 'dateImport') && new Date(arg.dateImport);
    this.id          = has(arg, 'id') && arg.id;
}

Operation.distance = function(a, b) {
    return a.amount - b.amount
}

/*
 * Global state
 */
var w = {
    lookup: {}
};

$banks = $('#banks-list');
$accounts = $('#accounts-list');
$operations = $('#operations-table');

function xhrError(xhr, textStatus, err) {
    alert('xhr error: ' + textStatus + '\n' + err);
}

/*
 * Controllers
 */

function init() {
    $.get('banks', {withAccountOnly:true}, function (data) {
        // Update model
        w.banks = [];
        w.lookup.banks = {}

        assert(w.banks.length === 0);
        assert(Object.keys(w.lookup.banks).length === 0);
        for (var bankPod of data) {
            var b = new Bank(bankPod);
            w.banks.push(b);
            w.lookup.banks[b.id] = b;
        }

        // Update view
        var content = '';
        for (var b of w.banks) {
            content += template(b, "<li><a onclick=clickOnBank('${id}')>${name}</a></li>");
        }
        $banks.html(content);

    }).fail(xhrError);
}

function clickOnBank(id) {
    assert(typeof w.lookup.banks !== 'undefined');
    assert(typeof w.lookup.banks[id] !== 'undefined');
    var bank = w.lookup.banks[id];

    $.get('banks/getAccounts/' + bank.id, function (data) {
        // Update model
        bank.accounts = []
        w.lookup.accounts = {}

        assert(bank.accounts.length === 0);
        assert(Object.keys(w.lookup.accounts).length === 0);
        for (var accPod of data) {
            var a = new Account(accPod);
            bank.addAccount(a);
            w.lookup.accounts[a.id] = a;
        }

        // Update view
        var content = '';
        for (var a of bank.accounts) {
            var ctx = {
                bid: bank.id,
                aid: a.id,
                atitle: a.title
            }
            content += template(ctx, "<li><a onclick=clickOnAccount('${aid}')>${atitle}</li>");
        }
        $accounts.html(content);

    }).fail(xhrError);
}

function clickOnAccount(id) {
    assert(typeof w.lookup.accounts !== 'undefined');
    assert(typeof w.lookup.accounts[id] !== 'undefined');
    var account = w.lookup.accounts[id];

    $.get('accounts/getOperations/' + account.id, function (data) {
        account.operations = [];
        w.lookup.operations = w.lookup.operations || {};

        assert(account.operations.length === 0);
        // Update model
        for (var opPod of data) {
            var opObj = new Operation(opPod);
            account.addOperation(opObj);
            w.lookup.operations[opObj.id] = opObj;
        }

        // Update view
        var content = '';
        for (var op of account.operations) {
            content += template(op, "<tr><td>${date}</td><td>${title}</td><td>${amount}</td></tr>");
        }
        $operations.html(content);
    });
}

init();
