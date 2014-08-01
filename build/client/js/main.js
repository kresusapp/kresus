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

/*
 * Global state
 */
var w = {
    lookup: {},
    current: {}
};

$banks = $('#banks-list');
$accounts = $('#accounts-list');
$operationsHeader = $('#operations-header');
$operations = $('#operations-table');
$similarities = $('#similarities-main');

function xhrError(xhr, textStatus, err) {
    alert('xhr error: ' + textStatus + '\n' + err);
}

/*
 * Controllers
 */

// Run at startup
(function init() {
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
})();

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
            content += template(ctx, "<li><a onclick=loadAccount('${aid}')>${atitle}</li>");
        }
        $accounts.html(content);

    }).fail(xhrError);
}

function loadAccount(id) {
    assert(typeof w.lookup.accounts !== 'undefined');
    assert(typeof w.lookup.accounts[id] !== 'undefined');
    var account = w.lookup.accounts[id];
    w.current.account = account;

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

        var total = account.initialAmount;
        for (var op of account.operations)
            total += op.amount;

        // Update view
        var content = '';
        for (var op of account.operations) {
            content += template(op, "<tr><td>${date}</td><td>${title}</td><td>${amount}</td></tr>");
        }
        $operations.html(content);
        $operationsHeader.html('Total: ' + total);

        // Run algorithms
        findRedundant(account.operations);
    });
}

/*
 * ALGORITHMS
 */
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 3; // 72 hours
function findRedundant(operations) {
    var similar = [];

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.sort(sortCriteria);
    for (var i = 0; i < operations.length; ++i) {
        if (i + 1 >= operations.length)
            continue;
        var op = sorted[i];
        var next = sorted[i+1];
        if (op.amount == next.amount) {
            var datediff = +op.date - +next.date;
            if (datediff <= TIME_SIMILAR_THRESHOLD)
                similar.push([op, next]);
        }
    }

    var content = '';
    // Update view
    if (similar.length === 0) {
        content = 'No similar operations found';
        $similarities.html(content);
        return;
    }

    content = '<div>Possibly redundant operations have been found.</div>';
    var tpl = '<table>'
            + '<tr><td>${adate}</td><td>${atitle}</td><td>${aamount}</td>'
            +    '<td><a onclick=deleteOperation("${aid}")>x</a><td></tr>'
            + '<tr><td>${bdate}</td><td>${btitle}</td><td>${bamount}</td>'
            +    '<td><a onclick=deleteOperation("${bid}")>x</a><td></tr>'
            + '</table>';

    for (var pair of similar) {
        assert(pair.length == 2);
        var a = pair[0], b = pair[1];
        var ctx = {
            adate: a.date,
            atitle: a.title,
            aamount: a.amount,
            aid: a.id,
            bdate: b.date,
            btitle: b.title,
            bamount: b.amount,
            bid: b.id
        }
        content += template(ctx, tpl);
    }
    $similarities.html(content);
}

function deleteOperation(id) {
    function reloadAccount() {
        assert(typeof w.lookup.operations !== 'undefined');
        assert(typeof w.lookup.operations[id] !== 'undefined');
        var op = w.lookup.operations[id];
        delete w.lookup.operations[id];
        has(w.current, 'account') && loadAccount(w.current.account.id);
    }

    $.ajax({
        url: 'operations/' + id,
        type: 'DELETE',
        success: reloadAccount,
        error: xhrError
    });
}
