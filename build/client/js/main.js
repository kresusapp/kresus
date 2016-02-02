(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _models = require('./models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Creates a function taking the "reject" argument of a new Promise and that
// can handle jquery ajax errors.
function xhrReject(reject) {
    return function (xhr, textStatus, xhrError) {
        var xhrText = xhr.responseText;
        var error = {};

        try {
            error = JSON.parse(xhrText);
        } catch (e) {
            // ignore
        }

        reject({
            code: error.code,
            message: error.message || '?',
            xhrText: xhrText,
            xhrError: xhrError
        });
    };
}

module.exports = {
    init: function init() {
        return new _promise2.default(function (accept, reject) {
            $.get('all/', accept).fail(xhrReject(reject));
        });
    },
    getAccounts: function getAccounts(bankId) {
        return new _promise2.default(function (accept, reject) {
            $.get('banks/' + bankId + '/accounts', function (data) {
                var accounts = data.map(function (acc) {
                    return new _models.Account(acc);
                });
                accept({ bankId: bankId, accounts: accounts });
            }).fail(xhrReject(reject));
        });
    },
    getOperations: function getOperations(accountId) {
        return new _promise2.default(function (accept, reject) {
            $.get('accounts/' + accountId + '/operations', accept).fail(xhrReject(reject));
        });
    },
    deleteBank: function deleteBank(bankId) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'banks/' + bankId,
                type: 'DELETE',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    deleteAccount: function deleteAccount(accountId) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'accounts/' + accountId,
                type: 'DELETE',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    createAlert: function createAlert(newAlert) {
        return new _promise2.default(function (accept, reject) {
            $.post('alerts/', newAlert, function (data) {
                accept(new _models.Alert(data));
            }).fail(xhrReject(reject));
        });
    },
    updateAlert: function updateAlert(alertId, attributes) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'alerts/' + alertId,
                type: 'PUT',
                data: attributes,
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    deleteAlert: function deleteAlert(alertId) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'alerts/' + alertId,
                type: 'DELETE',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    deleteCategory: function deleteCategory(categoryId, replaceByCategoryId) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'categories/' + categoryId,
                type: 'DELETE',
                data: { replaceByCategoryId: replaceByCategoryId },
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    updateOperation: function updateOperation(id, newOp) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'operations/' + id,
                type: 'PUT',
                data: newOp,
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    setCategoryForOperation: function setCategoryForOperation(operationId, categoryId) {
        return this.updateOperation(operationId, { categoryId: categoryId });
    },
    setTypeForOperation: function setTypeForOperation(operationId, operationTypeID) {
        return this.updateOperation(operationId, { operationTypeID: operationTypeID });
    },
    setCustomLabel: function setCustomLabel(operationId, customLabel) {
        return this.updateOperation(operationId, { customLabel: customLabel });
    },
    mergeOperations: function mergeOperations(toKeepId, toRemoveId) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'operations/' + toKeepId + '/mergeWith/' + toRemoveId,
                type: 'PUT',
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    getNewOperations: function getNewOperations(accessId) {
        return new _promise2.default(function (accept, reject) {
            $.get('accesses/' + accessId + '/fetch/operations', accept).fail(xhrReject(reject));
        });
    },

    createOperation: function createOperation(operation) {
        return new _promise2.default(function (accept, reject) {
            $.post('operations/', operation, accept).fail(xhrReject(reject));
        });
    },

    getNewAccounts: function getNewAccounts(accessId) {
        return new _promise2.default(function (accept, reject) {
            $.get('accesses/' + accessId + '/fetch/accounts', accept).fail(xhrReject(reject));
        });
    },
    updateWeboob: function updateWeboob(which) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'settings/weboob/',
                type: 'PUT',
                data: { action: which },
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    importInstance: function importInstance(content) {
        return new _promise2.default(function (accept, reject) {
            $.post('all/', { all: content }, accept).fail(xhrReject(reject));
        });
    },
    saveSetting: function saveSetting(key, value) {
        return new _promise2.default(function (accept, reject) {
            $.post('settings/', { key: key, value: value }, accept).fail(xhrReject(reject));
        });
    },
    updateAccess: function updateAccess(accessId, access) {
        return new _promise2.default(function (accept, reject) {
            access.customFields = access.customFields ? (0, _stringify2.default)(access.customFields) : undefined;
            $.ajax({
                url: 'accesses/' + accessId,
                type: 'PUT',
                data: access,
                success: accept,
                error: xhrReject(reject)
            });
        });
    },
    addBank: function addBank(bank, login, password, customFields) {
        return new _promise2.default(function (accept, reject) {
            var data = {
                bank: bank,
                login: login,
                password: password,
                customFields: customFields
            };

            if (data.customFields) data.customFields = (0, _stringify2.default)(data.customFields);

            $.post('accesses/', data, accept).fail(xhrReject(reject));
        });
    },
    addCategory: function addCategory(category) {
        return new _promise2.default(function (accept, reject) {
            $.post('categories/', category, accept).fail(xhrReject(reject));
        });
    },
    updateCategory: function updateCategory(id, category) {
        return new _promise2.default(function (accept, reject) {
            $.ajax({
                url: 'categories/' + id,
                type: 'PUT',
                data: category,
                success: accept,
                error: xhrReject(reject)
            });
        });
    }
};

},{"./models":32,"babel-runtime/core-js/json/stringify":36,"babel-runtime/core-js/promise":46}],2:[function(require,module,exports){
'use strict';

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Props: account: Account

var AccountListItem = function (_React$Component) {
    (0, _inherits3.default)(AccountListItem, _React$Component);

    function AccountListItem(props) {
        (0, _classCallCheck3.default)(this, AccountListItem);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountListItem).call(this, props));
    }

    (0, _createClass3.default)(AccountListItem, [{
        key: 'onClick',
        value: function onClick() {
            _store.Actions.SelectAccount(this.props.account);
        }
    }, {
        key: 'computeTotal',
        value: function computeTotal(operations) {
            var total = operations.reduce(function (a, b) {
                return a + b.amount;
            }, this.props.account.initialAmount);
            return Math.round(total * 100) / 100;
        }
    }, {
        key: 'render',
        value: function render() {
            var maybeActive = this.props.active ? "active" : "";
            return React.createElement(
                'li',
                { className: maybeActive },
                React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.onClick.bind(this) },
                        this.props.account.title
                    ),
                    ' (',
                    this.computeTotal(this.props.account.operations),
                    ' €)'
                )
            );
        }
    }]);
    return AccountListItem;
}(React.Component);

var AccountActiveItem = function (_AccountListItem) {
    (0, _inherits3.default)(AccountActiveItem, _AccountListItem);

    function AccountActiveItem(props) {
        (0, _classCallCheck3.default)(this, AccountActiveItem);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountActiveItem).call(this, props));

        (0, _helpers.has)(props, 'toggleDropdown');
        return _this2;
    }

    (0, _createClass3.default)(AccountActiveItem, [{
        key: 'render',
        value: function render() {
            var total = (0, _get3.default)((0, _getPrototypeOf2.default)(AccountActiveItem.prototype), 'computeTotal', this).call(this, this.props.account.operations);
            var color = total >= 0 ? 'positive' : 'negative';

            return React.createElement(
                'div',
                { className: 'account-details' },
                React.createElement(
                    'div',
                    { className: 'account-name' },
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.props.toggleDropdown },
                        this.props.account.title,
                        React.createElement(
                            'span',
                            { className: 'amount' },
                            '[',
                            React.createElement(
                                'span',
                                { className: color },
                                total,
                                ' €'
                            ),
                            ']'
                        ),
                        React.createElement('span', { className: 'caret' })
                    )
                )
            );
        }
    }]);
    return AccountActiveItem;
}(AccountListItem);

// State: accounts: [{id: accountId, title: accountTitle}]

var AccountListComponent = function (_React$Component2) {
    (0, _inherits3.default)(AccountListComponent, _React$Component2);

    function AccountListComponent(props) {
        (0, _classCallCheck3.default)(this, AccountListComponent);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountListComponent).call(this, props));

        _this3.state = {
            accounts: [],
            active: null,
            showDropdown: false
        };
        _this3.listener = _this3._listener.bind(_this3);
        return _this3;
    }

    (0, _createClass3.default)(AccountListComponent, [{
        key: 'toggleDropdown',
        value: function toggleDropdown(e) {
            this.setState({ showDropdown: !this.state.showDropdown });
            e.preventDefault();
        }
    }, {
        key: '_listener',
        value: function _listener() {
            this.setState({
                accounts: _store.store.getCurrentBankAccounts(),
                active: _store.store.getCurrentAccountId()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.banks, this.listener);
            _store.store.on(_store.State.operations, this.listener);
            _store.store.subscribeMaybeGet(_store.State.accounts, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.listener);
            _store.store.removeListener(_store.State.accounts, this.listener);
            _store.store.removeListener(_store.State.operations, this.listener);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var self = this;

            var active = this.state.accounts.filter(function (account) {
                return _this4.state.active === account.id;
            }).map(function (account) {
                return React.createElement(AccountActiveItem, { key: account.id, account: account, toggleDropdown: _this4.toggleDropdown.bind(_this4) });
            });

            var accounts = this.state.accounts.map(function (account) {
                var active = self.state.active === account.id;
                return React.createElement(AccountListItem, { key: account.id, account: account, active: active });
            });

            var menu = this.state.showDropdown ? "" : "dropdown-menu";
            var dropdown = this.state.showDropdown ? "dropup" : "dropdown";

            return React.createElement(
                'div',
                { className: "accounts sidebar-list " + dropdown },
                active,
                React.createElement(
                    'ul',
                    { className: menu },
                    accounts
                )
            );
        }
    }]);
    return AccountListComponent;
}(React.Component);

exports.default = AccountListComponent;

},{"../helpers":30,"../store":33,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/get":50,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],3:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

var _Modal = require('./Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _CategorySelectComponent = require('./CategorySelectComponent');

var _CategorySelectComponent2 = _interopRequireDefault(_CategorySelectComponent);

var _OperationTypeSelectComponent = require('./OperationTypeSelectComponent');

var _OperationTypeSelectComponent2 = _interopRequireDefault(_OperationTypeSelectComponent);

var _ValidableInputText = require('./ValidableInputText');

var _ValidableInputText2 = _interopRequireDefault(_ValidableInputText);

var _ValidableInputNumber = require('./ValidableInputNumber');

var _ValidableInputNumber2 = _interopRequireDefault(_ValidableInputNumber);

var _ValidableInputDate = require('./ValidableInputDate');

var _ValidableInputDate2 = _interopRequireDefault(_ValidableInputDate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AddOperationModal = function (_React$Component) {
    (0, _inherits3.default)(AddOperationModal, _React$Component);

    function AddOperationModal(props) {
        (0, _classCallCheck3.default)(this, AddOperationModal);

        (0, _helpers.has)(props, 'account');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AddOperationModal).call(this, props));

        _this.state = {
            operation: {
                categoryId: _helpers.NONE_CATEGORY_ID,
                operationTypeID: _store.store.getUnknownOperationType().id,
                bankAccount: _this.props.account.accountNumber
            },
            titleIsOK: false,
            amountIsOK: false,
            dateIsOK: false
        };
        _this.handleOnSubmit = _this.handleOnSubmit.bind(_this);
        _this.returnDateValue = _this.returnDateValue.bind(_this);
        _this.handleOnSelectOperationType = _this.handleOnSelectOperationType.bind(_this);
        _this.returnTitleValue = _this.returnTitleValue.bind(_this);
        _this.returnAmountValue = _this.returnAmountValue.bind(_this);
        _this.handleOnSelectCategory = _this.handleOnSelectCategory.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(AddOperationModal, [{
        key: 'handleOnSubmit',
        value: function handleOnSubmit(event) {
            // Some information is missing to have a "full" operation.
            var operation = this.state.operation;
            operation.bankAccount = this.props.account.accountNumber;

            _store.Actions.CreateOperation(this.props.account.id, operation);

            event.preventDefault();
            $('#addOperation' + this.props.account.id).modal('toggle');

            this.clearOperation();
        }
    }, {
        key: 'clearOperation',
        value: function clearOperation() {
            this.setState({ operation: {
                    categoryId: _helpers.NONE_CATEGORY_ID,
                    operationTypeID: _store.store.getUnknownOperationType().id
                } });
            this.refs.date.clear();
            this.refs.title.clear();
            this.refs.amount.clear();
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            // Only rerender if the button status has to be updated
            return this.isSubmitDisabled() === !(nextState.titleIsOK && nextState.amountIsOK && nextState.dateIsOK);
        }
    }, {
        key: 'isSubmitDisabled',
        value: function isSubmitDisabled() {
            return !(this.state.titleIsOK && this.state.amountIsOK && this.state.dateIsOK);
        }
    }, {
        key: 'returnDateValue',
        value: function returnDateValue(date) {
            if (date) {
                var operation = this.state.operation;
                operation.date = new Date(date);
                this.setState({ operation: operation, dateIsOK: true });
            } else {
                this.setState({ dateIsOK: false });
            }
        }
    }, {
        key: 'returnTitleValue',
        value: function returnTitleValue(title) {
            if (title && title.trim().length > 0) {
                var operation = this.state.operation;
                operation.title = title;
                this.setState({ operation: operation, titleIsOK: true });
            } else {
                this.setState({ titleIsOK: false });
            }
        }
    }, {
        key: 'returnAmountValue',
        value: function returnAmountValue(amount) {
            if (typeof amount === 'number') {
                var operation = this.state.operation;
                operation.amount = amount;
                this.setState({ operation: operation, amountIsOK: true });
            } else {
                this.setState({ amountIsOK: false });
            }
        }
    }, {
        key: 'handleOnSelectOperationType',
        value: function handleOnSelectOperationType(id) {
            var operation = this.state.operation;
            operation.operationTypeID = id;
            this.setState({ operation: operation });
        }
    }, {
        key: 'handleOnSelectCategory',
        value: function handleOnSelectCategory(id) {
            var operation = this.state.operation;
            operation.categoryId = id;
            this.setState({ operation: operation });
        }
    }, {
        key: 'render',
        value: function render() {
            var modalId = 'addOperation' + this.props.account.id;

            var labelDate = (0, _helpers.translate)('client.addoperationmodal.date');
            var labelTitle = (0, _helpers.translate)('client.addoperationmodal.label');
            var labelAmount = (0, _helpers.translate)('client.addoperationmodal.amount');

            var modalBody = React.createElement(
                'div',
                null,
                React.createElement(
                    'span',
                    null,
                    (0, _helpers.translate)('client.addoperationmodal.description', { account: this.props.account.accountNumber })
                ),
                React.createElement(
                    'form',
                    { id: 'formAddOperation' + this.props.account.id,
                        onSubmit: this.handleOnSubmit },
                    React.createElement(_ValidableInputDate2.default, {
                        returnInputValue: this.returnDateValue,
                        inputID: 'date' + this.props.account.id,
                        label: labelDate,
                        ref: 'date'
                    }),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { className: 'control-label', htmlFor: 'type' + this.props.account.id },
                            (0, _helpers.translate)('client.addoperationmodal.type')
                        ),
                        React.createElement(_OperationTypeSelectComponent2.default, {
                            operation: this.state.operation,
                            onSelectId: this.handleOnSelectOperationType
                        })
                    ),
                    React.createElement(_ValidableInputText2.default, {
                        inputID: 'title' + this.props.account.id,
                        returnInputValue: this.returnTitleValue,
                        label: labelTitle,
                        ref: 'title'
                    }),
                    React.createElement(_ValidableInputNumber2.default, {
                        inputID: 'amount' + this.props.account.id,
                        returnInputValue: this.returnAmountValue,
                        step: '0.01',
                        label: labelAmount,
                        ref: 'amount'
                    }),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { className: 'control-label',
                                htmlFor: 'category' + this.props.account.id },
                            (0, _helpers.translate)('client.addoperationmodal.category')
                        ),
                        React.createElement(_CategorySelectComponent2.default, {
                            operation: this.state.operation,
                            onSelectId: this.handleOnSelectCategory
                        })
                    )
                )
            );

            var modalTitle = (0, _helpers.translate)('client.addoperationmodal.add_operation', { account: this.props.account.accountNumber });
            var modalFooter = React.createElement(
                'div',
                null,
                React.createElement('input', { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal',
                    value: (0, _helpers.translate)('client.addoperationmodal.cancel')
                }),
                React.createElement('input', { type: 'submit', form: 'formAddOperation' + this.props.account.id,
                    className: 'btn btn-warning', value: (0, _helpers.translate)('client.addoperationmodal.submit'),
                    disabled: this.isSubmitDisabled()
                })
            );
            return React.createElement(_Modal2.default, {
                modalId: modalId,
                modalBody: modalBody,
                modalTitle: modalTitle,
                modalFooter: modalFooter
            });
        }
    }]);
    return AddOperationModal;
}(React.Component);

exports.default = AddOperationModal;

},{"../helpers":30,"../store":33,"./CategorySelectComponent":7,"./Modal":16,"./OperationTypeSelectComponent":19,"./ValidableInputDate":24,"./ValidableInputNumber":25,"./ValidableInputText":26,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],4:[function(require,module,exports){
"use strict";

var _get2 = require("babel-runtime/helpers/get");

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FilteredAmountWell = exports.AmountWell = undefined;

var _helpers = require("../helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AmountWell = exports.AmountWell = function (_React$Component) {
    (0, _inherits3.default)(AmountWell, _React$Component);

    function AmountWell(props) {
        (0, _classCallCheck3.default)(this, AmountWell);

        // this.props = {
        //  backgroundColor,
        //  title,
        //  subtitle,
        //  operations,
        //  initialAmount,
        //  filterFunction
        // }
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AmountWell).call(this, props));
    }

    (0, _createClass3.default)(AmountWell, [{
        key: "computeTotal",
        value: function computeTotal(operations) {
            var total = operations.filter(this.props.filterFunction).reduce(function (a, b) {
                return a + b.amount;
            }, this.props.initialAmount);
            return Math.round(total * 100) / 100;
        }
    }, {
        key: "getTotal",
        value: function getTotal() {
            return this.computeTotal(this.props.operations);
        }
    }, {
        key: "render",
        value: function render() {
            var style = "well " + this.props.backgroundColor;

            return React.createElement(
                "div",
                { className: this.props.size },
                React.createElement(
                    "div",
                    { className: style },
                    React.createElement(
                        "span",
                        { className: "well-icon" },
                        React.createElement("i", { className: "fa fa-" + this.props.icon })
                    ),
                    React.createElement(
                        "span",
                        { className: "operation-amount" },
                        this.getTotal(),
                        " €"
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "span",
                        { className: "well-title" },
                        this.props.title
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "span",
                        { className: "well-sub" },
                        this.props.subtitle
                    )
                )
            );
        }
    }]);
    return AmountWell;
}(React.Component);

var FilteredAmountWell = exports.FilteredAmountWell = function (_AmountWell) {
    (0, _inherits3.default)(FilteredAmountWell, _AmountWell);

    function FilteredAmountWell(props) {
        (0, _classCallCheck3.default)(this, FilteredAmountWell);

        // this.props = {
        //  hasFilteredOperations,
        //  filteredOperations,
        //  operations
        // }
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(FilteredAmountWell).call(this, props));
    }

    (0, _createClass3.default)(FilteredAmountWell, [{
        key: "getTotal",
        value: function getTotal() {
            if (this.props.hasFilteredOperations) return (0, _get3.default)((0, _getPrototypeOf2.default)(FilteredAmountWell.prototype), "computeTotal", this).call(this, this.props.filteredOperations);
            return (0, _get3.default)((0, _getPrototypeOf2.default)(FilteredAmountWell.prototype), "computeTotal", this).call(this, FilteredAmountWell.filterOperationsThisMonth(this.props.operations));
        }
    }, {
        key: "render",
        value: function render() {
            var style = "well " + this.props.backgroundColor;

            var filtered = this.props.hasFilteredOperations;
            var sub = filtered ? (0, _helpers.translate)('client.amount_well.current_search') : (0, _helpers.translate)('client.amount_well.this_month');

            return React.createElement(
                "div",
                { className: this.props.size },
                React.createElement(
                    "div",
                    { className: style },
                    React.createElement(
                        "span",
                        { className: "well-icon" },
                        React.createElement("i", { className: "fa fa-" + this.props.icon })
                    ),
                    React.createElement(
                        "span",
                        { className: "operation-amount" },
                        this.getTotal(),
                        " €"
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "span",
                        { className: "well-title" },
                        this.props.title
                    ),
                    React.createElement("br", null),
                    React.createElement(
                        "span",
                        { className: "well-sub" },
                        sub
                    )
                )
            );
        }
    }], [{
        key: "filterOperationsThisMonth",
        value: function filterOperationsThisMonth(operations) {
            var now = new Date();
            return operations.filter(function (op) {
                var d = new Date(op.date);
                return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            });
        }
    }]);
    return FilteredAmountWell;
}(AmountWell);

},{"../helpers":30,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/get":50,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],5:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BankActiveItemComponent = function (_React$Component) {
    (0, _inherits3.default)(BankActiveItemComponent, _React$Component);

    function BankActiveItemComponent(props) {
        (0, _classCallCheck3.default)(this, BankActiveItemComponent);

        (0, _helpers.has)(props, 'toggleDropdown');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankActiveItemComponent).call(this, props));
    }

    (0, _createClass3.default)(BankActiveItemComponent, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'bank-details' },
                React.createElement('div', { className: "icon icon-" + this.props.bank.uuid }),
                React.createElement(
                    'div',
                    { className: 'bank-name' },
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.props.toggleDropdown },
                        this.props.bank.name,
                        React.createElement('span', { className: 'caret' })
                    )
                )
            );
        }
    }]);
    return BankActiveItemComponent;
}(React.Component);

// Props: bank: Bank

var BankListItemComponent = function (_React$Component2) {
    (0, _inherits3.default)(BankListItemComponent, _React$Component2);

    function BankListItemComponent(props) {
        (0, _classCallCheck3.default)(this, BankListItemComponent);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankListItemComponent).call(this, props));
    }

    (0, _createClass3.default)(BankListItemComponent, [{
        key: 'onClick',
        value: function onClick() {
            _store.Actions.SelectBank(this.props.bank);
        }
    }, {
        key: 'render',
        value: function render() {
            var maybeActive = this.props.active ? "active" : "";
            return React.createElement(
                'li',
                { className: maybeActive },
                React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.onClick.bind(this) },
                        this.props.bank.name
                    )
                )
            );
        }
    }]);
    return BankListItemComponent;
}(React.Component);

// State: [{name: bankName, id: bankId}]

var BankListComponent = function (_React$Component3) {
    (0, _inherits3.default)(BankListComponent, _React$Component3);

    function BankListComponent(props) {
        (0, _classCallCheck3.default)(this, BankListComponent);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankListComponent).call(this, props));

        _this3.state = {
            banks: [],
            showDropdown: false
        };
        _this3.listener = _this3._listener.bind(_this3);
        return _this3;
    }

    (0, _createClass3.default)(BankListComponent, [{
        key: 'toggleDropdown',
        value: function toggleDropdown(e) {
            this.setState({ showDropdown: !this.state.showDropdown });
            e.preventDefault();
        }
    }, {
        key: '_listener',
        value: function _listener() {
            this.setState({
                active: _store.store.getCurrentBankId(),
                banks: _store.store.getBanks()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.subscribeMaybeGet(_store.State.banks, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.listener);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var active = this.state.banks.filter(function (bank) {
                return _this4.state.active == bank.id;
            }).map(function (bank) {
                return React.createElement(BankActiveItemComponent, { key: bank.id, bank: bank, toggleDropdown: _this4.toggleDropdown.bind(_this4) });
            });

            var banks = this.state.banks.map(function (bank) {
                var active = _this4.state.active == bank.id;
                return React.createElement(BankListItemComponent, { key: bank.id, bank: bank, active: active });
            });

            var menu = this.state.showDropdown ? "" : "dropdown-menu";
            var dropdown = this.state.showDropdown ? "dropup" : "dropdown";

            return React.createElement(
                'div',
                { className: "banks sidebar-list " + dropdown },
                active,
                React.createElement(
                    'ul',
                    { className: menu },
                    banks
                )
            );
        }
    }]);
    return BankListComponent;
}(React.Component);

exports.default = BankListComponent;

},{"../helpers":30,"../store":33,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],6:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

var _ConfirmDeleteModal = require('./ConfirmDeleteModal');

var _ConfirmDeleteModal2 = _interopRequireDefault(_ConfirmDeleteModal);

var _ColorPicker = require('./ColorPicker');

var _ColorPicker2 = _interopRequireDefault(_ColorPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function CreateForm(onSave, onCancel, previousValue, previousColor) {

    function onKeyUp(e) {
        if (e.keyCode == 13) {
            return onSave(e);
        }
        return true;
    }

    return React.createElement(
        'tr',
        null,
        React.createElement(
            'td',
            null,
            React.createElement(_ColorPicker2.default, { defaultValue: previousColor, ref: 'color' })
        ),
        React.createElement(
            'td',
            null,
            React.createElement('input', { type: 'text', className: 'form-control',
                placeholder: (0, _helpers.translate)('client.category.label'),
                defaultValue: previousValue || '', onKeyUp: onKeyUp,
                ref: 'label' })
        ),
        React.createElement(
            'td',
            null,
            React.createElement(
                'div',
                { className: 'btn-group btn-group-justified', role: 'group' },
                React.createElement(
                    'a',
                    { className: 'btn btn-success', role: 'button', onClick: onSave },
                    (0, _helpers.translate)('client.general.save')
                ),
                React.createElement(
                    'a',
                    { className: 'btn btn-danger', role: 'button', onClick: onCancel },
                    (0, _helpers.translate)('client.general.cancel')
                )
            )
        )
    );
}

var CategoryListItem = function (_React$Component) {
    (0, _inherits3.default)(CategoryListItem, _React$Component);

    function CategoryListItem(props) {
        (0, _classCallCheck3.default)(this, CategoryListItem);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CategoryListItem).call(this, props));

        _this.state = {
            editMode: false
        };
        return _this;
    }

    (0, _createClass3.default)(CategoryListItem, [{
        key: 'onSaveEdit',
        value: function onSaveEdit(e) {
            var label = this.refs.label.getDOMNode().value.trim();
            var color = this.refs.color.getValue();
            if (!label || !color) return false;

            var category = {
                title: label,
                color: color
            };

            _store.Actions.UpdateCategory(this.props.cat, category);

            this.setState({
                editMode: false
            });
            e.preventDefault();
        }
    }, {
        key: 'onCancelEdit',
        value: function onCancelEdit(e) {
            this.setState({
                editMode: false
            });
            e.preventDefault();
        }
    }, {
        key: 'onShowEdit',
        value: function onShowEdit(e) {
            this.setState({
                editMode: true
            }, function () {
                // then
                this.refs.label.getDOMNode().select();
            });
            e.preventDefault();
        }
    }, {
        key: 'onDelete',
        value: function onDelete() {
            var replaceCategory = this.refs.replacement.getDOMNode().value;
            _store.Actions.DeleteCategory(this.props.cat, replaceCategory);
        }
    }, {
        key: 'render',
        value: function render() {
            var c = this.props.cat;

            if (this.state.editMode) return CreateForm(this.onSaveEdit.bind(this), this.onCancelEdit.bind(this), c.title, c.color);

            var replacementOptions = _store.store.getCategories().filter(function (cat) {
                return cat.id !== c.id && cat.id !== _helpers.NONE_CATEGORY_ID;
            }).map(function (cat) {
                return React.createElement(
                    'option',
                    { key: cat.id, value: cat.id },
                    cat.title
                );
            });

            replacementOptions = [React.createElement(
                'option',
                { key: 'none', value: _helpers.NONE_CATEGORY_ID },
                (0, _helpers.translate)('client.category.dont_replace')
            )].concat(replacementOptions);

            var modalBody = React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'alert alert-info' },
                    (0, _helpers.translate)('client.category.erase', { title: c.title })
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'select',
                        { className: 'form-control', ref: 'replacement' },
                        replacementOptions
                    )
                )
            );

            return React.createElement(
                'tr',
                { key: c.id },
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'span',
                        { style: { backgroundColor: c.color }, className: 'color_block' },
                        ' '
                    )
                ),
                React.createElement(
                    'td',
                    null,
                    c.title
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'div',
                        { className: 'btn-group btn-group-justified', role: 'group' },
                        React.createElement(
                            'a',
                            { className: 'btn btn-primary', role: 'button', onClick: this.onShowEdit.bind(this) },
                            (0, _helpers.translate)('client.general.edit')
                        ),
                        React.createElement(
                            'a',
                            { className: 'btn btn-danger', role: 'button', 'data-toggle': 'modal',
                                'data-target': '#confirmDeleteCategory' + c.id },
                            (0, _helpers.translate)('client.general.delete')
                        )
                    ),
                    React.createElement(_ConfirmDeleteModal2.default, {
                        modalId: 'confirmDeleteCategory' + c.id,
                        modalBody: modalBody,
                        onDelete: this.onDelete.bind(this)
                    })
                )
            );
        }
    }]);
    return CategoryListItem;
}(React.Component);

var CategoryList = function (_React$Component2) {
    (0, _inherits3.default)(CategoryList, _React$Component2);

    function CategoryList(props) {
        (0, _classCallCheck3.default)(this, CategoryList);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CategoryList).call(this, props));

        _this2.state = {
            showForm: false,
            categories: []
        };
        _this2.listener = _this2._listener.bind(_this2);
        return _this2;
    }

    (0, _createClass3.default)(CategoryList, [{
        key: '_listener',
        value: function _listener() {
            this.setState({
                categories: _store.store.getCategories()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.subscribeMaybeGet(_store.State.categories, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.categories, this.listener);
        }
    }, {
        key: 'onShowForm',
        value: function onShowForm(e) {
            e.preventDefault();
            this.setState({
                showForm: !this.state.showForm
            }, function () {
                // then
                if (this.state.showForm) this.refs.label.getDOMNode().select();
            });
        }
    }, {
        key: 'onSave',
        value: function onSave(e) {
            e.preventDefault();

            var label = this.refs.label.getDOMNode().value.trim();
            var color = this.refs.color.getValue();
            if (!label || !color) return false;

            var category = {
                title: label,
                color: color
            };

            _store.Actions.CreateCategory(category);

            this.refs.label.getDOMNode().value = '';
            this.setState({
                showForm: false
            });
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var items = this.state.categories.filter(function (cat) {
                return cat.id != _helpers.NONE_CATEGORY_ID;
            }).map(function (cat) {
                return React.createElement(CategoryListItem, { cat: cat, key: cat.id });
            });

            var maybeForm = this.state.showForm ? CreateForm(this.onSave.bind(this), this.onShowForm.bind(this)) : React.createElement('tr', null);

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'top-panel panel panel-default' },
                    React.createElement(
                        'div',
                        { className: 'panel-heading' },
                        React.createElement(
                            'h3',
                            { className: 'title panel-title' },
                            (0, _helpers.translate)('client.category.title')
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-body' },
                        React.createElement(
                            'a',
                            { className: 'btn btn-primary text-uppercase pull-right', href: '#', onClick: this.onShowForm.bind(this) },
                            React.createElement('span', { className: 'fa fa-plus' }),
                            (0, _helpers.translate)('client.category.add')
                        )
                    ),
                    React.createElement(
                        'table',
                        { className: 'table table-striped table-hover table-bordered' },
                        React.createElement(
                            'thead',
                            null,
                            React.createElement(
                                'tr',
                                null,
                                React.createElement(
                                    'th',
                                    { className: 'col-sm-1' },
                                    (0, _helpers.translate)('client.category.column_category_color')
                                ),
                                React.createElement(
                                    'th',
                                    { className: 'col-sm-9' },
                                    (0, _helpers.translate)('client.category.column_category_name')
                                ),
                                React.createElement(
                                    'th',
                                    { className: 'col-sm-2' },
                                    (0, _helpers.translate)('client.category.column_action')
                                )
                            )
                        ),
                        React.createElement(
                            'tbody',
                            null,
                            maybeForm,
                            items
                        )
                    )
                )
            );
        }
    }]);
    return CategoryList;
}(React.Component);

exports.default = CategoryList;

},{"../helpers":30,"../store":33,"./ColorPicker":9,"./ConfirmDeleteModal":10,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],7:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

var _SelectableButtonComponent = require('./SelectableButtonComponent');

var _SelectableButtonComponent2 = _interopRequireDefault(_SelectableButtonComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CategorySelectComponent = function (_React$Component) {
    (0, _inherits3.default)(CategorySelectComponent, _React$Component);

    function CategorySelectComponent(props) {
        (0, _classCallCheck3.default)(this, CategorySelectComponent);

        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'onSelectId');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CategorySelectComponent).call(this, props));
    }

    (0, _createClass3.default)(CategorySelectComponent, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(_SelectableButtonComponent2.default, {
                operation: this.props.operation,
                optionsArray: _store.store.getCategories(),
                selectedId: function selectedId() {
                    return _this2.props.operation.categoryId;
                },
                idToLabel: function idToLabel(id) {
                    return _store.store.getCategoryFromId(id).title;
                },
                onSelectId: this.props.onSelectId.bind(this) });
        }
    }]);
    return CategorySelectComponent;
}(React.Component);

exports.default = CategorySelectComponent;

},{"../helpers":30,"../store":33,"./SelectableButtonComponent":21,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],8:[function(require,module,exports){
'use strict';

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OpCatChartPeriodSelect = exports.OpCatChartTypeSelect = undefined;

var _store = require('../store');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function DEBUG(text) {
    return (0, _helpers.debug)('Chart Component - ' + text);
}

function round2(x) {
    return Math.round(x * 100) / 100;
}

var ChartComponent = function (_React$Component) {
    (0, _inherits3.default)(ChartComponent, _React$Component);

    function ChartComponent() {
        (0, _classCallCheck3.default)(this, ChartComponent);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ChartComponent).apply(this, arguments));
    }

    (0, _createClass3.default)(ChartComponent, [{
        key: 'redraw',
        value: function redraw() {
            (0, _helpers.NYI)();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.redraw();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            // Force update!
            this.setState({});
        }
    }]);
    return ChartComponent;
}(React.Component);

var SelectWithDefault = function (_React$Component2) {
    (0, _inherits3.default)(SelectWithDefault, _React$Component2);

    function SelectWithDefault(props, options) {
        (0, _classCallCheck3.default)(this, SelectWithDefault);

        (0, _helpers.has)(props, 'defaultValue');
        (0, _helpers.has)(props, 'onChange');
        (0, _helpers.has)(props, 'htmlId');

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SelectWithDefault).call(this, props));

        _this2.options = options;
        return _this2;
    }

    (0, _createClass3.default)(SelectWithDefault, [{
        key: 'getValue',
        value: function getValue() {
            return this.refs.selector.getDOMNode().value;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'select',
                { className: 'form-control',
                    defaultValue: this.props.defaultValue,
                    onChange: this.props.onChange,
                    ref: 'selector', id: this.props.htmlId },
                this.options
            );
        }
    }]);
    return SelectWithDefault;
}(React.Component);

var OpCatChartTypeSelect = exports.OpCatChartTypeSelect = function (_SelectWithDefault) {
    (0, _inherits3.default)(OpCatChartTypeSelect, _SelectWithDefault);

    function OpCatChartTypeSelect(props) {
        (0, _classCallCheck3.default)(this, OpCatChartTypeSelect);

        var options = [React.createElement(
            'option',
            { key: 'all', value: 'all' },
            (0, _helpers.translate)('client.charts.all_types')
        ), React.createElement(
            'option',
            { key: 'positive', value: 'positive' },
            (0, _helpers.translate)('client.charts.positive')
        ), React.createElement(
            'option',
            { key: 'negative', value: 'negative' },
            (0, _helpers.translate)('client.charts.negative')
        )];
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OpCatChartTypeSelect).call(this, props, options));
    }

    return OpCatChartTypeSelect;
}(SelectWithDefault);

var OpCatChartPeriodSelect = exports.OpCatChartPeriodSelect = function (_SelectWithDefault2) {
    (0, _inherits3.default)(OpCatChartPeriodSelect, _SelectWithDefault2);

    function OpCatChartPeriodSelect(props) {
        (0, _classCallCheck3.default)(this, OpCatChartPeriodSelect);

        var options = [React.createElement(
            'option',
            { key: 'value', value: 'all' },
            (0, _helpers.translate)('client.charts.all_periods')
        ), React.createElement(
            'option',
            { key: 'current-month', value: 'current-month' },
            (0, _helpers.translate)('client.charts.current_month')
        ), React.createElement(
            'option',
            { key: 'last-month', value: 'last-month' },
            (0, _helpers.translate)('client.charts.last_month')
        ), React.createElement(
            'option',
            { key: '3-months', value: '3-months' },
            (0, _helpers.translate)('client.charts.three_months')
        ), React.createElement(
            'option',
            { key: '6-months', value: '6-months' },
            (0, _helpers.translate)('client.charts.six_months')
        )];
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OpCatChartPeriodSelect).call(this, props, options));
    }

    return OpCatChartPeriodSelect;
}(SelectWithDefault);

var OpCatChart = function (_ChartComponent) {
    (0, _inherits3.default)(OpCatChart, _ChartComponent);

    function OpCatChart() {
        (0, _classCallCheck3.default)(this, OpCatChart);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OpCatChart).apply(this, arguments));
    }

    (0, _createClass3.default)(OpCatChart, [{
        key: 'createPeriodFilter',
        value: function createPeriodFilter(option) {

            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth(); // Careful: January is month 0
            var previous = undefined;

            switch (option) {
                case 'all':
                    return function () {
                        return true;
                    };

                case 'current-month':
                    return function (d) {
                        return d.getMonth() == month && d.getFullYear() == year;
                    };

                case 'last-month':
                    previous = month > 0 ? month - 1 : 11;
                    year = month > 0 ? year : year - 1;
                    return function (d) {
                        return d.getMonth() == previous && d.getFullYear() == year;
                    };

                case '3-months':
                    if (month >= 3) {
                        previous = month - 3;
                        return function (d) {
                            return d.getMonth() >= previous && d.getFullYear() == year;
                        };
                    }
                    previous = (month + 9) % 12;
                    return function (d) {
                        return d.getMonth() >= previous && d.getFullYear() == year - 1 || d.getMonth() <= month && d.getFullYear() == year;
                    };

                case '6-months':
                    if (month >= 6) {
                        previous = month - 6;
                        return function (d) {
                            return d.getMonth() >= previous && d.getFullYear() == year;
                        };
                    }
                    previous = (month + 6) % 12;
                    return function (d) {
                        return d.getMonth() >= previous && d.getFullYear() == year - 1 || d.getMonth() <= month && d.getFullYear() == year;
                    };

                default:
                    (0, _helpers.assert)(false, 'unexpected option for date filter');
            }
        }
    }, {
        key: 'createKindFilter',
        value: function createKindFilter(option) {
            if (option === 'all') return function () {
                return true;
            };
            if (option === 'positive') return function (op) {
                return op.amount > 0;
            };
            if (option === 'negative') return function (op) {
                return op.amount < 0;
            };
            (0, _helpers.assert)(false, 'unknown kind filter option');
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            var ops = this.props.operations.slice();

            // Period
            var period = this.refs.period.getValue() || 'all';
            var periodFilter = this.createPeriodFilter(period);
            ops = ops.filter(function (op) {
                return periodFilter(op.date);
            });

            // Kind
            var kind = this.refs.type.getValue() || 'all';
            var kindFilter = this.createKindFilter(kind);
            ops = ops.filter(kindFilter);

            // Print charts
            this.barchart = CreateBarChartAll(ops, '#barchart');
            if (kind !== 'all') {
                this.piechart = CreatePieChartAll(ops, '#piechart');
            } else {
                document.querySelector('#piechart').innerHTML = '';
                this.piechart = null;
            }
        }
    }, {
        key: 'onShowAll',
        value: function onShowAll() {
            this.barchart && this.barchart.show();
            this.piechart && this.piechart.show();
        }
    }, {
        key: 'onHideAll',
        value: function onHideAll() {
            this.barchart && this.barchart.hide();
            this.piechart && this.piechart.hide();
        }
    }, {
        key: 'render',
        value: function render() {

            var defaultType = _store.store.getSetting('defaultChartType');
            var defaultPeriod = _store.store.getSetting('defaultChartPeriod');

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'panel panel-default' },
                    React.createElement(
                        'form',
                        { className: 'panel-body' },
                        React.createElement(
                            'div',
                            { className: 'form-horizontal' },
                            React.createElement(
                                'label',
                                { htmlFor: 'kind' },
                                (0, _helpers.translate)('client.charts.type')
                            ),
                            React.createElement(OpCatChartTypeSelect, {
                                defaultValue: defaultType,
                                onChange: this.redraw.bind(this),
                                htmlId: 'kind',
                                ref: 'type'
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'form-horizontal' },
                            React.createElement(
                                'label',
                                { htmlFor: 'period' },
                                (0, _helpers.translate)('client.charts.period')
                            ),
                            React.createElement(OpCatChartPeriodSelect, {
                                defaultValue: defaultPeriod,
                                onChange: this.redraw.bind(this),
                                htmlId: 'period',
                                ref: 'period'
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'form-horizontal' },
                            React.createElement(
                                'div',
                                { className: 'btn-group', role: 'group', 'aria-label': 'Show/Hide categories' },
                                React.createElement(
                                    'button',
                                    { type: 'button', className: 'btn btn-primary',
                                        onClick: this.onHideAll.bind(this) },
                                    (0, _helpers.translate)("client.charts.unselect_all_categories")
                                ),
                                React.createElement(
                                    'button',
                                    { type: 'button', className: 'btn btn-primary',
                                        onClick: this.onShowAll.bind(this) },
                                    (0, _helpers.translate)("client.charts.select_all_categories")
                                )
                            )
                        )
                    )
                ),
                React.createElement('div', { id: 'barchart', style: { width: '100%' } }),
                React.createElement('div', { id: 'piechart', style: { width: '100%' } })
            );
        }
    }]);
    return OpCatChart;
}(ChartComponent);

var BalanceChart = function (_ChartComponent2) {
    (0, _inherits3.default)(BalanceChart, _ChartComponent2);

    function BalanceChart() {
        (0, _classCallCheck3.default)(this, BalanceChart);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BalanceChart).apply(this, arguments));
    }

    (0, _createClass3.default)(BalanceChart, [{
        key: 'redraw',
        value: function redraw() {
            CreateChartBalance('#barchart', this.props.account, this.props.operations);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('div', { id: 'barchart', style: { width: '100%' } });
        }
    }]);
    return BalanceChart;
}(ChartComponent);

var InOutChart = function (_ChartComponent3) {
    (0, _inherits3.default)(InOutChart, _ChartComponent3);

    function InOutChart() {
        (0, _classCallCheck3.default)(this, InOutChart);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(InOutChart).apply(this, arguments));
    }

    (0, _createClass3.default)(InOutChart, [{
        key: 'redraw',
        value: function redraw() {
            CreateChartPositiveNegative('#barchart', this.props.operations);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('div', { id: 'barchart', style: { width: '100%' } });
        }
    }]);
    return InOutChart;
}(ChartComponent);

// Components

var ChartsComponent = function (_React$Component3) {
    (0, _inherits3.default)(ChartsComponent, _React$Component3);

    function ChartsComponent(props) {
        (0, _classCallCheck3.default)(this, ChartsComponent);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ChartsComponent).call(this, props));

        _this8.state = {
            account: null,
            operations: [],
            categories: [],
            kind: 'all' // which chart are we showing?
        };

        _this8.reload = _this8._reload.bind(_this8);
        return _this8;
    }

    (0, _createClass3.default)(ChartsComponent, [{
        key: '_reload',
        value: function _reload() {
            DEBUG('reload');
            this.setState({
                account: _store.store.getCurrentAccount(),
                operations: _store.store.getCurrentOperations(),
                categories: _store.store.getCategories()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            // Changing a bank may change the selected account
            _store.store.on(_store.State.banks, this.reload);

            // Changing the selected account needs reloading graphs for the
            // selected account.
            _store.store.on(_store.State.accounts, this.reload);

            // Obviously new categories means new graphs.
            _store.store.on(_store.State.categories, this.reload);

            _store.store.subscribeMaybeGet(_store.State.operations, this.reload);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.reload);
            _store.store.removeListener(_store.State.accounts, this.reload);
            _store.store.removeListener(_store.State.operations, this.reload);
            _store.store.removeListener(_store.State.categories, this.reload);
        }
    }, {
        key: 'changeKind',
        value: function changeKind(kind) {
            this.setState({
                kind: kind
            });
        }
    }, {
        key: 'onClick',
        value: function onClick(kind) {
            var _this9 = this;

            return function () {
                return _this9.changeKind(kind);
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _this10 = this;

            var chartComponent = '';
            switch (this.state.kind) {
                case 'all':
                    {
                        chartComponent = React.createElement(OpCatChart, { operations: this.state.operations });
                        break;
                    }
                case 'balance':
                    {
                        chartComponent = React.createElement(BalanceChart, { operations: this.state.operations, account: this.state.account });
                        break;
                    }
                case 'pos-neg':
                    {
                        // Flatten operations
                        var accounts = _store.store.getCurrentBankAccounts();
                        var ops = [];
                        for (var i = 0; i < accounts.length; i++) {
                            ops = ops.concat(accounts[i].operations);
                        }chartComponent = React.createElement(InOutChart, { operations: ops });
                        break;
                    }
                default:
                    (0, _helpers.assert)(false, 'unexpected chart kind');
            }

            var IsActive = function IsActive(which) {
                return which == _this10.state.kind ? 'active' : '';
            };

            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.charts.title')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'ul',
                        { className: 'nav nav-pills', role: 'tablist' },
                        React.createElement(
                            'li',
                            { role: 'presentation', className: IsActive('all') },
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.onClick('all') },
                                (0, _helpers.translate)('client.charts.by_category')
                            )
                        ),
                        React.createElement(
                            'li',
                            { role: 'presentation', className: IsActive('balance') },
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.onClick('balance') },
                                (0, _helpers.translate)('client.charts.balance')
                            )
                        ),
                        React.createElement(
                            'li',
                            { role: 'presentation', className: IsActive('pos-neg') },
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.onClick('pos-neg') },
                                (0, _helpers.translate)('client.charts.differences_all')
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'tab-content' },
                        chartComponent
                    )
                )
            );
        }
    }]);
    return ChartsComponent;
}(React.Component);

// Charts

exports.default = ChartsComponent;
function CreateBarChartAll(operations, barchartId) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    // Category -> {Month -> [Amounts]}
    var map = {};

    // Category -> color
    var colorMap = {};

    // Datekey -> Date
    var dateset = {};
    for (var _i = 0, size = operations.length; _i < size; _i++) {
        var op = operations[_i];
        var c = _store.store.getCategoryFromId(op.categoryId);
        map[c.title] = map[c.title] || {};

        var dk = datekey(op);
        map[c.title][dk] = map[c.title][dk] || [];
        map[c.title][dk].push(op.amount);
        dateset[dk] = +op.date;

        colorMap[c.title] = colorMap[c.title] || c.color;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort(function (a, b) {
        return a[1] - b[1];
    });

    var series = [];
    for (var c in map) {
        var data = [];

        for (var j = 0; j < dates.length; j++) {
            var dk = dates[j][0];
            map[c][dk] = map[c][dk] || [];
            data.push(round2(map[c][dk].reduce(function (a, b) {
                return a + b;
            }, 0)));
        }

        data = [c].concat(data);
        series.push(data);
    }

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString( /* use the default locale */undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    var yAxisLegend = (0, _helpers.translate)('client.charts.Amount');

    return c3.generate({

        bindto: barchartId,

        data: {
            columns: series,
            type: 'bar',
            colors: colorMap
        },

        bar: {
            width: {
                ratio: .5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories: categories
            },

            y: {
                label: yAxisLegend
            }
        },

        grid: {
            x: {
                show: true
            },
            y: {
                show: true,
                lines: [{ value: 0 }]
            }
        }
    });
}

function CreatePieChartAll(operations, chartId) {

    var catMap = new _map2.default();
    // categoryId -> [val1, val2, val3]
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(operations), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var op = _step.value;

            var catId = op.categoryId;
            var arr = catMap.has(catId) ? catMap.get(catId) : [];
            arr.push(op.amount);
            catMap.set(catId, arr);
        }

        // [ [categoryName, val1, val2], [anotherCategoryName, val3, val4] ]
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    var series = [];
    // {label -> color}
    var colorMap = {};
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(catMap), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2);

            var catId = _step2$value[0];
            var valueArr = _step2$value[1];

            var c = _store.store.getCategoryFromId(catId);
            series.push([c.title].concat(valueArr));
            colorMap[c.title] = c.color;
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'pie',
            colors: colorMap
        },

        tooltip: {
            format: {
                value: function value(_value, ratio, id) {
                    return round2(ratio * 100) + '% (' + Math.abs(round2(_value)) + ')';
                }
            }
        }

    });
}

function CreateChartBalance(chartId, account, operations) {

    if (account === null) {
        (0, _helpers.debug)('ChartComponent: no account');
        return;
    }

    var ops = operations.slice().sort(function (a, b) {
        return +a.date - +b.date;
    });

    function makeKey(date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    }

    var opmap = new _map2.default();

    // Fill all dates
    var DAY = 1000 * 60 * 60 * 24;

    var firstDate = ops.length ? +ops[0].date : Date.now();
    firstDate = (firstDate / DAY | 0) * DAY;

    var today = (Date.now() / DAY | 0) * DAY;
    for (; firstDate <= today; firstDate += DAY) {
        opmap.set(makeKey(new Date(firstDate)), 0);
    }

    // Date (day) -> cumulated sum of amounts for this day (scalar)
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = (0, _getIterator3.default)(ops), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var o = _step3.value;

            var key = makeKey(o.date);
            opmap.set(key, opmap.get(key) + o.amount);
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    ;

    var balance = account.initialAmount;
    var csv = "Date,Balance\n";
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(opmap), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2);

            var date = _step4$value[0];
            var amount = _step4$value[1];

            balance += amount;
            csv += date + ',' + round2(balance) + '\n';
        }

        // Create the chart
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    new Dygraph(document.querySelector(chartId), csv);
}

function CreateChartPositiveNegative(chartId, operations) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    var POS = 0,
        NEG = 1,
        BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    var map = {};
    // Datekey -> Date
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var dk = datekey(op);
        map[dk] = map[dk] || [0, 0, 0];

        map[dk][POS] += op.amount > 0 ? op.amount : 0;
        map[dk][NEG] += op.amount < 0 ? -op.amount : 0;
        map[dk][BAL] += op.amount;

        dateset[dk] = +op.date;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort(function (a, b) {
        return a[1] - b[1];
    });

    var series = [];
    function addSerie(name, mapIndex) {
        var data = [];
        for (var i = 0; i < dates.length; i++) {
            var dk = dates[i][0];
            data.push(round2(map[dk][mapIndex]));
        }
        var serie = [name].concat(data);
        series.push(serie);
    }

    addSerie((0, _helpers.translate)('client.charts.Received'), POS);
    addSerie((0, _helpers.translate)('client.charts.Paid'), NEG);
    addSerie((0, _helpers.translate)('client.charts.Saved'), BAL);

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString( /* use the default locale */undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    var yAxisLegend = (0, _helpers.translate)('client.charts.Amount');

    var chart = c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'bar'
        },

        bar: {
            width: {
                ratio: .5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories: categories
            },

            y: {
                label: yAxisLegend
            }
        },

        grid: {
            x: {
                show: true
            },
            y: {
                show: true,
                lines: [{ value: 0 }]
            }
        }
    });
}

},{"../helpers":30,"../store":33,"babel-runtime/core-js/get-iterator":34,"babel-runtime/core-js/map":37,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52,"babel-runtime/helpers/slicedToArray":53}],9:[function(require,module,exports){
"use strict";

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ColorPicker = function (_React$Component) {
    (0, _inherits3.default)(ColorPicker, _React$Component);

    function ColorPicker() {
        (0, _classCallCheck3.default)(this, ColorPicker);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ColorPicker).apply(this, arguments));
    }

    (0, _createClass3.default)(ColorPicker, [{
        key: "getValue",
        value: function getValue() {
            return this.refs.picker.getDOMNode().value;
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            if (!Modernizr.inputtypes.color) $(this.refs.picker.getDOMNode()).minicolors().parent().css("width", "100%");
        }
    }, {
        key: "componentWillUnmount",
        value: function componentWillUnmount() {
            if (!Modernizr.inputtypes.color) $(this.refs.picker.getDOMNode()).minicolors("destroy");
        }
    }, {
        key: "render",
        value: function render() {
            function generateColor() {
                var convertRGBToHex = function convertRGBToHex(rgb) {
                    var hexRed = rgb.r.toString(16).toUpperCase();
                    if (hexRed.length < 2) hexRed += hexRed;

                    var hexGreen = rgb.g.toString(16).toUpperCase();
                    if (hexGreen.length < 2) hexGreen += hexGreen;

                    var hexBlue = rgb.b.toString(16).toUpperCase();
                    if (hexBlue.length < 2) hexBlue += hexBlue;

                    return "#" + hexRed + hexGreen + hexBlue;
                };

                var generatePrimaryColor = function generatePrimaryColor() {
                    // Ranges of bright colors
                    var ranges = [[100, 255], [50, 200], [10, 100]];

                    // Select random range and remove
                    var r = ranges.splice(Math.floor(Math.random() * ranges.length), 1)[0];

                    // Pick a random number from within the range

                    var _r = (0, _slicedToArray3.default)(r, 2);

                    var low = _r[0];
                    var high = _r[1];

                    return Math.floor(Math.random() * (high - low)) + low;
                };

                return convertRGBToHex({
                    r: generatePrimaryColor(),
                    g: generatePrimaryColor(),
                    b: generatePrimaryColor()
                });
            }

            return React.createElement("input", {
                type: Modernizr.inputtypes.color ? "color" : "hidden",
                className: "form-control",
                defaultValue: this.props.defaultValue || generateColor(),
                ref: "picker"
            });
        }
    }]);
    return ColorPicker;
}(React.Component);

exports.default = ColorPicker;

},{"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52,"babel-runtime/helpers/slicedToArray":53}],10:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

var _Modal = require('./Modal');

var _Modal2 = _interopRequireDefault(_Modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ConfirmDeleteModal = function (_React$Component) {
    (0, _inherits3.default)(ConfirmDeleteModal, _React$Component);

    function ConfirmDeleteModal(props) {
        (0, _classCallCheck3.default)(this, ConfirmDeleteModal);

        (0, _helpers.has)(props, 'modalId');
        (0, _helpers.has)(props, 'modalBody');
        (0, _helpers.has)(props, 'onDelete');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ConfirmDeleteModal).call(this, props));
    }

    (0, _createClass3.default)(ConfirmDeleteModal, [{
        key: 'render',
        value: function render() {
            var modalTitle = (0, _helpers.translate)('client.confirmdeletemodal.title');

            var modalFooter = React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal' },
                    (0, _helpers.translate)('client.confirmdeletemodal.dont_delete')
                ),
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-danger', 'data-dismiss': 'modal', onClick: this.props.onDelete },
                    (0, _helpers.translate)('client.confirmdeletemodal.confirm')
                )
            );

            return React.createElement(_Modal2.default, { modalId: this.props.modalId,
                modalBody: this.props.modalBody,
                modalTitle: modalTitle,
                modalFooter: modalFooter });
        }
    }]);
    return ConfirmDeleteModal;
}(React.Component);

exports.default = ConfirmDeleteModal;

},{"../helpers":30,"./Modal":16,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],11:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CustomBankField = function (_React$Component) {
    (0, _inherits3.default)(CustomBankField, _React$Component);

    function CustomBankField(props) {
        (0, _classCallCheck3.default)(this, CustomBankField);

        (0, _helpers.has)(props, 'params');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CustomBankField).call(this, props));
    }

    (0, _createClass3.default)(CustomBankField, [{
        key: 'getValue',
        value: function getValue() {
            var node = this.refs.field.getDOMNode();
            return {
                name: this.props.params.name,
                value: this.props.params.type === "number" ? parseInt(node.value, 10) : node.value
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var customFieldFormInput = undefined;

            switch (this.props.params.type) {
                case "select":
                    var customFieldOptions = this.props.params.values.map(function (opt) {
                        return React.createElement(
                            'option',
                            { key: opt.value, value: opt.value,
                                selected: opt.value === (_this2.props.params.currentValue || _this2.props.params.default) },
                            opt.label
                        );
                    });
                    customFieldFormInput = React.createElement(
                        'select',
                        { name: this.props.params.name, className: 'form-control', id: this.props.params.name, ref: 'field' },
                        customFieldOptions
                    );
                    break;

                case "text":
                case "number":
                case "password":
                    customFieldFormInput = React.createElement('input', { name: this.props.params.name,
                        type: this.props.params.type,
                        className: 'form-control',
                        id: this.props.params.name,
                        ref: 'field',
                        placeholder: this.props.params.placeholderKey ? (0, _helpers.translate)(this.props.params.placeholderKey) : '',
                        value: this.props.params.currentValue
                    });
                    break;

                default:
                    alert((0, _helpers.translate)('client.settings.unknown_field_type'));
            }

            return React.createElement(
                'div',
                { className: 'form-group' },
                React.createElement(
                    'label',
                    { htmlFor: this.props.params.name },
                    (0, _helpers.translate)(this.props.params.labelKey)
                ),
                customFieldFormInput
            );
        }
    }]);
    return CustomBankField;
}(React.Component);

exports.default = CustomBankField;

},{"../helpers":30,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],12:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DatePicker = function (_React$Component) {
    (0, _inherits3.default)(DatePicker, _React$Component);

    function DatePicker(props) {
        (0, _classCallCheck3.default)(this, DatePicker);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DatePicker).call(this, props));

        _this.pickadate = null;
        return _this;
    }

    (0, _createClass3.default)(DatePicker, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            this.pickadate = $(this.refs.elem.getDOMNode()).pickadate().pickadate('picker');
            this.pickadate.on('set', function (value) {
                if ((0, _helpers.maybeHas)(value, 'clear')) {
                    _this2.props.onSelect && _this2.props.onSelect(null);
                } else if ((0, _helpers.maybeHas)(value, 'select')) {
                    var actualDate = new Date(value.select);

                    // pickadate returns UTC time, fix the timezone offset.
                    actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());

                    _this2.props.onSelect && _this2.props.onSelect(+actualDate);
                }
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.refs.elem.getDOMNode().value = '';
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('input', { className: 'form-control', type: 'text', ref: 'elem' });
        }
    }]);
    return DatePicker;
}(React.Component);

exports.default = DatePicker;
;

},{"../helpers":30,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],13:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Global variables

var ImportModule = function (_React$Component) {
    (0, _inherits3.default)(ImportModule, _React$Component);

    function ImportModule() {
        (0, _classCallCheck3.default)(this, ImportModule);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ImportModule).apply(this, arguments));
    }

    (0, _createClass3.default)(ImportModule, [{
        key: 'onImportInstance',
        value: function onImportInstance(e) {

            var $importFile = document.getElementById('importFile');
            if (!$importFile || !$importFile.files || !$importFile.files.length) {
                alert('Need to select a file!');
                e.preventDefault();
                return;
            }

            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                var asText = e.target.result;
                var asJSON = undefined;
                try {
                    asJSON = JSON.parse(asText);
                } catch (e) {
                    alert('JSON file to import isnt valid!');
                }
                _store.Actions.ImportInstance({
                    content: asJSON
                });
            };
            fileReader.readAsText($importFile.files[0]);

            $importFile.value = '';

            e.preventDefault();
            return;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'row' },
                React.createElement('input', {
                    type: 'file',
                    name: 'importFile',
                    id: 'importFile',
                    className: 'col-xs-9' }),
                React.createElement(
                    'button',
                    {
                        id: 'importInstance',
                        className: 'btn btn-primary col-xs-3',
                        onClick: this.onImportInstance.bind(this) },
                    (0, _helpers.translate)('client.settings.go_import_instance')
                )
            );
        }
    }]);
    return ImportModule;
}(React.Component);

exports.default = ImportModule;

},{"../helpers":30,"../store":33,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],14:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LoadScreen = function (_React$Component) {
    (0, _inherits3.default)(LoadScreen, _React$Component);

    function LoadScreen() {
        (0, _classCallCheck3.default)(this, LoadScreen);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LoadScreen).apply(this, arguments));
    }

    (0, _createClass3.default)(LoadScreen, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'h1',
                    null,
                    (0, _helpers.translate)('client.loadscreen.title')
                ),
                React.createElement(
                    'div',
                    { className: 'well' },
                    (0, _helpers.translate)('client.loadscreen.prolix1'),
                    React.createElement('br', null),
                    React.createElement('br', null),
                    (0, _helpers.translate)('client.loadscreen.prolix2'),
                    ' ',
                    React.createElement(
                        'a',
                        { href: 'https://github.com/bnjbvr/kresus/blob/incoming/README.md' },
                        'README'
                    ),
                    ' ',
                    (0, _helpers.translate)('client.loadscreen.prolix3'),
                    React.createElement('br', null),
                    React.createElement('br', null),
                    (0, _helpers.translate)('client.loadscreen.prolix4'),
                    ' ',
                    React.createElement(
                        'a',
                        { href: 'https://forum.cozy.io/t/app-kresus/' },
                        'forum'
                    ),
                    '.',
                    React.createElement('br', null),
                    React.createElement('br', null),
                    (0, _helpers.translate)('client.loadscreen.prolix5')
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement('iframe', {
                        width: '100%',
                        height: '600px',
                        src: 'https://www.youtube.com/embed/y6XBBqnPKEA',
                        frameBorder: '0',
                        allowFullScreen: true })
                )
            );
        }
    }]);
    return LoadScreen;
}(React.Component);

exports.default = LoadScreen;

},{"../helpers":30,"../store":33,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],15:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

var _NewBankForm = require('./NewBankForm');

var _NewBankForm2 = _interopRequireDefault(_NewBankForm);

var _ImportModule = require('./ImportModule');

var _ImportModule2 = _interopRequireDefault(_ImportModule);

var _Settings = require('./Settings');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MainAccountWizard = function (_React$Component) {
    (0, _inherits3.default)(MainAccountWizard, _React$Component);

    function MainAccountWizard() {
        (0, _classCallCheck3.default)(this, MainAccountWizard);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MainAccountWizard).apply(this, arguments));
    }

    (0, _createClass3.default)(MainAccountWizard, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'wizard panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h1',
                        { className: 'panel-title' },
                        (0, _helpers.translate)('client.accountwizard.title')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'p',
                        null,
                        (0, _helpers.translate)('client.accountwizard.content')
                    ),
                    React.createElement(
                        'ul',
                        { className: 'nav nav-tabs' },
                        React.createElement(
                            'li',
                            { className: 'active' },
                            React.createElement(
                                'a',
                                { href: '#bank_form', 'data-toggle': 'tab' },
                                (0, _helpers.translate)('client.settings.new_bank_form_title')
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#import', 'data-toggle': 'tab' },
                                (0, _helpers.translate)('client.accountwizard.import_title')
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { href: '#advanced', 'data-toggle': 'tab' },
                                (0, _helpers.translate)('client.accountwizard.advanced')
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'tab-content' },
                        React.createElement(
                            'div',
                            { className: 'tab-pane active', id: 'bank_form' },
                            React.createElement(_NewBankForm2.default, { expanded: true })
                        ),
                        React.createElement(
                            'div',
                            { className: 'tab-pane', id: 'import' },
                            React.createElement(
                                'p',
                                null,
                                (0, _helpers.translate)('client.accountwizard.import')
                            ),
                            React.createElement(_ImportModule2.default, null)
                        ),
                        React.createElement(
                            'div',
                            { className: 'tab-pane', id: 'advanced' },
                            React.createElement(_Settings.WeboobParameters, null)
                        )
                    )
                )
            );
        }
    }]);
    return MainAccountWizard;
}(React.Component);

exports.default = MainAccountWizard;
;

},{"../helpers":30,"./ImportModule":13,"./NewBankForm":17,"./Settings":22,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],16:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modal = function (_React$Component) {
    (0, _inherits3.default)(Modal, _React$Component);

    function Modal(props) {
        (0, _classCallCheck3.default)(this, Modal);

        (0, _helpers.has)(props, 'modalId');
        (0, _helpers.has)(props, 'modalBody');
        (0, _helpers.has)(props, 'modalTitle');
        (0, _helpers.has)(props, 'modalFooter');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Modal).call(this, props));
    }

    (0, _createClass3.default)(Modal, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'modal fade', id: this.props.modalId, tabIndex: '-1',
                    role: 'dialog', 'aria-labelledby': 'myModalLabel', 'aria-hidden': 'true' },
                React.createElement(
                    'div',
                    { className: 'modal-dialog' },
                    React.createElement(
                        'div',
                        { className: 'modal-content' },
                        React.createElement(
                            'div',
                            { className: 'modal-header' },
                            React.createElement(
                                'button',
                                { type: 'button', className: 'close', 'data-dismiss': 'modal',
                                    'aria-label': 'Close' },
                                React.createElement(
                                    'span',
                                    { 'aria-hidden': 'true' },
                                    '×'
                                )
                            ),
                            React.createElement(
                                'h4',
                                { className: 'modal-title', id: 'myModalLabel' },
                                this.props.modalTitle
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'modal-body' },
                            this.props.modalBody
                        ),
                        React.createElement(
                            'div',
                            { className: 'modal-footer' },
                            this.props.modalFooter
                        )
                    )
                )
            );
        }
    }]);
    return Modal;
}(React.Component);

exports.default = Modal;

},{"../helpers":30,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],17:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

var _errors = require('../errors');

var _errors2 = _interopRequireDefault(_errors);

var _CustomBankField = require('./CustomBankField');

var _CustomBankField2 = _interopRequireDefault(_CustomBankField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NewBankForm = function (_React$Component) {
    (0, _inherits3.default)(NewBankForm, _React$Component);

    function NewBankForm(props) {
        (0, _classCallCheck3.default)(this, NewBankForm);

        (0, _helpers.has)(props, 'expanded');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NewBankForm).call(this, props));

        _this.state = {
            expanded: _this.props.expanded,
            hasCustomFields: false,
            customFields: []
        };
        return _this;
    }

    (0, _createClass3.default)(NewBankForm, [{
        key: 'toggleExpand',
        value: function toggleExpand() {
            this.setState({
                expanded: !this.state.expanded
            });
        }
    }, {
        key: 'domBank',
        value: function domBank() {
            return this.refs.bank.getDOMNode();
        }
    }, {
        key: 'domId',
        value: function domId() {
            return this.refs.id.getDOMNode();
        }
    }, {
        key: 'domPassword',
        value: function domPassword() {
            return this.refs.password.getDOMNode();
        }
    }, {
        key: 'onChangedBank',
        value: function onChangedBank() {
            var uuid = this.domBank().value;
            var found = _store.store.getStaticBanks().filter(function (b) {
                return b.uuid == uuid;
            });

            (0, _helpers.assert)(found.length == 1, 'selected bank doesnt exist');
            var bank = found[0];

            if (typeof bank.customFields !== 'undefined') {
                this.setState({
                    hasCustomFields: true,
                    customFields: bank.customFields
                });
            } else {
                this.setState({
                    hasCustomFields: false,
                    customFields: []
                });
            }
        }
    }, {
        key: 'onSubmit',
        value: function onSubmit() {
            var _this2 = this;

            var bank = this.domBank().value;
            var id = this.domId().value.trim();
            var pwd = this.domPassword().value.trim();
            var customFields = undefined;

            if (this.state.hasCustomFields) {
                customFields = this.state.customFields.map(function (field, index) {
                    return _this2.refs["customField" + index].getValue();
                });
            }

            if (!id.length || !pwd.length) {
                alert((0, _helpers.translate)('client.settings.missing_login_or_password'));
                return;
            }

            _store.store.once(_store.State.sync, this._afterSync.bind(this));
            _store.Actions.CreateBank(bank, id, pwd, this.state.hasCustomFields ? customFields : undefined);
        }
    }, {
        key: '_afterSync',
        value: function _afterSync(err) {
            if (!err) {
                this.setState({
                    expanded: false
                });
                return;
            }

            switch (err.code) {
                case _errors2.default.INVALID_PASSWORD:
                    alert((0, _helpers.translate)('client.sync.first_time_wrong_password'));
                    this.domPassword().value = '';
                    this.domPassword().select();
                    break;
                case _errors2.default.INVALID_PARAMETERS:
                    alert((0, _helpers.translate)('client.sync.invalid_parameters', { content: err.content }));
                    break;
                case _errors2.default.EXPIRED_PASSWORD:
                    alert((0, _helpers.translate)('client.sync.expired_password'));
                    break;
                case _errors2.default.UNKNOWN_MODULE:
                    alert((0, _helpers.translate)('client.sync.unknown_module'));
                    break;
                default:
                    alert((0, _helpers.translate)('client.sync.unknown_error', { content: err.content }));
                    break;
            }
        }
    }, {
        key: 'onKeyUp',
        value: function onKeyUp(e) {
            if (e.keyCode == 13) {
                this.onSubmit();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var maybeForm = React.createElement('div', { className: 'transition-expand' });

            if (this.state.expanded) {
                var options = _store.store.getStaticBanks().map(function (bank) {
                    return React.createElement(
                        'option',
                        { key: bank.id, value: bank.uuid },
                        bank.name
                    );
                });

                var maybeCustomFields = [];
                if (this.state.hasCustomFields) {
                    maybeCustomFields = this.state.customFields.map(function (field, index) {
                        return React.createElement(_CustomBankField2.default, { ref: "customField" + index, params: field });
                    });
                } else {
                    maybeCustomFields = React.createElement('div', null);
                }

                maybeForm = React.createElement(
                    'div',
                    { className: 'panel-body transition-expand' },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'bank' },
                            (0, _helpers.translate)('client.settings.bank')
                        ),
                        React.createElement(
                            'select',
                            { className: 'form-control', id: 'bank', ref: 'bank', onChange: this.onChangedBank.bind(this) },
                            options
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'id' },
                            (0, _helpers.translate)('client.settings.login')
                        ),
                        React.createElement('input', { type: 'text', className: 'form-control', id: 'id', ref: 'id',
                            onKeyUp: this.onKeyUp.bind(this) })
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'password' },
                            (0, _helpers.translate)('client.settings.password')
                        ),
                        React.createElement('input', { type: 'password', className: 'form-control', id: 'password', ref: 'password',
                            onKeyUp: this.onKeyUp.bind(this) })
                    ),
                    maybeCustomFields,
                    React.createElement('input', { type: 'submit',
                        className: 'btn btn-save pull-right',
                        onClick: this.onSubmit.bind(this),
                        value: (0, _helpers.translate)('client.settings.submit') })
                );
            }

            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.settings.new_bank_form_title')
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: "option-legend fa fa-" + (this.state.expanded ? "minus" : "plus") + "-circle", 'aria-label': 'add',
                            onClick: this.toggleExpand.bind(this),
                            title: (0, _helpers.translate)("client.settings.add_bank_button") })
                    ),
                    maybeForm
                )
            );
        }
    }]);
    return NewBankForm;
}(React.Component);

exports.default = NewBankForm;

},{"../errors":27,"../helpers":30,"../store":33,"./CustomBankField":11,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],18:[function(require,module,exports){
'use strict';

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

var _models = require('../models');

var _store = require('../store');

var _errors = require('../errors');

var _AmountWell = require('./AmountWell');

var _SearchOperationList = require('./SearchOperationList');

var _SearchOperationList2 = _interopRequireDefault(_SearchOperationList);

var _CategorySelectComponent = require('./CategorySelectComponent');

var _CategorySelectComponent2 = _interopRequireDefault(_CategorySelectComponent);

var _OperationTypeSelectComponent = require('./OperationTypeSelectComponent');

var _OperationTypeSelectComponent2 = _interopRequireDefault(_OperationTypeSelectComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
var SMALL_TITLE_THRESHOLD = 4;

// Components
function ComputeAttachmentLink(op) {
    var file = op.binary.fileName || 'file';
    return 'operations/' + op.id + '/' + file;
}

var LabelComponent = function (_React$Component) {
    (0, _inherits3.default)(LabelComponent, _React$Component);

    function LabelComponent(props) {
        (0, _classCallCheck3.default)(this, LabelComponent);

        (0, _helpers.has)(props, 'operation');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LabelComponent).call(this, props));

        _this.state = {
            editMode: false
        };
        return _this;
    }

    (0, _createClass3.default)(LabelComponent, [{
        key: 'buttonLabel',
        value: function buttonLabel() {
            (0, _helpers.assert)(false, "buttonLabel() must be implemented by the subclasses!");
        }
    }, {
        key: 'dom',
        value: function dom() {
            return this.refs.customlabel.getDOMNode();
        }
    }, {
        key: 'switchToEditMode',
        value: function switchToEditMode() {
            var _this2 = this;

            this.setState({ editMode: true }, function () {
                _this2.dom().focus();
                // Set the cursor at the end
                _this2.dom().selectionStart = (_this2.dom().value || '').length;
            });
        }
    }, {
        key: 'switchToStaticMode',
        value: function switchToStaticMode() {
            this.setState({ editMode: false });
        }
    }, {
        key: 'onBlur',
        value: function onBlur() {
            var customLabel = this.dom().value;
            if (customLabel) {
                // If the new non empty customLabel value is different from the current one, save it.
                if (customLabel.trim() !== this.defaultValue() && customLabel.trim().length) {
                    _store.Actions.SetCustomLabel(this.props.operation, customLabel);
                    // Be optimistic
                    this.props.operation.customLabel = customLabel;
                }
            } else if (this.props.operation.customLabel && this.props.operation.customLabel.length) {
                // If the new customLabel value is empty and there was already one, unset it.
                _store.Actions.SetCustomLabel(this.props.operation, '');
                // Be optimistic
                this.props.operation.customLabel = null;
            }
            this.switchToStaticMode();
        }
    }, {
        key: 'onKeyUp',
        value: function onKeyUp(e) {
            if (e.key === 'Enter') {
                this.onBlur();
            } else if (e.key === 'Escape') {
                this.switchToStaticMode();
            }
        }
    }, {
        key: 'defaultValue',
        value: function defaultValue() {
            var op = this.props.operation;

            var customLabel = op.customLabel;
            if (customLabel !== null && customLabel.trim().length) {
                return customLabel;
            }

            var label = undefined;
            if (op.title.length < SMALL_TITLE_THRESHOLD) {
                label = op.raw;
                if (op.title.length) {
                    label += ' (' + op.title + ')';
                }
            } else {
                label = op.title;
            }
            return label;
        }
    }, {
        key: 'render',
        value: function render() {
            if (!this.state.editMode) {
                return React.createElement(
                    'button',
                    {
                        className: 'form-control text-left btn-transparent',
                        id: this.props.operation.id,
                        onClick: this.switchToEditMode.bind(this) },
                    this.buttonLabel()
                );
            }
            return React.createElement('input', { className: 'form-control',
                type: 'text',
                ref: 'customlabel',
                id: this.props.operation.id,
                defaultValue: this.defaultValue(),
                onBlur: this.onBlur.bind(this),
                onKeyUp: this.onKeyUp.bind(this)
            });
        }
    }]);
    return LabelComponent;
}(React.Component);

var DetailedViewLabelComponent = function (_LabelComponent) {
    (0, _inherits3.default)(DetailedViewLabelComponent, _LabelComponent);

    function DetailedViewLabelComponent(props) {
        (0, _classCallCheck3.default)(this, DetailedViewLabelComponent);

        (0, _helpers.has)(props, 'operation');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DetailedViewLabelComponent).call(this, props));
    }

    (0, _createClass3.default)(DetailedViewLabelComponent, [{
        key: 'buttonLabel',
        value: function buttonLabel() {
            var customLabel = this.props.operation.customLabel;
            if (customLabel === null || customLabel.trim().length === 0) {
                return React.createElement(
                    'em',
                    { className: 'text-muted' },
                    (0, _helpers.translate)('client.operations.add_custom_label')
                );
            }
            return React.createElement(
                'div',
                { className: 'label-button' },
                customLabel
            );
        }
    }]);
    return DetailedViewLabelComponent;
}(LabelComponent);

var OperationListViewLabelComponent = function (_LabelComponent2) {
    (0, _inherits3.default)(OperationListViewLabelComponent, _LabelComponent2);

    function OperationListViewLabelComponent(props) {
        (0, _classCallCheck3.default)(this, OperationListViewLabelComponent);

        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'link');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationListViewLabelComponent).call(this, props));
    }

    (0, _createClass3.default)(OperationListViewLabelComponent, [{
        key: 'buttonLabel',
        value: function buttonLabel() {
            return React.createElement(
                'div',
                { className: 'label-button text-uppercase' },
                this.defaultValue()
            );
        }
    }, {
        key: 'render',
        value: function render() {
            if (typeof this.props.link === 'undefined') {
                return (0, _get3.default)((0, _getPrototypeOf2.default)(OperationListViewLabelComponent.prototype), 'render', this).call(this);
            }
            return React.createElement(
                'div',
                { className: 'input-group' },
                this.props.link,
                (0, _get3.default)((0, _getPrototypeOf2.default)(OperationListViewLabelComponent.prototype), 'render', this).call(this)
            );
        }
    }]);
    return OperationListViewLabelComponent;
}(LabelComponent);

var OperationDetails = function (_React$Component2) {
    (0, _inherits3.default)(OperationDetails, _React$Component2);

    function OperationDetails(props) {
        (0, _classCallCheck3.default)(this, OperationDetails);

        (0, _helpers.has)(props, 'toggleDetails');
        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'rowClassName');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationDetails).call(this, props));
    }

    (0, _createClass3.default)(OperationDetails, [{
        key: 'onSelectOperationType',
        value: function onSelectOperationType(id) {
            _store.Actions.SetOperationType(this.props.operation, id);
            this.props.operation.operationTypeID = id;
        }
    }, {
        key: 'onSelectCategory',
        value: function onSelectCategory(id) {
            _store.Actions.SetOperationCategory(this.props.operation, id);
            this.props.operation.categoryId = id;
        }
    }, {
        key: 'render',
        value: function render() {
            var op = this.props.operation;

            var maybeAttachment = '';
            if (op.binary !== null) {
                var opLink = ComputeAttachmentLink(op);
                maybeAttachment = React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: opLink, target: '_blank' },
                        React.createElement('span', { className: 'glyphicon glyphicon-file' }),
                        (0, _helpers.translate)('client.operations.attached_file')
                    )
                );
            } else if (op.attachments && op.attachments.url !== null) {
                maybeAttachment = React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: op.attachments.url, target: '_blank' },
                        React.createElement('span', { className: 'glyphicon glyphicon-file' }),
                        (0, _helpers.translate)('client.' + op.attachments.linkTranslationKey)
                    )
                );
            }

            return React.createElement(
                'tr',
                { className: this.props.rowClassName },
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.props.toggleDetails },
                        React.createElement('i', { className: 'fa fa-minus-square' })
                    )
                ),
                React.createElement(
                    'td',
                    { colSpan: '5', className: 'text-uppercase' },
                    React.createElement(
                        'ul',
                        null,
                        React.createElement(
                            'li',
                            null,
                            (0, _helpers.translate)('client.operations.full_label'),
                            op.raw
                        ),
                        React.createElement(
                            'li',
                            { className: 'form-inline' },
                            (0, _helpers.translate)('client.operations.custom_label'),
                            React.createElement(DetailedViewLabelComponent, { operation: op })
                        ),
                        React.createElement(
                            'li',
                            null,
                            (0, _helpers.translate)('client.operations.amount'),
                            op.amount
                        ),
                        React.createElement(
                            'li',
                            { className: 'form-inline' },
                            (0, _helpers.translate)('client.operations.type'),
                            React.createElement(_OperationTypeSelectComponent2.default, {
                                operation: op,
                                onSelectId: this.onSelectOperationType.bind(this)
                            })
                        ),
                        React.createElement(
                            'li',
                            { className: 'form-inline' },
                            (0, _helpers.translate)('client.operations.category'),
                            React.createElement(_CategorySelectComponent2.default, {
                                operation: op,
                                onSelectId: this.onSelectCategory.bind(this)
                            })
                        ),
                        maybeAttachment
                    )
                )
            );
        }
    }]);
    return OperationDetails;
}(React.Component);

var OperationComponent = function (_React$Component3) {
    (0, _inherits3.default)(OperationComponent, _React$Component3);

    function OperationComponent(props) {
        (0, _classCallCheck3.default)(this, OperationComponent);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationComponent).call(this, props));

        _this6.state = {
            showDetails: false
        };
        return _this6;
    }

    (0, _createClass3.default)(OperationComponent, [{
        key: 'toggleDetails',
        value: function toggleDetails(e) {
            this.setState({ showDetails: !this.state.showDetails });
            e.preventDefault();
        }
    }, {
        key: 'onSelectOperationType',
        value: function onSelectOperationType(id) {
            _store.Actions.SetOperationType(this.props.operation, id);
            this.props.operation.operationTypeID = id;
        }
    }, {
        key: 'onSelectCategory',
        value: function onSelectCategory(id) {
            _store.Actions.SetOperationCategory(this.props.operation, id);
            this.props.operation.categoryId = id;
        }
    }, {
        key: 'render',
        value: function render() {
            var op = this.props.operation;

            var rowClassName = op.amount > 0 ? "success" : "";

            if (this.state.showDetails) {
                return React.createElement(OperationDetails, {
                    toggleDetails: this.toggleDetails.bind(this),
                    operation: op,
                    rowClassName: rowClassName });
            }

            // Add a link to the attached file, if there is any.
            var link = undefined;
            if (op.binary !== null) {
                var opLink = ComputeAttachmentLink(op);
                link = React.createElement(
                    'label',
                    { 'for': op.id, className: 'input-group-addon box-transparent' },
                    React.createElement(
                        'a',
                        {
                            target: '_blank',
                            href: opLink,
                            title: (0, _helpers.translate)('client.operations.attached_file') },
                        React.createElement('span', { className: 'glyphicon glyphicon-file', 'aria-hidden': 'true' })
                    )
                );
            } else if (op.attachments && op.attachments.url !== null) {
                maybeAttachment = React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: op.attachments.url, target: '_blank' },
                        React.createElement('span', { className: 'glyphicon glyphicon-link' }),
                        (0, _helpers.translate)('client.' + op.attachments.linkTranslationKey)
                    )
                );
            }

            return React.createElement(
                'tr',
                { className: rowClassName },
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.toggleDetails.bind(this) },
                        React.createElement('i', { className: 'fa fa-plus-square' })
                    )
                ),
                React.createElement(
                    'td',
                    null,
                    op.date.toLocaleDateString()
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(_OperationTypeSelectComponent2.default, {
                        operation: op,
                        onSelectId: this.onSelectOperationType.bind(this)
                    })
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(OperationListViewLabelComponent, { operation: op, link: link })
                ),
                React.createElement(
                    'td',
                    null,
                    op.amount
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(_CategorySelectComponent2.default, {
                        operation: op,
                        onSelectId: this.onSelectCategory.bind(this)
                    })
                )
            );
        }
    }]);
    return OperationComponent;
}(React.Component);

var SyncButton = function (_React$Component4) {
    (0, _inherits3.default)(SyncButton, _React$Component4);

    function SyncButton(props) {
        (0, _classCallCheck3.default)(this, SyncButton);

        (0, _helpers.has)(props, 'account');

        var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SyncButton).call(this, props));

        _this7.state = {
            isSynchronizing: false
        };
        return _this7;
    }

    (0, _createClass3.default)(SyncButton, [{
        key: 'onFetchOperations',
        value: function onFetchOperations() {
            _store.store.once(_store.State.sync, this.afterFetchOperations.bind(this));
            _store.Actions.FetchOperations();
            // Change UI to show a message indicating sync.
            this.setState({
                isSynchronizing: true
            });
        }
    }, {
        key: 'afterFetchOperations',
        value: function afterFetchOperations(err) {
            this.setState({
                isSynchronizing: false
            });
            (0, _errors.MaybeHandleSyncError)(err);
        }
    }, {
        key: 'render',
        value: function render() {
            var text = this.state.isSynchronizing ? React.createElement(
                'div',
                { className: 'last-sync' },
                React.createElement(
                    'span',
                    { className: 'option-legend' },
                    (0, _helpers.translate)('client.operations.syncing')
                ),
                React.createElement('span', { className: 'fa fa-refresh fa-spin' })
            ) : React.createElement(
                'div',
                { className: 'last-sync' },
                React.createElement(
                    'span',
                    { className: 'option-legend' },
                    (0, _helpers.translate)('client.operations.last_sync'),
                    ' ' + new Date(this.props.account.lastChecked).toLocaleString()
                ),
                React.createElement(
                    'a',
                    { href: '#', onClick: this.onFetchOperations.bind(this) },
                    React.createElement('span', { className: 'option-legend fa fa-refresh' })
                )
            );

            return React.createElement(
                'div',
                { className: 'panel-options' },
                text
            );
        }
    }]);
    return SyncButton;
}(React.Component);

var SHOW_ITEMS_INITIAL = 30; // elements
var SHOW_ITEMS_MORE = 50; // elements
var SHOW_ITEMS_TIMEOUT = 300; // ms

var OperationsComponent = function (_React$Component5) {
    (0, _inherits3.default)(OperationsComponent, _React$Component5);

    function OperationsComponent(props) {
        (0, _classCallCheck3.default)(this, OperationsComponent);

        var _this8 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationsComponent).call(this, props));

        _this8.state = {
            account: null,
            operations: [],
            filteredOperations: [],
            lastItemShown: SHOW_ITEMS_INITIAL,
            hasFilteredOperations: false
        };
        _this8.showMoreTimer = null;
        _this8.listener = _this8._listener.bind(_this8);
        return _this8;
    }

    (0, _createClass3.default)(OperationsComponent, [{
        key: '_listener',
        value: function _listener() {
            var _this9 = this;

            this.setState({
                account: _store.store.getCurrentAccount(),
                operations: _store.store.getCurrentOperations(),
                lastItemShown: SHOW_ITEMS_INITIAL
            }, function () {
                return _this9.refs.search.filter();
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.banks, this.listener);
            _store.store.on(_store.State.accounts, this.listener);
            _store.store.subscribeMaybeGet(_store.State.operations, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.listener);
            _store.store.removeListener(_store.State.operations, this.listener);
            _store.store.removeListener(_store.State.accounts, this.listener);

            if (this.showMoreTimer) {
                clearTimeout(this.showMoreTimer);
                this.showMoreTimer = null;
            }
        }
    }, {
        key: 'setFilteredOperations',
        value: function setFilteredOperations(operations) {
            this.setState({
                filteredOperations: operations,
                hasFilteredOperations: operations.length < this.state.operations.length,
                lastItemShown: SHOW_ITEMS_INITIAL
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this10 = this;

            // Edge case: the component hasn't retrieved the account yet.
            if (this.state.account === null) {
                return React.createElement('div', null);
            }

            var ops = this.state.filteredOperations.filter(function (op, i) {
                return i <= _this10.state.lastItemShown;
            }).map(function (o) {
                return React.createElement(OperationComponent, { key: o.id, operation: o });
            });

            var maybeShowMore = function maybeShowMore() {

                if (_this10.showMoreTimer) {
                    clearTimeout(_this10.showMoreTimer);
                }

                _this10.showMoreTimer = setTimeout(function () {
                    var newLastItemShown = Math.min(_this10.state.lastItemShown + SHOW_ITEMS_MORE, _this10.state.filteredOperations.length);
                    if (newLastItemShown > _this10.state.lastItemShown) {
                        _this10.setState({
                            lastItemShown: newLastItemShown
                        }, maybeShowMore);
                    }
                }, SHOW_ITEMS_TIMEOUT);
            };
            maybeShowMore();

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'row operation-wells' },
                    React.createElement(_AmountWell.AmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-lightblue',
                        icon: 'balance-scale',
                        title: (0, _helpers.translate)('client.operations.current_balance'),
                        subtitle: (0, _helpers.translate)('client.operations.as_of') + ' ' + new Date(this.state.account.lastChecked).toLocaleDateString(),
                        operations: this.state.operations,
                        initialAmount: this.state.account.initialAmount,
                        filterFunction: function filterFunction(op) {
                            return true;
                        }
                    }),
                    React.createElement(_AmountWell.FilteredAmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-green',
                        icon: 'arrow-down',
                        title: (0, _helpers.translate)('client.operations.received'),
                        hasFilteredOperations: this.state.hasFilteredOperations,
                        operations: this.state.operations,
                        filteredOperations: this.state.filteredOperations,
                        initialAmount: 0,
                        filterFunction: function filterFunction(op) {
                            return op.amount > 0;
                        }
                    }),
                    React.createElement(_AmountWell.FilteredAmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-orange',
                        icon: 'arrow-up',
                        title: (0, _helpers.translate)('client.operations.paid'),
                        hasFilteredOperations: this.state.hasFilteredOperations,
                        operations: this.state.operations,
                        filteredOperations: this.state.filteredOperations,
                        initialAmount: 0,
                        filterFunction: function filterFunction(op) {
                            return op.amount < 0;
                        }
                    }),
                    React.createElement(_AmountWell.FilteredAmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-darkblue',
                        icon: 'database',
                        title: (0, _helpers.translate)('client.operations.saved'),
                        hasFilteredOperations: this.state.hasFilteredOperations,
                        operations: this.state.operations,
                        filteredOperations: this.state.filteredOperations,
                        initialAmount: 0,
                        filterFunction: function filterFunction(op) {
                            return true;
                        }
                    })
                ),
                React.createElement(
                    'div',
                    { className: 'operation-panel panel panel-default' },
                    React.createElement(
                        'div',
                        { className: 'panel-heading' },
                        React.createElement(
                            'h3',
                            { className: 'title panel-title' },
                            (0, _helpers.translate)('client.operations.title')
                        ),
                        React.createElement(SyncButton, { account: this.state.account })
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-body' },
                        React.createElement(_SearchOperationList2.default, { setFilteredOperations: this.setFilteredOperations.bind(this), operations: this.state.operations, ref: 'search' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'table-responsive' },
                        React.createElement(
                            'table',
                            { className: 'table table-striped table-hover table-bordered' },
                            React.createElement(
                                'thead',
                                null,
                                React.createElement(
                                    'tr',
                                    null,
                                    React.createElement('th', null),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-1' },
                                        (0, _helpers.translate)('client.operations.column_date')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-2' },
                                        (0, _helpers.translate)('client.operations.column_type')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-6' },
                                        (0, _helpers.translate)('client.operations.column_name')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-1' },
                                        (0, _helpers.translate)('client.operations.column_amount')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-2' },
                                        (0, _helpers.translate)('client.operations.column_category')
                                    )
                                )
                            ),
                            React.createElement(
                                'tbody',
                                null,
                                ops
                            )
                        )
                    )
                )
            );
        }
    }]);
    return OperationsComponent;
}(React.Component);

exports.default = OperationsComponent;

},{"../errors":27,"../helpers":30,"../models":32,"../store":33,"./AmountWell":4,"./CategorySelectComponent":7,"./OperationTypeSelectComponent":19,"./SearchOperationList":20,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/get":50,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],19:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

var _SelectableButtonComponent = require('./SelectableButtonComponent');

var _SelectableButtonComponent2 = _interopRequireDefault(_SelectableButtonComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OperationTypeSelectComponent = function (_React$Component) {
    (0, _inherits3.default)(OperationTypeSelectComponent, _React$Component);

    function OperationTypeSelectComponent(props) {
        (0, _classCallCheck3.default)(this, OperationTypeSelectComponent);

        (0, _helpers.has)(props, 'onSelectId');
        (0, _helpers.has)(props, 'operation');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationTypeSelectComponent).call(this, props));
    }

    (0, _createClass3.default)(OperationTypeSelectComponent, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            return React.createElement(_SelectableButtonComponent2.default, {
                operation: this.props.operation,
                optionsArray: _store.store.getOperationTypes(),
                selectedId: function selectedId() {
                    return _this2.props.operation.operationTypeID;
                },
                idToLabel: function idToLabel(id) {
                    return _store.store.operationTypeToLabel(id);
                },
                onSelectId: this.props.onSelectId.bind(this)
            });
        }
    }]);
    return OperationTypeSelectComponent;
}(React.Component);

exports.default = OperationTypeSelectComponent;

},{"../helpers":30,"../store":33,"./SelectableButtonComponent":21,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],20:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

var _store = require('../store');

var _DatePicker = require('./DatePicker');

var _DatePicker2 = _interopRequireDefault(_DatePicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchComponent = function (_React$Component) {
    (0, _inherits3.default)(SearchComponent, _React$Component);

    function SearchComponent(props) {
        (0, _classCallCheck3.default)(this, SearchComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SearchComponent).call(this, props));

        _this.state = _this.initialState();
        return _this;
    }

    (0, _createClass3.default)(SearchComponent, [{
        key: 'initialState',
        value: function initialState() {
            return {
                showDetails: false,

                keywords: [],
                category: '',
                type: '',
                amount_low: '',
                amount_high: '',
                date_low: null,
                date_high: null
            };
        }
    }, {
        key: 'clearSearch',
        value: function clearSearch(close, event) {
            var initialState = this.initialState();
            initialState.showDetails = !close;
            this.setState(initialState, this.filter);
            this.ref("searchForm").reset();

            event.preventDefault();
        }
    }, {
        key: 'toggleDetails',
        value: function toggleDetails() {
            this.setState({
                showDetails: !this.state.showDetails
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            // Force search with empty query, to show all operations
            this.filter();
        }
    }, {
        key: 'ref',
        value: function ref(name) {
            (0, _helpers.has)(this.refs, name);
            return this.refs[name].getDOMNode();
        }
    }, {
        key: 'changeLowDate',
        value: function changeLowDate(value) {
            this.setState({
                date_low: value
            }, this.filter);
        }
    }, {
        key: 'changeHighDate',
        value: function changeHighDate(value) {
            this.setState({
                date_high: value
            }, this.filter);
        }
    }, {
        key: 'syncKeyword',
        value: function syncKeyword() {
            var kw = this.ref('keywords');
            this.setState({
                keywords: kw.value.split(' ').map(function (w) {
                    return w.toLowerCase();
                })
            }, this.filter);
        }
    }, {
        key: 'syncCategory',
        value: function syncCategory() {
            var cat = this.ref('cat');
            this.setState({
                category: cat.value.toLowerCase()
            }, this.filter);
        }
    }, {
        key: 'syncType',
        value: function syncType() {
            var type = this.ref('type');
            this.setState({
                type: type.value
            }, this.filter);
        }
    }, {
        key: 'syncAmountLow',
        value: function syncAmountLow() {
            var low = this.ref('amount_low');
            this.setState({
                amount_low: low.value
            }, this.filter);
        }
    }, {
        key: 'syncAmountHigh',
        value: function syncAmountHigh() {
            var high = this.ref('amount_high');
            this.setState({
                amount_high: high.value
            }, this.filter);
        }
    }, {
        key: 'filter',
        value: function filter() {
            function contains(where, substring) {
                return where.toLowerCase().indexOf(substring) !== -1;
            }

            function filterIf(condition, array, callback) {
                if (condition) return array.filter(callback);
                return array;
            }

            // Filter! Apply most discriminatory / easiest filters first
            var operations = this.props.operations.slice();

            var self = this;
            operations = filterIf(this.state.category !== '', operations, function (op) {
                return contains(_store.store.getCategoryFromId(op.categoryId).title, self.state.category);
            });

            operations = filterIf(this.state.type !== '', operations, function (op) {
                return op.operationTypeID === self.state.type;
            });

            operations = filterIf(this.state.amount_low !== '', operations, function (op) {
                return op.amount >= self.state.amount_low;
            });

            operations = filterIf(this.state.amount_high !== '', operations, function (op) {
                return op.amount <= self.state.amount_high;
            });

            operations = filterIf(this.state.date_low !== null, operations, function (op) {
                return op.date >= self.state.date_low;
            });

            operations = filterIf(this.state.date_high !== null, operations, function (op) {
                return op.date <= self.state.date_high;
            });

            operations = filterIf(this.state.keywords.length > 0, operations, function (op) {
                for (var i = 0; i < self.state.keywords.length; i++) {
                    var str = self.state.keywords[i];
                    if (!contains(op.raw, str) && !contains(op.title, str) && (op.customLabel === null || !contains(op.customLabel, str))) {
                        return false;
                    }
                }
                return true;
            });

            this.props.setFilteredOperations(operations);
        }
    }, {
        key: 'render',
        value: function render() {
            var details;
            if (!this.state.showDetails) {
                details = React.createElement('div', { className: 'transition-expand' });
            } else {
                var catOptions = [React.createElement(
                    'option',
                    { key: '_', value: '' },
                    (0, _helpers.translate)('client.search.any_category')
                )].concat(_store.store.getCategories().map(function (c) {
                    return React.createElement(
                        'option',
                        { key: c.id, value: c.title },
                        c.title
                    );
                }));

                var typeOptions = [React.createElement(
                    'option',
                    { key: '_', value: '' },
                    (0, _helpers.translate)('client.search.any_type')
                )].concat(_store.store.getOperationTypes().map(function (type) {
                    return React.createElement(
                        'option',
                        { key: type.id, value: type.id },
                        _store.store.operationTypeToLabel(type.id)
                    );
                }));

                details = React.createElement(
                    'form',
                    { className: 'panel-body transition-expand', ref: 'searchForm' },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'keywords' },
                            (0, _helpers.translate)('client.search.keywords')
                        ),
                        React.createElement('input', { type: 'text', className: 'form-control',
                            onKeyUp: this.syncKeyword.bind(this), defaultValue: this.state.keywords.join(' '),
                            id: 'keywords', ref: 'keywords' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-horizontal' },
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'div',
                                { className: 'col-xs-2' },
                                React.createElement(
                                    'label',
                                    { htmlFor: 'category-selector' },
                                    (0, _helpers.translate)('client.search.category')
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-5' },
                                React.createElement(
                                    'select',
                                    { className: 'form-control', id: 'category-selector',
                                        onChange: this.syncCategory.bind(this), defaultValue: this.state.category,
                                        ref: 'cat' },
                                    catOptions
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-1' },
                                React.createElement(
                                    'label',
                                    { htmlFor: 'type-selector' },
                                    (0, _helpers.translate)('client.search.type')
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-4' },
                                React.createElement(
                                    'select',
                                    { className: 'form-control', id: 'type-selector',
                                        onChange: this.syncType.bind(this), defaultValue: this.state.type,
                                        ref: 'type' },
                                    typeOptions
                                )
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-horizontal' },
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'div',
                                { className: 'col-xs-2' },
                                React.createElement(
                                    'label',
                                    { className: 'control-label', htmlFor: 'amount-low' },
                                    (0, _helpers.translate)('client.search.amount_low')
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-5' },
                                React.createElement('input', { type: 'number', className: 'form-control',
                                    onChange: this.syncAmountLow.bind(this), defaultValue: this.state.amount_low,
                                    id: 'amount-low', ref: 'amount_low' })
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-1' },
                                React.createElement(
                                    'label',
                                    { className: 'control-label', htmlFor: 'amount-high' },
                                    (0, _helpers.translate)('client.search.and')
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-4' },
                                React.createElement('input', { type: 'number', className: 'form-control',
                                    onChange: this.syncAmountHigh.bind(this), defaultValue: this.state.amount_high,
                                    id: 'amount-high', ref: 'amount_high' })
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-horizontal' },
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'div',
                                { className: 'col-xs-2' },
                                React.createElement(
                                    'label',
                                    { className: 'control-label', htmlFor: 'date-low' },
                                    (0, _helpers.translate)('client.search.date_low')
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-5' },
                                React.createElement(_DatePicker2.default, { ref: 'date_low', id: 'date-low', key: 'date-low', onSelect: this.changeLowDate.bind(this) })
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-1' },
                                React.createElement(
                                    'label',
                                    { className: 'control-label', htmlFor: 'date-high' },
                                    (0, _helpers.translate)('client.search.and')
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-4' },
                                React.createElement(_DatePicker2.default, { ref: 'date_high', id: 'date-high', key: 'date-high', onSelect: this.changeHighDate.bind(this) })
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'button',
                            { className: 'btn btn-warning pull-left', type: 'button', onClick: this.clearSearch.bind(this, true) },
                            (0, _helpers.translate)('client.search.clearAndClose')
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-warning pull-right', type: 'button', onClick: this.clearSearch.bind(this, false) },
                            (0, _helpers.translate)('client.search.clear')
                        )
                    )
                );
            }

            return React.createElement(
                'div',
                { className: 'panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading clickable', onClick: this.toggleDetails.bind(this) },
                    React.createElement(
                        'h5',
                        { className: 'panel-title' },
                        (0, _helpers.translate)('client.search.title'),
                        React.createElement('span', { className: "pull-right fa fa-" + (this.state.showDetails ? 'minus' : 'plus') + "-square", 'aria-hidden': 'true' })
                    )
                ),
                details
            );
        }
    }]);
    return SearchComponent;
}(React.Component);

exports.default = SearchComponent;

},{"../helpers":30,"../store":33,"./DatePicker":12,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],21:[function(require,module,exports){
"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SelectableButtonComponent = function (_React$Component) {
    (0, _inherits3.default)(SelectableButtonComponent, _React$Component);

    function SelectableButtonComponent(props) {
        (0, _classCallCheck3.default)(this, SelectableButtonComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SelectableButtonComponent).call(this, props));

        _this.state = {
            editMode: false
        };
        return _this;
    }

    (0, _createClass3.default)(SelectableButtonComponent, [{
        key: "dom",
        value: function dom() {
            return this.refs.select.getDOMNode();
        }
    }, {
        key: "onChange",
        value: function onChange(e) {
            var selectedId = this.dom().value;
            this.props.onSelectId(selectedId);
            this.switchToStaticMode();
        }
    }, {
        key: "switchToEditMode",
        value: function switchToEditMode() {
            this.setState({ editMode: true }, function () {
                this.dom().focus();
            });
        }
    }, {
        key: "switchToStaticMode",
        value: function switchToStaticMode() {
            this.setState({ editMode: false });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var selectedId = this.props.selectedId();
            var label = this.props.idToLabel(selectedId);

            if (!this.state.editMode) {
                return React.createElement(
                    "button",
                    {
                        className: "form-control btn-transparent label-button",
                        onClick: this.switchToEditMode.bind(this) },
                    label
                );
            }
            var options = this.props.optionsArray.map(function (o) {
                return React.createElement(
                    "option",
                    { key: o.id, value: o.id, className: "label-button" },
                    _this2.props.idToLabel(o.id)
                );
            });

            return React.createElement(
                "select",
                { className: "form-control",
                    onChange: this.onChange.bind(this),
                    onBlur: this.switchToStaticMode.bind(this),
                    defaultValue: selectedId,
                    ref: "select" },
                options
            );
        }
    }]);
    return SelectableButtonComponent;
}(React.Component);

exports.default = SelectableButtonComponent;

},{"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],22:[function(require,module,exports){
'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.WeboobParameters = undefined;

var _store = require('../store');

var _helpers = require('../helpers');

var _errors = require('../errors');

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _ConfirmDeleteModal = require('./ConfirmDeleteModal');

var _ConfirmDeleteModal2 = _interopRequireDefault(_ConfirmDeleteModal);

var _ImportModule = require('./ImportModule');

var _ImportModule2 = _interopRequireDefault(_ImportModule);

var _Modal = require('./Modal');

var _Modal2 = _interopRequireDefault(_Modal);

var _NewBankForm = require('./NewBankForm');

var _NewBankForm2 = _interopRequireDefault(_NewBankForm);

var _CustomBankField = require('./CustomBankField');

var _CustomBankField2 = _interopRequireDefault(_CustomBankField);

var _AddOperationModal = require('./AddOperationModal');

var _AddOperationModal2 = _interopRequireDefault(_AddOperationModal);

var _Charts = require('./Charts');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Account = function (_React$Component) {
    (0, _inherits3.default)(Account, _React$Component);

    function Account(props) {
        (0, _classCallCheck3.default)(this, Account);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Account).call(this, props));

        _this.listener = _this._listener.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Account, [{
        key: '_listener',
        value: function _listener() {
            this.forceUpdate();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.settings, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.settings, this.listener);
        }
    }, {
        key: 'onDelete',
        value: function onDelete(id) {
            _store.Actions.DeleteAccount(this.props.account);
        }
    }, {
        key: 'setAsDefault',
        value: function setAsDefault() {
            _store.Actions.ChangeSetting('defaultAccountId', this.props.account.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var a = this.props.account;
            var label = a.iban ? a.title + ' (IBAN: ' + a.iban + ')' : a.title;
            var setDefaultAccountTitle = undefined;
            var selected = undefined;

            if (_store.store.getDefaultAccountId() === this.props.account.id) {
                setDefaultAccountTitle = "";
                selected = "fa-star";
            } else {
                setDefaultAccountTitle = (0, _helpers.translate)("client.settings.set_default_account");
                selected = "fa-star-o";
            }

            return React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    null,
                    React.createElement('span', { className: "clickable fa " + selected,
                        'aria-hidden': 'true',
                        onClick: this.setAsDefault.bind(this),
                        title: setDefaultAccountTitle })
                ),
                React.createElement(
                    'td',
                    null,
                    label
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement('span', { className: 'pull-right fa fa-times-circle', 'aria-label': 'remove',
                        'data-toggle': 'modal',
                        'data-target': '#confirmDeleteAccount' + a.id,
                        title: (0, _helpers.translate)("client.settings.delete_account_button") }),
                    React.createElement('span', { className: 'pull-right fa fa-plus-circle', 'aria-label': 'Add an operation',
                        'data-toggle': 'modal',
                        'data-target': '#addOperation' + a.id,
                        title: (0, _helpers.translate)("client.settings.add_operation") }),
                    React.createElement(_ConfirmDeleteModal2.default, {
                        modalId: 'confirmDeleteAccount' + a.id,
                        modalBody: (0, _helpers.translate)('client.settings.erase_account', { title: a.title }),
                        onDelete: this.onDelete.bind(this)
                    }),
                    React.createElement(_AddOperationModal2.default, {
                        account: a
                    })
                )
            );
        }
    }]);
    return Account;
}(React.Component);

var EditAccessModal = function (_React$Component2) {
    (0, _inherits3.default)(EditAccessModal, _React$Component2);
    (0, _createClass3.default)(EditAccessModal, [{
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            var _this3 = this;

            event.preventDefault();

            var newLogin = this.refs.login.getDOMNode().value.trim();
            var newPassword = this.refs.password.getDOMNode().value.trim();
            if (!newPassword || !newPassword.length) {
                alert((0, _helpers.translate)("client.editaccessmodal.not_empty"));
                return;
            }

            var customFields = undefined;
            if (this.props.customFields) {
                customFields = this.props.customFields.map(function (field, index) {
                    return _this3.refs["customField" + index].getValue();
                });
                if (customFields.some(function (f) {
                    return !f.value;
                })) {
                    alert((0, _helpers.translate)("client.editaccessmodal.customFields_not_empty"));
                    return;
                }
            }

            this.props.onSave(newLogin && newLogin.length ? newLogin : undefined, newPassword, customFields);
            this.refs.password.getDOMNode().value = '';

            $("#" + this.props.modalId).modal('hide');
        }
    }]);

    function EditAccessModal(props) {
        (0, _classCallCheck3.default)(this, EditAccessModal);

        (0, _helpers.has)(props, "modalId");

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(EditAccessModal).call(this, props));

        _this2.handleSubmit = _this2.handleSubmit.bind(_this2);
        return _this2;
    }

    (0, _createClass3.default)(EditAccessModal, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this4 = this;

            $('#' + this.props.modalId).on('shown.bs.modal', function () {
                _this4.refs.password.getDOMNode().focus();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var customFields = undefined;

            if (this.props.customFields) {
                customFields = this.props.customFields.map(function (field, index) {
                    return React.createElement(_CustomBankField2.default, { ref: "customField" + index, params: field });
                });
            }

            var modalTitle = (0, _helpers.translate)('client.editaccessmodal.title');

            var modalBody = React.createElement(
                'div',
                null,
                (0, _helpers.translate)('client.editaccessmodal.body'),
                React.createElement(
                    'form',
                    { id: this.props.modalId + "-form",
                        className: 'form-group',
                        onSubmit: this.handleSubmit },
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'login' },
                            (0, _helpers.translate)('client.settings.login')
                        ),
                        React.createElement('input', { type: 'text', className: 'form-control', id: 'login', ref: 'login' })
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'password' },
                            (0, _helpers.translate)('client.settings.password')
                        ),
                        React.createElement('input', { type: 'password', className: 'form-control', id: 'password', ref: 'password' })
                    ),
                    customFields
                )
            );

            var modalFooter = React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal' },
                    (0, _helpers.translate)('client.editaccessmodal.cancel')
                ),
                React.createElement(
                    'button',
                    { type: 'submit', form: this.props.modalId + "-form", className: 'btn btn-success' },
                    (0, _helpers.translate)('client.editaccessmodal.save')
                )
            );

            return React.createElement(_Modal2.default, { modalId: this.props.modalId,
                modalTitle: modalTitle,
                modalBody: modalBody,
                modalFooter: modalFooter
            });
        }
    }]);
    return EditAccessModal;
}(React.Component);

var BankAccounts = function (_React$Component3) {
    (0, _inherits3.default)(BankAccounts, _React$Component3);

    function BankAccounts(props) {
        (0, _classCallCheck3.default)(this, BankAccounts);

        var _this5 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankAccounts).call(this, props));

        _this5.state = {
            accounts: []
        };
        _this5.listener = _this5._listener.bind(_this5);
        _this5.handleChangeAccess = _this5.handleChangeAccess.bind(_this5);
        return _this5;
    }

    (0, _createClass3.default)(BankAccounts, [{
        key: '_listener',
        value: function _listener() {
            this.setState({
                accounts: _store.store.getBankAccounts(this.props.bank.id)
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.subscribeMaybeGet(_store.State.accounts, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.accounts, this.listener);
        }
    }, {
        key: 'onDeleteBank',
        value: function onDeleteBank() {
            _store.Actions.DeleteBank(this.props.bank);
        }
    }, {
        key: 'onUpdateBank',
        value: function onUpdateBank() {
            if (this.state.accounts && this.state.accounts.length) {
                _store.store.once(_store.State.sync, _errors.MaybeHandleSyncError);
                _store.Actions.FetchAccounts(this.props.bank, this.state.accounts[0]);
            }
        }
    }, {
        key: 'handleChangeAccess',
        value: function handleChangeAccess(login, password, customFields) {
            (0, _helpers.assert)(this.state.accounts && this.state.accounts.length);
            _store.Actions.UpdateAccess(this.state.accounts[0], login, password, customFields);
        }
    }, {
        key: 'render',
        value: function render() {
            var accounts = this.state.accounts.map(function (acc) {
                return React.createElement(Account, { key: acc.id, account: acc });
            });

            var b = this.props.bank;

            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        this.props.bank.name
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: 'option-legend fa fa-refresh', 'aria-label': 'reload accounts',
                            onClick: this.onUpdateBank.bind(this),
                            title: (0, _helpers.translate)("client.settings.reload_accounts_button") }),
                        React.createElement('span', { className: 'option-legend fa fa-cog', 'aria-label': 'Edit bank access',
                            'data-toggle': 'modal',
                            'data-target': '#changePasswordBank' + b.id,
                            title: (0, _helpers.translate)("client.settings.change_password_button") }),
                        React.createElement('span', { className: 'option-legend fa fa-times-circle', 'aria-label': 'remove',
                            'data-toggle': 'modal',
                            'data-target': '#confirmDeleteBank' + b.id,
                            title: (0, _helpers.translate)("client.settings.delete_bank_button") })
                    )
                ),
                React.createElement(_ConfirmDeleteModal2.default, {
                    modalId: 'confirmDeleteBank' + b.id,
                    modalBody: (0, _helpers.translate)('client.settings.erase_bank', { name: b.name }),
                    onDelete: this.onDeleteBank.bind(this)
                }),
                React.createElement(EditAccessModal, {
                    modalId: 'changePasswordBank' + b.id,
                    customFields: b.customFields,
                    onSave: this.handleChangeAccess
                }),
                React.createElement(
                    'table',
                    { className: 'table bank-accounts-list' },
                    React.createElement(
                        'thead',
                        null,
                        React.createElement(
                            'tr',
                            null,
                            React.createElement('th', null),
                            React.createElement(
                                'th',
                                null,
                                (0, _helpers.translate)('client.settings.column_account_name')
                            ),
                            React.createElement('th', null)
                        )
                    ),
                    React.createElement(
                        'tbody',
                        null,
                        accounts
                    )
                )
            );
        }
    }]);
    return BankAccounts;
}(React.Component);

var BankAccountsList = function (_React$Component4) {
    (0, _inherits3.default)(BankAccountsList, _React$Component4);

    function BankAccountsList(props) {
        (0, _classCallCheck3.default)(this, BankAccountsList);

        var _this6 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankAccountsList).call(this, props));

        _this6.state = {
            banks: []
        };
        _this6.listener = _this6._listener.bind(_this6);
        return _this6;
    }

    (0, _createClass3.default)(BankAccountsList, [{
        key: '_listener',
        value: function _listener() {
            this.setState({
                banks: _store.store.getBanks()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.subscribeMaybeGet(_store.State.banks, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.listener);
        }
    }, {
        key: 'render',
        value: function render() {
            var banks = this.state.banks.map(function (bank) {
                return React.createElement(BankAccounts, { key: bank.id, bank: bank });
            });

            return React.createElement(
                'div',
                null,
                React.createElement(_NewBankForm2.default, { expanded: false }),
                React.createElement(
                    'div',
                    null,
                    banks
                )
            );
        }
    }]);
    return BankAccountsList;
}(React.Component);

var DefaultParameters = function (_React$Component5) {
    (0, _inherits3.default)(DefaultParameters, _React$Component5);

    function DefaultParameters(props) {
        (0, _classCallCheck3.default)(this, DefaultParameters);

        var _this7 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DefaultParameters).call(this, props));

        _this7.state = {
            duplicateThreshold: _store.store.getSetting('duplicateThreshold'),
            defaultChartType: _store.store.getSetting('defaultChartType'),
            defaultChartPeriod: _store.store.getSetting('defaultChartPeriod')
        };
        return _this7;
    }

    (0, _createClass3.default)(DefaultParameters, [{
        key: 'onDuplicateThresholdChange',
        value: function onDuplicateThresholdChange() {
            var val = this.refs.duplicateThreshold.getDOMNode().value;
            _store.Actions.ChangeSetting('duplicateThreshold', val);
            this.setState({
                duplicateThreshold: val
            });
            return true;
        }
    }, {
        key: 'onDefaultOpCatKindChange',
        value: function onDefaultOpCatKindChange() {
            var val = this.refs.defaultChartType.getValue();
            _store.Actions.ChangeSetting('defaultChartType', val);
            this.setState({
                defaultChartType: val
            });
            return true;
        }
    }, {
        key: 'onDefaultOpCatPeriodChange',
        value: function onDefaultOpCatPeriodChange() {
            var val = this.refs.defaultChartPeriod.getValue();
            _store.Actions.ChangeSetting('defaultChartPeriod', val);
            this.setState({
                defaultChartPeriod: val
            });
            return true;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'form',
                { className: 'form-horizontal' },
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'duplicateThreshold', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.duplicate_threshold')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement('input', { id: 'duplicateThreshold', ref: 'duplicateThreshold', type: 'number', className: 'form-control',
                            min: '0', step: '1',
                            value: this.state.duplicateThreshold, onChange: this.onDuplicateThresholdChange.bind(this) }),
                        React.createElement(
                            'span',
                            { className: 'help-block' },
                            (0, _helpers.translate)('client.settings.duplicate_help')
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'defaultChartType', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.default_chart_type')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement(_Charts.OpCatChartTypeSelect, {
                            defaultValue: this.state.defaultChartType,
                            onChange: this.onDefaultOpCatKindChange.bind(this),
                            ref: 'defaultChartType',
                            htmlId: 'defaultChartType'
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'defaultChartPeriod', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.default_chart_period')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement(_Charts.OpCatChartPeriodSelect, {
                            defaultValue: this.state.defaultChartPeriod,
                            onChange: this.onDefaultOpCatPeriodChange.bind(this),
                            ref: 'defaultChartPeriod',
                            htmlId: 'defaultChartPeriod'
                        })
                    )
                )
            );
        }
    }]);
    return DefaultParameters;
}(React.Component);

var BackupParameters = function (_React$Component6) {
    (0, _inherits3.default)(BackupParameters, _React$Component6);

    function BackupParameters() {
        (0, _classCallCheck3.default)(this, BackupParameters);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BackupParameters).apply(this, arguments));
    }

    (0, _createClass3.default)(BackupParameters, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'form',
                null,
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'exportInstance', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.export_instance')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement(
                            'a',
                            { download: 'kresus.json',
                                href: 'all/export',
                                id: 'exportInstance',
                                className: 'btn btn-primary' },
                            (0, _helpers.translate)('client.settings.go_export_instance')
                        ),
                        React.createElement(
                            'span',
                            { className: 'help-block' },
                            (0, _helpers.translate)('client.settings.export_instance_help')
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'importInstance', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.import_instance')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement(_ImportModule2.default, null),
                        React.createElement(
                            'span',
                            { className: 'help-block' },
                            (0, _helpers.translate)('client.settings.import_instance_help')
                        )
                    )
                )
            );
        }
    }]);
    return BackupParameters;
}(React.Component);

var WeboobParameters = exports.WeboobParameters = function (_React$Component7) {
    (0, _inherits3.default)(WeboobParameters, _React$Component7);

    function WeboobParameters(props) {
        (0, _classCallCheck3.default)(this, WeboobParameters);

        var _this9 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(WeboobParameters).call(this, props));

        _this9.onWeboobUpdated = _this9._onWeboobUpdated.bind(_this9);
        _this9.handleToggleWeboobAutoMergeAccounts = _this9.handleToggleWeboobAutoMergeAccounts.bind(_this9);
        _this9.handleToggleWeboobAutoUpdate = _this9.handleToggleWeboobAutoUpdate.bind(_this9);
        _this9.state = {
            isUpdatingWeboob: false
        };
        return _this9;
    }

    (0, _createClass3.default)(WeboobParameters, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.weboob, this.onWeboobUpdated);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.weboob, this.onWeboobUpdated);
        }
    }, {
        key: 'onWeboobUpdate',
        value: function onWeboobUpdate(which) {
            _store.Actions.UpdateWeboob({
                which: which
            });
            this.setState({
                isUpdatingWeboob: true
            });
        }
    }, {
        key: '_onWeboobUpdated',
        value: function _onWeboobUpdated() {
            this.setState({
                isUpdatingWeboob: false
            });
        }
    }, {
        key: 'handleToggleWeboobAutoMergeAccounts',
        value: function handleToggleWeboobAutoMergeAccounts(e) {
            var newValue = e.target.checked;
            _store.Actions.ChangeBoolSetting('weboob-auto-merge-accounts', newValue);
        }
    }, {
        key: 'handleToggleWeboobAutoUpdate',
        value: function handleToggleWeboobAutoUpdate(e) {
            var newValue = e.target.checked;
            _store.Actions.ChangeBoolSetting('weboob-auto-update', newValue);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'form',
                null,
                React.createElement(
                    'div',
                    { className: 'form-group clearfix' },
                    React.createElement(
                        'label',
                        { htmlFor: 'autoMerge', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.weboob_auto_merge_accounts')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement('input', {
                            id: 'autoMerge',
                            type: 'checkbox',
                            ref: 'autoMerge',
                            defaultChecked: _store.store.getBoolSetting('weboob-auto-merge-accounts'),
                            onChange: this.handleToggleWeboobAutoMergeAccounts
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group clearfix' },
                    React.createElement(
                        'label',
                        { htmlFor: 'autoUpdate', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.weboob_auto_update')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement('input', {
                            id: 'autoUpdate',
                            type: 'checkbox',
                            ref: 'autoUpdate',
                            defaultChecked: _store.store.getBoolSetting('weboob-auto-update'),
                            onChange: this.handleToggleWeboobAutoUpdate
                        })
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group clearfix' },
                    React.createElement(
                        'label',
                        { htmlFor: 'updateWeboob', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.update_weboob')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement(
                            'button',
                            {
                                id: 'updateWeboob',
                                type: 'button',
                                className: 'btn btn-primary',
                                onClick: this.onWeboobUpdate.bind(this, 'modules'),
                                disabled: this.state.isUpdatingWeboob ? 'disabled' : undefined },
                            (0, _helpers.translate)('client.settings.go_update_weboob')
                        ),
                        React.createElement(
                            'span',
                            { className: 'help-block' },
                            (0, _helpers.translate)('client.settings.update_weboob_help')
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group clearfix' },
                    React.createElement(
                        'label',
                        { htmlFor: 'reinstallWeboob', className: 'col-xs-4 control-label' },
                        (0, _helpers.translate)('client.settings.reinstall_weboob')
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-xs-8' },
                        React.createElement(
                            'button',
                            {
                                id: 'reinstallWeboob',
                                type: 'button',
                                className: 'btn btn-danger',
                                onClick: this.onWeboobUpdate.bind(this, 'core'),
                                disabled: this.state.isUpdatingWeboob ? 'disabled' : undefined },
                            (0, _helpers.translate)('client.settings.go_reinstall_weboob')
                        ),
                        React.createElement(
                            'span',
                            { className: 'help-block' },
                            (0, _helpers.translate)('client.settings.reinstall_weboob_help')
                        )
                    )
                )
            );
        }
    }]);
    return WeboobParameters;
}(React.Component);

var AccountSelector = function (_React$Component8) {
    (0, _inherits3.default)(AccountSelector, _React$Component8);

    function AccountSelector() {
        (0, _classCallCheck3.default)(this, AccountSelector);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountSelector).apply(this, arguments));
    }

    (0, _createClass3.default)(AccountSelector, [{
        key: 'value',
        value: function value() {
            return this.refs.selector.getDOMNode().value;
        }
    }, {
        key: 'render',
        value: function render() {
            var banks = _store.store.getBanks();
            var accounts = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(banks), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var b = _step.value;
                    var _iteratorNormalCompletion2 = true;
                    var _didIteratorError2 = false;
                    var _iteratorError2 = undefined;

                    try {
                        for (var _iterator2 = (0, _getIterator3.default)(_store.store.getBankAccounts(b.id)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                            var a = _step2.value;

                            accounts.push([a.accountNumber, b.name + ' - ' + a.title]);
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                _iterator2.return();
                            }
                        } finally {
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var options = accounts.map(function (pair) {
                return React.createElement(
                    'option',
                    { value: pair[0] },
                    pair[1]
                );
            });

            return React.createElement(
                'select',
                { className: 'form-control', ref: 'selector' },
                options
            );
        }
    }]);
    return AccountSelector;
}(React.Component);

var AlertCreationModal = function (_React$Component9) {
    (0, _inherits3.default)(AlertCreationModal, _React$Component9);

    function AlertCreationModal(props) {
        (0, _classCallCheck3.default)(this, AlertCreationModal);

        (0, _helpers.has)(props, 'alertType');
        (0, _helpers.has)(props, 'modalId');
        (0, _helpers.has)(props, 'titleTranslationKey');
        (0, _helpers.has)(props, 'sendIfText');

        var _this11 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AlertCreationModal).call(this, props));

        _this11.state = {
            maybeLimitError: ''
        };
        return _this11;
    }

    (0, _createClass3.default)(AlertCreationModal, [{
        key: 'onSubmit',
        value: function onSubmit() {

            // Validate data
            var limitDom = this.refs.limit.getDOMNode();
            var limit = parseFloat(limitDom.value);
            if (limit !== limit) {
                this.setState({
                    maybeLimitError: (0, _helpers.translate)("client.settings.emails.invalid_limit")
                });
                return;
            }

            // Actually submit the form
            var newAlert = {
                type: this.props.alertType,
                limit: limit,
                order: this.refs.selector.getDOMNode().value,
                bankAccount: this.refs.account.value()
            };

            _store.Actions.CreateAlert(newAlert);

            $('#' + this.props.modalId).modal('toggle');

            // Clear form and errors
            limitDom.value = 0;
            if (this.state.maybeLimitError.length) {
                this.setState({ maybeLimitError: '' });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var modalTitle = (0, _helpers.translate)('client.' + this.props.titleTranslationKey);

            var modalBody = React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'account' },
                        (0, _helpers.translate)('client.settings.emails.account')
                    ),
                    React.createElement(AccountSelector, { ref: 'account', id: 'account' })
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'span',
                        null,
                        this.props.sendIfText,
                        ' '
                    ),
                    React.createElement(
                        'select',
                        { className: 'form-control', ref: 'selector' },
                        React.createElement(
                            'option',
                            { value: 'gt' },
                            (0, _helpers.translate)('client.settings.emails.greater_than')
                        ),
                        React.createElement(
                            'option',
                            { value: 'lt' },
                            (0, _helpers.translate)('client.settings.emails.less_than')
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'span',
                        { className: 'text-danger' },
                        this.state.maybeLimitError
                    ),
                    React.createElement('input', { type: 'number', ref: 'limit', className: 'form-control', defaultValue: '0' })
                )
            );

            var modalFooter = React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal' },
                    (0, _helpers.translate)('client.settings.emails.cancel')
                ),
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-success', onClick: this.onSubmit.bind(this) },
                    (0, _helpers.translate)('client.settings.emails.create')
                )
            );

            return React.createElement(_Modal2.default, { modalId: this.props.modalId,
                modalTitle: modalTitle,
                modalBody: modalBody,
                modalFooter: modalFooter
            });
        }
    }]);
    return AlertCreationModal;
}(React.Component);

var AlertItem = function (_React$Component10) {
    (0, _inherits3.default)(AlertItem, _React$Component10);

    function AlertItem(props) {
        (0, _classCallCheck3.default)(this, AlertItem);

        (0, _helpers.has)(props, "alert");
        (0, _helpers.has)(props, "account");
        (0, _helpers.has)(props, "sendIfText");

        var _this12 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AlertItem).call(this, props));

        _this12.onSelectChange = _this12.onSelectChange.bind(_this12);
        _this12.onLimitChange = _this12.onLimitChange.bind(_this12);
        _this12.onDelete = _this12.onDelete.bind(_this12);
        return _this12;
    }

    (0, _createClass3.default)(AlertItem, [{
        key: 'onSelectChange',
        value: function onSelectChange() {
            var newValue = this.refs.selector.getDOMNode().value;
            if (newValue === this.props.alert.order) return;
            _store.Actions.UpdateAlert(this.props.alert, { order: newValue });
        }
    }, {
        key: 'onLimitChange',
        value: function onLimitChange() {
            var newValue = parseFloat(this.refs.limit.getDOMNode().value);
            if (newValue === this.props.alert.limit || newValue !== newValue) return;
            _store.Actions.UpdateAlert(this.props.alert, { limit: newValue });
        }
    }, {
        key: 'onDelete',
        value: function onDelete() {
            _store.Actions.DeleteAlert(this.props.alert);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var account = _props.account;
            var alert = _props.alert;

            (0, _helpers.assert)(alert.order === 'gt' || alert.order === 'lt');

            return React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    null,
                    account.title
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'div',
                        { className: 'form-inline' },
                        React.createElement(
                            'span',
                            null,
                            this.props.sendIfText,
                            ' '
                        ),
                        React.createElement(
                            'select',
                            { className: 'form-control',
                                defaultValue: alert.order,
                                ref: 'selector',
                                onChange: this.onSelectChange
                            },
                            React.createElement(
                                'option',
                                { value: 'gt' },
                                (0, _helpers.translate)('client.settings.emails.greater_than')
                            ),
                            React.createElement(
                                'option',
                                { value: 'lt' },
                                (0, _helpers.translate)('client.settings.emails.less_than')
                            )
                        ),
                        React.createElement(
                            'span',
                            null,
                            ' '
                        ),
                        React.createElement('input', { type: 'number',
                            ref: 'limit',
                            className: 'form-control',
                            defaultValue: alert.limit,
                            onChange: this.onLimitChange
                        })
                    )
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'button',
                        { type: 'button', className: 'btn btn-danger pull-right', 'aria-label': 'remove',
                            'data-toggle': 'modal', 'data-target': '#confirmDeleteAlert' + alert.id,
                            title: (0, _helpers.translate)("client.settings.emails.delete_alert") },
                        React.createElement('span', { className: 'glyphicon glyphicon-remove', 'aria-hidden': 'true' })
                    ),
                    React.createElement(_ConfirmDeleteModal2.default, {
                        modalId: 'confirmDeleteAlert' + alert.id,
                        modalBody: (0, _helpers.translate)('client.settings.emails.delete_alert_full_text'),
                        onDelete: this.onDelete
                    })
                )
            );
        }
    }]);
    return AlertItem;
}(React.Component);

var Alerts = function (_React$Component11) {
    (0, _inherits3.default)(Alerts, _React$Component11);

    function Alerts(props) {
        (0, _classCallCheck3.default)(this, Alerts);

        (0, _helpers.has)(props, 'alertType');
        (0, _helpers.has)(props, 'sendIfText');
        (0, _helpers.has)(props, 'titleTranslationKey');
        (0, _helpers.has)(props, 'panelTitleKey');

        var _this13 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Alerts).call(this, props));

        _this13.state = {
            alerts: _store.store.getAlerts(_this13.props.alertType)
        };
        _this13.onAlertChange = _this13.onAlertChange.bind(_this13);
        return _this13;
    }

    (0, _createClass3.default)(Alerts, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.alerts, this.onAlertChange);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.alerts, this.onAlertChange);
        }
    }, {
        key: 'onAlertChange',
        value: function onAlertChange() {
            this.setState({
                alerts: _store.store.getAlerts(this.props.alertType)
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this14 = this;

            var pairs = this.state.alerts;
            var items = pairs.map(function (pair) {
                return React.createElement(AlertItem, {
                    alert: pair.alert,
                    account: pair.account,
                    sendIfText: _this14.props.sendIfText
                });
            });

            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.' + this.props.panelTitleKey)
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: 'option-legend fa fa-plus-circle', 'aria-label': 'create alert',
                            'data-toggle': 'modal',
                            'data-target': '#alert-' + this.props.alertType + '-creation' })
                    )
                ),
                React.createElement(AlertCreationModal, {
                    modalId: 'alert-' + this.props.alertType + '-creation',
                    alertType: this.props.alertType,
                    titleTranslationKey: this.props.titleTranslationKey,
                    sendIfText: this.props.sendIfText
                }),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'table',
                        { className: 'table' },
                        React.createElement(
                            'thead',
                            null,
                            React.createElement(
                                'tr',
                                null,
                                React.createElement(
                                    'th',
                                    null,
                                    (0, _helpers.translate)('client.settings.emails.account')
                                ),
                                React.createElement(
                                    'th',
                                    null,
                                    (0, _helpers.translate)('client.settings.emails.details')
                                ),
                                React.createElement('th', null)
                            )
                        ),
                        React.createElement(
                            'tbody',
                            null,
                            items
                        )
                    )
                )
            );
        }
    }]);
    return Alerts;
}(React.Component);

var ReportCreationModal = function (_React$Component12) {
    (0, _inherits3.default)(ReportCreationModal, _React$Component12);

    function ReportCreationModal() {
        (0, _classCallCheck3.default)(this, ReportCreationModal);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ReportCreationModal).apply(this, arguments));
    }

    (0, _createClass3.default)(ReportCreationModal, [{
        key: 'onSubmit',
        value: function onSubmit() {

            var newAlert = {
                type: "report",
                bankAccount: this.refs.account.value(),
                frequency: this.refs.selector.getDOMNode().value
            };

            _store.Actions.CreateAlert(newAlert);
        }
    }, {
        key: 'render',
        value: function render() {
            var modalTitle = (0, _helpers.translate)('client.settings.emails.add_report');

            var modalBody = React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'label',
                        { htmlFor: 'account' },
                        (0, _helpers.translate)('client.settings.emails.account')
                    ),
                    React.createElement(AccountSelector, { ref: 'account', id: 'account' })
                ),
                React.createElement(
                    'div',
                    { className: 'form-group' },
                    React.createElement(
                        'span',
                        null,
                        (0, _helpers.translate)('client.settings.emails.send_report'),
                        ' '
                    ),
                    React.createElement(
                        'select',
                        { className: 'form-control', ref: 'selector' },
                        React.createElement(
                            'option',
                            { value: 'daily' },
                            (0, _helpers.translate)('client.settings.emails.daily')
                        ),
                        React.createElement(
                            'option',
                            { value: 'weekly' },
                            (0, _helpers.translate)('client.settings.emails.weekly')
                        ),
                        React.createElement(
                            'option',
                            { value: 'monthly' },
                            (0, _helpers.translate)('client.settings.emails.monthly')
                        )
                    )
                )
            );

            var modalFooter = React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal' },
                    (0, _helpers.translate)('client.settings.emails.cancel')
                ),
                React.createElement(
                    'button',
                    { type: 'button', className: 'btn btn-success', 'data-dismiss': 'modal',
                        onClick: this.onSubmit.bind(this) },
                    (0, _helpers.translate)('client.settings.emails.create')
                )
            );

            return React.createElement(_Modal2.default, { modalId: 'report-creation',
                modalTitle: modalTitle,
                modalBody: modalBody,
                modalFooter: modalFooter
            });
        }
    }]);
    return ReportCreationModal;
}(React.Component);

var ReportItem = function (_React$Component13) {
    (0, _inherits3.default)(ReportItem, _React$Component13);

    function ReportItem(props) {
        (0, _classCallCheck3.default)(this, ReportItem);

        var _this16 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ReportItem).call(this, props));

        _this16.onSelectChange = _this16.onSelectChange.bind(_this16);
        _this16.onDelete = _this16.onDelete.bind(_this16);
        return _this16;
    }

    (0, _createClass3.default)(ReportItem, [{
        key: 'onSelectChange',
        value: function onSelectChange() {
            var newValue = this.refs.selector.getDOMNode().value;
            if (newValue === this.props.alert.order) return;
            _store.Actions.UpdateAlert(this.props.alert, { frequency: newValue });
        }
    }, {
        key: 'onDelete',
        value: function onDelete() {
            _store.Actions.DeleteAlert(this.props.alert);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var account = _props2.account;
            var alert = _props2.alert;

            (0, _helpers.has)(alert, 'frequency');
            (0, _helpers.assert)(alert.type === 'report');

            return React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    null,
                    account.title
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'div',
                        { className: 'form-inline' },
                        React.createElement(
                            'span',
                            null,
                            (0, _helpers.translate)('client.settings.emails.send_report'),
                            ' '
                        ),
                        React.createElement(
                            'select',
                            { className: 'form-control',
                                defaultValue: alert.frequency,
                                ref: 'selector',
                                onChange: this.onSelectChange
                            },
                            React.createElement(
                                'option',
                                { value: 'daily' },
                                (0, _helpers.translate)('client.settings.emails.daily')
                            ),
                            React.createElement(
                                'option',
                                { value: 'weekly' },
                                (0, _helpers.translate)('client.settings.emails.weekly')
                            ),
                            React.createElement(
                                'option',
                                { value: 'monthly' },
                                (0, _helpers.translate)('client.settings.emails.monthly')
                            )
                        )
                    )
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'button',
                        { type: 'button', className: 'btn btn-danger pull-right', 'aria-label': 'remove',
                            'data-toggle': 'modal', 'data-target': '#confirmDeleteAlert' + alert.id,
                            title: (0, _helpers.translate)("client.settings.emails.delete_report") },
                        React.createElement('span', { className: 'glyphicon glyphicon-remove', 'aria-hidden': 'true' })
                    ),
                    React.createElement(_ConfirmDeleteModal2.default, {
                        modalId: 'confirmDeleteAlert' + alert.id,
                        modalBody: (0, _helpers.translate)('client.settings.emails.delete_report_full_text'),
                        onDelete: this.onDelete
                    })
                )
            );
        }
    }]);
    return ReportItem;
}(React.Component);

var Reports = function (_React$Component14) {
    (0, _inherits3.default)(Reports, _React$Component14);

    function Reports(props) {
        (0, _classCallCheck3.default)(this, Reports);

        var _this17 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Reports).call(this, props));

        _this17.state = {
            alerts: _store.store.getAlerts('report')
        };
        _this17.onAlertChange = _this17.onAlertChange.bind(_this17);
        return _this17;
    }

    (0, _createClass3.default)(Reports, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.alerts, this.onAlertChange);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.alerts, this.onAlertChange);
        }
    }, {
        key: 'onAlertChange',
        value: function onAlertChange() {
            this.setState({
                alerts: _store.store.getAlerts('report')
            });
        }
    }, {
        key: 'render',
        value: function render() {

            var pairs = this.state.alerts;
            var items = pairs.map(function (pair) {
                return React.createElement(ReportItem, { alert: pair.alert, account: pair.account });
            });

            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.settings.emails.reports_title')
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: 'option-legend fa fa-plus-circle', 'aria-label': 'create report',
                            'data-toggle': 'modal', 'data-target': '#report-creation' })
                    )
                ),
                React.createElement(ReportCreationModal, null),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'table',
                        { className: 'table' },
                        React.createElement(
                            'thead',
                            null,
                            React.createElement(
                                'tr',
                                null,
                                React.createElement(
                                    'th',
                                    null,
                                    (0, _helpers.translate)('client.settings.emails.account')
                                ),
                                React.createElement(
                                    'th',
                                    null,
                                    (0, _helpers.translate)('client.settings.emails.details')
                                ),
                                React.createElement('th', null)
                            )
                        ),
                        React.createElement(
                            'tbody',
                            null,
                            items
                        )
                    )
                )
            );
        }
    }]);
    return Reports;
}(React.Component);

var EmailsParameters = function (_React$Component15) {
    (0, _inherits3.default)(EmailsParameters, _React$Component15);

    function EmailsParameters() {
        (0, _classCallCheck3.default)(this, EmailsParameters);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(EmailsParameters).apply(this, arguments));
    }

    (0, _createClass3.default)(EmailsParameters, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(Alerts, {
                    alertType: 'balance',
                    sendIfText: (0, _helpers.translate)('client.settings.emails.send_if_balance_is'),
                    titleTranslationKey: 'settings.emails.add_balance',
                    panelTitleKey: 'settings.emails.balance_title'
                }),
                React.createElement(Alerts, {
                    alertType: 'transaction',
                    sendIfText: (0, _helpers.translate)('client.settings.emails.send_if_transaction_is'),
                    titleTranslationKey: 'settings.emails.add_transaction',
                    panelTitleKey: 'settings.emails.transaction_title'
                }),
                React.createElement(Reports, null)
            );
        }
    }]);
    return EmailsParameters;
}(React.Component);

var About = function (_React$Component16) {
    (0, _inherits3.default)(About, _React$Component16);

    function About() {
        (0, _classCallCheck3.default)(this, About);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(About).apply(this, arguments));
    }

    (0, _createClass3.default)(About, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'h3',
                    null,
                    'Kresus'
                ),
                React.createElement(
                    'ul',
                    null,
                    React.createElement(
                        'li',
                        null,
                        'Version: ',
                        _package2.default.version
                    ),
                    React.createElement(
                        'li',
                        null,
                        'License: ',
                        _package2.default.license
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'https://github.com/bnjbvr/kresus', target: '_blank' },
                            'Code'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'https://forum.cozy.io/t/app-kresus', target: '_blank' },
                            'Cozy Forum thread'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'https://blog.benj.me/tag/kresus', target: '_blank' },
                            'Blog'
                        )
                    )
                )
            );
        }
    }]);
    return About;
}(React.Component);

var SettingsComponents = function (_React$Component17) {
    (0, _inherits3.default)(SettingsComponents, _React$Component17);

    function SettingsComponents(props) {
        (0, _classCallCheck3.default)(this, SettingsComponents);

        var _this20 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SettingsComponents).call(this, props));

        _this20.state = {
            showing: 'accounts'
        };
        return _this20;
    }

    (0, _createClass3.default)(SettingsComponents, [{
        key: 'show',
        value: function show(which) {
            var _this21 = this;

            return function () {
                _this21.setState({
                    showing: which
                });
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var self = this;
            function MaybeActive(name) {
                return self.state.showing === name ? 'active' : '';
            }

            var Tab;
            switch (this.state.showing) {
                case 'accounts':
                    Tab = React.createElement(BankAccountsList, null);
                    break;
                case 'defaults':
                    Tab = React.createElement(DefaultParameters, null);
                    break;
                case 'about':
                    Tab = React.createElement(About, null);
                    break;
                case 'backup':
                    Tab = React.createElement(BackupParameters, null);
                    break;
                case 'weboob':
                    Tab = React.createElement(WeboobParameters, null);
                    break;
                case 'emails':
                    Tab = React.createElement(EmailsParameters, null);
                    break;
                default:
                    (0, _helpers.assert)(false, 'unknown state to show in settings');
            }

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'top-panel panel panel-default' },
                    React.createElement(
                        'div',
                        { className: 'panel-heading' },
                        React.createElement(
                            'h3',
                            { className: 'title panel-title' },
                            (0, _helpers.translate)('client.settings.title')
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-body' },
                        React.createElement(
                            'div',
                            { className: 'col-md-3' },
                            React.createElement(
                                'nav',
                                { className: 'top-panel navbar navbar-default' },
                                React.createElement(
                                    'div',
                                    { className: 'navbar-header' },
                                    React.createElement(
                                        'button',
                                        { type: 'button', className: 'navbar-toggle',
                                            'data-toggle': 'collapse',
                                            'data-target': '#settings-menu-collapse' },
                                        React.createElement(
                                            'span',
                                            { className: 'sr-only' },
                                            'Toggle navigation'
                                        ),
                                        React.createElement('span', { className: 'fa fa-navicon' })
                                    )
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'collapse navbar-collapse sidebar-navbar-collapse', id: 'settings-menu-collapse' },
                                    React.createElement(
                                        'ul',
                                        { className: 'nav nav-pills nav-stacked' },
                                        React.createElement(
                                            'li',
                                            { role: 'presentation', className: MaybeActive('accounts') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('accounts') },
                                                (0, _helpers.translate)('client.settings.tab_accounts')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation', className: MaybeActive('emails') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('emails') },
                                                (0, _helpers.translate)('client.settings.tab_emails')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation', className: MaybeActive('defaults') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('defaults') },
                                                (0, _helpers.translate)('client.settings.tab_defaults')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation', className: MaybeActive('backup') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('backup') },
                                                (0, _helpers.translate)('client.settings.tab_backup')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation', className: MaybeActive('weboob') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('weboob') },
                                                (0, _helpers.translate)('client.settings.tab_weboob')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation', className: MaybeActive('about') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('about') },
                                                (0, _helpers.translate)('client.settings.tab_about')
                                            )
                                        )
                                    )
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'col-xs-12 col-md-9' },
                            Tab
                        )
                    )
                )
            );
        }
    }]);
    return SettingsComponents;
}(React.Component);

exports.default = SettingsComponents;

},{"../../package.json":143,"../errors":27,"../helpers":30,"../store":33,"./AddOperationModal":3,"./Charts":8,"./ConfirmDeleteModal":10,"./CustomBankField":11,"./ImportModule":13,"./Modal":16,"./NewBankForm":17,"babel-runtime/core-js/get-iterator":34,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],23:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _store = require('../store');

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function DEBUG(text) {
    return (0, _helpers.debug)('Similarity Component - ' + text);
}

// Algorithm

function findRedundantPairs(operations, duplicateThreshold) {
    var before = Date.now();
    DEBUG('Running findRedundantPairs algorithm...');
    DEBUG('Input: ' + operations.length + ' operations');
    var similar = [];

    // duplicateThreshold is in hours
    var threshold = duplicateThreshold * 60 * 60 * 1000;
    DEBUG('Threshold: ' + threshold);

    // O(n log n)
    var sorted = operations.slice().sort(function (a, b) {
        return a.amount - b.amount;
    });
    for (var i = 0; i < operations.length; ++i) {
        var op = sorted[i];
        var j = i + 1;
        while (j < operations.length) {
            var next = sorted[j];
            if (next.amount != op.amount) break;
            var datediff = Math.abs(+op.date - +next.date);
            //Two operations are duplicates if they were not imported at the same date.
            if (datediff <= threshold && +op.dateImport !== +next.dateImport) similar.push([op, next]);
            j += 1;
        }
    }

    DEBUG(similar.length + ' pairs of similar operations found');
    DEBUG('findRedundantPairs took ' + (Date.now() - before) + 'ms.');
    //The duplicates are sorted from last imported to first imported
    similar.sort(function (a, b) {
        return Math.max(b[0].dateImport, b[1].dateImport) - Math.max(a[0].dateImport, a[1].dateImport);
    });
    return similar;
}

// Components

var SimilarityPairComponent = function (_React$Component) {
    (0, _inherits3.default)(SimilarityPairComponent, _React$Component);

    function SimilarityPairComponent() {
        (0, _classCallCheck3.default)(this, SimilarityPairComponent);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SimilarityPairComponent).apply(this, arguments));
    }

    (0, _createClass3.default)(SimilarityPairComponent, [{
        key: 'onMerge',
        value: function onMerge(e) {

            var older = undefined,
                younger = undefined;
            if (+this.props.a.dateImport < +this.props.b.dateImport) {
                older = this.props.a;
                younger = this.props.b;
            } else {
                older = this.props.b;
                younger = this.props.a;
            }

            _store.Actions.MergeOperations(younger, older);
            e.preventDefault();
        }
    }, {
        key: 'render',
        value: function render() {

            return React.createElement(
                'table',
                { className: 'table table-striped table-bordered' },
                React.createElement(
                    'thead',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'th',
                            { className: 'col-xs-2' },
                            (0, _helpers.translate)("client.similarity.date")
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-3' },
                            (0, _helpers.translate)("client.similarity.label")
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-1' },
                            (0, _helpers.translate)("client.similarity.amount")
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-2' },
                            (0, _helpers.translate)("client.similarity.category")
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-1' },
                            (0, _helpers.translate)("client.similarity.type")
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-2' },
                            (0, _helpers.translate)("client.similarity.imported_on")
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-1' },
                            (0, _helpers.translate)("client.similarity.merge")
                        )
                    )
                ),
                React.createElement(
                    'tbody',
                    null,
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'td',
                            null,
                            this.props.a.date.toLocaleDateString()
                        ),
                        React.createElement(
                            'td',
                            null,
                            this.props.a.title
                        ),
                        React.createElement(
                            'td',
                            null,
                            this.props.a.amount
                        ),
                        React.createElement(
                            'td',
                            null,
                            _store.store.getCategoryFromId(this.props.a.categoryId).title
                        ),
                        React.createElement(
                            'td',
                            null,
                            _store.store.operationTypeToLabel(this.props.a.operationTypeID)
                        ),
                        React.createElement(
                            'td',
                            null,
                            new Date(this.props.a.dateImport).toLocaleString()
                        ),
                        React.createElement(
                            'td',
                            { rowSpan: 2 },
                            React.createElement(
                                'button',
                                { className: 'btn btn-primary', onClick: this.onMerge.bind(this) },
                                React.createElement('span', { className: 'glyphicon glyphicon-resize-small', 'aria-hidden': 'true' })
                            )
                        )
                    ),
                    React.createElement(
                        'tr',
                        null,
                        React.createElement(
                            'td',
                            null,
                            this.props.b.date.toLocaleDateString()
                        ),
                        React.createElement(
                            'td',
                            null,
                            this.props.b.title
                        ),
                        React.createElement(
                            'td',
                            null,
                            this.props.b.amount
                        ),
                        React.createElement(
                            'td',
                            null,
                            _store.store.getCategoryFromId(this.props.b.categoryId).title
                        ),
                        React.createElement(
                            'td',
                            null,
                            _store.store.operationTypeToLabel(this.props.b.operationTypeID)
                        ),
                        React.createElement(
                            'td',
                            null,
                            new Date(this.props.b.dateImport).toLocaleString()
                        )
                    )
                )
            );
        }
    }]);
    return SimilarityPairComponent;
}(React.Component);

var Similarity = function (_React$Component2) {
    (0, _inherits3.default)(Similarity, _React$Component2);

    function Similarity(props) {
        (0, _classCallCheck3.default)(this, Similarity);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Similarity).call(this, props));

        _this2.state = {
            pairs: []
        };
        _this2.listener = _this2._listener.bind(_this2);
        return _this2;
    }

    (0, _createClass3.default)(Similarity, [{
        key: '_listener',
        value: function _listener() {
            this.setState({
                pairs: findRedundantPairs(_store.store.getCurrentOperations(), _store.store.getSetting('duplicateThreshold'))
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.banks, this.listener);
            _store.store.on(_store.State.accounts, this.listener);
            _store.store.subscribeMaybeGet(_store.State.operations, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.listener);
            _store.store.removeListener(_store.State.accounts, this.listener);
            _store.store.removeListener(_store.State.operations, this.listener);
        }
    }, {
        key: 'render',
        value: function render() {
            var pairs = this.state.pairs;

            var sim;
            if (pairs.length === 0) {
                sim = React.createElement(
                    'div',
                    null,
                    (0, _helpers.translate)('client.similarity.nothing_found')
                );
            } else {
                sim = pairs.map(function (p) {
                    var key = p[0].id.toString() + p[1].id.toString();
                    return React.createElement(SimilarityPairComponent, { key: key, a: p[0], b: p[1] });
                });
            }
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'top-panel panel panel-default' },
                    React.createElement(
                        'div',
                        { className: 'panel-heading' },
                        React.createElement(
                            'h3',
                            { className: 'title panel-title' },
                            (0, _helpers.translate)('client.similarity.title')
                        )
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-body' },
                        React.createElement(
                            'div',
                            { className: 'alert alert-info' },
                            React.createElement('span', { className: 'glyphicon glyphicon-exclamation-sign' }),
                            (0, _helpers.translate)('client.similarity.help')
                        ),
                        sim
                    )
                )
            );
        }
    }]);
    return Similarity;
}(React.Component);

exports.default = Similarity;

},{"../helpers":30,"../store":33,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],24:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

var _DatePicker = require('./DatePicker');

var _DatePicker2 = _interopRequireDefault(_DatePicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValidableInputDate = function (_React$Component) {
    (0, _inherits3.default)(ValidableInputDate, _React$Component);

    function ValidableInputDate(props) {
        (0, _classCallCheck3.default)(this, ValidableInputDate);

        (0, _helpers.has)(props, 'returnInputValue');
        (0, _helpers.has)(props, 'inputID');
        (0, _helpers.has)(props, 'label');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ValidableInputDate).call(this, props));

        _this.state = { isOK: false };
        return _this;
    }

    (0, _createClass3.default)(ValidableInputDate, [{
        key: 'clear',
        value: function clear() {
            this.refs.inputdate.clear();
            this.onSelect('');
        }
    }, {
        key: 'showValidity',
        value: function showValidity() {
            if (this.state.isOK) {
                return React.createElement('span', { className: 'fa fa-check form-control-feedback', 'aria-hidden': 'true' });
            }
            return React.createElement('span', { className: 'fa fa-times form-control-feedback', 'aria-hidden': 'true' });
        }
    }, {
        key: 'onSelect',
        value: function onSelect(date) {
            if (date) {
                this.setState({ isOK: true }, this.props.returnInputValue(date));
            } else {
                this.setState({ isOK: false }, this.props.returnInputValue(null));
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'form-group has-feedback' },
                React.createElement(
                    'label',
                    { className: 'control-label', htmlFor: this.props.inputID },
                    this.props.label
                ),
                React.createElement(_DatePicker2.default, { id: this.props.inputID, required: true,
                    onSelect: this.onSelect.bind(this),
                    ref: 'inputdate'
                }),
                this.showValidity()
            );
        }
    }]);
    return ValidableInputDate;
}(React.Component);

exports.default = ValidableInputDate;

},{"../helpers":30,"./DatePicker":12,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],25:[function(require,module,exports){
'use strict';

var _isFinite = require('babel-runtime/core-js/number/is-finite');

var _isFinite2 = _interopRequireDefault(_isFinite);

var _isNan = require('babel-runtime/core-js/number/is-nan');

var _isNan2 = _interopRequireDefault(_isNan);

var _parseFloat = require('babel-runtime/core-js/number/parse-float');

var _parseFloat2 = _interopRequireDefault(_parseFloat);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValidableInputNumber = function (_React$Component) {
    (0, _inherits3.default)(ValidableInputNumber, _React$Component);

    function ValidableInputNumber(props) {
        (0, _classCallCheck3.default)(this, ValidableInputNumber);

        (0, _helpers.has)(props, 'returnInputValue');
        (0, _helpers.has)(props, 'inputID');
        (0, _helpers.has)(props, 'step');
        (0, _helpers.has)(props, 'label');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ValidableInputNumber).call(this, props));

        _this.state = { isOK: false };
        return _this;
    }

    (0, _createClass3.default)(ValidableInputNumber, [{
        key: 'clear',
        value: function clear() {
            this.refs.number.getDOMNode().value = '';
            this.onChange();
        }
    }, {
        key: 'onChange',
        value: function onChange() {
            var number = (0, _parseFloat2.default)(this.refs.number.getDOMNode().value.trim());
            if (!(0, _isNan2.default)(number) && (0, _isFinite2.default)(number) && 1 / number !== -Infinity) {
                this.setState({ isOK: true }, this.props.returnInputValue(number));
            } else {
                this.setState({ isOK: false }, this.props.returnInputValue(null));
            }
        }
    }, {
        key: 'showValidity',
        value: function showValidity() {
            if (this.state.isOK) {
                return React.createElement('span', { className: 'fa fa-check form-control-feedback', 'aria-hidden': 'true' });
            }
            return React.createElement('span', { className: 'fa fa-times form-control-feedback', 'aria-hidden': 'true' });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'form-group has-feedback' },
                React.createElement(
                    'label',
                    { className: 'control-label', htmlFor: this.props.inputID },
                    this.props.label
                ),
                React.createElement('input', { className: 'form-control', type: 'number', id: this.props.inputID,
                    step: this.props.step, ref: 'number', onChange: this.onChange.bind(this),
                    required: true }),
                this.showValidity()
            );
        }
    }]);
    return ValidableInputNumber;
}(React.Component);

exports.default = ValidableInputNumber;

},{"../helpers":30,"babel-runtime/core-js/number/is-finite":38,"babel-runtime/core-js/number/is-nan":39,"babel-runtime/core-js/number/parse-float":40,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],26:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _helpers = require('../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValidableInputText = function (_React$Component) {
    (0, _inherits3.default)(ValidableInputText, _React$Component);

    function ValidableInputText(props) {
        (0, _classCallCheck3.default)(this, ValidableInputText);

        (0, _helpers.has)(props, 'returnInputValue');
        (0, _helpers.has)(props, 'inputID');
        (0, _helpers.has)(props, 'label');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ValidableInputText).call(this, props));

        _this.state = { isOK: false };
        return _this;
    }

    (0, _createClass3.default)(ValidableInputText, [{
        key: 'onChange',
        value: function onChange() {
            var title = this.refs.text.getDOMNode().value.trim();
            if (title.length > 0) {
                this.setState({ isOK: true }, this.props.returnInputValue(title));
            } else {
                this.setState({ isOK: false }, this.props.returnInputValue(null));
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.refs.text.getDOMNode().value = '';
            this.onChange();
        }
    }, {
        key: 'showValidity',
        value: function showValidity() {
            if (this.state.isOK) {
                return React.createElement('span', { className: 'fa fa-check form-control-feedback', 'aria-hidden': 'true' });
            }
            return React.createElement('span', { className: 'fa fa-times form-control-feedback', 'aria-hidden': 'true' });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'form-group has-feedback' },
                React.createElement(
                    'label',
                    { className: 'control-label', htmlFor: this.props.inputID },
                    this.props.label
                ),
                React.createElement('input', { className: 'form-control', type: 'text', id: this.props.inputID,
                    ref: 'text', required: true, onChange: this.onChange.bind(this) }),
                this.showValidity()
            );
        }
    }]);
    return ValidableInputText;
}(React.Component);

exports.default = ValidableInputText;

},{"../helpers":30,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MaybeHandleSyncError = MaybeHandleSyncError;

var _helpers = require('./helpers');

var _errors = require('../shared/errors.json');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function get(name) {
    if (typeof _errors2.default[name] !== 'undefined') return _errors2.default[name];
    throw "unknown exception code!";
}

var Errors = {
    NO_PASSWORD: get('NO_PASSWORD'),
    INVALID_PASSWORD: get('INVALID_PASSWORD'),
    INVALID_PARAMETERS: get('INVALID_PARAMETERS'),
    EXPIRED_PASSWORD: get('EXPIRED_PASSWORD'),
    UNKNOWN_MODULE: get('UNKNOWN_WEBOOB_MODULE'),
    BANK_ALREADY_EXISTS: get('BANK_ALREADY_EXISTS'),
    GENERIC_EXCEPTION: get('GENERIC_EXCEPTION')
};

exports.default = Errors;
function MaybeHandleSyncError(err) {

    if (!err) return;

    switch (err.code) {
        case Errors.INVALID_PASSWORD:
            alert((0, _helpers.translate)('client.sync.wrong_password'));
            break;
        case Errors.EXPIRED_PASSWORD:
            alert((0, _helpers.translate)('client.sync.expired_password'));
            break;
        case Errors.UNKNOWN_MODULE:
            alert((0, _helpers.translate)('client.sync.unknown_module'));
            break;
        case Errors.NO_PASSWORD:
            alert((0, _helpers.translate)('client.sync.no_password'));
            break;
        default:
            alert((0, _helpers.translate)('client.sync.unknown_error', { content: err.message }));
            break;
    }
}

},{"../shared/errors.json":145,"./helpers":30}],28:[function(require,module,exports){
/*
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Dispatcher
 * @typechecks
 */

"use strict";

var invariant = require('./invariant');

var _lastID = 1;
var _prefix = 'ID_';

/**
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways:
 *
 *   1) Callbacks are not subscribed to particular events. Every payload is
 *      dispatched to every registered callback.
 *   2) Callbacks can be deferred in whole or part until other callbacks have
 *      been executed.
 *
 * For example, consider this hypothetical flight destination form, which
 * selects a default city when a country is selected:
 *
 *   var flightDispatcher = new Dispatcher();
 *
 *   // Keeps track of which country is selected
 *   var CountryStore = {country: null};
 *
 *   // Keeps track of which city is selected
 *   var CityStore = {city: null};
 *
 *   // Keeps track of the base flight price of the selected city
 *   var FlightPriceStore = {price: null}
 *
 * When a user changes the selected city, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'city-update',
 *     selectedCity: 'paris'
 *   });
 *
 * This payload is digested by `CityStore`:
 *
 *   flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'city-update') {
 *       CityStore.city = payload.selectedCity;
 *     }
 *   });
 *
 * When the user selects a country, we dispatch the payload:
 *
 *   flightDispatcher.dispatch({
 *     actionType: 'country-update',
 *     selectedCountry: 'australia'
 *   });
 *
 * This payload is digested by both stores:
 *
 *    CountryStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       CountryStore.country = payload.selectedCountry;
 *     }
 *   });
 *
 * When the callback to update `CountryStore` is registered, we save a reference
 * to the returned token. Using this token with `waitFor()`, we can guarantee
 * that `CountryStore` is updated before the callback that updates `CityStore`
 * needs to query its data.
 *
 *   CityStore.dispatchToken = flightDispatcher.register(function(payload) {
 *     if (payload.actionType === 'country-update') {
 *       // `CountryStore.country` may not be updated.
 *       flightDispatcher.waitFor([CountryStore.dispatchToken]);
 *       // `CountryStore.country` is now guaranteed to be updated.
 *
 *       // Select the default city for the new country
 *       CityStore.city = getDefaultCityForCountry(CountryStore.country);
 *     }
 *   });
 *
 * The usage of `waitFor()` can be chained, for example:
 *
 *   FlightPriceStore.dispatchToken =
 *     flightDispatcher.register(function(payload) {
 *       switch (payload.actionType) {
 *         case 'country-update':
 *           flightDispatcher.waitFor([CityStore.dispatchToken]);
 *           FlightPriceStore.price =
 *             getFlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *
 *         case 'city-update':
 *           FlightPriceStore.price =
 *             FlightPriceStore(CountryStore.country, CityStore.city);
 *           break;
 *     }
 *   });
 *
 * The `country-update` payload will be guaranteed to invoke the stores'
 * registered callbacks in order: `CountryStore`, `CityStore`, then
 * `FlightPriceStore`.
 */

function Dispatcher() {
  this.$Dispatcher_callbacks = {};
  this.$Dispatcher_isPending = {};
  this.$Dispatcher_isHandled = {};
  this.$Dispatcher_isDispatching = false;
  this.$Dispatcher_pendingPayload = null;
}

/**
 * Registers a callback to be invoked with every dispatched payload. Returns
 * a token that can be used with `waitFor()`.
 *
 * @param {function} callback
 * @return {string}
 */
Dispatcher.prototype.register = function (callback) {
  var id = _prefix + _lastID++;
  this.$Dispatcher_callbacks[id] = callback;
  return id;
};

/**
 * Removes a callback based on its token.
 *
 * @param {string} id
 */
Dispatcher.prototype.unregister = function (id) {
  invariant(this.$Dispatcher_callbacks[id], 'Dispatcher.unregister(...): `%s` does not map to a registered callback.', id);
  delete this.$Dispatcher_callbacks[id];
};

/**
 * Waits for the callbacks specified to be invoked before continuing execution
 * of the current callback. This method should only be used by a callback in
 * response to a dispatched payload.
 *
 * @param {array<string>} ids
 */
Dispatcher.prototype.waitFor = function (ids) {
  invariant(this.$Dispatcher_isDispatching, 'Dispatcher.waitFor(...): Must be invoked while dispatching.');
  for (var ii = 0; ii < ids.length; ii++) {
    var id = ids[ii];
    if (this.$Dispatcher_isPending[id]) {
      invariant(this.$Dispatcher_isHandled[id], 'Dispatcher.waitFor(...): Circular dependency detected while ' + 'waiting for `%s`.', id);
      continue;
    }
    invariant(this.$Dispatcher_callbacks[id], 'Dispatcher.waitFor(...): `%s` does not map to a registered callback.', id);
    this.$Dispatcher_invokeCallback(id);
  }
};

/**
 * Dispatches a payload to all registered callbacks.
 *
 * @param {object} payload
 */
Dispatcher.prototype.dispatch = function (payload) {
  invariant(!this.$Dispatcher_isDispatching, 'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.');
  this.$Dispatcher_startDispatching(payload);
  try {
    for (var id in this.$Dispatcher_callbacks) {
      if (this.$Dispatcher_isPending[id]) {
        continue;
      }
      this.$Dispatcher_invokeCallback(id);
    }
  } finally {
    this.$Dispatcher_stopDispatching();
  }
};

/**
 * Is this Dispatcher currently dispatching.
 *
 * @return {boolean}
 */
Dispatcher.prototype.isDispatching = function () {
  return this.$Dispatcher_isDispatching;
};

/**
 * Call the callback stored with the given id. Also do some internal
 * bookkeeping.
 *
 * @param {string} id
 * @internal
 */
Dispatcher.prototype.$Dispatcher_invokeCallback = function (id) {
  this.$Dispatcher_isPending[id] = true;
  this.$Dispatcher_callbacks[id](this.$Dispatcher_pendingPayload);
  this.$Dispatcher_isHandled[id] = true;
};

/**
 * Set up bookkeeping needed when dispatching.
 *
 * @param {object} payload
 * @internal
 */
Dispatcher.prototype.$Dispatcher_startDispatching = function (payload) {
  for (var id in this.$Dispatcher_callbacks) {
    this.$Dispatcher_isPending[id] = false;
    this.$Dispatcher_isHandled[id] = false;
  }
  this.$Dispatcher_pendingPayload = payload;
  this.$Dispatcher_isDispatching = true;
};

/**
 * Clear bookkeeping used for dispatching.
 *
 * @internal
 */
Dispatcher.prototype.$Dispatcher_stopDispatching = function () {
  this.$Dispatcher_pendingPayload = null;
  this.$Dispatcher_isDispatching = false;
};

module.exports = new Dispatcher();

},{"./invariant":29}],29:[function(require,module,exports){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function invariant(condition, format, a, b, c, d, e, f) {
  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error('Invariant Violation: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

},{}],30:[function(require,module,exports){
'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.compareLocale = exports.NONE_CATEGORY_ID = undefined;
exports.debug = debug;
exports.assert = assert;
exports.maybeHas = maybeHas;
exports.has = has;
exports.NYI = NYI;
exports.setTranslator = setTranslator;
exports.setTranslatorAlertMissing = setTranslatorAlertMissing;
exports.translate = translate;
exports.stringToColor = stringToColor;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * HELPERS
 */

var DEBUG = true;
var ASSERTS = true;

function debug() {
    DEBUG && console.log.apply(console, arguments);
};

function assert(x, wat) {
    if (!x) {
        var text = 'Assertion error: ' + (wat ? wat : '') + '\n' + new Error().stack;
        ASSERTS && alert(text);
        console.log(text);
        return false;
    }
    return true;
};

function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

function has(obj, prop, wat) {
    return assert(maybeHas(obj, prop), wat || 'object should have property ' + prop);
}

function NYI() {
    throw 'Not yet implemented';
}

var NONE_CATEGORY_ID = exports.NONE_CATEGORY_ID = '-1';

var translator = null;
var alertMissing = null;
function setTranslator(polyglotInstance) {
    translator = polyglotInstance.t.bind(polyglotInstance);
}

function setTranslatorAlertMissing(bool) {
    alertMissing = bool;
}

function translate(format, bindings) {
    bindings = bindings || {};
    bindings['_'] = '';

    var ret = translator(format, bindings);
    if (ret === '' && alertMissing) {
        console.log('Missing translation key for "' + format + '"');
        return format;
    }

    return ret;
}

var compareLocale = exports.compareLocale = function () {
    if (typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined') {
        var _ret = function () {
            var cache = new _map2.default();
            return {
                v: function v(a, b, locale) {
                    if (!cache.has(locale)) {
                        cache.set(locale, new Intl.Collator(locale, { sensitivity: 'base' }));
                    }
                    return cache.get(locale).compare(a, b);
                }
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
    }

    if (typeof String.prototype.localeCompare === 'function') {
        return function (a, b, locale) {
            return a.localeCompare(b, locale, { sensitivity: 'base' });
        };
    }

    return function (a, b, locale) {
        var af = a.toLowerCase();
        var bf = b.toLowerCase();
        if (af < bf) return -1;
        if (af > bf) return 1;
        return 0;
    };
}();

function stringToColor(str) {
    var hash = 0;
    var color = '#';

    // String to hash
    for (var i = 0, size = str.length; i < size; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Int/hash to hex
    for (var i = 0; i < 3; i++) {
        var s = (hash >> i * 8 & 0xFF).toString(16);
        while (s.length < 2) {
            s += '0';
        }color += s;
    }

    return color;
}

},{"babel-runtime/core-js/map":37,"babel-runtime/helpers/typeof":54}],31:[function(require,module,exports){
'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _store = require('./store');

var _helpers = require('./helpers');

var _AccountList = require('./components/AccountList');

var _AccountList2 = _interopRequireDefault(_AccountList);

var _BankList = require('./components/BankList');

var _BankList2 = _interopRequireDefault(_BankList);

var _CategoryList = require('./components/CategoryList');

var _CategoryList2 = _interopRequireDefault(_CategoryList);

var _Charts = require('./components/Charts');

var _Charts2 = _interopRequireDefault(_Charts);

var _OperationList = require('./components/OperationList');

var _OperationList2 = _interopRequireDefault(_OperationList);

var _Similarity = require('./components/Similarity');

var _Similarity2 = _interopRequireDefault(_Similarity);

var _Settings = require('./components/Settings');

var _Settings2 = _interopRequireDefault(_Settings);

var _LoadScreen = require('./components/LoadScreen');

var _LoadScreen2 = _interopRequireDefault(_LoadScreen);

var _MainAccountWizard = require('./components/MainAccountWizard');

var _MainAccountWizard2 = _interopRequireDefault(_MainAccountWizard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Now this really begins.

var Kresus = function (_React$Component) {
    (0, _inherits3.default)(Kresus, _React$Component);

    function Kresus() {
        (0, _classCallCheck3.default)(this, Kresus);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Kresus).call(this));

        _this.state = {
            showing: 'reports'
        };
        return _this;
    }

    (0, _createClass3.default)(Kresus, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            // Fake mutations to re-trigger rendering
            _store.store.on(_store.State.weboob, function () {
                return _this2.setState({ showing: _this2.state.showing });
            });
            _store.store.on(_store.State.banks, function () {
                return _this2.setState({ showing: _this2.state.showing });
            });
        }
    }, {
        key: 'show',
        value: function show(name) {
            var _this3 = this;

            return function () {
                return _this3.setState({ showing: name });
            };
        }
    }, {
        key: 'render',
        value: function render() {

            if (!_store.store.isWeboobInstalled()) {
                setTimeout(function () {
                    // Force reloading after 2 minutes
                    window.location = '';
                }, 1000 * 60 * 2);
                return React.createElement(_LoadScreen2.default, null);
            }

            if (_store.store.getCurrentBank() === null) {
                return React.createElement(_MainAccountWizard2.default, null);
            }

            var mainComponent;
            var showing = this.state.showing;
            switch (showing) {
                case "reports":
                    mainComponent = React.createElement(_OperationList2.default, null);
                    break;
                case "charts":
                    mainComponent = React.createElement(_Charts2.default, null);
                    break;
                case "categories":
                    mainComponent = React.createElement(_CategoryList2.default, null);
                    break;
                case "similarities":
                    mainComponent = React.createElement(_Similarity2.default, null);
                    break;
                case "settings":
                    mainComponent = React.createElement(_Settings2.default, null);
                    break;
                default:
                    alert('unknown component to render: ' + showing + '!');
                    break;
            }

            function IsActive(which) {
                return showing === which ? 'active' : '';
            }

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'row navbar main-navbar visible-xs' },
                    React.createElement(
                        'button',
                        { className: 'navbar-toggle', 'data-toggle': 'offcanvas', 'data-target': '.sidebar' },
                        React.createElement('span', { className: 'fa fa-navicon' })
                    ),
                    React.createElement(
                        'a',
                        { className: 'navbar-brand', href: '#' },
                        (0, _helpers.translate)('client.KRESUS')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'sidebar offcanvas-xs col-sm-3 col-xs-10' },
                        React.createElement(
                            'div',
                            { className: 'logo sidebar-light' },
                            React.createElement(
                                'a',
                                { href: '#' },
                                (0, _helpers.translate)('client.KRESUS')
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'banks-accounts-list' },
                            React.createElement(_BankList2.default, null),
                            React.createElement(_AccountList2.default, null)
                        ),
                        React.createElement(
                            'div',
                            { className: 'sidebar-section-list' },
                            React.createElement(
                                'ul',
                                null,
                                React.createElement(
                                    'li',
                                    { className: IsActive('reports'), onClick: this.show('reports') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-briefcase' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.reports')
                                ),
                                React.createElement(
                                    'li',
                                    { className: IsActive('charts'), onClick: this.show('charts') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-line-chart' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.charts')
                                ),
                                React.createElement(
                                    'li',
                                    { className: IsActive('similarities'), onClick: this.show('similarities') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-clone' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.similarities')
                                ),
                                React.createElement(
                                    'li',
                                    { className: IsActive('categories'), onClick: this.show('categories') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-list-ul' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.categories')
                                ),
                                React.createElement(
                                    'li',
                                    { className: IsActive('settings'), onClick: this.show('settings') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-cogs' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.settings')
                                )
                            )
                        )
                    ),
                    React.createElement('div', { className: 'col-sm-3' }),
                    React.createElement(
                        'div',
                        { className: 'main-block col-xs-12 col-sm-9' },
                        React.createElement(
                            'div',
                            { className: 'main-container' },
                            mainComponent
                        )
                    )
                )
            );
        }
    }]);
    return Kresus;
}(React.Component);

// Components
// Global variables

_store.store.setupKresus(function () {
    React.render(React.createElement(Kresus, null), document.querySelector('#main'));
});

},{"./components/AccountList":2,"./components/BankList":5,"./components/CategoryList":6,"./components/Charts":8,"./components/LoadScreen":14,"./components/MainAccountWizard":15,"./components/OperationList":18,"./components/Settings":22,"./components/Similarity":23,"./helpers":30,"./store":33,"babel-runtime/core-js/object/get-prototype-of":44,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49,"babel-runtime/helpers/inherits":51,"babel-runtime/helpers/possibleConstructorReturn":52}],32:[function(require,module,exports){
'use strict';

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Alert = exports.OperationType = exports.Setting = exports.Category = exports.Operation = exports.Account = exports.Bank = undefined;

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bank = exports.Bank = function Bank(arg) {
    (0, _classCallCheck3.default)(this, Bank);

    this.id = (0, _helpers.has)(arg, 'id') && arg.id;
    this.name = (0, _helpers.has)(arg, 'name') && arg.name;
    this.uuid = (0, _helpers.has)(arg, 'uuid') && arg.uuid;
    this.customFields = arg.customFields;

    this.accounts = [];
};

var Account = exports.Account = function () {
    function Account(arg) {
        (0, _classCallCheck3.default)(this, Account);

        this.bank = (0, _helpers.has)(arg, 'bank') && arg.bank;
        this.bankAccess = (0, _helpers.has)(arg, 'bankAccess') && arg.bankAccess;
        this.title = (0, _helpers.has)(arg, 'title') && arg.title;
        this.accountNumber = (0, _helpers.has)(arg, 'accountNumber') && arg.accountNumber;
        this.initialAmount = (0, _helpers.has)(arg, 'initialAmount') && arg.initialAmount;
        this.lastChecked = (0, _helpers.has)(arg, 'lastChecked') && new Date(arg.lastChecked);
        this.id = (0, _helpers.has)(arg, 'id') && arg.id;
        this.iban = (0, _helpers.maybeHas)(arg, 'iban') && arg.iban || null;

        this.operations = [];
    }

    (0, _createClass3.default)(Account, [{
        key: 'mergeOwnProperties',
        value: function mergeOwnProperties(other) {
            (0, _helpers.assert)(this.id === other.id, 'ids of merged accounts must be equal');
            this.bank = other.bank;
            this.bankAccess = other.bankAccess;
            this.title = other.title;
            this.accountNumber = other.accountNumber;
            this.initialAmount = other.initialAmount;
            this.lastChecked = other.lastChecked;
            this.iban = other.iban;
            // No need to merge ids, they're the same
        }
    }]);
    return Account;
}();

var Operation = exports.Operation = function Operation(arg, unknownTypeId) {
    (0, _classCallCheck3.default)(this, Operation);

    (0, _helpers.assert)(typeof unknownTypeId === 'string', "unknown type id must be a string");
    this.bankAccount = (0, _helpers.has)(arg, 'bankAccount') && arg.bankAccount;
    this.title = (0, _helpers.has)(arg, 'title') && arg.title;
    this.date = (0, _helpers.has)(arg, 'date') && new Date(arg.date);
    this.amount = (0, _helpers.has)(arg, 'amount') && arg.amount;
    this.binary = (0, _helpers.maybeHas)(arg, 'binary') && arg.binary || null;
    this.attachments = (0, _helpers.maybeHas)(arg, 'attachments') && arg.attachments || null;
    this.raw = (0, _helpers.has)(arg, 'raw') && arg.raw;
    this.dateImport = (0, _helpers.maybeHas)(arg, 'dateImport') && new Date(arg.dateImport) || 0;
    this.id = (0, _helpers.has)(arg, 'id') && arg.id;
    this.categoryId = arg.categoryId || _helpers.NONE_CATEGORY_ID;
    this.operationTypeID = (0, _helpers.maybeHas)(arg, 'operationTypeID') && arg.operationTypeID || unknownTypeId;
    this.customLabel = (0, _helpers.maybeHas)(arg, 'customLabel') && arg.customLabel || null;
};

var Category = exports.Category = function () {
    function Category(arg) {
        (0, _classCallCheck3.default)(this, Category);

        this.title = (0, _helpers.has)(arg, 'title') && arg.title;
        this.color = (0, _helpers.maybeHas)(arg, 'color') && arg.color || (0, _helpers.stringToColor)(this.title);
        this.id = (0, _helpers.has)(arg, 'id') && arg.id;

        // Optional
        this.parentId = arg.parentId;
    }

    (0, _createClass3.default)(Category, [{
        key: 'mergeOwnProperties',
        value: function mergeOwnProperties(other) {
            (0, _helpers.assert)(other.id === this.id, 'ids of merged categories need to be the same, got ' + other.id + ' and ' + this.id);
            this.title = other.title;
            this.color = other.color;
            this.parentId = other.parentId;
        }
    }]);
    return Category;
}();

var Setting = exports.Setting = function Setting(arg) {
    (0, _classCallCheck3.default)(this, Setting);

    this.key = (0, _helpers.has)(arg, 'name') && arg.name;
    this.val = (0, _helpers.has)(arg, 'value') && arg.value;
};

var OperationType = exports.OperationType = function OperationType(arg) {
    (0, _classCallCheck3.default)(this, OperationType);

    this.name = (0, _helpers.has)(arg, 'name') && arg.name;
    this.id = (0, _helpers.has)(arg, 'id') && arg.id;
    this.weboobvalue = (0, _helpers.has)(arg, 'weboobvalue') && arg.weboobvalue;
};

var Alert = exports.Alert = function () {
    function Alert(arg) {
        (0, _classCallCheck3.default)(this, Alert);

        this.id = (0, _helpers.has)(arg, 'id') && arg.id;
        this.bankAccount = (0, _helpers.has)(arg, 'bankAccount') && arg.bankAccount;

        this.type = (0, _helpers.has)(arg, 'type') && arg.type;
        (0, _helpers.assert)(['report', 'balance', 'transaction'].indexOf(this.type) !== -1);

        // Data for reports
        this.frequency = arg.type === 'report' && (0, _helpers.has)(arg, 'frequency') && arg.frequency;
        arg.type === 'report' && (0, _helpers.assert)(['daily', 'weekly', 'monthly'].indexOf(arg.frequency) !== -1);

        // Data for balance/operation notifications
        this.limit = arg.type !== 'report' && (0, _helpers.has)(arg, 'limit') && arg.limit;
        this.order = arg.type !== 'report' && (0, _helpers.has)(arg, 'order') && arg.order;
        arg.type !== 'report' && (0, _helpers.assert)(['lt', 'gt'].indexOf(arg.order) !== -1);
    }

    (0, _createClass3.default)(Alert, [{
        key: 'merge',
        value: function merge(other) {
            var _arr = ['frequency', 'limit', 'order'];

            for (var _i = 0; _i < _arr.length; _i++) {
                var attr = _arr[_i];
                if ((0, _helpers.maybeHas)(other, attr)) {
                    this[attr] = other[attr];
                }
            }
        }
    }]);
    return Alert;
}();

},{"./helpers":30,"babel-runtime/helpers/classCallCheck":48,"babel-runtime/helpers/createClass":49}],33:[function(require,module,exports){
'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Actions = exports.State = exports.store = undefined;

var _events = require('events');

var _helpers = require('./helpers');

var _models = require('./models');

var _dispatcher = require('./flux/dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _backend = require('./backend');

var _backend2 = _interopRequireDefault(_backend);

var _defaultSettings = require('../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
var localesPath = '../shared/locales/';

require('../shared/locales/fr');
require('../shared/locales/en');

var events = new _events.EventEmitter();

// Private data
var data = {
    categories: [],
    categoryMap: new _map2.default(), // maps category ids to categories

    currentBankId: null,
    currentAccountId: null,

    settings: new _map2.default(_defaultSettings2.default),

    // Map of Banks (id -> bank)
    // (Each bank has an "account" field which is a map (id -> account),
    //  each account has an "operation" field which is an array of Operation).
    banks: new _map2.default(),

    operationtypes: [],
    operationTypesLabel: new _map2.default(), // Maps operation types to labels

    alerts: [],

    /* Contains static information about banks (name/uuid) */
    StaticBanks: []
};

// Holds the current bank information
var store = exports.store = {};

/*
 * GETTERS
 **/

store.getCurrentBankId = function () {
    return data.currentBankId;
};

store.getCurrentAccountId = function () {
    return data.currentAccountId;
};

store.getDefaultAccountId = function () {
    return data.settings.get('defaultAccountId');
};

// [instanceof Bank]
store.getStaticBanks = function () {
    (0, _helpers.has)(data, 'StaticBanks');
    (0, _helpers.assert)(data.StaticBanks !== null);
    return data.StaticBanks.slice();
};

// [{bankId, bankName}]
store.getBanks = function () {
    (0, _helpers.has)(data, 'banks');
    var ret = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(data.banks.values()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var bank = _step.value;

            ret.push(bank);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return ret;
};

store.getBank = function (id) {
    if (!data.banks.has(id)) return null;
    return data.banks.get(id);
};

store.getAccount = function (id) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(data.banks.values()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var bank = _step2.value;

            if (bank.accounts.has(id)) return bank.accounts.get(id);
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    return null;
};

// [instanceof Account]
store.getBankAccounts = function (bankId) {
    if (!data.banks.has(bankId)) {
        (0, _helpers.debug)('getBankAccounts: No bank with id ' + bankId + ' found.');
        return [];
    }

    var bank = data.banks.get(bankId);
    (0, _helpers.assert)(typeof bank.accounts !== 'undefined', 'bank.accounts must exist');
    (0, _helpers.assert)(bank.accounts instanceof _map2.default, 'bank.accounts must be a Map');

    var ret = [];
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = (0, _getIterator3.default)(bank.accounts.values()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var acc = _step3.value;

            ret.push(acc);
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return ret;
};

store.getCurrentBankAccounts = function () {
    if (data.currentBankId === null) {
        (0, _helpers.debug)('getCurrentBankAccounts: No current bank set.');
        return [];
    }
    (0, _helpers.assert)(data.banks.has(data.currentBankId));
    return store.getBankAccounts(data.currentBankId);
};

store.getCurrentBank = function () {
    if (data.currentBankId === null) {
        (0, _helpers.debug)('getCurrentBank: No current bank is set');
        return null;
    }
    return data.banks.get(data.currentBankId);
};

// instanceof Account
store.getCurrentAccount = function () {

    var currentBank = store.getCurrentBank();
    var currentBankAccounts = currentBank.accounts;

    if (data.currentAccountId === null) {
        (0, _helpers.debug)('getCurrentAccount: No current account is set');
        return null;
    }

    (0, _helpers.assert)(currentBankAccounts.has(data.currentAccountId));
    return currentBankAccounts.get(data.currentAccountId);
};

// [instanceof Operation]
store.getCurrentOperations = function () {
    var acc = this.getCurrentAccount();
    if (acc === null) return [];
    return acc.operations;
};

// [instanceof Category]
store.getCategories = function () {
    return data.categories;
};

// [instanceof OperationType]
store.getOperationTypes = function () {
    return data.operationtypes;
};

// [{account: instanceof Account, alert: instanceof Alerts}]
store.getAlerts = function (kind) {

    // TODO need a way to find accounts by accountNumber, or to map alerts to accounts.id
    var accountMap = new _map2.default();
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(data.banks.values()), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var bank = _step4.value;
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
                for (var _iterator6 = (0, _getIterator3.default)(bank.accounts.values()), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                    var account = _step6.value;

                    (0, _helpers.assert)(!accountMap.has(account.accountNumber), "accountNumber should be globally unique");
                    accountMap.set(account.accountNumber, account);
                }
            } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion6 && _iterator6.return) {
                        _iterator6.return();
                    }
                } finally {
                    if (_didIteratorError6) {
                        throw _iteratorError6;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    var res = [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = (0, _getIterator3.default)(data.alerts.filter(function (al) {
            return al.type === kind;
        })), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var al = _step5.value;

            (0, _helpers.assert)(accountMap.has(al.bankAccount), 'Unknown bank account for an alert: ' + al.bankAccount);
            res.push({
                account: accountMap.get(al.bankAccount),
                alert: al
            });
        }
    } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
            }
        } finally {
            if (_didIteratorError5) {
                throw _iteratorError5;
            }
        }
    }

    return res;
};

// String
store.getSetting = function (key) {
    var dict = data.settings;
    (0, _helpers.assert)(_defaultSettings2.default.has(key), 'all settings must have default values, but ' + key + ' doesn\'t have one.');
    (0, _helpers.assert)(dict.has(key), 'setting not set: ' + key);
    return dict.get(key);
};

store.getBoolSetting = function (key) {
    var val = store.getSetting(key);
    (0, _helpers.assert)(val === 'true' || val === 'false', "A bool setting must be true or false");
    return val === 'true';
};

// Bool
store.isWeboobInstalled = function () {
    return store.getBoolSetting('weboob-installed');
};

/*
 * BACKEND
 **/

function sortOperations(ops) {
    // Sort by -date first, then by +title/customLabel.
    ops.sort(function (a, b) {
        var ad = +a.date,
            bd = +b.date;
        if (ad < bd) return 1;
        if (ad > bd) return -1;
        var ac = a.customLabel && a.customLabel.trim().length ? a.customLabel : a.title;
        var bc = b.customLabel && b.customLabel.trim().length ? b.customLabel : b.title;
        return (0, _helpers.compareLocale)(ac, bc, data.settings.locale);
    });
}

function GenericErrorHandler(err) {
    // Show the error in the console
    console.error('A request has failed with the following information:\n- Code: ' + err.code + '\n- Message: ' + err.message + '\n- XHR Text: ' + err.xhrText + '\n- XHR Error: ' + err.xhrError + '\n- stringified: ' + (0, _stringify2.default)(err) + '\n');

    var maybeCode = err.code ? ' (code ' + err.code + ')' : '';
    alert('Error: ' + err.message + maybeCode + '. Please refer to the developers\' console for more information.');
}

store.setupKresus = function (cb) {
    _backend2.default.init().then(function (world) {

        (0, _helpers.has)(world, 'settings');
        store.setSettings(world.settings, world.cozy);

        (0, _helpers.has)(world, 'banks');
        world.banks.sort(function (a, b) {
            return (0, _helpers.compareLocale)(a.name, b.name, data.settings.locale);
        });
        data.StaticBanks = world.banks;

        (0, _helpers.has)(world, 'categories');
        store.setCategories(world.categories);

        (0, _helpers.has)(world, 'operationtypes');
        store.setOperationTypes(world.operationtypes);

        var unknownOperationTypeId = store.getUnknownOperationType().id;

        (0, _helpers.has)(world, 'accounts');
        (0, _helpers.has)(world, 'operations');

        var defaultAccountId = store.getDefaultAccountId();

        data.banks = new _map2.default();
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
            var _loop = function _loop() {
                var bankPOD = _step7.value;

                var bank = new _models.Bank(bankPOD);
                var accounts = world.accounts.filter(function (acc) {
                    return acc.bank === bank.uuid;
                });
                if (accounts.length) {
                    // Found a bank with accounts.
                    data.banks.set(bank.id, bank);

                    accounts.sort(function (a, b) {
                        return (0, _helpers.compareLocale)(a.title, b.title, data.settings.locale);
                    });

                    bank.accounts = new _map2.default();
                    var _iteratorNormalCompletion9 = true;
                    var _didIteratorError9 = false;
                    var _iteratorError9 = undefined;

                    try {
                        var _loop2 = function _loop2() {
                            var accPOD = _step9.value;

                            var acc = new _models.Account(accPOD);
                            bank.accounts.set(acc.id, acc);

                            acc.operations = world.operations.filter(function (op) {
                                return op.bankAccount === acc.accountNumber;
                            }).map(function (op) {
                                return new _models.Operation(op, unknownOperationTypeId);
                            });

                            sortOperations(acc.operations);

                            if (!data.currentAccountId) {
                                data.currentAccountId = acc.id;
                                data.currentBankId = bank.id;
                            }

                            if (acc.id === defaultAccountId) {
                                data.currentAccountId = acc.id;
                                data.currentBankId = bank.id;
                            }
                        };

                        for (var _iterator9 = (0, _getIterator3.default)(accounts), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                            _loop2();
                        }
                    } catch (err) {
                        _didIteratorError9 = true;
                        _iteratorError9 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion9 && _iterator9.return) {
                                _iterator9.return();
                            }
                        } finally {
                            if (_didIteratorError9) {
                                throw _iteratorError9;
                            }
                        }
                    }
                }
            };

            for (var _iterator7 = (0, _getIterator3.default)(world.banks), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                _loop();
            }
        } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion7 && _iterator7.return) {
                    _iterator7.return();
                }
            } finally {
                if (_didIteratorError7) {
                    throw _iteratorError7;
                }
            }
        }

        if (defaultAccountId) (0, _helpers.assert)(data.currentAccountId === defaultAccountId);

        (0, _helpers.has)(world, 'alerts');
        data.alerts = [];
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
            for (var _iterator8 = (0, _getIterator3.default)(world.alerts), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                var al = _step8.value;

                (0, _helpers.assert)(['balance', 'transaction', 'report'].indexOf(al.type) !== -1, 'unknown alert type: ' + al.type);
                data.alerts.push(new _models.Alert(al));
            }
        } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion8 && _iterator8.return) {
                    _iterator8.return();
                }
            } finally {
                if (_didIteratorError8) {
                    throw _iteratorError8;
                }
            }
        }

        cb && cb();
    }).catch(GenericErrorHandler);
};

store.updateWeboob = function (which) {
    _backend2.default.updateWeboob(which).then(function () {
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    }).catch(function (err) {
        GenericErrorHandler(err);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    });
};

store.importInstance = function (content) {
    _backend2.default.importInstance(content).then(function () {
        // Reload all the things!
        _dispatcher2.default.dispatch({
            type: Events.server.saved_bank
        });
    }).catch(GenericErrorHandler);
};

// BANKS
store.addBank = function (uuid, id, pwd, maybeCustomFields) {
    _backend2.default.addBank(uuid, id, pwd, maybeCustomFields).then(function () {
        _dispatcher2.default.dispatch({
            type: Events.server.saved_bank
        });
    }).catch(function (err) {
        // Don't use GenericErrorHandler here, because of special handling.
        // TODO fix this ^
        _dispatcher2.default.dispatch({
            type: Events.after_sync,
            maybeError: err
        });
    });
};

store.deleteBankFromStore = function (bankId) {
    (0, _helpers.assert)(data.banks.has(bankId), 'Deleted bank ' + bankId + ' must exist?');
    data.banks.delete(bankId);

    if (data.currentBankId === bankId) {
        data.currentBankId = null;
        if (data.banks.size) {
            data.currentBankId = data.banks.keys().next().value;
        }
        data.currentAccountId = null;
        if (data.currentBankId && store.getCurrentBank().accounts.size) {
            data.currentAccountId = store.getCurrentBank().accounts.keys().next().value;
        }
    }

    _dispatcher2.default.dispatch({
        type: Events.forward,
        event: State.banks
    });
};

store.deleteBank = function (bankId) {
    _backend2.default.deleteBank(bankId).then(function () {
        store.deleteBankFromStore(bankId);
    }).catch(GenericErrorHandler);
};

// ACCOUNTS
store.loadAccounts = function (bank) {
    var bankId = bank.id;
    _backend2.default.getAccounts(bankId).then(function (_ref) {
        var bankId = _ref.bankId;
        var accounts = _ref.accounts;

        var bank = data.banks.get(bankId);
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
            for (var _iterator10 = (0, _getIterator3.default)(accounts), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var newacc = _step10.value;

                if (bank.accounts.has(newacc.id)) {
                    bank.accounts.get(newacc.id).mergeOwnProperties(newacc);
                } else {
                    bank.accounts.set(newacc.id, newacc);
                }
            }
        } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                    _iterator10.return();
                }
            } finally {
                if (_didIteratorError10) {
                    throw _iteratorError10;
                }
            }
        }

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.accounts
        });
    }).catch(GenericErrorHandler);
};

store.deleteAccount = function (accountId) {
    _backend2.default.deleteAccount(accountId).then(function () {

        var found = false;
        var bank = undefined;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
            for (var _iterator11 = (0, _getIterator3.default)(data.banks.values()), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                bank = _step11.value;

                if (bank.accounts.has(accountId)) {
                    bank.accounts.delete(accountId);
                    if (bank.accounts.size === 0) {
                        store.deleteBankFromStore(bank.id);
                    }
                    found = true;
                    break;
                }
            }
        } catch (err) {
            _didIteratorError11 = true;
            _iteratorError11 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                    _iterator11.return();
                }
            } finally {
                if (_didIteratorError11) {
                    throw _iteratorError11;
                }
            }
        }

        (0, _helpers.assert)(found, "Deleted account must have been present in the first place");

        if (data.currentAccountId === accountId) {
            data.currentAccountId = null;
            if (data.currentBankId && store.getCurrentBank().accounts.size) {
                data.currentAccountId = store.getCurrentBank().accounts.keys().next().value;
            }
        }

        if (store.getDefaultAccountId() === accountId) {
            data.settings.set('defaultAccountId', '');
        }

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.accounts
        });
    }).catch(GenericErrorHandler);
};

store.fetchAccounts = function (bankId, accountId, accessId) {
    (0, _helpers.assert)(data.banks.has(bankId));

    _backend2.default.getNewAccounts(accessId).then(function () {
        var bank = data.banks.get(bankId);
        store.loadAccounts(bank);
        // Retrieve operations of all bank accounts
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
            for (var _iterator12 = (0, _getIterator3.default)(bank.accounts.values()), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var _acc = _step12.value;

                store.loadOperationsFor(bankId, _acc.id);
            }
        } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion12 && _iterator12.return) {
                    _iterator12.return();
                }
            } finally {
                if (_didIteratorError12) {
                    throw _iteratorError12;
                }
            }
        }
    }).catch(function (err) {
        // Don't use GenericErrorHandler, we have a specific error handling
        // TODO fix this ^
        _dispatcher2.default.dispatch({
            type: Events.after_sync,
            maybeError: err
        });
    });
};

// OPERATIONS
store.loadOperationsFor = function (bankId, accountId) {
    _backend2.default.getOperations(accountId).then(function (operations) {

        var bank = data.banks.get(bankId);
        var acc = bank.accounts.get(accountId);
        var unknownOperationTypeId = store.getUnknownOperationType().id;
        acc.operations = operations.map(function (o) {
            return new _models.Operation(o, unknownOperationTypeId);
        });

        sortOperations(acc.operations);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(GenericErrorHandler);
};

store.fetchOperations = function () {
    (0, _helpers.assert)(data.currentBankId !== null);
    (0, _helpers.assert)(data.currentAccountId !== null);

    var accountId = data.currentAccountId;
    var accessId = this.getCurrentAccount().bankAccess;
    (0, _helpers.assert)(typeof accessId !== 'undefined', 'Need an access for syncing operations');

    _backend2.default.getNewOperations(accessId).then(function () {
        // Reload accounts, for updating the 'last updated' date.
        var currentBank = store.getCurrentBank();
        store.loadAccounts(currentBank);
        // Reload operations, obviously.
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
            for (var _iterator13 = (0, _getIterator3.default)(currentBank.accounts.values()), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                var _acc2 = _step13.value;

                store.loadOperationsFor(currentBank.id, _acc2.id);
            }
        } catch (err) {
            _didIteratorError13 = true;
            _iteratorError13 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion13 && _iterator13.return) {
                    _iterator13.return();
                }
            } finally {
                if (_didIteratorError13) {
                    throw _iteratorError13;
                }
            }
        }

        _dispatcher2.default.dispatch({
            type: Events.after_sync
        });
    }).catch(function (err) {
        // Don't use GenericErrorHandler here, we have special error handling.
        // TODO fix this ^
        _dispatcher2.default.dispatch({
            type: Events.after_sync,
            maybeError: err
        });
    });
};

store.updateCategoryForOperation = function (operation, categoryId) {

    // The server expects an empty string for replacing by none
    var serverCategoryId = categoryId === _helpers.NONE_CATEGORY_ID ? '' : categoryId;

    _backend2.default.setCategoryForOperation(operation.id, serverCategoryId).then(function () {
        operation.categoryId = categoryId;
        // No need to forward at the moment?
    }).catch(GenericErrorHandler);
};

store.getUnknownOperationType = function () {
    var cached = null;
    return function () {
        if (cached) return cached;
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
            for (var _iterator14 = (0, _getIterator3.default)(data.operationtypes), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                var t = _step14.value;

                if (t.name === 'type.unknown') return cached = t;
            }
        } catch (err) {
            _didIteratorError14 = true;
            _iteratorError14 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion14 && _iterator14.return) {
                    _iterator14.return();
                }
            } finally {
                if (_didIteratorError14) {
                    throw _iteratorError14;
                }
            }
        }

        (0, _helpers.assert)(false, "OperationTypes should have an Unknown type!");
    };
}();

store.updateTypeForOperation = function (operation, type) {

    (0, _helpers.assert)(type !== null, "operations with no type should have been handled in setupKresus");

    _backend2.default.setTypeForOperation(operation.id, type).then(function () {
        operation.operationTypeID = type;
        // No need to forward at the moment?
    }).catch(GenericErrorHandler);
};

store.updateCustomLabelForOperation = function (operation, customLabel) {
    _backend2.default.setCustomLabel(operation.id, customLabel).then(function () {
        operation.customLabel = customLabel;
        //No need to forward at the moment?
    }).catch(GenericErrorHandler);
};

store.mergeOperations = function (toKeepId, toRemoveId) {
    _backend2.default.mergeOperations(toKeepId, toRemoveId).then(function (newToKeep) {

        var ops = store.getCurrentOperations();
        var unknownOperationTypeId = store.getUnknownOperationType().id;

        var found = 0;
        var toDeleteIndex = null;
        for (var i = 0; i < ops.length; i++) {
            var op = ops[i];
            if (op.id === toKeepId) {
                ops[i] = new _models.Operation(newToKeep, unknownOperationTypeId);
                if (++found == 2) break;
            } else if (op.id === toRemoveId) {
                toDeleteIndex = i;
                if (++found == 2) break;
            }
        }
        (0, _helpers.assert)(found == 2, "both operations had to be present");
        (0, _helpers.assert)(toDeleteIndex !== null);

        ops.splice(toDeleteIndex, 1);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(GenericErrorHandler);
};

// CATEGORIES
store.addCategory = function (category) {
    _backend2.default.addCategory(category).then(function (created) {

        store.triggerNewCategory(created);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.categories
        });
    }).catch(GenericErrorHandler);
};

store.updateCategory = function (id, category) {
    _backend2.default.updateCategory(id, category).then(function (newCat) {

        store.triggerUpdateCategory(id, newCat);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.categories
        });
    }).catch(GenericErrorHandler);
};

store.deleteCategory = function (id, replaceById) {
    (0, _helpers.assert)(typeof replaceById !== 'undefined');

    // The server expects an empty string if there's no replacement category.
    var serverReplaceById = replaceById === _helpers.NONE_CATEGORY_ID ? '' : replaceById;

    _backend2.default.deleteCategory(id, serverReplaceById).then(function () {
        store.triggerDeleteCategory(id, replaceById);
        _dispatcher2.default.dispatch({
            type: Events.server.deleted_category
        });
    }).catch(GenericErrorHandler);
};

store.getCategoryFromId = function (id) {
    (0, _helpers.assert)(data.categoryMap.has(id), 'getCategoryFromId lookup failed for id: ' + id);
    return data.categoryMap.get(id);
};

function resetCategoryMap() {
    data.categories.sort(function (a, b) {
        return (0, _helpers.compareLocale)(a.title, b.title, data.settings.locale);
    });
    data.categoryMap = new _map2.default();
    for (var i = 0; i < data.categories.length; i++) {
        var c = data.categories[i];
        (0, _helpers.has)(c, 'id');
        (0, _helpers.has)(c, 'title');
        (0, _helpers.has)(c, 'color');
        data.categoryMap.set(c.id, c);
    }
}

store.setCategories = function (categories) {
    var NONE_CATEGORY = new _models.Category({
        id: _helpers.NONE_CATEGORY_ID,
        title: (0, _helpers.translate)('client.category.none'),
        color: '#000000'
    });

    data.categories = [NONE_CATEGORY].concat(categories).map(function (cat) {
        return new _models.Category(cat);
    });
    resetCategoryMap();
};

store.triggerNewCategory = function (category) {
    data.categories.push(new _models.Category(category));
    resetCategoryMap();
};

store.triggerUpdateCategory = function (id, updated) {
    var _iteratorNormalCompletion15 = true;
    var _didIteratorError15 = false;
    var _iteratorError15 = undefined;

    try {
        for (var _iterator15 = (0, _getIterator3.default)(data.categories), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
            var cat = _step15.value;

            if (cat.id === id) {
                cat.mergeOwnProperties(updated);
                resetCategoryMap();
                return;
            }
        }
    } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion15 && _iterator15.return) {
                _iterator15.return();
            }
        } finally {
            if (_didIteratorError15) {
                throw _iteratorError15;
            }
        }
    }

    (0, _helpers.assert)(false, "Didn't find category to update");
};

store.triggerDeleteCategory = function (id, replaceId) {
    var found = false;
    for (var i = 0; i < data.categories.length; i++) {
        var cat = data.categories[i];
        if (cat.id === id) {
            data.categories.splice(i, 1);
            resetCategoryMap();
            found = true;
            break;
        }
    }
    (0, _helpers.assert)(found, "Didn't find category to delete");

    // Update operations
    var _iteratorNormalCompletion16 = true;
    var _didIteratorError16 = false;
    var _iteratorError16 = undefined;

    try {
        for (var _iterator16 = (0, _getIterator3.default)(data.banks.values()), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
            var _bank = _step16.value;
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
                for (var _iterator17 = (0, _getIterator3.default)(_bank.accounts.values()), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    var _acc3 = _step17.value;
                    var _iteratorNormalCompletion18 = true;
                    var _didIteratorError18 = false;
                    var _iteratorError18 = undefined;

                    try {
                        for (var _iterator18 = (0, _getIterator3.default)(_acc3.operations), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                            var op = _step18.value;

                            if (op.categoryId === id) {
                                op.categoryId = replaceId;
                            }
                        }
                    } catch (err) {
                        _didIteratorError18 = true;
                        _iteratorError18 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion18 && _iterator18.return) {
                                _iterator18.return();
                            }
                        } finally {
                            if (_didIteratorError18) {
                                throw _iteratorError18;
                            }
                        }
                    }
                }
            } catch (err) {
                _didIteratorError17 = true;
                _iteratorError17 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion17 && _iterator17.return) {
                        _iterator17.return();
                    }
                } finally {
                    if (_didIteratorError17) {
                        throw _iteratorError17;
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion16 && _iterator16.return) {
                _iterator16.return();
            }
        } finally {
            if (_didIteratorError16) {
                throw _iteratorError16;
            }
        }
    }
};

// SETTINGS

store.setSettings = function (settings, cozy) {
    var _iteratorNormalCompletion19 = true;
    var _didIteratorError19 = false;
    var _iteratorError19 = undefined;

    try {
        for (var _iterator19 = (0, _getIterator3.default)(settings), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var pair = _step19.value;

            (0, _helpers.assert)(_defaultSettings2.default.has(pair.name), 'all settings must have their default value, missing for: ' + pair.name);
            data.settings.set(pair.name, pair.value);
        }
    } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion19 && _iterator19.return) {
                _iterator19.return();
            }
        } finally {
            if (_didIteratorError19) {
                throw _iteratorError19;
            }
        }
    }

    if (!data.settings.has('locale')) {
        if (cozy && cozy.length && cozy[0].locale) {
            data.settings.set('locale', cozy[0].locale);
        } else {
            data.settings.set('locale', 'en');
        }
    }

    (0, _helpers.assert)(data.settings.has('locale'), 'Kresus needs a locale');
    var locale = data.settings.get('locale');
    var p = new Polyglot({ allowMissing: true });
    var found = false;
    try {
        p.extend(require(localesPath + locale));
        found = true;
    } catch (e) {
        // Default locale is 'en', so the error shouldn't be shown in this
        // case.
        if (locale !== 'en') {
            console.log(e);
        }
    }

    (0, _helpers.setTranslator)(p);
    // only alert for missing translations in the case of the non default locale
    (0, _helpers.setTranslatorAlertMissing)(found);
};

store.changeSetting = function (key, value) {
    var previousValue = data.settings.get(key);
    data.settings.set(key, value);
    events.emit(State.settings);

    _backend2.default.saveSetting(String(key), String(value)).catch(function (err) {
        GenericErrorHandler(err);
        data.settings.set(key, previousValue);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.settings
        });
    });
};

store.changeAccess = function (accessId, login, password, customFields) {
    _backend2.default.updateAccess(accessId, { login: login, password: password, customFields: customFields }).then(function () {
        // Nothing to do yet, accesses are not saved locally.
    }).catch(GenericErrorHandler);
};

store.createOperationForAccount = function (accountID, operation) {
    _backend2.default.createOperation(operation).then(function (created) {
        var account = store.getAccount(accountID);
        var unknownOperationTypeId = store.getUnknownOperationType().id;
        account.operations.push(new _models.Operation(created, unknownOperationTypeId));
        sortOperations(account.operations);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(GenericErrorHandler);
};

// OPERATION TYPES
store.setOperationTypes = function (operationtypes) {
    data.operationtypes = operationtypes.map(function (type) {
        return new _models.OperationType(type);
    });
    resetOperationTypesLabel();
};

function resetOperationTypesLabel() {
    data.operationTypesLabel = new _map2.default();

    for (var i = 0; i < data.operationtypes.length; i++) {
        var c = data.operationtypes[i];
        (0, _helpers.has)(c, 'id');
        (0, _helpers.has)(c, 'name');
        data.operationTypesLabel.set(c.id, (0, _helpers.translate)('client.' + c.name));
    }

    // Sort operation types by names
    data.operationtypes.sort(function (a, b) {
        var al = store.operationTypeToLabel(a.id);
        var bl = store.operationTypeToLabel(b.id);
        return (0, _helpers.compareLocale)(al, bl, data.settings.locale);
    });
}

store.operationTypeToLabel = function (id) {
    (0, _helpers.assert)(data.operationTypesLabel.has(id), 'operationTypeToLabel lookup failed for id: ' + id);
    return data.operationTypesLabel.get(id);
};

// ALERTS
function findAlertIndex(al) {
    var arr = data.alerts;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id === al.id) {
            return i;
        }
    }
    (0, _helpers.assert)(false, "impossible to find the alert!");
}

store.createAlert = function (al) {
    _backend2.default.createAlert(al).then(function (createdAlert) {
        data.alerts.push(createdAlert);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    }).catch(GenericErrorHandler);
};

store.updateAlert = function (al, attributes) {
    _backend2.default.updateAlert(al.id, attributes).then(function () {
        var i = findAlertIndex(al);
        data.alerts[i].merge(attributes);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    }).catch(GenericErrorHandler);
};

store.deleteAlert = function (al) {
    _backend2.default.deleteAlert(al.id).then(function () {
        var i = findAlertIndex(al);
        data.alerts.splice(i, 1);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    }).catch(GenericErrorHandler);
};

/*
 * EVENTS
 */
var Events = {
    forward: 'forward',
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        changed_password: 'the user changed the password of a bank access',
        changed_setting: 'the user changed a setting value',
        created_alert: 'the user submitted an alert creation form',
        created_bank: 'the user submitted an access creation form',
        created_category: 'the user submitted a category creation form',
        created_operation: 'the user created an operation for an account',
        deleted_account: 'the user clicked in order to delete an account',
        deleted_alert: 'the user clicked in order to delete an alert',
        deleted_bank: 'the user clicked in order to delete a bank',
        deleted_category: 'the user clicked in order to delete a category',
        fetched_accounts: 'the user clicked in order to fetch new accounts and operations for a bank',
        fetched_operations: 'the user clicked in order to fetch operations for a specific bank account',
        imported_instance: 'the user sent a file to import a kresus instance',
        merged_operations: 'the user clicked in order to merge two operations',
        selected_account: 'the user clicked to change the selected account, or a callback forced selection of an account',
        selected_bank: 'the user clicked to change the selected bank, or a callback forced selection of a bank',
        updated_alert: 'the user submitted an alert update form',
        updated_category: 'the user submitted a category update form',
        updated_category_of_operation: 'the user changed the category of an operation in the select list',
        updated_type_of_operation: 'the user changed the type of an operation in the select list',
        updated_custom_label_of_operation: 'the user updated the label of  an operation',
        updated_weboob: 'the user asked to update weboob'
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        deleted_category: 'a category has just been deleted on the server',
        saved_bank: 'a bank access was saved (created or updated) on the server.',
        saved_category: 'a category was saved (created or updated) on the server.',
        after_sync: 'new operations / accounts were fetched on the server.'
    }
};

var State = exports.State = {
    alerts: 'alerts state changed',
    banks: 'banks state changed',
    accounts: 'accounts state changed',
    settings: 'settings state changed',
    operations: 'operations state changed',
    categories: 'categories state changed',
    weboob: 'weboob state changed',
    sync: 'sync state changed'
};

/*
 * ACTIONS
 **/
var Actions = exports.Actions = {

    // Main UI

    SelectAccount: function SelectAccount(account) {
        (0, _helpers.assert)(account instanceof _models.Account, 'SelectAccount expects an Account');
        _dispatcher2.default.dispatch({
            type: Events.user.selected_account,
            accountId: account.id
        });
    },
    SelectBank: function SelectBank(bank) {
        (0, _helpers.assert)(bank instanceof _models.Bank, 'SelectBank expects a Bank');
        _dispatcher2.default.dispatch({
            type: Events.user.selected_bank,
            bankId: bank.id
        });
    },

    // Categories

    CreateCategory: function CreateCategory(category) {
        (0, _helpers.has)(category, 'title', 'CreateCategory expects an object that has a title field');
        (0, _helpers.has)(category, 'color', 'CreateCategory expects an object that has a color field');
        _dispatcher2.default.dispatch({
            type: Events.user.created_category,
            category: category
        });
    },
    UpdateCategory: function UpdateCategory(category, newCategory) {
        (0, _helpers.assert)(category instanceof _models.Category, 'UpdateCategory expects a Category as the first argument');
        (0, _helpers.has)(newCategory, 'title', 'UpdateCategory expects a second argument that has a title field');
        (0, _helpers.has)(newCategory, 'color', 'UpdateCategory expects a second argument that has a color field');
        _dispatcher2.default.dispatch({
            type: Events.user.updated_category,
            id: category.id,
            category: newCategory
        });
    },
    DeleteCategory: function DeleteCategory(category, replace) {
        (0, _helpers.assert)(category instanceof _models.Category, 'DeleteCategory expects a Category as the first argument');
        (0, _helpers.assert)(typeof replace === 'string', 'DeleteCategory expects a String as the second argument');
        _dispatcher2.default.dispatch({
            type: Events.user.deleted_category,
            id: category.id,
            replaceByCategoryId: replace
        });
    },

    // Operation list

    SetOperationCategory: function SetOperationCategory(operation, catId) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'SetOperationCategory expects an Operation as the first argument');
        (0, _helpers.assert)(typeof catId === 'string', 'SetOperationCategory expects a String category id as the second argument');
        _dispatcher2.default.dispatch({
            type: Events.user.updated_category_of_operation,
            operation: operation,
            categoryId: catId
        });
    },
    FetchOperations: function FetchOperations() {
        _dispatcher2.default.dispatch({
            type: Events.user.fetched_operations
        });
    },
    FetchAccounts: function FetchAccounts(bank, account) {
        (0, _helpers.assert)(bank instanceof _models.Bank, 'FetchAccounts expects a Bank instance as the first arg');
        (0, _helpers.assert)(account instanceof _models.Account, 'FetchAccounts expects an Account instance as the second arg');
        _dispatcher2.default.dispatch({
            type: Events.user.fetched_accounts,
            bankId: bank.id,
            accountId: account.id,
            accessId: account.bankAccess
        });
    },
    SetOperationType: function SetOperationType(operation, typeId) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'SetOperationType expects an Operation as the first argument');
        (0, _helpers.assert)(typeof typeId === 'string', 'SetOperationType expects a String operationtype id as the second argument');
        _dispatcher2.default.dispatch({
            type: Events.user.updated_type_of_operation,
            operation: operation,
            typeId: typeId
        });
    },
    SetCustomLabel: function SetCustomLabel(operation, customLabel) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'SetCustomLabel expects an Operation as the first argument');
        (0, _helpers.assert)(typeof customLabel === 'string', 'SetCustomLabel expects a String as second argument');
        _dispatcher2.default.dispatch({
            type: Events.user.updated_custom_label_of_operation,
            operation: operation,
            customLabel: customLabel
        });
    },

    // Settings
    DeleteAccount: function DeleteAccount(account) {
        (0, _helpers.assert)(account instanceof _models.Account, 'DeleteAccount expects an Account');
        _dispatcher2.default.dispatch({
            type: Events.user.deleted_account,
            accountId: account.id
        });
    },
    DeleteBank: function DeleteBank(bank) {
        (0, _helpers.assert)(bank instanceof _models.Bank, 'DeleteBank expects an Bank');
        _dispatcher2.default.dispatch({
            type: Events.user.deleted_bank,
            bankId: bank.id
        });
    },
    CreateBank: function CreateBank(uuid, login, passwd, customFields) {
        (0, _helpers.assert)(typeof uuid === 'string' && uuid.length, 'uuid must be a non-empty string');
        (0, _helpers.assert)(typeof login === 'string' && login.length, 'login must be a non-empty string');
        (0, _helpers.assert)(typeof passwd === 'string' && passwd.length, 'passwd must be a non-empty string');
        var eventObject = {
            type: Events.user.created_bank,
            bankUuid: uuid,
            id: login,
            pwd: passwd
        };
        if (typeof customFields !== 'undefined') eventObject.customFields = customFields;
        _dispatcher2.default.dispatch(eventObject);
    },
    ChangeSetting: function ChangeSetting(key, val) {
        (0, _helpers.assert)(typeof key === 'string', 'key must be a string');
        (0, _helpers.assert)(typeof val === 'string', 'value must be a string');
        (0, _helpers.assert)(key.length + val.length, 'key and value must be non-empty');
        _dispatcher2.default.dispatch({
            type: Events.user.changed_setting,
            key: key,
            value: val
        });
    },
    ChangeBoolSetting: function ChangeBoolSetting(key, val) {
        (0, _helpers.assert)(typeof val === 'boolean', 'val must be a boolean');
        this.ChangeSetting(key, val.toString());
    },
    UpdateWeboob: function UpdateWeboob(action) {
        (0, _helpers.has)(action, 'which');
        _dispatcher2.default.dispatch({
            type: Events.user.updated_weboob,
            which: action.which
        });
    },
    UpdateAccess: function UpdateAccess(account, login, password, customFields) {
        (0, _helpers.assert)(account instanceof _models.Account, 'first param must be an account');
        (0, _helpers.assert)(typeof password === 'string', 'second param must be the password');

        if (typeof login !== 'undefined') {
            (0, _helpers.assert)(typeof login === 'string', 'third param must be the login');
        }

        if (typeof customFields !== 'undefined') {
            (0, _helpers.assert)(customFields instanceof Array && customFields.every(function (f) {
                return (0, _helpers.has)(f, "name") && (0, _helpers.has)(f, "value");
            }), 'if not omitted third param must be an array of object with "name" and "value" keys');
        }

        _dispatcher2.default.dispatch({
            type: Events.user.changed_password,
            accessId: account.bankAccess,
            login: login,
            password: password,
            customFields: customFields
        });
    },
    ImportInstance: function ImportInstance(action) {
        (0, _helpers.has)(action, 'content');
        _dispatcher2.default.dispatch({
            type: Events.user.imported_instance,
            content: action.content
        });
    },
    CreateOperation: function CreateOperation(accountID, operation) {
        (0, _helpers.assert)(typeof accountID === 'string' && accountID.length, 'first parameter must be a non empty string');
        _dispatcher2.default.dispatch({
            type: Events.user.created_operation,
            operation: operation,
            accountID: accountID
        });
    },

    // Duplicates

    MergeOperations: function MergeOperations(toKeep, toRemove) {
        (0, _helpers.assert)(toKeep instanceof _models.Operation && toRemove instanceof _models.Operation, 'MergeOperation expects two Operation');
        _dispatcher2.default.dispatch({
            type: Events.user.merged_operations,
            toKeepId: toKeep.id,
            toRemoveId: toRemove.id
        });
    },

    // Alerts
    CreateAlert: function CreateAlert(alert) {
        (0, _helpers.assert)((typeof alert === 'undefined' ? 'undefined' : (0, _typeof3.default)(alert)) === 'object');
        (0, _helpers.has)(alert, 'type');
        (0, _helpers.has)(alert, 'bankAccount');
        _dispatcher2.default.dispatch({
            type: Events.user.created_alert,
            alert: alert
        });
    },
    UpdateAlert: function UpdateAlert(alert, attributes) {
        (0, _helpers.assert)(alert instanceof _models.Alert, "UpdateAlert expects an instance of Alert");
        (0, _helpers.assert)((typeof attributes === 'undefined' ? 'undefined' : (0, _typeof3.default)(attributes)) === 'object', "Second attribute to UpdateAlert must be an object");
        _dispatcher2.default.dispatch({
            type: Events.user.updated_alert,
            alert: alert,
            attributes: attributes
        });
    },
    DeleteAlert: function DeleteAlert(alert) {
        (0, _helpers.assert)(alert instanceof _models.Alert, "DeleteAlert expects an instance of Alert");
        _dispatcher2.default.dispatch({
            type: Events.user.deleted_alert,
            alert: alert
        });
    }
};

_dispatcher2.default.register(function (action) {
    switch (action.type) {

        // User events
        case Events.user.changed_password:
            (0, _helpers.has)(action, 'accessId');
            (0, _helpers.has)(action, 'password');
            store.changeAccess(action.accessId, action.login, action.password, action.customFields);
            break;

        case Events.user.changed_setting:
            (0, _helpers.has)(action, 'key');
            (0, _helpers.has)(action, 'value');
            store.changeSetting(action.key, action.value);
            break;

        case Events.user.created_bank:
            (0, _helpers.has)(action, 'bankUuid');
            (0, _helpers.has)(action, 'id');
            (0, _helpers.has)(action, 'pwd');
            store.addBank(action.bankUuid, action.id, action.pwd, action.customFields);
            break;

        case Events.user.created_category:
            (0, _helpers.has)(action, 'category');
            store.addCategory(action.category);
            break;

        case Events.user.deleted_account:
            (0, _helpers.has)(action, 'accountId');
            store.deleteAccount(action.accountId);
            break;

        case Events.user.deleted_alert:
            (0, _helpers.has)(action, 'alert');
            store.deleteAlert(action.alert);
            break;

        case Events.user.deleted_bank:
            (0, _helpers.has)(action, 'bankId');
            store.deleteBank(action.bankId);
            break;

        case Events.user.deleted_category:
            (0, _helpers.has)(action, 'id');
            (0, _helpers.has)(action, 'replaceByCategoryId');
            store.deleteCategory(action.id, action.replaceByCategoryId);
            break;

        case Events.user.imported_instance:
            (0, _helpers.has)(action, 'content');
            store.importInstance(action.content);
            break;

        case Events.user.merged_operations:
            (0, _helpers.has)(action, 'toKeepId');
            (0, _helpers.has)(action, 'toRemoveId');
            store.mergeOperations(action.toKeepId, action.toRemoveId);
            break;

        case Events.user.fetched_operations:
            store.fetchOperations();
            break;

        case Events.user.fetched_accounts:
            (0, _helpers.has)(action, 'bankId');
            (0, _helpers.has)(action, 'accessId');
            (0, _helpers.has)(action, 'accountId');
            store.fetchAccounts(action.bankId, action.accountId, action.accessId);
            break;

        case Events.user.selected_account:
            (0, _helpers.has)(action, 'accountId');
            (0, _helpers.assert)(store.getAccount(action.accountId) !== null, 'Selected account must exist');
            data.currentAccountId = action.accountId;
            events.emit(State.accounts);
            break;

        case Events.user.selected_bank:
            (0, _helpers.has)(action, 'bankId');
            var currentBank = store.getBank(action.bankId);
            (0, _helpers.assert)(currentBank !== null, 'Selected bank must exist');
            data.currentBankId = currentBank.id;
            data.currentAccountId = currentBank.accounts.keys().next().value;
            events.emit(State.banks);
            break;

        case Events.user.created_alert:
            (0, _helpers.has)(action, 'alert');
            store.createAlert(action.alert);
            break;

        case Events.user.updated_alert:
            (0, _helpers.has)(action, 'alert');
            (0, _helpers.has)(action, 'attributes');
            store.updateAlert(action.alert, action.attributes);
            break;

        case Events.user.updated_category:
            (0, _helpers.has)(action, 'id');
            (0, _helpers.has)(action, 'category');
            store.updateCategory(action.id, action.category);
            break;

        case Events.user.updated_category_of_operation:
            (0, _helpers.has)(action, 'operation');
            (0, _helpers.has)(action, 'categoryId');
            store.updateCategoryForOperation(action.operation, action.categoryId);
            break;

        case Events.user.updated_type_of_operation:
            (0, _helpers.has)(action, 'operation');
            (0, _helpers.has)(action, 'typeId');
            store.updateTypeForOperation(action.operation, action.typeId);
            break;

        case Events.user.updated_custom_label_of_operation:
            (0, _helpers.has)(action, 'operation');
            (0, _helpers.has)(action, 'customLabel');
            store.updateCustomLabelForOperation(action.operation, action.customLabel);
            break;

        case Events.user.created_operation:
            (0, _helpers.has)(action, 'accountID');
            (0, _helpers.has)(action, 'operation');
            store.createOperationForAccount(action.accountID, action.operation);
            break;

        case Events.user.updated_weboob:
            (0, _helpers.has)(action, 'which');
            store.updateWeboob(action.which);
            break;

        // Server events. Most of these events should be forward events, as the
        // logic on events is handled directly in backend callbacks.
        case Events.server.saved_bank:
            // Should be pretty rare, so we can reload everything.
            store.setupKresus(function () {
                _dispatcher2.default.dispatch({
                    type: Events.forward,
                    event: State.banks
                });
            });
            break;

        case Events.server.deleted_category:
            events.emit(State.categories);
            // Deleting a category will change operations affected to that category
            events.emit(State.operations);
            break;

        case Events.forward:
            (0, _helpers.has)(action, 'event');
            events.emit(action.event);
            break;

        case Events.after_sync:
            events.emit(State.sync, action.maybeError);
            break;

        default:
            (0, _helpers.assert)(false, "unhandled event in store switch: " + action.type);
    }
});

function CheckEvent(event) {
    (0, _helpers.assert)(event == State.alerts || event == State.banks || event == State.accounts || event == State.settings || event == State.operations || event == State.categories || event == State.weboob || event == State.sync, 'component subscribed to an unknown / forbidden event:' + event);
}

store.on = function (event, cb) {
    CheckEvent(event);
    events.on(event, cb);
};

store.once = function (event, cb) {
    CheckEvent(event);
    events.once(event, cb);
};

store.removeListener = function (event, cb) {
    events.removeListener(event, cb);
};

// Subscribes callback to event, and calls the callback if there's already data.
store.subscribeMaybeGet = function (event, cb) {
    store.on(event, cb);

    switch (event) {

        case State.banks:
            if (data.banks.size > 0) {
                (0, _helpers.debug)('Store - cache hit for banks');
                cb();
            }
            break;

        case State.accounts:
            if (data.currentBankId !== null) {
                (0, _helpers.debug)('Store - cache hit for accounts');
                cb();
            }
            break;

        case State.operations:
            if (data.currentBankId !== null && data.currentAccountId !== null) {
                (0, _helpers.debug)('Store - cache hit for operations');
                cb();
            }
            break;

        case State.categories:
            if (data.categories.length > 0) {
                (0, _helpers.debug)('Store - cache hit for categories');
                cb();
            }
            break;

        default:
            (0, _helpers.assert)(false, "default case of subscribeMaybeGet shouldn't ever be reached");
            break;
    }
};

},{"../shared/default-settings":144,"../shared/locales/en":146,"../shared/locales/fr":147,"./backend":1,"./flux/dispatcher":28,"./helpers":30,"./models":32,"babel-runtime/core-js/get-iterator":34,"babel-runtime/core-js/json/stringify":36,"babel-runtime/core-js/map":37,"babel-runtime/helpers/typeof":54,"events":142}],34:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":55}],35:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":56}],36:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":57}],37:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":58}],38:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/is-finite"), __esModule: true };
},{"core-js/library/fn/number/is-finite":59}],39:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/is-nan"), __esModule: true };
},{"core-js/library/fn/number/is-nan":60}],40:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/parse-float"), __esModule: true };
},{"core-js/library/fn/number/parse-float":61}],41:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":62}],42:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":63}],43:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":64}],44:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":65}],45:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":66}],46:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":67}],47:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":68}],48:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],49:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("../core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
},{"../core-js/object/define-property":42}],50:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("../core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("../core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"../core-js/object/get-own-property-descriptor":43,"../core-js/object/get-prototype-of":44}],51:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("../core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("../core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"../core-js/object/create":41,"../core-js/object/set-prototype-of":45,"../helpers/typeof":54}],52:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("../helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"../helpers/typeof":54}],53:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _isIterable2 = require("../core-js/is-iterable");

var _isIterable3 = _interopRequireDefault(_isIterable2);

var _getIterator2 = require("../core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if ((0, _isIterable3.default)(Object(arr))) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
})();
},{"../core-js/get-iterator":34,"../core-js/is-iterable":35}],54:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof _Symbol !== "undefined" && obj.constructor === _Symbol ? "symbol" : typeof obj; }

exports.default = function (obj) {
  return obj && typeof _symbol2.default !== "undefined" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":47}],55:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":126,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":141}],56:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":127,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":141}],57:[function(require,module,exports){
var core = require('../../modules/$.core');
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return (core.JSON && core.JSON.stringify || JSON.stringify).apply(JSON, arguments);
};
},{"../../modules/$.core":77}],58:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
module.exports = require('../modules/$.core').Map;
},{"../modules/$.core":77,"../modules/es6.map":129,"../modules/es6.object.to-string":136,"../modules/es6.string.iterator":138,"../modules/es7.map.to-json":140,"../modules/web.dom.iterable":141}],59:[function(require,module,exports){
require('../../modules/es6.number.is-finite');
module.exports = require('../../modules/$.core').Number.isFinite;
},{"../../modules/$.core":77,"../../modules/es6.number.is-finite":130}],60:[function(require,module,exports){
require('../../modules/es6.number.is-nan');
module.exports = require('../../modules/$.core').Number.isNaN;
},{"../../modules/$.core":77,"../../modules/es6.number.is-nan":131}],61:[function(require,module,exports){
require('../../modules/es6.number.parse-float');
module.exports = parseFloat;
},{"../../modules/es6.number.parse-float":132}],62:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":102}],63:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":102}],64:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.get-own-property-descriptor');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":102,"../../modules/es6.object.get-own-property-descriptor":133}],65:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/$.core').Object.getPrototypeOf;
},{"../../modules/$.core":77,"../../modules/es6.object.get-prototype-of":134}],66:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/$.core').Object.setPrototypeOf;
},{"../../modules/$.core":77,"../../modules/es6.object.set-prototype-of":135}],67:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;
},{"../modules/$.core":77,"../modules/es6.object.to-string":136,"../modules/es6.promise":137,"../modules/es6.string.iterator":138,"../modules/web.dom.iterable":141}],68:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
module.exports = require('../../modules/$.core').Symbol;
},{"../../modules/$.core":77,"../../modules/es6.object.to-string":136,"../../modules/es6.symbol":139}],69:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],70:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],71:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":95}],72:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./$.cof')
  , TAG = require('./$.wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./$.cof":73,"./$.wks":124}],73:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],74:[function(require,module,exports){
'use strict';
var $            = require('./$')
  , hide         = require('./$.hide')
  , redefineAll  = require('./$.redefine-all')
  , ctx          = require('./$.ctx')
  , strictNew    = require('./$.strict-new')
  , defined      = require('./$.defined')
  , forOf        = require('./$.for-of')
  , $iterDefine  = require('./$.iter-define')
  , step         = require('./$.iter-step')
  , ID           = require('./$.uid')('id')
  , $has         = require('./$.has')
  , isObject     = require('./$.is-object')
  , setSpecies   = require('./$.set-species')
  , DESCRIPTORS  = require('./$.descriptors')
  , isExtensible = Object.isExtensible || isObject
  , SIZE         = DESCRIPTORS ? '_s' : 'size'
  , id           = 0;

var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!$has(it, ID)){
    // can't set id to frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
};

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      strictNew(that, C, NAME);
      that._i = $.create(null); // index
      that._f = undefined;      // first entry
      that._l = undefined;      // last entry
      that[SIZE] = 0;           // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)$.setDesc(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"./$":102,"./$.ctx":78,"./$.defined":79,"./$.descriptors":80,"./$.for-of":85,"./$.has":88,"./$.hide":89,"./$.is-object":95,"./$.iter-define":98,"./$.iter-step":100,"./$.redefine-all":108,"./$.set-species":112,"./$.strict-new":116,"./$.uid":123}],75:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var forOf   = require('./$.for-of')
  , classof = require('./$.classof');
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    var arr = [];
    forOf(this, false, arr.push, arr);
    return arr;
  };
};
},{"./$.classof":72,"./$.for-of":85}],76:[function(require,module,exports){
'use strict';
var $              = require('./$')
  , global         = require('./$.global')
  , $export        = require('./$.export')
  , fails          = require('./$.fails')
  , hide           = require('./$.hide')
  , redefineAll    = require('./$.redefine-all')
  , forOf          = require('./$.for-of')
  , strictNew      = require('./$.strict-new')
  , isObject       = require('./$.is-object')
  , setToStringTag = require('./$.set-to-string-tag')
  , DESCRIPTORS    = require('./$.descriptors');

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
  } else {
    C = wrapper(function(target, iterable){
      strictNew(target, C, NAME);
      target._c = new Base;
      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
    });
    $.each.call('add,clear,delete,forEach,get,has,set,keys,values,entries'.split(','),function(KEY){
      var IS_ADDER = KEY == 'add' || KEY == 'set';
      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
        var result = this._c[KEY](a === 0 ? 0 : a, b);
        return IS_ADDER ? this : result;
      });
    });
    if('size' in proto)$.setDesc(C.prototype, 'size', {
      get: function(){
        return this._c.size;
      }
    });
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F, O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"./$":102,"./$.descriptors":80,"./$.export":83,"./$.fails":84,"./$.for-of":85,"./$.global":87,"./$.hide":89,"./$.is-object":95,"./$.redefine-all":108,"./$.set-to-string-tag":113,"./$.strict-new":116}],77:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],78:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./$.a-function":69}],79:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],80:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":84}],81:[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":87,"./$.is-object":95}],82:[function(require,module,exports){
// all enumerable object keys, includes symbols
var $ = require('./$');
module.exports = function(it){
  var keys       = $.getKeys(it)
    , getSymbols = $.getSymbols;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = $.isEnum
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
  }
  return keys;
};
},{"./$":102}],83:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , ctx       = require('./$.ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":77,"./$.ctx":78,"./$.global":87}],84:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],85:[function(require,module,exports){
var ctx         = require('./$.ctx')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , anObject    = require('./$.an-object')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that){
  var iterFn = getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./$.an-object":71,"./$.ctx":78,"./$.is-array-iter":93,"./$.iter-call":96,"./$.to-length":121,"./core.get-iterator-method":125}],86:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./$.to-iobject')
  , getNames  = require('./$').getNames
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return getNames(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.get = function getOwnPropertyNames(it){
  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
  return getNames(toIObject(it));
};
},{"./$":102,"./$.to-iobject":120}],87:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],88:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],89:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":102,"./$.descriptors":80,"./$.property-desc":107}],90:[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":87}],91:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],92:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":73}],93:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./$.iterators')
  , ITERATOR   = require('./$.wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./$.iterators":101,"./$.wks":124}],94:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./$.cof');
module.exports = Array.isArray || function(arg){
  return cof(arg) == 'Array';
};
},{"./$.cof":73}],95:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],96:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./$.an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./$.an-object":71}],97:[function(require,module,exports){
'use strict';
var $              = require('./$')
  , descriptor     = require('./$.property-desc')
  , setToStringTag = require('./$.set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./$.hide')(IteratorPrototype, require('./$.wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./$":102,"./$.hide":89,"./$.property-desc":107,"./$.set-to-string-tag":113,"./$.wks":124}],98:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./$.library')
  , $export        = require('./$.export')
  , redefine       = require('./$.redefine')
  , hide           = require('./$.hide')
  , has            = require('./$.has')
  , Iterators      = require('./$.iterators')
  , $iterCreate    = require('./$.iter-create')
  , setToStringTag = require('./$.set-to-string-tag')
  , getProto       = require('./$').getProto
  , ITERATOR       = require('./$.wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , methods, key;
  // Fix native
  if($native){
    var IteratorPrototype = getProto($default.call(new Base));
    // Set @@toStringTag to native iterators
    setToStringTag(IteratorPrototype, TAG, true);
    // FF fix
    if(!LIBRARY && has(proto, FF_ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    // fix Array#{values, @@iterator}.name in V8 / FF
    if(DEF_VALUES && $native.name !== VALUES){
      VALUES_BUG = true;
      $default = function values(){ return $native.call(this); };
    }
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES  ? $default : getMethod(VALUES),
      keys:    IS_SET      ? $default : getMethod(KEYS),
      entries: !DEF_VALUES ? $default : getMethod('entries')
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./$":102,"./$.export":83,"./$.has":88,"./$.hide":89,"./$.iter-create":97,"./$.iterators":101,"./$.library":104,"./$.redefine":109,"./$.set-to-string-tag":113,"./$.wks":124}],99:[function(require,module,exports){
var ITERATOR     = require('./$.wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ safe = true; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":124}],100:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],101:[function(require,module,exports){
module.exports = {};
},{}],102:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],103:[function(require,module,exports){
var $         = require('./$')
  , toIObject = require('./$.to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":102,"./$.to-iobject":120}],104:[function(require,module,exports){
module.exports = true;
},{}],105:[function(require,module,exports){
var global    = require('./$.global')
  , macrotask = require('./$.task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./$.cof')(process) == 'process'
  , head, last, notify;

var flush = function(){
  var parent, domain, fn;
  if(isNode && (parent = process.domain)){
    process.domain = null;
    parent.exit();
  }
  while(head){
    domain = head.domain;
    fn     = head.fn;
    if(domain)domain.enter();
    fn(); // <- currently we use it only for Promise - try / catch not required
    if(domain)domain.exit();
    head = head.next;
  } last = undefined;
  if(parent)parent.enter();
};

// Node.js
if(isNode){
  notify = function(){
    process.nextTick(flush);
  };
// browsers with MutationObserver
} else if(Observer){
  var toggle = 1
    , node   = document.createTextNode('');
  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
  notify = function(){
    node.data = toggle = -toggle;
  };
// environments with maybe non-completely correct, but existent Promise
} else if(Promise && Promise.resolve){
  notify = function(){
    Promise.resolve().then(flush);
  };
// for other environments - macrotask based on:
// - setImmediate
// - MessageChannel
// - window.postMessag
// - onreadystatechange
// - setTimeout
} else {
  notify = function(){
    // strange IE + webpack dev server bug - use .call(global)
    macrotask.call(global, flush);
  };
}

module.exports = function asap(fn){
  var task = {fn: fn, next: undefined, domain: isNode && process.domain};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./$.cof":73,"./$.global":87,"./$.task":118}],106:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./$.export')
  , core    = require('./$.core')
  , fails   = require('./$.fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./$.core":77,"./$.export":83,"./$.fails":84}],107:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],108:[function(require,module,exports){
var redefine = require('./$.redefine');
module.exports = function(target, src){
  for(var key in src)redefine(target, key, src[key]);
  return target;
};
},{"./$.redefine":109}],109:[function(require,module,exports){
module.exports = require('./$.hide');
},{"./$.hide":89}],110:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],111:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./$":102,"./$.an-object":71,"./$.ctx":78,"./$.is-object":95}],112:[function(require,module,exports){
'use strict';
var core        = require('./$.core')
  , $           = require('./$')
  , DESCRIPTORS = require('./$.descriptors')
  , SPECIES     = require('./$.wks')('species');

module.exports = function(KEY){
  var C = core[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])$.setDesc(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./$":102,"./$.core":77,"./$.descriptors":80,"./$.wks":124}],113:[function(require,module,exports){
var def = require('./$').setDesc
  , has = require('./$.has')
  , TAG = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./$":102,"./$.has":88,"./$.wks":124}],114:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":87}],115:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./$.an-object')
  , aFunction = require('./$.a-function')
  , SPECIES   = require('./$.wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./$.a-function":69,"./$.an-object":71,"./$.wks":124}],116:[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],117:[function(require,module,exports){
var toInteger = require('./$.to-integer')
  , defined   = require('./$.defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$.defined":79,"./$.to-integer":119}],118:[function(require,module,exports){
var ctx                = require('./$.ctx')
  , invoke             = require('./$.invoke')
  , html               = require('./$.html')
  , cel                = require('./$.dom-create')
  , global             = require('./$.global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listner = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./$.cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listner, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$.cof":73,"./$.ctx":78,"./$.dom-create":81,"./$.global":87,"./$.html":90,"./$.invoke":91}],119:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],120:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":79,"./$.iobject":92}],121:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":119}],122:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":79}],123:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],124:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , uid    = require('./$.uid')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
};
},{"./$.global":87,"./$.shared":114,"./$.uid":123}],125:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./$.classof":72,"./$.core":77,"./$.iterators":101,"./$.wks":124}],126:[function(require,module,exports){
var anObject = require('./$.an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./$.core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./$.an-object":71,"./$.core":77,"./core.get-iterator-method":125}],127:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./$.classof":72,"./$.core":77,"./$.iterators":101,"./$.wks":124}],128:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./$.add-to-unscopables')
  , step             = require('./$.iter-step')
  , Iterators        = require('./$.iterators')
  , toIObject        = require('./$.to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./$.iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./$.add-to-unscopables":70,"./$.iter-define":98,"./$.iter-step":100,"./$.iterators":101,"./$.to-iobject":120}],129:[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":76,"./$.collection-strong":74}],130:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export   = require('./$.export')
  , _isFinite = require('./$.global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"./$.export":83,"./$.global":87}],131:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./$.export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"./$.export":83}],132:[function(require,module,exports){
// 20.1.2.12 Number.parseFloat(string)
var $export = require('./$.export');

$export($export.S, 'Number', {parseFloat: parseFloat});
},{"./$.export":83}],133:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./$.to-iobject');

require('./$.object-sap')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./$.object-sap":106,"./$.to-iobject":120}],134:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./$.to-object');

require('./$.object-sap')('getPrototypeOf', function($getPrototypeOf){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./$.object-sap":106,"./$.to-object":122}],135:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./$.export');
$export($export.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.export":83,"./$.set-proto":111}],136:[function(require,module,exports){

},{}],137:[function(require,module,exports){
'use strict';
var $          = require('./$')
  , LIBRARY    = require('./$.library')
  , global     = require('./$.global')
  , ctx        = require('./$.ctx')
  , classof    = require('./$.classof')
  , $export    = require('./$.export')
  , isObject   = require('./$.is-object')
  , anObject   = require('./$.an-object')
  , aFunction  = require('./$.a-function')
  , strictNew  = require('./$.strict-new')
  , forOf      = require('./$.for-of')
  , setProto   = require('./$.set-proto').set
  , same       = require('./$.same-value')
  , SPECIES    = require('./$.wks')('species')
  , speciesConstructor = require('./$.species-constructor')
  , asap       = require('./$.microtask')
  , PROMISE    = 'Promise'
  , process    = global.process
  , isNode     = classof(process) == 'process'
  , P          = global[PROMISE]
  , Wrapper;

var testResolve = function(sub){
  var test = new P(function(){});
  if(sub)test.constructor = Object;
  return P.resolve(test) === test;
};

var USE_NATIVE = function(){
  var works = false;
  function P2(x){
    var self = new P(x);
    setProto(self, P2.prototype);
    return self;
  }
  try {
    works = P && P.resolve && testResolve();
    setProto(P2, P);
    P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
    // actual Firefox has broken subclass support, test that
    if(!(P2.resolve(5).then(function(){}) instanceof P2)){
      works = false;
    }
    // actual V8 bug, https://code.google.com/p/v8/issues/detail?id=4162
    if(works && require('./$.descriptors')){
      var thenableThenGotten = false;
      P.resolve($.setDesc({}, 'then', {
        get: function(){ thenableThenGotten = true; }
      }));
      works = thenableThenGotten;
    }
  } catch(e){ works = false; }
  return works;
}();

// helpers
var sameConstructor = function(a, b){
  // library wrapper special case
  if(LIBRARY && a === P && b === Wrapper)return true;
  return same(a, b);
};
var getConstructor = function(C){
  var S = anObject(C)[SPECIES];
  return S != undefined ? S : C;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var PromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve),
  this.reject  = aFunction(reject)
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(record, isReject){
  if(record.n)return;
  record.n = true;
  var chain = record.c;
  asap(function(){
    var value = record.v
      , ok    = record.s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , result, then;
      try {
        if(handler){
          if(!ok)record.h = true;
          result = handler === true ? value : handler(value);
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    chain.length = 0;
    record.n = false;
    if(isReject)setTimeout(function(){
      var promise = record.p
        , handler, console;
      if(isUnhandled(promise)){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      } record.a = undefined;
    }, 1);
  });
};
var isUnhandled = function(promise){
  var record = promise._d
    , chain  = record.a || record.c
    , i      = 0
    , reaction;
  if(record.h)return false;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var $reject = function(value){
  var record = this;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  record.v = value;
  record.s = 2;
  record.a = record.c.slice();
  notify(record, true);
};
var $resolve = function(value){
  var record = this
    , then;
  if(record.d)return;
  record.d = true;
  record = record.r || record; // unwrap
  try {
    if(record.p === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      asap(function(){
        var wrapper = {r: record, d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      record.v = value;
      record.s = 1;
      notify(record, false);
    }
  } catch(e){
    $reject.call({r: record, d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  P = function Promise(executor){
    aFunction(executor);
    var record = this._d = {
      p: strictNew(this, P, PROMISE),         // <- promise
      c: [],                                  // <- awaiting reactions
      a: undefined,                           // <- checked in isUnhandled reactions
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false,                               // <- handled rejection
      n: false                                // <- notify
    };
    try {
      executor(ctx($resolve, record, 1), ctx($reject, record, 1));
    } catch(err){
      $reject.call(record, err);
    }
  };
  require('./$.redefine-all')(P.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction = new PromiseCapability(speciesConstructor(this, P))
        , promise  = reaction.promise
        , record   = this._d;
      reaction.ok   = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      record.c.push(reaction);
      if(record.a)record.a.push(reaction);
      if(record.s)notify(record, false);
      return promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
require('./$.set-to-string-tag')(P, PROMISE);
require('./$.set-species')(PROMISE);
Wrapper = require('./$.core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = new PromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof P && sameConstructor(x.constructor, this))return x;
    var capability = new PromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./$.iter-detect')(function(iter){
  P.all(iter)['catch'](function(){});
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject
      , values     = [];
    var abrupt = perform(function(){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        var alreadyCalled = false;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled = true;
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = getConstructor(this)
      , capability = new PromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./$":102,"./$.a-function":69,"./$.an-object":71,"./$.classof":72,"./$.core":77,"./$.ctx":78,"./$.descriptors":80,"./$.export":83,"./$.for-of":85,"./$.global":87,"./$.is-object":95,"./$.iter-detect":99,"./$.library":104,"./$.microtask":105,"./$.redefine-all":108,"./$.same-value":110,"./$.set-proto":111,"./$.set-species":112,"./$.set-to-string-tag":113,"./$.species-constructor":115,"./$.strict-new":116,"./$.wks":124}],138:[function(require,module,exports){
'use strict';
var $at  = require('./$.string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./$.iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./$.iter-define":98,"./$.string-at":117}],139:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $              = require('./$')
  , global         = require('./$.global')
  , has            = require('./$.has')
  , DESCRIPTORS    = require('./$.descriptors')
  , $export        = require('./$.export')
  , redefine       = require('./$.redefine')
  , $fails         = require('./$.fails')
  , shared         = require('./$.shared')
  , setToStringTag = require('./$.set-to-string-tag')
  , uid            = require('./$.uid')
  , wks            = require('./$.wks')
  , keyOf          = require('./$.keyof')
  , $names         = require('./$.get-names')
  , enumKeys       = require('./$.enum-keys')
  , isArray        = require('./$.is-array')
  , anObject       = require('./$.an-object')
  , toIObject      = require('./$.to-iobject')
  , createDesc     = require('./$.property-desc')
  , getDesc        = $.getDesc
  , setDesc        = $.setDesc
  , _create        = $.create
  , getNames       = $names.get
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , setter         = false
  , HIDDEN         = wks('_hidden')
  , isEnum         = $.isEnum
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , useNative      = typeof $Symbol == 'function'
  , ObjectProto    = Object.prototype;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(setDesc({}, 'a', {
    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = getDesc(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  setDesc(it, key, D);
  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
} : setDesc;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol.prototype);
  sym._k = tag;
  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
};

var isSymbol = function(it){
  return typeof it == 'symbol';
};

var $defineProperty = function defineProperty(it, key, D){
  if(D && has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return setDesc(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key);
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
    ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  var D = getDesc(it = toIObject(it), key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = getNames(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
  return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var names  = getNames(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
};
var $stringify = function stringify(it){
  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
  var args = [it]
    , i    = 1
    , $$   = arguments
    , replacer, $replacer;
  while($$.length > i)args.push($$[i++]);
  replacer = args[1];
  if(typeof replacer == 'function')$replacer = replacer;
  if($replacer || !isArray(replacer))replacer = function(key, value){
    if($replacer)value = $replacer.call(this, key, value);
    if(!isSymbol(value))return value;
  };
  args[1] = replacer;
  return _stringify.apply($JSON, args);
};
var buggyJSON = $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
});

// 19.4.1.1 Symbol([description])
if(!useNative){
  $Symbol = function Symbol(){
    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
  };
  redefine($Symbol.prototype, 'toString', function toString(){
    return this._k;
  });

  isSymbol = function(it){
    return it instanceof $Symbol;
  };

  $.create     = $create;
  $.isEnum     = $propertyIsEnumerable;
  $.getDesc    = $getOwnPropertyDescriptor;
  $.setDesc    = $defineProperty;
  $.setDescs   = $defineProperties;
  $.getNames   = $names.get = $getOwnPropertyNames;
  $.getSymbols = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./$.library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }
}

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    return keyOf(SymbolRegistry, key);
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
  'species,split,toPrimitive,toStringTag,unscopables'
).split(','), function(it){
  var sym = wks(it);
  symbolStatics[it] = useNative ? sym : wrap(sym);
});

setter = true;

$export($export.G + $export.W, {Symbol: $Symbol});

$export($export.S, 'Symbol', symbolStatics);

$export($export.S + $export.F * !useNative, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});

// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./$":102,"./$.an-object":71,"./$.descriptors":80,"./$.enum-keys":82,"./$.export":83,"./$.fails":84,"./$.get-names":86,"./$.global":87,"./$.has":88,"./$.is-array":94,"./$.keyof":103,"./$.library":104,"./$.property-desc":107,"./$.redefine":109,"./$.set-to-string-tag":113,"./$.shared":114,"./$.to-iobject":120,"./$.uid":123,"./$.wks":124}],140:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./$.export');

$export($export.P, 'Map', {toJSON: require('./$.collection-to-json')('Map')});
},{"./$.collection-to-json":75,"./$.export":83}],141:[function(require,module,exports){
require('./es6.array.iterator');
var Iterators = require('./$.iterators');
Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
},{"./$.iterators":101,"./es6.array.iterator":128}],142:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],143:[function(require,module,exports){
module.exports={
  "name": "kresus",
  "version": "0.7.2",
  "engines": [
    "node = 0.8.x"
  ],
  "description": "Kresus' Personal Finance Manager",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/bnjbvr/kresus"
  },
  "main": "client/main.js",
  "dependencies": {
    "americano": "0.4.2",
    "babel-runtime": "6.3.19",
    "cozy-i18n-helper": "0.0.4",
    "cozy-notifications-helper": "1.0.2",
    "cozydb": "0.1.7",
    "moment": "2.10.6",
    "path-extra": "3.0.0",
    "pouchdb": "5.0.0",
    "printit": "0.1.3"
  },
  "devDependencies": {
    "babel-eslint": "4.1.6",
    "babel-cli": "6.3.17",
    "babel-plugin-transform-runtime": "6.3.13",
    "babel-preset-es2015": "6.3.13",
    "babel-preset-react": "6.3.13",
    "babel-preset-stage-0": "6.3.13",
    "babelify": "7.2.0",
    "browserify": "12.0.1",
    "eslint": "1.10.3",
    "eslint-plugin-react": "3.14.0",
    "onchange": "2.0.0",
    "sprity-cli": "1.0.1",
    "watchify": "3.6.1"
  },
  "scripts": {
    "start": "node build/server/index.js",
    "postinstall": "./scripts/postinstall.sh",
    "test": "./scripts/test.sh"
  },
  "bin": {
    "kresus": "bin/kresus.js"
  },
  "cozy-displayName": "Kresus",
  "cozy-permissions": {
    "Bank": {
      "description": "Les banques auxquelles vous pouvez accéder via l'application."
    },
    "BankAccess": {
      "description": "Vos identifiants d'accès à votre banque sont stockés de façon sécurisée."
    },
    "BankAccount": {
      "description": "Vos différents comptes bancaires."
    },
    "BankOperation": {
      "description": "Une opération bancaire."
    },
    "BankAlert": {
      "description": "Une alerte liée à vos comptes bancaires."
    },
    "BankCategory": {
      "description": "Categories des operations bancaires."
    },
    "send mail to user": {
      "description": "A votre demande, des rapports journaliers, hebdomadaires ou mensuels peuvent vous être envoyés par email."
    },
    "Notification": {
      "description": "Des notifications sont créées lorsque des alertes sont mises en place dans l'application."
    },
    "CozyInstance": {
      "description": "Afin d'afficher le contenu dans votre langue, l'application doit accéder à vos préférences."
    },
    "KresusConfig": {
      "description": "Une paire de clé-valeur pour sauvegarder des éléments de configuration de Kresus."
    },
    "operationtype": {
      "description": "Un type d'opération bancaire"
    }
  }
}

},{}],144:[function(require,module,exports){
'use strict';

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultSettings = new _map2.default();

DefaultSettings.set('weboob-auto-update', 'false');
DefaultSettings.set('weboob-auto-merge-accounts', 'true');
DefaultSettings.set('weboob-installed', 'false');
DefaultSettings.set('duplicateThreshold', '24');
DefaultSettings.set('defaultChartType', 'all');
DefaultSettings.set('defaultChartPeriod', 'current-month');
DefaultSettings.set('defaultAccountId', '');

module.exports = DefaultSettings;

},{"babel-runtime/core-js/map":37}],145:[function(require,module,exports){
module.exports={
    "UNKNOWN_WEBOOB_MODULE": "UNKNOWN_WEBOOB_MODULE",
    "NO_PASSWORD": "NO_PASSWORD",
    "INVALID_PASSWORD": "INVALID_PASSWORD",
    "EXPIRED_PASSWORD": "EXPIRED_PASSWORD",
    "BANK_ALREADY_EXISTS": "BANK_ALREADY_EXISTS",
    "INVALID_PARAMETERS": "INVALID_PARAMETERS",
    "GENERIC_EXCEPTION": "GENERIC_EXCEPTION"
}

},{}],146:[function(require,module,exports){
'use strict';

module.exports = {

    client: {

        KRESUS: 'KRESUS',

        accountwizard: {
            title: 'Welcome!',
            content: "Kresus is a personal finance manager that allows you to have a better understanding of what your main expenses are, by computing useful statistics about your bank transactions. To start, please set up a bank account below:",
            import_title: "Import",
            import: "If you've exported your previous Kresus instance, you can also import it back now by selecting the JSON file created on export.",
            advanced: "Advanced options"
        },

        amount_well: {
            current_search: 'For this search',
            this_month: 'This month'
        },

        category: {
            none: 'None',
            add: 'add a category',
            column_category_color: 'COLOR',
            column_category_name: 'CATEGORY NAME',
            column_action: 'ACTION',
            dont_replace: "Don't replace",
            erase: 'This will erase the "%{title}" category. If there are transactions mapped to this category, and you would like to move them to an existing category, you can do so in this list (by default, all transactions will move to the "None" category). Are you sure about this?',
            title: 'Categories',
            label: 'Label'
        },

        editaccessmodal: {
            not_empty: "Please fill the password field",
            customFields_not_empty: "Please fill all the custom fields",
            title: "Edit bank access",
            body: "If your bank password changed, you need to update it in Kresus so that the bank link keeps on syncing operations from your bank account.",
            cancel: "Cancel",
            save: "Save"
        },

        confirmdeletemodal: {
            title: 'Confirm deletion',
            confirm: 'Confirm deletion',
            dont_delete: "Don't delete"
        },

        charts: {
            Amount: 'Amounts',
            balance: 'balance',
            by_category: 'by category',
            differences_all: 'differences',
            Paid: 'Paid',
            Received: 'Received',
            Saved: 'Saved',
            title: 'Charts',

            type: 'Type',
            all_types: 'All types',
            positive: 'Income',
            negative: 'Expenses',

            period: 'Period',
            all_periods: 'All times',
            current_month: 'Current month',
            last_month: 'Last month',
            three_months: 'Last three months',
            six_months: 'Last six months',

            unselect_all_categories: 'Unselect all categories',
            select_all_categories: 'Select all categories'
        },

        general: {
            cancel: 'cancel',
            delete: 'delete',
            edit: 'edit',
            save: 'save'
        },

        loadscreen: {
            title: "Please wait while Kresus installs dependencies…",
            prolix1: "Kresus is currently trying to install its dependencies.  This can take up to 10 minutes on slow servers.",
            prolix2: "If you're self-hosting, please consider reading the",
            prolix3: "to ensure all the needed prerequisites have been installed on your machine. On the CozyCloud infra, your machine should be already set up.",
            prolix4: "The page is going to automatically reload in a short while. If you get stuck after 10 minutes, consider writing a message in the",
            prolix5: "Thank you for your patience."
        },

        menu: {
            banks: 'Banks',
            categories: 'Categories',
            charts: 'Charts',
            settings: 'Settings',
            similarities: 'Duplicates',
            sublists: 'Accounts',
            reports: 'Reports'
        },

        operations: {
            amount: 'Amount:',

            column_date: 'Date',
            column_name: 'Transaction',
            column_amount: 'Amount',
            column_category: 'Category',
            column_type: 'Type',

            current_balance: 'Balance',
            as_of: 'as of',
            received: 'Received',
            paid: 'Paid',
            saved: 'Saved',

            attached_file: 'Download the attached file',
            edf_details: 'See the bill in the EDF application',

            full_label: 'Full label:',
            category: 'Category:',

            last_sync: 'Last sync:',
            sync_now: 'Synchroniser maintenant',
            syncing: 'Fetching your latest bank transactions…',

            title: 'Transactions',
            type: 'Type:',
            custom_label: 'Custom label',
            add_custom_label: 'Add a custom label'
        },

        search: {
            any_category: "Any category",
            any_type: "Any type",
            keywords: "Keywords:",
            category: 'Category:',
            type: 'Type:',
            amount_low: 'Amount: between',
            and: 'and',
            date_low: 'Date: between',
            clear: 'Clear',
            clearAndClose: 'Clear and close',
            title: 'Search'
        },

        settings: {
            column_account_name: 'Name',
            unknown_field_type: 'unknown field type',
            website: 'Website',
            auth_type: "Authentification type",
            birthday: "Birthday",
            birthdate: "Birthday",
            merchant_id: "Merchant ID",
            birthday_placeholder: "DDMMYYYY",
            secret: "Secret",
            secret_placeholder: "Enter your secret phrase here",
            favorite_code_editor: "Favorite code editor",
            challengeanswer1: "Challenge Answer 1",
            question1: "Question 1",
            question2: "Question 2",
            question3: "Question 3",
            answer1: "Answer 1",
            answer2: "Answer 2",
            answer3: "Answer 3",
            bank: 'Bank',
            login: 'Login',
            password: 'Password',
            new_bank_form_title: 'Configure a new bank access',
            duplicate_threshold: 'Duplication threshold',
            duplicate_help: 'Two transactions will appear in the Duplicates section if they both happen within this period of time (in hours) of each other.',

            weboob_auto_update: "Automatically update Weboob modules",
            weboob_auto_merge_accounts: "Automatically merge Weboob accounts",

            reinstall_weboob: 'Reinstall weboob',
            go_reinstall_weboob: "Fire the reinstall!",
            reinstall_weboob_help: "This will entirely reinstall Weboob. Note it can take up to a few minutes, during which you won't be able to poll your accounts and operations. Use with caution!",

            update_weboob: 'Update weboob',
            go_update_weboob: "Fire the update!",
            update_weboob_help: "This will update Weboob without reinstalling it from scratch.  This should be done as a first step, in case fetching transactions doesn't work anymore.",

            export_instance: "Export Kresus instance",
            go_export_instance: "Export",
            export_instance_help: "This will export the instance to a JSON format that another Kresus instance can import. This won't contain the passwords of your bank accesses, which need to be reset manually when importing data from another instance.",

            import_instance: "Import Kresus instance",
            go_import_instance: "Import",
            import_instance_help: "This will import an existing instance, exported with the above button. It won't try to merge any data, so please ensure that your data is clean and delete any existing data with the DataBrowser, if needed.",

            title: 'Settings',

            tab_accounts: 'Bank accounts',
            tab_about: 'About',
            tab_backup: 'Backup / restore data',
            tab_defaults: 'Default parameters',
            tab_emails: 'Emails',
            tab_weboob: 'Weboob management',

            erase_account: 'This will erase the "%{title}" account, and all its transactions. If this is the last account bound to this bank, the bank will be erased as well. Are you sure about this?',
            erase_bank: 'This will erase the "%{name}" bank, and all its associated accounts and transactions. Are you sure about this?',
            missing_login_or_password: "Missing login or password",
            submit: 'Submit',

            delete_account_button: "Delete account",
            delete_bank_button: "Delete bank",
            reload_accounts_button: "Reload accounts",
            change_password_button: "Edit bank access",
            add_bank_button: "Add a new bank access",
            set_default_account: "Set as default account",
            add_operation: "Add an operation",

            emails: {
                invalid_limit: "Limit value is invalid",
                add_balance: "Add a new balance notification",
                add_transaction: "Add a new transaction notification",
                add_report: "Add a new email report",
                account: "Account",
                create: "Create",
                cancel: "Cancel",
                details: "Details",
                balance_title: "Balance alerts",
                transaction_title: "Transaction alerts",
                reports_title: "Reports",
                send_if_balance_is: "Notify me if balance is",
                send_if_transaction_is: "Notify me if a transaction's amount is",
                send_report: "Send me a report with the following frequency:",
                greater_than: "greater than",
                less_than: "less than",
                delete_alert: "Delete alert",
                delete_report: "Delete report",
                delete_alert_full_text: "This will erase this alert and you won't receive emails and notifications about it anymore. Are you sure you want to remove this alert?",
                delete_report_full_text: "This will erase this report and you won't receive emails about it anymore.  Are you sure you want to remove this alert?",
                daily: "daily",
                weekly: "weekly",
                monthly: "monthly"
            },

            default_chart_type: "Chart: default amount type",
            default_chart_period: "Chart: default period"
        },

        similarity: {
            nothing_found: "No similar transactions found.",
            title: "Duplicates",
            help: "Sometimes, importing bank transactions may lead to duplicate transactions, e.g. if the bank added information to a given transaction a few days after its effective date. This screen shows similarities between suspected transactions, and allows you to manually remove duplicates. Note: Categories may be transferred upon deletion: if you have a pair of duplicates A/B, in which A has a category but B doesn't, and you choose to delete A, then B will inherit A's category.",
            date: "Date",
            label: "Label",
            amount: "Amount",
            category: "Category",
            imported_on: "Imported on",
            merge: "Merge",
            type: "Type"
        },

        sync: {
            no_password: "This access' password isn't set. Please set it in your bank settings and retry.",
            wrong_password: 'Your password appears to be rejected by the bank website, please go to your Kresus settings and update it.',
            first_time_wrong_password: 'The password seems to be incorrect, please type it again.',
            invalid_parameters: "The format of one of your login or password might be incorrect: %{content}",
            expired_password: 'Your password has expired. Please change it on your bank website and update it in Kresus.',
            unknown_module: 'Unknown bank module. Please try updating Weboob.',
            unknown_error: "Unknown error, please report: %{content}"
        },

        type: {
            none: "None",
            unknown: "Unknown",
            transfer: "Transfer",
            order: "Order",
            check: "Check",
            deposit: "Deposit",
            payback: "Payback",
            withdrawal: "Withdrawal",
            card: "Card",
            loan_payment: "Loan payment",
            bankfee: "Bank fee",
            cash_deposit: "Cash deposit"
        },

        addoperationmodal: {
            label: "Title",
            amount: "Amount",
            category: "Category",
            cancel: "Cancel",
            submit: "Create",
            add_operation: "Create an operation for the account %{account}",
            type: "Type",
            date: "Date",
            description: "You're about to create an operation for account %{account}. Make sure your account is synced before creating it. In case you want to delete an operation which was created by mistake, please use the databrowser app."
        }
    },

    server: {}
};

},{}],147:[function(require,module,exports){
'use strict';

module.exports = {

    client: {

        KRESUS: 'KRESUS',

        accountwizard: {
            title: 'Bienvenue !',
            content: "Kresus est un gestionnaire de finances personnelles qui vous permet de mieux comprendre quelles sont vos dépenses, en calculant des statistiques intéressantes sur vos opérations bancaires. Pour commencer, veuillez remplir le formulaire ci-dessous :",
            import_title: "Import",
            import: "Si vous avez exporté votre précédente instance de Kresus, vous pouvez également l'importer de nouveau en sélectionnant le fichier JSON créé lors de l'import.",
            advanced: "Options avancées"
        },

        amount_well: {
            current_search: 'Recherche courante',
            this_month: 'Ce mois'
        },

        category: {
            none: 'Sans',
            add: 'ajouter une catégorie',
            column_category_color: 'COULEUR',
            column_category_name: 'NOM',
            column_action: 'ACTION',
            dont_replace: 'Ne pas remplacer',
            erase: "Cela va supprimer la catégorie '%{title}'. S'il y a des opérations affectées à cette catégorie, vous pouvez les réaffecter à une catégorie existante à l'aide du menu déroulant (sinon, ces opérations n'auront plus de catégorie). Êtes-vous sûr de vouloir supprimer cette catégorie ?",
            title: 'Catégories',
            label: 'Libellé'
        },

        editaccessmodal: {
            not_empty: "Le mot de passe est obligatoire !",
            customFields_not_empty: "Veuillez renseigner tous les champs personnalisés",
            title: "Changer les informations de connexion du compte",
            body: "Si votre mot de passe bancaire a changé, vous pouvez le changer ici afin que le lien de Kresus continue de fonctionner.",
            cancel: "Annuler",
            save: "Sauver"
        },

        confirmdeletemodal: {
            title: 'Demande de confirmation',
            confirm: 'Confirmer la suppression',
            dont_delete: "Ne pas supprimer"
        },

        charts: {
            Amount: 'Montant',
            balance: 'balance',
            by_category: 'par catégorie',
            differences_all: 'rentrées et sorties (tous les comptes)',
            Paid: 'Payé',
            Received: 'Reçu',
            Saved: 'Économisé',
            title: 'Graphiques',

            type: 'Type',
            all_types: 'Les deux',
            positive: 'Revenus',
            negative: 'Dépenses',

            period: 'Période',
            all_periods: 'Tout le temps',
            current_month: 'Mois courant',
            last_month: 'Mois précédent',
            three_months: 'Trois derniers mois',
            six_months: 'Six derniers mois',

            unselect_all_categories: 'Désélectionner toutes les catégories',
            select_all_categories: 'Sélectionner toutes les catégories'
        },

        general: {
            cancel: 'annuler',
            delete: 'supprimer',
            edit: 'éditer',
            save: 'sauver'
        },

        loadscreen: {
            title: "Merci de patienter pendant l'installation des dépendances de Kresus",
            prolix1: "Kresus est en train d'installer les dépendances. Cela peut prendre jusqu'à 10 minutes sur des serveurs plus lents.",
            prolix2: "Si vous êtes auto-hébergés, pensez à lire le fichier",
            prolix3: "pour vous assurer que toutes les dépendences requises sont installées sur votre machine. Si vous êtes sur l'infrastructure CozyCloud, votre machine devrait déjà être configurée.",
            prolix4: "Cette page va automatiquement se recharger dans un moment. Si vous restez bloqués dessus au bout de 10 minutes, n'hésitez pas à écrire un message sur le",
            prolix5: "Merci pour votre patience."
        },

        menu: {
            banks: 'Banques',
            categories: 'Catégories',
            charts: 'Graphiques',
            settings: 'Préférences',
            similarities: 'Doublons',
            sublists: 'Comptes',
            reports: 'Rapports'
        },

        operations: {
            amount: 'Montant :',

            column_date: 'Date',
            column_name: 'Opération',
            column_amount: 'Montant',
            column_category: 'Catégorie',
            column_type: 'Type',

            current_balance: 'Balance en cours',
            as_of: 'À la date du',
            received: 'Reçu',
            paid: 'Payé',
            saved: 'Économisé',

            attached_file: 'Télécharger le fichier associé',
            edf_details: 'Voir sa facture dans l\'application EDF',

            full_label: 'Libellé complet :',
            category: 'Catégorie :',

            last_sync: 'Dernière synchronisation avec votre banque :',
            sync_now: 'Synchroniser maintenant',
            syncing: 'Récupération de vos dernières opérations en cours…',

            title: 'Opérations',
            type: 'Type :',
            custom_label: 'Libellé personnalisé :',
            add_custom_label: 'Ajouter un libellé personnalisé'
        },

        search: {
            any_category: "N'importe quelle catégorie",
            any_type: "N'importe quel type",
            keywords: "Mots-clés :",
            category: 'Catégorie :',
            type: 'Type :',
            amount_low: 'Montant : entre',
            and: 'et',
            date_low: 'Date : entre',
            clear: 'Vider',
            clearAndClose: 'Vider & fermer',
            title: 'Recherche'
        },

        settings: {
            column_account_name: 'Nom',
            unknown_field_type: 'Type de champ incorrect',
            website: 'Site internet',
            auth_type: "Type d'autentification",
            birthday: "Date d'anniversaire",
            birthdate: "Date d'anniversaire",
            merchant_id: "Identifiant de marchant",
            birthday_placeholder: "JJMMAAAA",
            secret: "Phrase secrète",
            secret_placeholder: "Entrez votre phrase secrète ici",
            favorite_code_editor: "Editeur de code préféré",
            challengeanswer1: "Challenge Answer 1",
            question1: "Question 1",
            question2: "Question 2",
            question3: "Question 3",
            answer1: "Réponse 1",
            answer2: "Réponse 2",
            answer3: "Réponse 3",
            bank: 'Banque',
            login: 'Identifiant',
            password: 'Mot de passe',
            new_bank_form_title: 'Configurer un nouvel accès',
            duplicate_threshold: 'Seuil de doublon',
            duplicate_help: 'Deux opérations seront considérées comme étant des doublons dans la partie Doublons si celles-ci sont arrivées au cours de cette période temporelle (en heures).',

            weboob_auto_update: "Mettre à jour Weboob automatiquement",
            weboob_auto_merge_accounts: "Fusionner automatiquement les comptes Weboob",

            reinstall_weboob: 'Réinstaller Weboob',
            go_reinstall_weboob: "Lancer la réinstallation",
            reinstall_weboob_help: "Cette procédure va entièrement réinstaller Weboob. Cela peut prendre quelques minutes, durant lesquelles vous ne pourrez pas importer vos comptes et opérations. À n'utiliser qu'en dernier recours !",

            update_weboob: 'Mettre Weboob à jour',
            go_update_weboob: "Lancer la mise à jour",
            update_weboob_help: "Cette procédure va mettre à jour Weboob sans le réinstaller entièrement. Cela peut prendre quelques minutes, durant lesquelles vous ne pourrez pas importer vos comptes et opérations. À utiliser quand mettre à jour ne synchronise plus vos opérations !",

            export_instance: "Exporter l'instance",
            go_export_instance: "Exporter",
            export_instance_help: "Cela va exporter l'instance entière au format JSON, dans un format qu'une autre instance de Kresus peut par la suite ré-importer. Cela n'enregistrera pas les mots de passe de vos accès bancaires, qui devront être définis après avoir importé manuellement l'instance.",

            import_instance: "Importer une instance",
            go_import_instance: "Importer",
            import_instance_help: "Cela va importer une instance déjà existante, exportée à l'aide du bouton ci-dessus. Aucune donnée ne sera fusionnée avec les données existantes, il est donc nécessaire de vous assurer que vous n'avez pas déjà des données présentes ; si besoin est, vous pouvez supprimer des données existantes à l'aide de l'application DataBrowser.",

            title: 'Paramètres',

            tab_accounts: 'Comptes bancaires',
            tab_about: 'À propos',
            tab_backup: 'Sauvegarde et restauration',
            tab_defaults: 'Paramètres par défaut',
            tab_emails: 'Emails',
            tab_weboob: 'Gestion de Weboob',

            erase_account: "Cela va supprimer le compte '%{title}' et toutes les opérations bancaires qu'il contient. Si c'est le dernier compte lié à cette banque, le lien bancaire sera supprimé. Êtes-vous sûrs de vouloir supprimer ce compte ?",
            erase_bank: "Cela va supprimer la banque nommée '%{name}', tous les comptes et toutes les opérations liées à cette banque. Êtes-vous sûrs de vouloir supprimer cette banque et tous ses comptes liés ?",
            missing_login_or_password: "Le login et le mot de passe sont obligatoires",
            submit: 'Sauvegarder',

            delete_account_button: "Supprimer compte",
            delete_bank_button: "Supprimer banque",
            reload_accounts_button: "Mettre à jour les comptes",
            change_password_button: "Mettre à jour les informations de connexion",
            add_bank_button: "Ajouter une banque",
            set_default_account: "Définir comme compte par défaut",
            add_operation: "Ajouter une opération",

            emails: {
                invalid_limit: "La valeur de seuil est invalide",
                add_balance: "Ajouter une notification sur le solde",
                add_transaction: "Ajouter une notification sur opération",
                add_report: "Ajouter un nouveau rapport",
                account: "Compte",
                create: "Créer",
                cancel: "Annuler",
                details: "Description",
                balance_title: "Alertes sur solde",
                transaction_title: "Alertes sur opérations",
                reports_title: "Rapports",
                send_if_balance_is: "Me prévenir si le solde est",
                send_if_transaction_is: "Me prévenir si le montant d'une opération est",
                send_report: "M'envoyer un rapport à la fréquence suivante :",
                greater_than: "supérieur à",
                less_than: "inférieur à",
                delete_alert: "supprimer l'alerte",
                delete_report: "supprimer le rapport",
                delete_alert_full_text: "Cela va supprimer l'alerte et vous ne recevrez plus les emails et notifications associés. Êtes-vous sûrs de vouloir continuer ?",
                delete_report_full_text: "Cela va supprimer le rapport email et vous ne recevrez plus les emails associés. Êtes-vous sûrs de vouloir continuer ?",
                daily: "tous les jours",
                weekly: "toutes les semaines",
                monthly: "tous les mois"
            },

            default_chart_type: "Graphiques : type d'opérations par défaut",
            default_chart_period: "Graphiques : période par défaut"
        },

        similarity: {
            nothing_found: "Aucune paire d'opérations similaires n'a été trouvée.",
            title: "Doublons",
            help: "Il arrive lors de l'import des opérations bancaires que certaines d'entre elles soient importées en double, par exemple quand la banque ajoute des informations sur une opération bancaire quelques jours après que celle-ci a eu lieu. Cet écran vous montre les potentiels doublons (opérations qui ont le même montant sur une période temporelle donnée). Remarque : les catégories sont transférées lors de la suppression : si dans une paire de doublons A / B dans laquelle A a une catégorie et B n'en a pas, supprimer A réaffectera automatiquement sa catégorie à B.",
            date: "Date",
            label: "Libellé de l'opération",
            amount: "Montant",
            category: "Catégorie",
            imported_on: "Importé le",
            merge: "Fusionner",
            type: "Type"
        },

        sync: {
            no_password: "Aucun mot de passe n'est associé à ce compte, veuillez le définir dans les préférences et réessayer svp.",
            wrong_password: "Le mot de passe est incorrect, veuillez le mettre à jour dans les préférences svp.",
            first_time_wrong_password: "Le mot de passe semble incorrect, veuillez l'entrer une nouvelle fois svp.",
            invalid_parameters: "Le format de votre login ou mot de passe semble être incorrect : %{content}",
            expired_password: "Votre mot de passe a expiré. Veuillez le mettre à jour sur le site de votre banque et dans les préférences svp.",
            unknown_module: "Votre banque utilise un module non supporté par Kresus (et Weboob). Essayez de mettre à jour Weboob ou contactez un mainteneur.",
            unknown_error: "Erreur inattendue: %{content}"
        },

        type: {
            none: "Aucun",
            unknown: "Inconnu",
            transfer: "Virement",
            order: "Prélèvement",
            check: "Chèque",
            deposit: "Dépot",
            payback: "Remboursement",
            withdrawal: "Retrait",
            card: "Carte",
            loan_payment: "Remboursement d'emprunt",
            bankfee: "Frais bancaire",
            cash_deposit: "Dépôt d'éspèces"
        },

        addoperationmodal: {
            label: "Libellé de l'opération",
            amount: "Montant",
            category: "Catégorie",
            cancel: "Annuler",
            submit: "Créer",
            add_operation: "Créer une opération pour le compte ",
            type: "Type",
            date: "Date",
            description: "Vous vous apprétez à créer une opération pour le compte %{account}. Assurez-vous que votre compte est bien à jour avant de la créer. Si vous voulez supprimer une operation créée à tort, utilisez l'application databrowser."
        }
    },

    server: {}
};

},{}]},{},[31]);
