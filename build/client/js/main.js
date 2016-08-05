(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.init = init;
exports.getAccounts = getAccounts;
exports.getOperations = getOperations;
exports.deleteOperation = deleteOperation;
exports.deleteBank = deleteBank;
exports.deleteAccount = deleteAccount;
exports.createAlert = createAlert;
exports.updateAlert = updateAlert;
exports.deleteAlert = deleteAlert;
exports.deleteCategory = deleteCategory;
exports.updateOperation = updateOperation;
exports.setCategoryForOperation = setCategoryForOperation;
exports.setTypeForOperation = setTypeForOperation;
exports.setCustomLabel = setCustomLabel;
exports.mergeOperations = mergeOperations;
exports.getNewOperations = getNewOperations;
exports.createOperation = createOperation;
exports.getNewAccounts = getNewAccounts;
exports.updateWeboob = updateWeboob;
exports.importInstance = importInstance;
exports.saveSetting = saveSetting;
exports.updateAccess = updateAccess;
exports.addBank = addBank;
exports.addCategory = addCategory;
exports.updateCategory = updateCategory;

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

function init() {
    return new _promise2.default(function (accept, reject) {
        $.get('all/', accept).fail(xhrReject(reject));
    });
}

function getAccounts(bankId) {
    return new _promise2.default(function (accept, reject) {
        $.get('banks/' + bankId + '/accounts', function (data) {
            accept(data);
        }).fail(xhrReject(reject));
    });
}

function getOperations(accountId) {
    return new _promise2.default(function (accept, reject) {
        $.get('accounts/' + accountId + '/operations', accept).fail(xhrReject(reject));
    });
}

function deleteOperation(opId) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'operations/' + opId,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function deleteBank(bankId) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'banks/' + bankId,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function deleteAccount(accountId) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'accounts/' + accountId,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function createAlert(newAlert) {
    return new _promise2.default(function (accept, reject) {
        $.post('alerts/', newAlert, function (data) {
            accept(data);
        }).fail(xhrReject(reject));
    });
}

function updateAlert(alertId, attributes) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'alerts/' + alertId,
            type: 'PUT',
            data: attributes,
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function deleteAlert(alertId) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'alerts/' + alertId,
            type: 'DELETE',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function deleteCategory(categoryId, replaceByCategoryId) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'categories/' + categoryId,
            type: 'DELETE',
            data: { replaceByCategoryId: replaceByCategoryId },
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function updateOperation(id, newOp) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'operations/' + id,
            type: 'PUT',
            data: newOp,
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function setCategoryForOperation(operationId, categoryId) {
    return this.updateOperation(operationId, { categoryId: categoryId });
}

function setTypeForOperation(operationId, operationTypeID) {
    return this.updateOperation(operationId, { operationTypeID: operationTypeID });
}

function setCustomLabel(operationId, customLabel) {
    return this.updateOperation(operationId, { customLabel: customLabel });
}

function mergeOperations(toKeepId, toRemoveId) {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'operations/' + toKeepId + '/mergeWith/' + toRemoveId,
            type: 'PUT',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function getNewOperations(accessId) {
    return new _promise2.default(function (accept, reject) {
        $.get('accesses/' + accessId + '/fetch/operations', accept).fail(xhrReject(reject));
    });
}

function createOperation(operation) {
    return new _promise2.default(function (accept, reject) {
        $.post('operations/', operation, accept).fail(xhrReject(reject));
    });
}

function getNewAccounts(accessId) {
    return new _promise2.default(function (accept, reject) {
        $.get('accesses/' + accessId + '/fetch/accounts', accept).fail(xhrReject(reject));
    });
}

function updateWeboob() {
    return new _promise2.default(function (accept, reject) {
        $.ajax({
            url: 'settings/weboob/',
            type: 'PUT',
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function importInstance(content) {
    return new _promise2.default(function (accept, reject) {
        $.post('all/', { all: content }, accept).fail(xhrReject(reject));
    });
}

function saveSetting(key, value) {
    return new _promise2.default(function (accept, reject) {
        $.post('settings/', { key: key, value: value }, accept).fail(xhrReject(reject));
    });
}

function updateAccess(accessId, access) {
    return new _promise2.default(function (accept, reject) {
        if (access.customFields) access.customFields = (0, _stringify2.default)(access.customFields);
        $.ajax({
            url: 'accesses/' + accessId,
            type: 'PUT',
            data: access,
            success: accept,
            error: xhrReject(reject)
        });
    });
}

function addBank(bank, login, password, customFields) {
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
}

function addCategory(category) {
    return new _promise2.default(function (accept, reject) {
        $.post('categories/', category, accept).fail(xhrReject(reject));
    });
}

function updateCategory(id, category) {
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

},{"babel-runtime/core-js/json/stringify":66,"babel-runtime/core-js/promise":76}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _colorPicker = require('../ui/color-picker');

var _colorPicker2 = _interopRequireDefault(_colorPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CreateForm = function (_React$Component) {
    (0, _inherits3.default)(CreateForm, _React$Component);

    function CreateForm(props) {
        (0, _classCallCheck3.default)(this, CreateForm);

        (0, _helpers.has)(props, 'onSave');
        (0, _helpers.has)(props, 'onCancel');
        // Facultative: previousValue, previousColor

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CreateForm).call(this, props));

        _this.handleSave = _this.handleSave.bind(_this);
        _this.handleKeyUp = _this.handleKeyUp.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(CreateForm, [{
        key: 'selectLabel',
        value: function selectLabel() {
            this.refs.label.getDOMNode().select();
        }
    }, {
        key: 'clearLabel',
        value: function clearLabel() {
            this.refs.label.getDOMNode().value = '';
        }
    }, {
        key: 'handleSave',
        value: function handleSave(e) {
            var label = this.refs.label.getDOMNode().value.trim();
            var color = this.refs.color.getValue();
            if (!label || !color) return false;
            return this.props.onSave(e, label, color);
        }
    }, {
        key: 'handleKeyUp',
        value: function handleKeyUp(e) {
            if (e.key === 'Enter') {
                return this.handleSave(e);
            }
            return true;
        }
    }, {
        key: 'render',
        value: function render() {
            var previousColor = this.props.previousColor;
            var previousValue = this.props.previousValue || '';
            return React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    null,
                    React.createElement(_colorPicker2.default, { defaultValue: previousColor, ref: 'color' })
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement('input', { type: 'text', className: 'form-control',
                        placeholder: (0, _helpers.translate)('client.category.label'),
                        defaultValue: previousValue, onKeyUp: this.handleKeyUp,
                        ref: 'label'
                    })
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(
                        'div',
                        { className: 'btn-group btn-group-justified', role: 'group' },
                        React.createElement(
                            'a',
                            {
                                className: 'btn btn-success',
                                role: 'button',
                                onClick: this.handleSave },
                            (0, _helpers.translate)('client.general.save')
                        ),
                        React.createElement(
                            'a',
                            {
                                className: 'btn btn-danger',
                                role: 'button',
                                onClick: this.props.onCancel },
                            (0, _helpers.translate)('client.general.cancel')
                        )
                    )
                )
            );
        }
    }]);
    return CreateForm;
}(React.Component);

exports.default = CreateForm;

},{"../../helpers":59,"../ui/color-picker":51,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

var _createForm = require('./create-form');

var _createForm2 = _interopRequireDefault(_createForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CategoryList = function (_React$Component) {
    (0, _inherits3.default)(CategoryList, _React$Component);

    function CategoryList(props) {
        (0, _classCallCheck3.default)(this, CategoryList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CategoryList).call(this, props));

        _this.state = {
            showForm: false,
            categories: _store.store.getCategories()
        };

        _this.listener = _this.listener.bind(_this);
        _this.handleSave = _this.handleSave.bind(_this);
        _this.handleShowForm = _this.handleShowForm.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(CategoryList, [{
        key: 'listener',
        value: function listener() {
            this.setState({
                categories: _store.store.getCategories()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.categories, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.categories, this.listener);
        }
    }, {
        key: 'handleShowForm',
        value: function handleShowForm(e) {
            e.preventDefault();
            this.setState({
                showForm: !this.state.showForm
            }, function () {
                // then
                if (this.state.showForm) this.refs.createform.selectLabel();
            });
        }
    }, {
        key: 'handleSave',
        value: function handleSave(e, title, color) {
            e.preventDefault();

            var category = {
                title: title,
                color: color
            };

            _store.Actions.createCategory(category);

            this.refs.createform.clearLabel();
            this.setState({
                showForm: false
            });
            return false;
        }
    }, {
        key: 'render',
        value: function render() {
            var items = this.state.categories.filter(function (cat) {
                return cat.id !== _helpers.NONE_CATEGORY_ID;
            }).map(function (cat) {
                return React.createElement(_item2.default, { cat: cat, key: cat.id });
            });

            var maybeForm = this.state.showForm ? React.createElement(_createForm2.default, {
                ref: 'createform',
                onSave: this.handleSave,
                onCancel: this.handleShowForm
            }) : React.createElement('tr', null);

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
                            { className: 'btn btn-primary text-uppercase pull-right',
                                href: '#', onClick: this.handleShowForm },
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

},{"../../helpers":59,"../../store":62,"./create-form":2,"./item":4,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _createForm = require('./create-form');

var _createForm2 = _interopRequireDefault(_createForm);

var _confirmDeleteModal = require('../ui/confirm-delete-modal');

var _confirmDeleteModal2 = _interopRequireDefault(_confirmDeleteModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CategoryListItem = function (_React$Component) {
    (0, _inherits3.default)(CategoryListItem, _React$Component);

    function CategoryListItem(props) {
        (0, _classCallCheck3.default)(this, CategoryListItem);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CategoryListItem).call(this, props));

        _this.state = {
            editMode: false
        };

        _this.handleSave = _this.handleSave.bind(_this);
        _this.handleCancel = _this.handleCancel.bind(_this);
        _this.handleShowEdit = _this.handleShowEdit.bind(_this);
        _this.handleDelete = _this.handleDelete.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(CategoryListItem, [{
        key: 'handleSave',
        value: function handleSave(e, title, color) {
            var category = {
                title: title,
                color: color
            };

            _store.Actions.updateCategory(this.props.cat, category);

            this.setState({
                editMode: false
            });
            e.preventDefault();
        }
    }, {
        key: 'handleCancel',
        value: function handleCancel(e) {
            this.setState({
                editMode: false
            });
            e.preventDefault();
        }
    }, {
        key: 'handleShowEdit',
        value: function handleShowEdit(e) {
            this.setState({
                editMode: true
            }, function () {
                // then
                this.refs.createform.selectLabel();
            });
            e.preventDefault();
        }
    }, {
        key: 'handleDelete',
        value: function handleDelete() {
            var replaceCategory = this.refs.replacement.getDOMNode().value;
            _store.Actions.deleteCategory(this.props.cat, replaceCategory);
        }
    }, {
        key: 'render',
        value: function render() {
            var c = this.props.cat;

            if (this.state.editMode) {
                return React.createElement(_createForm2.default, {
                    ref: 'createform',
                    onSave: this.handleSave,
                    onCancel: this.handleCancel,
                    previousColor: c.color,
                    previousValue: c.title
                });
            }

            var replacementOptions = _store.store.getCategories().filter(function (cat) {
                return cat.id !== c.id && cat.id !== _helpers.NONE_CATEGORY_ID;
            }).map(function (cat) {
                return React.createElement(
                    'option',
                    {
                        key: cat.id,
                        value: cat.id },
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
                        {
                            style: { backgroundColor: c.color },
                            className: 'color_block' },
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
                            {
                                className: 'btn btn-primary',
                                role: 'button',
                                onClick: this.handleShowEdit },
                            (0, _helpers.translate)('client.general.edit')
                        ),
                        React.createElement(
                            'a',
                            { className: 'btn btn-danger', role: 'button', 'data-toggle': 'modal',
                                'data-target': '#confirmDeleteCategory' + c.id },
                            (0, _helpers.translate)('client.general.delete')
                        )
                    ),
                    React.createElement(_confirmDeleteModal2.default, {
                        modalId: 'confirmDeleteCategory' + c.id,
                        modalBody: modalBody,
                        onDelete: this.handleDelete
                    })
                )
            );
        }
    }]);
    return CategoryListItem;
}(React.Component);

exports.default = CategoryListItem;

},{"../../helpers":59,"../../store":62,"../ui/confirm-delete-modal":52,"./create-form":2,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ChartComponent = function (_React$Component) {
    (0, _inherits3.default)(ChartComponent, _React$Component);

    function ChartComponent() {
        (0, _classCallCheck3.default)(this, ChartComponent);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ChartComponent).apply(this, arguments));
    }

    (0, _createClass3.default)(ChartComponent, [{
        key: 'redraw',
        value: function redraw() {
            alert('not yet implemented');
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.redraw();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.redraw();
        }
    }]);
    return ChartComponent;
}(React.Component);

exports.default = ChartComponent;

},{"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.createBarChartAll = createBarChartAll;
exports.createPieChartAll = createPieChartAll;
exports.createChartBalance = createChartBalance;
exports.createChartPositiveNegative = createChartPositiveNegative;

var _store = require('../../store');

var _helpers = require('../../helpers');

var _chartBase = require('./chart-base');

var _chartBase2 = _interopRequireDefault(_chartBase);

var _operationsByCategoryChart = require('./operations-by-category-chart');

var _operationsByCategoryChart2 = _interopRequireDefault(_operationsByCategoryChart);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals c3: false, Dygraph: false */
function round2(x) {
    return Math.round(x * 100) / 100;
}

// Charts
function createBarChartAll(operations, barchartId) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    // Category -> {Month -> [Amounts]}
    var map = new _map2.default();

    // Category -> color
    var colorMap = {};

    // Datekey -> Date
    var dateset = new _map2.default();
    for (var i = 0, size = operations.length; i < size; i++) {
        var op = operations[i];
        var c = _store.store.getCategoryFromId(op.categoryId);

        map.set(c.title, map.get(c.title) || {});
        var categoryDates = map.get(c.title);

        var dk = datekey(op);
        (categoryDates[dk] = categoryDates[dk] || []).push(op.amount);
        dateset.set(dk, +op.date);

        colorMap[c.title] = colorMap[c.title] || c.color;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = (0, _from2.default)(dateset);
    dates.sort(function (a, b) {
        return a[1] - b[1];
    });

    var series = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = (0, _getIterator3.default)(map.keys()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _c = _step.value;

            var data = [];

            for (var j = 0; j < dates.length; j++) {
                var _dk = dates[j][0];
                var values = map.get(_c)[_dk] = map.get(_c)[_dk] || [];
                data.push(round2(values.reduce(function (a, b) {
                    return a + b;
                }, 0)));
            }

            data = [_c].concat(data);
            series.push(data);
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

    var categories = [];
    for (var _i = 0; _i < dates.length; _i++) {
        var date = new Date(dates[_i][1]);
        // Undefined means the default locale
        var defaultLocale = void 0;
        var str = date.toLocaleDateString(defaultLocale, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    var yAxisLegend = (0, _helpers.translate)('client.charts.amount');

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

function createPieChartAll(operations, chartId) {

    var catMap = new _map2.default();
    // categoryId -> [val1, val2, val3]
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = (0, _getIterator3.default)(operations), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var op = _step2.value;

            var catId = op.categoryId;
            var arr = catMap.has(catId) ? catMap.get(catId) : [];
            arr.push(op.amount);
            catMap.set(catId, arr);
        }

        // [ [categoryName, val1, val2], [anotherCategoryName, val3, val4] ]
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

    var series = [];
    // {label -> color}
    var colorMap = {};
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = (0, _getIterator3.default)(catMap), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _step3$value = (0, _slicedToArray3.default)(_step3.value, 2);

            var _catId = _step3$value[0];
            var valueArr = _step3$value[1];

            var c = _store.store.getCategoryFromId(_catId);
            series.push([c.title].concat(valueArr));
            colorMap[c.title] = c.color;
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

    return c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'pie',
            colors: colorMap
        },

        tooltip: {
            format: {
                value: function value(_value, ratio) {
                    return round2(ratio * 100) + '% (' + Math.abs(round2(_value)) + ')';
                }
            }
        }

    });
}

function createChartBalance(chartId, account, operations) {

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
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = (0, _getIterator3.default)(ops), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var o = _step4.value;

            var key = makeKey(o.date);
            opmap.set(key, opmap.get(key) + o.amount);
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

    var balance = account.initialAmount;
    var csv = 'Date,Balance\n';
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
        for (var _iterator5 = (0, _getIterator3.default)(opmap), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var _step5$value = (0, _slicedToArray3.default)(_step5.value, 2);

            var date = _step5$value[0];
            var amount = _step5$value[1];

            balance += amount;
            csv += date + ',' + round2(balance) + '\n';
        }

        /* eslint-disable no-new */

        // Create the chart
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

    new Dygraph(document.querySelector(chartId), csv);

    /* eslint-enable no-new */
}

function createChartPositiveNegative(chartId, operations) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + ' - ' + d.getMonth();
    }

    var POS = 0,
        NEG = 1,
        BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    var map = new _map2.default();
    // Datekey -> Date
    var dateset = new _map2.default();
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var dk = datekey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        var triplet = map.get(dk);
        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +op.date);
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = (0, _from2.default)(dateset);
    dates.sort(function (a, b) {
        return a[1] - b[1];
    });

    var series = [];
    function addSerie(name, mapIndex) {
        var data = [];
        for (var j = 0; j < dates.length; j++) {
            var _dk2 = dates[j][0];
            data.push(round2(map.get(_dk2)[mapIndex]));
        }
        var serie = [name].concat(data);
        series.push(serie);
    }

    addSerie((0, _helpers.translate)('client.charts.received'), POS);
    addSerie((0, _helpers.translate)('client.charts.spent'), NEG);
    addSerie((0, _helpers.translate)('client.charts.saved'), BAL);

    var categories = [];
    for (var _i2 = 0; _i2 < dates.length; _i2++) {
        var date = new Date(dates[_i2][1]);
        // Undefined means the default locale
        var defaultLocale = void 0;
        var str = date.toLocaleDateString(defaultLocale, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    var yAxisLegend = (0, _helpers.translate)('client.charts.amount');

    c3.generate({

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

var BalanceChart = function (_ChartComponent) {
    (0, _inherits3.default)(BalanceChart, _ChartComponent);

    function BalanceChart() {
        (0, _classCallCheck3.default)(this, BalanceChart);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BalanceChart).apply(this, arguments));
    }

    (0, _createClass3.default)(BalanceChart, [{
        key: 'redraw',
        value: function redraw() {
            createChartBalance('#barchart', this.props.account, this.props.operations);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('div', { id: 'barchart', style: { width: '100%' } });
        }
    }]);
    return BalanceChart;
}(_chartBase2.default);

var InOutChart = function (_ChartComponent2) {
    (0, _inherits3.default)(InOutChart, _ChartComponent2);

    function InOutChart() {
        (0, _classCallCheck3.default)(this, InOutChart);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(InOutChart).apply(this, arguments));
    }

    (0, _createClass3.default)(InOutChart, [{
        key: 'redraw',
        value: function redraw() {
            createChartPositiveNegative('#barchart', this.props.operations);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('div', { id: 'barchart', style: { width: '100%' } });
        }
    }]);
    return InOutChart;
}(_chartBase2.default);

// Components


var ChartsComponent = function (_React$Component) {
    (0, _inherits3.default)(ChartsComponent, _React$Component);

    function ChartsComponent(props) {
        (0, _classCallCheck3.default)(this, ChartsComponent);

        var _this3 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ChartsComponent).call(this, props));

        _this3.state = {
            account: _store.store.getCurrentAccount(),
            operations: _store.store.getCurrentOperations(),
            categories: _store.store.getCategories(),
            kind: 'all'
        };

        _this3.reload = _this3._reload.bind(_this3);
        return _this3;
    }

    (0, _createClass3.default)(ChartsComponent, [{
        key: '_reload',
        value: function _reload() {
            (0, _helpers.debug)('charts component reload');
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

            _store.store.on(_store.State.operations, this.reload);
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
            this.setState({ kind: kind });
        }
    }, {
        key: 'onClick',
        value: function onClick(kind) {
            var _this4 = this;

            return function () {
                return _this4.changeKind(kind);
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var chartComponent = '';
            switch (this.state.kind) {
                case 'all':
                    {
                        chartComponent = React.createElement(_operationsByCategoryChart2.default, {
                            operations: this.state.operations
                        });
                        break;
                    }
                case 'balance':
                    {
                        chartComponent = React.createElement(BalanceChart, {
                            operations: this.state.operations,
                            account: this.state.account
                        });
                        break;
                    }
                case 'pos-neg':
                    {
                        // Flatten operations
                        var accounts = _store.store.getCurrentBankAccounts();
                        var ops = [];
                        var _iteratorNormalCompletion6 = true;
                        var _didIteratorError6 = false;
                        var _iteratorError6 = undefined;

                        try {
                            for (var _iterator6 = (0, _getIterator3.default)(accounts), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                var acc = _step6.value;

                                ops = ops.concat(acc.operations);
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

                        chartComponent = React.createElement(InOutChart, { operations: ops });
                        break;
                    }
                default:
                    (0, _helpers.assert)(false, 'unexpected chart kind');
            }

            var isActive = function isActive(which) {
                return which === this.state.kind ? 'active' : '';
            };
            isActive = isActive.bind(this);

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
                            { role: 'presentation', className: isActive('all') },
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.onClick('all') },
                                (0, _helpers.translate)('client.charts.by_category')
                            )
                        ),
                        React.createElement(
                            'li',
                            { role: 'presentation', className: isActive('balance') },
                            React.createElement(
                                'a',
                                { href: '#', onClick: this.onClick('balance') },
                                (0, _helpers.translate)('client.charts.balance')
                            )
                        ),
                        React.createElement(
                            'li',
                            { role: 'presentation', className: isActive('pos-neg') },
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

exports.default = ChartsComponent;

},{"../../helpers":59,"../../store":62,"./chart-base":5,"./operations-by-category-chart":7,"babel-runtime/core-js/array/from":63,"babel-runtime/core-js/get-iterator":64,"babel-runtime/core-js/map":67,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82,"babel-runtime/helpers/slicedToArray":83}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _models = require('../../models');

var _operationsByCategoryPeriodSelect = require('../shared/operations-by-category-period-select');

var _operationsByCategoryPeriodSelect2 = _interopRequireDefault(_operationsByCategoryPeriodSelect);

var _operationsByCategoryTypeSelect = require('../shared/operations-by-category-type-select');

var _operationsByCategoryTypeSelect2 = _interopRequireDefault(_operationsByCategoryTypeSelect);

var _ = require('./');

var _chartBase = require('./chart-base');

var _chartBase2 = _interopRequireDefault(_chartBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OpCatChart = function (_ChartComponent) {
    (0, _inherits3.default)(OpCatChart, _ChartComponent);

    function OpCatChart(props) {
        (0, _classCallCheck3.default)(this, OpCatChart);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OpCatChart).call(this, props));

        _this.handleRedraw = _this.redraw.bind(_this);
        _this.handleHideAll = _this.handleHideAll.bind(_this);
        _this.handleShowAll = _this.handleShowAll.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(OpCatChart, [{
        key: 'createPeriodFilter',
        value: function createPeriodFilter(option) {

            var date = new Date();
            var year = date.getFullYear();
            // Careful: January is month 0
            var month = date.getMonth();
            var previous = void 0;

            switch (option) {
                case 'all':
                    return function () {
                        return true;
                    };

                case 'current-month':
                    return function (d) {
                        return d.getMonth() === month && d.getFullYear() === year;
                    };

                case 'last-month':
                    previous = month > 0 ? month - 1 : 11;
                    year = month > 0 ? year : year - 1;
                    return function (d) {
                        return d.getMonth() === previous && d.getFullYear() === year;
                    };

                case '3-months':
                    if (month >= 3) {
                        previous = month - 3;
                        return function (d) {
                            return d.getMonth() >= previous && d.getFullYear() === year;
                        };
                    }
                    previous = (month + 9) % 12;
                    return function (d) {
                        return d.getMonth() >= previous && d.getFullYear() === year - 1 || d.getMonth() <= month && d.getFullYear() === year;
                    };

                case '6-months':
                    if (month >= 6) {
                        previous = month - 6;
                        return function (d) {
                            return d.getMonth() >= previous && d.getFullYear() === year;
                        };
                    }
                    previous = (month + 6) % 12;
                    return function (d) {
                        return d.getMonth() >= previous && d.getFullYear() === year - 1 || d.getMonth() <= month && d.getFullYear() === year;
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

            // Invert values on the negative chart.
            if (kind === 'negative') {
                ops = ops.map(function (op) {
                    var ret = new _models.Operation(op, '');
                    ret.amount = -ret.amount;
                    return ret;
                });
            }

            // Print charts
            this.barchart = (0, _.createBarChartAll)(ops, '#barchart');
            if (kind !== 'all') {
                this.piechart = (0, _.createPieChartAll)(ops, '#piechart');
            } else {
                document.querySelector('#piechart').innerHTML = '';
                this.piechart = null;
            }
        }
    }, {
        key: 'handleShowAll',
        value: function handleShowAll() {
            if (this.barchart) this.barchart.show();
            if (this.piechart) this.piechart.show();
        }
    }, {
        key: 'handleHideAll',
        value: function handleHideAll() {
            if (this.barchart) this.barchart.hide();
            if (this.piechart) this.piechart.hide();
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
                            React.createElement(_operationsByCategoryTypeSelect2.default, {
                                defaultValue: defaultType,
                                onChange: this.handleRedraw,
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
                            React.createElement(_operationsByCategoryPeriodSelect2.default, {
                                defaultValue: defaultPeriod,
                                onChange: this.handleRedraw,
                                htmlId: 'period',
                                ref: 'period'
                            })
                        ),
                        React.createElement(
                            'div',
                            { className: 'form-horizontal' },
                            React.createElement(
                                'div',
                                { className: 'btn-group',
                                    role: 'group', 'aria-label': 'Show/Hide categories' },
                                React.createElement(
                                    'button',
                                    { type: 'button', className: 'btn btn-primary',
                                        onClick: this.handleHideAll },
                                    (0, _helpers.translate)('client.charts.unselect_all_categories')
                                ),
                                React.createElement(
                                    'button',
                                    { type: 'button', className: 'btn btn-primary',
                                        onClick: this.handleShowAll },
                                    (0, _helpers.translate)('client.charts.select_all_categories')
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
}(_chartBase2.default);

exports.default = OpCatChart;

},{"../../helpers":59,"../../models":61,"../../store":62,"../shared/operations-by-category-period-select":42,"../shared/operations-by-category-type-select":43,"./":6,"./chart-base":5,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _item = require('./item');

var _item2 = _interopRequireDefault(_item);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function debug(text) {
    return (0, _helpers.debug)('Similarity Component - ' + text);
}

// Algorithm

function findRedundantPairs(operations, duplicateThreshold) {
    var before = Date.now();
    debug('Running findRedundantPairs algorithm...');
    debug('Input: ' + operations.length + ' operations');
    var similar = [];

    // duplicateThreshold is in hours
    var threshold = duplicateThreshold * 60 * 60 * 1000;
    debug('Threshold: ' + threshold);

    // O(n log n)
    var sorted = operations.slice().sort(function (a, b) {
        return a.amount - b.amount;
    });
    for (var i = 0; i < operations.length; ++i) {
        var op = sorted[i];
        var j = i + 1;
        while (j < operations.length) {
            var next = sorted[j];
            if (next.amount !== op.amount) break;
            var datediff = Math.abs(+op.date - +next.date);
            // Two operations are duplicates if they were not imported at the same date.
            if (datediff <= threshold && +op.dateImport !== +next.dateImport) {
                // Two operations with the same known type can be considered as duplicates.
                var unknownOperationTypeId = _store.store.getUnknownOperationType().id;
                if (op.operationTypeID === unknownOperationTypeId || next.operationTypeID === unknownOperationTypeId || op.operationTypeID === next.operationTypeID) {
                    similar.push([op, next]);
                }
            }
            j += 1;
        }
    }

    debug(similar.length + ' pairs of similar operations found');
    debug('findRedundantPairs took ' + (Date.now() - before) + 'ms.');
    // The duplicates are sorted from last imported to first imported
    similar.sort(function (a, b) {
        return Math.max(b[0].dateImport, b[1].dateImport) - Math.max(a[0].dateImport, a[1].dateImport);
    });
    return similar;
}

var Similarity = function (_React$Component) {
    (0, _inherits3.default)(Similarity, _React$Component);

    function Similarity(props) {
        (0, _classCallCheck3.default)(this, Similarity);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Similarity).call(this, props));

        _this.state = {
            pairs: findRedundantPairs(_store.store.getCurrentOperations(), _store.store.getSetting('duplicateThreshold'))
        };
        _this.listener = _this.listener.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Similarity, [{
        key: 'listener',
        value: function listener() {
            this.setState({
                pairs: findRedundantPairs(_store.store.getCurrentOperations(), _store.store.getSetting('duplicateThreshold'))
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.banks, this.listener);
            _store.store.on(_store.State.accounts, this.listener);
            _store.store.on(_store.State.operations, this.listener);
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

            var formatCurrency = _store.store.getCurrentAccount().formatCurrency;

            var sim = void 0;
            if (pairs.length === 0) {
                sim = React.createElement(
                    'div',
                    null,
                    (0, _helpers.translate)('client.similarity.nothing_found')
                );
            } else {
                sim = pairs.map(function (p) {
                    var key = p[0].id.toString() + p[1].id.toString();
                    return React.createElement(_item2.default, { key: key, a: p[0], b: p[1],
                        formatCurrency: formatCurrency
                    });
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

},{"../../helpers":59,"../../store":62,"./item":9,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Pair = function (_React$Component) {
    (0, _inherits3.default)(Pair, _React$Component);

    function Pair(props) {
        (0, _classCallCheck3.default)(this, Pair);

        (0, _helpers.has)(props, 'formatCurrency');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Pair).call(this, props));

        _this.handleMerge = _this.handleMerge.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Pair, [{
        key: 'handleMerge',
        value: function handleMerge(e) {

            var older = void 0,
                younger = void 0;
            if (+this.props.a.dateImport < +this.props.b.dateImport) {
                older = this.props.a;
                younger = this.props.b;
            } else {
                older = this.props.b;
                younger = this.props.a;
            }

            _store.Actions.mergeOperations(younger, older);
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
                            (0, _helpers.translate)('client.similarity.date')
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-3' },
                            (0, _helpers.translate)('client.similarity.label')
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-1' },
                            (0, _helpers.translate)('client.similarity.amount')
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-2' },
                            (0, _helpers.translate)('client.similarity.category')
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-1' },
                            (0, _helpers.translate)('client.similarity.type')
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-2' },
                            (0, _helpers.translate)('client.similarity.imported_on')
                        ),
                        React.createElement(
                            'th',
                            { className: 'col-xs-1' },
                            (0, _helpers.translate)('client.similarity.merge')
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
                            this.props.formatCurrency(this.props.a.amount)
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
                                { className: 'btn btn-primary', onClick: this.handleMerge },
                                React.createElement('span', { className: 'glyphicon glyphicon-resize-small',
                                    'aria-hidden': 'true'
                                })
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
                            this.props.formatCurrency(this.props.b.amount)
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
    return Pair;
}(React.Component);

exports.default = Pair;

},{"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _addBankForm = require('../shared/add-bank-form');

var _addBankForm2 = _interopRequireDefault(_addBankForm);

var _importModule = require('../shared/import-module');

var _importModule2 = _interopRequireDefault(_importModule);

var _weboobParameters = require('../shared/weboob-parameters');

var _weboobParameters2 = _interopRequireDefault(_weboobParameters);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccountWizard = function (_React$Component) {
    (0, _inherits3.default)(AccountWizard, _React$Component);

    function AccountWizard() {
        (0, _classCallCheck3.default)(this, AccountWizard);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountWizard).apply(this, arguments));
    }

    (0, _createClass3.default)(AccountWizard, [{
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
                            React.createElement(_addBankForm2.default, { expanded: true })
                        ),
                        React.createElement(
                            'div',
                            { className: 'tab-pane', id: 'import' },
                            React.createElement(
                                'p',
                                null,
                                (0, _helpers.translate)('client.accountwizard.import')
                            ),
                            React.createElement(_importModule2.default, null)
                        ),
                        React.createElement(
                            'div',
                            { className: 'tab-pane', id: 'advanced' },
                            React.createElement(_weboobParameters2.default, null)
                        )
                    )
                )
            );
        }
    }]);
    return AccountWizard;
}(React.Component);

exports.default = AccountWizard;

},{"../../helpers":59,"../shared/add-bank-form":39,"../shared/import-module":41,"../shared/weboob-parameters":45,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WeboobInstallReadme = function (_React$Component) {
    (0, _inherits3.default)(WeboobInstallReadme, _React$Component);

    function WeboobInstallReadme() {
        (0, _classCallCheck3.default)(this, WeboobInstallReadme);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(WeboobInstallReadme).apply(this, arguments));
    }

    (0, _createClass3.default)(WeboobInstallReadme, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'h1',
                    null,
                    (0, _helpers.translate)('client.weboobinstallreadme.title')
                ),
                React.createElement(
                    'div',
                    { className: 'well' },
                    (0, _helpers.translate)('client.weboobinstallreadme.content'),
                    React.createElement(
                        'a',
                        { href: 'https://github.com/bnjbvr/kresus/blob/incoming/README.md' },
                        'README'
                    ),
                    '.'
                )
            );
        }
    }]);
    return WeboobInstallReadme;
}(React.Component);

exports.default = WeboobInstallReadme;

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Props: account: Account
var AccountListItem = function (_React$Component) {
    (0, _inherits3.default)(AccountListItem, _React$Component);

    function AccountListItem(props) {
        (0, _classCallCheck3.default)(this, AccountListItem);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountListItem).call(this, props));

        _this.handleClick = _this.handleClick.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(AccountListItem, [{
        key: 'handleClick',
        value: function handleClick() {
            _store.Actions.selectAccount(this.props.account);
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
            var maybeActive = this.props.active ? 'active' : '';
            var formatCurrency = this.props.account.formatCurrency;
            return React.createElement(
                'li',
                { className: maybeActive },
                React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.handleClick },
                        this.props.account.title
                    ),
                    React.createElement(
                        'span',
                        null,
                        ' ',
                        formatCurrency(this.computeTotal(this.props.account.operations))
                    )
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

        (0, _helpers.has)(props, 'handleClick');
        return _this2;
    }

    (0, _createClass3.default)(AccountActiveItem, [{
        key: 'render',
        value: function render() {
            var total = (0, _get3.default)((0, _getPrototypeOf2.default)(AccountActiveItem.prototype), 'computeTotal', this).call(this, this.props.account.operations);
            var color = total >= 0 ? 'positive' : 'negative';
            var formatCurrency = this.props.account.formatCurrency;

            return React.createElement(
                'div',
                { className: 'account-details' },
                React.createElement(
                    'div',
                    { className: 'account-name' },
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.props.handleClick },
                        this.props.account.title,
                        React.createElement(
                            'span',
                            { className: 'amount' },
                            React.createElement(
                                'span',
                                { className: color },
                                formatCurrency(total)
                            )
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
            accounts: _store.store.getCurrentBankAccounts(),
            active: _store.store.getCurrentAccountId(),
            showDropdown: false
        };
        _this3.listener = _this3.listener.bind(_this3);
        _this3.toggleDropdown = _this3.toggleDropdown.bind(_this3);
        return _this3;
    }

    (0, _createClass3.default)(AccountListComponent, [{
        key: 'toggleDropdown',
        value: function toggleDropdown(e) {
            this.setState({ showDropdown: !this.state.showDropdown });
            e.preventDefault();
        }
    }, {
        key: 'listener',
        value: function listener() {
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
            _store.store.on(_store.State.accounts, this.listener);
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

            var active = this.state.accounts.filter(function (account) {
                return _this4.state.active === account.id;
            }).map(function (account) {
                return React.createElement(AccountActiveItem, {
                    key: account.id,
                    account: account,
                    handleClick: _this4.toggleDropdown
                });
            });

            var accounts = this.state.accounts.map(function (account) {
                var isActive = _this4.state.active === account.id;
                return React.createElement(AccountListItem, { key: account.id, account: account, active: isActive });
            });

            var menu = this.state.showDropdown ? '' : 'dropdown-menu';
            var dropdown = this.state.showDropdown ? 'dropup' : 'dropdown';

            return React.createElement(
                'div',
                { className: 'accounts sidebar-list ' + dropdown + ' ' },
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

},{"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/get":80,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BankActiveItemComponent = function (_React$Component) {
    (0, _inherits3.default)(BankActiveItemComponent, _React$Component);

    function BankActiveItemComponent(props) {
        (0, _classCallCheck3.default)(this, BankActiveItemComponent);

        (0, _helpers.has)(props, 'bank');
        (0, _helpers.has)(props, 'handleClick');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankActiveItemComponent).call(this, props));
    }

    (0, _createClass3.default)(BankActiveItemComponent, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'bank-details' },
                React.createElement('div', { className: 'icon icon-' + this.props.bank.uuid }),
                React.createElement(
                    'div',
                    { className: 'bank-name' },
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.props.handleClick },
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

        (0, _helpers.has)(props, 'bank');
        (0, _helpers.has)(props, 'active');

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankListItemComponent).call(this, props));

        _this2.handleClick = _this2.handleClick.bind(_this2);
        return _this2;
    }

    (0, _createClass3.default)(BankListItemComponent, [{
        key: 'handleClick',
        value: function handleClick() {
            _store.Actions.selectBank(this.props.bank);
        }
    }, {
        key: 'render',
        value: function render() {
            var maybeActive = this.props.active ? 'active' : '';
            return React.createElement(
                'li',
                { className: maybeActive },
                React.createElement(
                    'span',
                    null,
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.handleClick },
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
            banks: _store.store.getBanks(),
            active: _store.store.getCurrentBankId(),
            showDropdown: false
        };
        _this3.listener = _this3.listener.bind(_this3);
        _this3.toggleDropdown = _this3.toggleDropdown.bind(_this3);
        return _this3;
    }

    (0, _createClass3.default)(BankListComponent, [{
        key: 'toggleDropdown',
        value: function toggleDropdown(e) {
            this.setState({ showDropdown: !this.state.showDropdown });
            e.preventDefault();
        }
    }, {
        key: 'listener',
        value: function listener() {
            this.setState({
                active: _store.store.getCurrentBankId(),
                banks: _store.store.getBanks()
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.banks, this.listener);
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
                return _this4.state.active === bank.id;
            }).map(function (bank) {
                return React.createElement(BankActiveItemComponent, {
                    key: bank.id,
                    bank: bank,
                    handleClick: _this4.toggleDropdown
                });
            });

            var banks = this.state.banks.map(function (bank) {
                var isActive = _this4.state.active === bank.id;
                return React.createElement(BankListItemComponent, { key: bank.id, bank: bank, active: isActive });
            });

            var menu = this.state.showDropdown ? '' : 'dropdown-menu';
            var dropdown = this.state.showDropdown ? 'dropup' : 'dropdown';

            return React.createElement(
                'div',
                { className: 'banks sidebar-list ' + dropdown },
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

},{"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FilteredAmountWell = exports.AmountWell = undefined;

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

var _helpers = require("../../helpers");

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
                        this.props.formatCurrency(this.getTotal())
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
                        this.props.formatCurrency(this.getTotal())
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

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/get":80,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _confirmDeleteModal = require('../ui/confirm-delete-modal');

var _confirmDeleteModal2 = _interopRequireDefault(_confirmDeleteModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DeleteOperation = function (_React$Component) {
    (0, _inherits3.default)(DeleteOperation, _React$Component);

    function DeleteOperation(props) {
        (0, _classCallCheck3.default)(this, DeleteOperation);

        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'formatCurrency');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DeleteOperation).call(this, props));

        _this.handleDeleteOperation = _this.handleDeleteOperation.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(DeleteOperation, [{
        key: 'handleDeleteOperation',
        value: function handleDeleteOperation() {
            _store.Actions.deleteOperation(this.props.operation);
        }
    }, {
        key: 'render',
        value: function render() {
            var op = this.props.operation;

            var label = '"' + (op.customLabel ? op.customLabel : op.title) + '"';

            var amount = this.props.formatCurrency(op.amount);
            var date = op.date.toLocaleDateString();
            var modalBody = React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    null,
                    (0, _helpers.translate)('client.operations.warning_delete')
                ),
                React.createElement(
                    'div',
                    null,
                    (0, _helpers.translate)('client.operations.are_you_sure', { label: label, amount: amount, date: date })
                )
            );

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { className: 'btn btn-danger',
                        'data-toggle': 'modal',
                        'data-target': '#delete' + op.id },
                    React.createElement('span', { className: 'fa fa-trash' }),
                    ' ',
                    (0, _helpers.translate)('client.operations.delete_operation_button')
                ),
                React.createElement(_confirmDeleteModal2.default, {
                    modalId: 'delete' + op.id,
                    modalBody: modalBody,
                    onDelete: this.handleDeleteOperation
                })
            );
        }
    }]);
    return DeleteOperation;
}(React.Component);

exports.default = DeleteOperation;

},{"../../helpers":59,"../../store":62,"../ui/confirm-delete-modal":52,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

exports.computeAttachmentLink = computeAttachmentLink;

var _helpers = require('../../helpers');

var _store = require('../../store');

var _label = require('./label');

var _deleteOperation = require('./delete-operation');

var _deleteOperation2 = _interopRequireDefault(_deleteOperation);

var _operationTypeSelect = require('../ui/operation-type-select');

var _operationTypeSelect2 = _interopRequireDefault(_operationTypeSelect);

var _categorySelect = require('../ui/category-select');

var _categorySelect2 = _interopRequireDefault(_categorySelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function computeAttachmentLink(op) {
    var file = op.binary.fileName || 'file';
    return 'operations/' + op.id + '/' + file;
}

var OperationDetails = function (_React$Component) {
    (0, _inherits3.default)(OperationDetails, _React$Component);

    function OperationDetails(props) {
        (0, _classCallCheck3.default)(this, OperationDetails);

        (0, _helpers.has)(props, 'onToggleDetails');
        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'rowClassName');
        (0, _helpers.has)(props, 'formatCurrency');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationDetails).call(this, props));

        _this.handleSelectType = _this.handleSelectType.bind(_this);
        _this.handleSelectCategory = _this.handleSelectCategory.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(OperationDetails, [{
        key: 'handleSelectType',
        value: function handleSelectType(id) {
            _store.Actions.setOperationType(this.props.operation, id);
            this.props.operation.operationTypeID = id;
        }
    }, {
        key: 'handleSelectCategory',
        value: function handleSelectCategory(id) {
            _store.Actions.setOperationCategory(this.props.operation, id);
            this.props.operation.categoryId = id;
        }
    }, {
        key: 'render',
        value: function render() {
            var op = this.props.operation;

            var maybeAttachment = '';
            if (op.binary !== null) {
                var opLink = computeAttachmentLink(op);
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
                        { href: '#', onClick: this.props.onToggleDetails },
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
                            React.createElement(_label.DetailedViewLabel, { operation: op })
                        ),
                        React.createElement(
                            'li',
                            null,
                            (0, _helpers.translate)('client.operations.amount'),
                            this.props.formatCurrency(op.amount)
                        ),
                        React.createElement(
                            'li',
                            { className: 'form-inline' },
                            (0, _helpers.translate)('client.operations.type'),
                            React.createElement(_operationTypeSelect2.default, {
                                operation: op,
                                onSelectId: this.handleSelectType
                            })
                        ),
                        React.createElement(
                            'li',
                            { className: 'form-inline' },
                            (0, _helpers.translate)('client.operations.category'),
                            React.createElement(_categorySelect2.default, {
                                operation: op,
                                onSelectId: this.handleSelectCategory
                            })
                        ),
                        maybeAttachment,
                        React.createElement(
                            'li',
                            null,
                            React.createElement(_deleteOperation2.default, {
                                operation: this.props.operation,
                                formatCurrency: this.props.formatCurrency
                            })
                        )
                    )
                )
            );
        }
    }]);
    return OperationDetails;
}(React.Component);

exports.default = OperationDetails;

},{"../../helpers":59,"../../store":62,"../ui/category-select":47,"../ui/operation-type-select":55,"./delete-operation":15,"./label":18,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _amountWell = require('./amount-well');

var _search = require('./search');

var _search2 = _interopRequireDefault(_search);

var _operation = require('./operation');

var _operation2 = _interopRequireDefault(_operation);

var _syncButton = require('./sync-button');

var _syncButton2 = _interopRequireDefault(_syncButton);

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Height of an operation line (px) based on the css settings
var OPERATION_HEIGHT = setOperationHeight();

// Number of operations before / after the ones to render, for flexibility.
var OPERATION_BALLAST = 10;

// Throttling for the scroll event (ms)
var SCROLL_THROTTLING = 150;

// Number of elements
var INITIAL_SHOW_ITEMS = window.innerHeight / OPERATION_HEIGHT | 0;

// Filter functions used in amount wells.
function noFilter() {
    return true;
}
function isPositive(op) {
    return op.amount > 0;
}
function isNegative(op) {
    return op.amount < 0;
}

function setOperationHeight() {
    // Keep in sync with style.css.
    return window.innerWidth < 768 ? 41 : 54;
}

var OperationsComponent = function (_React$Component) {
    (0, _inherits3.default)(OperationsComponent, _React$Component);

    function OperationsComponent(props) {
        (0, _classCallCheck3.default)(this, OperationsComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationsComponent).call(this, props));

        _this.state = {
            account: _store.store.getCurrentAccount(),
            operations: _store.store.getCurrentOperations(),
            filteredOperations: [],
            firstItemShown: 0,
            lastItemShown: INITIAL_SHOW_ITEMS,
            hasFilteredOperations: false
        };
        _this.listener = _this._listener.bind(_this);
        _this.setFilteredOperations = _this.setFilteredOperations.bind(_this);

        _this.handleScroll = (0, _lodash2.default)(_this.onScroll.bind(_this), SCROLL_THROTTLING);
        _this.handleResize = _this.handleResize.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(OperationsComponent, [{
        key: '_listener',
        value: function _listener() {
            var _this2 = this;

            this.setState({
                account: _store.store.getCurrentAccount(),
                operations: _store.store.getCurrentOperations(),
                firstItemShown: 0,
                lastItemShown: INITIAL_SHOW_ITEMS
            }, function () {
                _this2.refs.search.filter();
                _this2.handleScroll();
            });
        }
    }, {
        key: 'setFilteredOperations',
        value: function setFilteredOperations(operations) {
            this.setState({
                filteredOperations: operations,
                hasFilteredOperations: operations.length < this.state.operations.length,
                firstItemShown: 0,
                lastItemShown: INITIAL_SHOW_ITEMS
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.banks, this.listener);
            _store.store.on(_store.State.accounts, this.listener);
            _store.store.on(_store.State.operations, this.listener);

            window.addEventListener('scroll', this.handleScroll);
            window.addEventListener('resize', this.handleResize);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.banks, this.listener);
            _store.store.removeListener(_store.State.operations, this.listener);
            _store.store.removeListener(_store.State.accounts, this.listener);

            window.removeEventListener('scroll', this.handleScroll);
            window.removeEventListener('resize', this.handleResize);
        }
    }, {
        key: 'handleResize',
        value: function handleResize(e) {
            e.preventDefault();
            OPERATION_HEIGHT = setOperationHeight();
            INITIAL_SHOW_ITEMS = window.innerHeight / OPERATION_HEIGHT | 0;
            this.handleScroll();
        }
    }, {
        key: 'onScroll',
        value: function onScroll() {
            var wellH = React.findDOMNode(this.refs.wells).scrollHeight;
            var searchH = React.findDOMNode(this.refs.search).scrollHeight;
            var panelH = React.findDOMNode(this.refs.panelHeading).scrollHeight;
            var theadH = React.findDOMNode(this.refs.thead).scrollHeight;
            var fixedTopH = wellH + searchH + panelH + theadH;

            var topItemH = Math.max(window.scrollY - fixedTopH, 0);
            var bottomItemH = topItemH + window.innerHeight;

            var firstItemShown = Math.max(topItemH / OPERATION_HEIGHT - OPERATION_BALLAST | 0, 0);
            var lastItemShown = (bottomItemH / OPERATION_HEIGHT | 0) + OPERATION_BALLAST;

            this.setState({
                firstItemShown: firstItemShown,
                lastItemShown: lastItemShown
            });
        }
    }, {
        key: 'render',
        value: function render() {
            // Edge case: the component hasn't retrieved the account yet.
            if (this.state.account === null) {
                return React.createElement('div', null);
            }

            var bufferPreH = OPERATION_HEIGHT * this.state.firstItemShown;
            var bufferPre = React.createElement('tr', { style: { height: bufferPreH + 'px' } });

            var formatCurrency = this.state.account.formatCurrency;
            var ops = this.state.filteredOperations.slice(this.state.firstItemShown, this.state.lastItemShown).map(function (o) {
                return React.createElement(_operation2.default, { key: o.id,
                    operation: o,
                    formatCurrency: formatCurrency
                });
            });

            var numOps = this.state.filteredOperations.length;
            var bufferPostH = OPERATION_HEIGHT * Math.max(numOps - this.state.lastItemShown, 0);
            var bufferPost = React.createElement('tr', { style: { height: bufferPostH + 'px' } });

            var asOf = (0, _helpers.translate)('client.operations.as_of');
            var lastCheckedDate = new Date(this.state.account.lastChecked).toLocaleDateString();
            var lastCheckDate = asOf + ' ' + lastCheckedDate;

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'div',
                    { className: 'row operation-wells', ref: 'wells' },
                    React.createElement(_amountWell.AmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-lightblue',
                        icon: 'balance-scale',
                        title: (0, _helpers.translate)('client.operations.current_balance'),
                        subtitle: lastCheckDate,
                        operations: this.state.operations,
                        initialAmount: this.state.account.initialAmount,
                        filterFunction: noFilter,
                        formatCurrency: formatCurrency
                    }),
                    React.createElement(_amountWell.FilteredAmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-green',
                        icon: 'arrow-down',
                        title: (0, _helpers.translate)('client.operations.received'),
                        hasFilteredOperations: this.state.hasFilteredOperations,
                        operations: this.state.operations,
                        filteredOperations: this.state.filteredOperations,
                        initialAmount: 0,
                        filterFunction: isPositive,
                        formatCurrency: formatCurrency
                    }),
                    React.createElement(_amountWell.FilteredAmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-orange',
                        icon: 'arrow-up',
                        title: (0, _helpers.translate)('client.operations.spent'),
                        hasFilteredOperations: this.state.hasFilteredOperations,
                        operations: this.state.operations,
                        filteredOperations: this.state.filteredOperations,
                        initialAmount: 0,
                        filterFunction: isNegative,
                        formatCurrency: formatCurrency
                    }),
                    React.createElement(_amountWell.FilteredAmountWell, {
                        size: 'col-xs-12 col-md-3',
                        backgroundColor: 'background-darkblue',
                        icon: 'database',
                        title: (0, _helpers.translate)('client.operations.saved'),
                        hasFilteredOperations: this.state.hasFilteredOperations,
                        operations: this.state.operations,
                        filteredOperations: this.state.filteredOperations,
                        initialAmount: 0,
                        filterFunction: noFilter,
                        formatCurrency: formatCurrency
                    })
                ),
                React.createElement(_search2.default, {
                    ref: 'search',
                    setFilteredOperations: this.setFilteredOperations,
                    operations: this.state.operations
                }),
                React.createElement(
                    'div',
                    { className: 'operation-panel panel panel-default' },
                    React.createElement(
                        'div',
                        { className: 'panel-heading', ref: 'panelHeading' },
                        React.createElement(
                            'h3',
                            { className: 'title panel-title' },
                            (0, _helpers.translate)('client.operations.title')
                        ),
                        React.createElement(_syncButton2.default, { account: this.state.account })
                    ),
                    React.createElement(
                        'div',
                        { className: 'table-responsive' },
                        React.createElement(
                            'table',
                            { className: 'table table-hover table-bordered' },
                            React.createElement(
                                'thead',
                                { ref: 'thead' },
                                React.createElement(
                                    'tr',
                                    null,
                                    React.createElement('th', { className: 'hidden-xs' }),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-1 col-xs-2' },
                                        (0, _helpers.translate)('client.operations.column_date')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-2 hidden-xs' },
                                        (0, _helpers.translate)('client.operations.column_type')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-6 col-xs-8' },
                                        (0, _helpers.translate)('client.operations.column_name')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-1 col-xs-2' },
                                        (0, _helpers.translate)('client.operations.column_amount')
                                    ),
                                    React.createElement(
                                        'th',
                                        { className: 'col-sm-2 hidden-xs' },
                                        (0, _helpers.translate)('client.operations.column_category')
                                    )
                                )
                            ),
                            React.createElement(
                                'tbody',
                                null,
                                bufferPre,
                                ops,
                                bufferPost
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

},{"../../helpers":59,"../../store":62,"./amount-well":14,"./operation":19,"./search":20,"./sync-button":21,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82,"lodash.throttle":178}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.OperationListViewLabel = exports.DetailedViewLabel = undefined;

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

var _helpers = require('../../helpers');

var _store = require('../../store');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
var SMALL_TITLE_THRESHOLD = 4;

var LabelComponent = function (_React$Component) {
    (0, _inherits3.default)(LabelComponent, _React$Component);

    function LabelComponent(props) {
        (0, _classCallCheck3.default)(this, LabelComponent);

        (0, _helpers.has)(props, 'operation');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(LabelComponent).call(this, props));

        _this.state = {
            editMode: false
        };
        _this.handleClickEditMode = _this.handleClickEditMode.bind(_this);
        _this.handleBlur = _this.handleBlur.bind(_this);
        _this.handleKeyUp = _this.handleKeyUp.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(LabelComponent, [{
        key: 'buttonLabel',
        value: function buttonLabel() {
            (0, _helpers.assert)(false, 'buttonLabel() must be implemented by the subclasses!');
        }
    }, {
        key: 'dom',
        value: function dom() {
            return this.refs.customlabel.getDOMNode();
        }
    }, {
        key: 'handleClickEditMode',
        value: function handleClickEditMode() {
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
        key: 'handleBlur',
        value: function handleBlur() {
            var customLabel = this.dom().value;
            if (customLabel) {
                // If the new non empty customLabel value is different from the current one, save it.
                if (customLabel.trim() !== this.defaultValue() && customLabel.trim().length) {
                    _store.Actions.setCustomLabel(this.props.operation, customLabel);
                    // Be optimistic
                    this.props.operation.customLabel = customLabel;
                }
            } else if (this.props.operation.customLabel && this.props.operation.customLabel.length) {
                // If the new customLabel value is empty and there was already one, unset it.
                _store.Actions.setCustomLabel(this.props.operation, '');
                // Be optimistic
                this.props.operation.customLabel = null;
            }
            this.switchToStaticMode();
        }
    }, {
        key: 'handleKeyUp',
        value: function handleKeyUp(e) {
            if (e.key === 'Enter') {
                this.handleBlur();
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

            var label = void 0;
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
                    'div',
                    null,
                    React.createElement(
                        'span',
                        { className: 'text-uppercase visible-xs-inline label-button' },
                        this.defaultValue()
                    ),
                    React.createElement(
                        'button',
                        {
                            className: 'form-control text-left btn-transparent hidden-xs',
                            id: this.props.operation.id,
                            onClick: this.handleClickEditMode },
                        this.buttonLabel()
                    )
                );
            }
            return React.createElement('input', { className: 'form-control',
                type: 'text',
                ref: 'customlabel',
                id: this.props.operation.id,
                defaultValue: this.defaultValue(),
                onBlur: this.handleBlur,
                onKeyUp: this.handleKeyUp
            });
        }
    }]);
    return LabelComponent;
}(React.Component);

var DetailedViewLabel = exports.DetailedViewLabel = function (_LabelComponent) {
    (0, _inherits3.default)(DetailedViewLabel, _LabelComponent);

    function DetailedViewLabel(props) {
        (0, _classCallCheck3.default)(this, DetailedViewLabel);

        (0, _helpers.has)(props, 'operation');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DetailedViewLabel).call(this, props));
    }

    (0, _createClass3.default)(DetailedViewLabel, [{
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
    return DetailedViewLabel;
}(LabelComponent);

var OperationListViewLabel = exports.OperationListViewLabel = function (_LabelComponent2) {
    (0, _inherits3.default)(OperationListViewLabel, _LabelComponent2);

    function OperationListViewLabel(props) {
        (0, _classCallCheck3.default)(this, OperationListViewLabel);

        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'link');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationListViewLabel).call(this, props));
    }

    (0, _createClass3.default)(OperationListViewLabel, [{
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
                return (0, _get3.default)((0, _getPrototypeOf2.default)(OperationListViewLabel.prototype), 'render', this).call(this);
            }
            return React.createElement(
                'div',
                { className: 'input-group' },
                this.props.link,
                (0, _get3.default)((0, _getPrototypeOf2.default)(OperationListViewLabel.prototype), 'render', this).call(this)
            );
        }
    }]);
    return OperationListViewLabel;
}(LabelComponent);

},{"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/get":80,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _details = require('./details');

var _details2 = _interopRequireDefault(_details);

var _label = require('./label');

var _operationTypeSelect = require('../ui/operation-type-select');

var _operationTypeSelect2 = _interopRequireDefault(_operationTypeSelect);

var _categorySelect = require('../ui/category-select');

var _categorySelect2 = _interopRequireDefault(_categorySelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Operation = function (_React$Component) {
    (0, _inherits3.default)(Operation, _React$Component);

    function Operation(props) {
        (0, _classCallCheck3.default)(this, Operation);

        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'formatCurrency');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Operation).call(this, props));

        _this.state = {
            showDetails: false
        };
        _this.handleToggleDetails = _this.handleToggleDetails.bind(_this);
        _this.handleSelectType = _this.handleSelectType.bind(_this);
        _this.handleSelectCategory = _this.handleSelectCategory.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(Operation, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return this.state.showDetails !== nextState.showDetails || this.props.visible !== nextProps.visible;
        }
    }, {
        key: 'handleToggleDetails',
        value: function handleToggleDetails(e) {
            this.setState({ showDetails: !this.state.showDetails });
            e.preventDefault();
        }
    }, {
        key: 'handleSelectType',
        value: function handleSelectType(id) {
            _store.Actions.setOperationType(this.props.operation, id);
            this.props.operation.operationTypeID = id;
        }
    }, {
        key: 'handleSelectCategory',
        value: function handleSelectCategory(id) {
            _store.Actions.setOperationCategory(this.props.operation, id);
            this.props.operation.categoryId = id;
        }
    }, {
        key: 'render',
        value: function render() {
            var op = this.props.operation;

            var rowClassName = op.amount > 0 ? 'success' : '';

            if (this.state.showDetails) {
                return React.createElement(_details2.default, {
                    onToggleDetails: this.handleToggleDetails,
                    operation: op,
                    rowClassName: rowClassName,
                    formatCurrency: this.props.formatCurrency
                });
            }

            // Add a link to the attached file, if there is any.
            var link = void 0;
            if (op.binary !== null) {
                var opLink = (0, _details.computeAttachmentLink)(op);
                link = React.createElement(
                    'a',
                    {
                        target: '_blank',
                        href: opLink,
                        title: (0, _helpers.translate)('client.operations.attached_file') },
                    React.createElement('span', { className: 'fa fa-file', 'aria-hidden': 'true' })
                );
            } else if (op.attachments && op.attachments.url !== null) {
                link = React.createElement(
                    'a',
                    { href: op.attachments.url, target: '_blank' },
                    React.createElement('span', { className: 'glyphicon glyphicon-link' }),
                    (0, _helpers.translate)('client.' + op.attachments.linkTranslationKey)
                );
            }

            var maybeLink = void 0;
            if (link) {
                maybeLink = React.createElement(
                    'label',
                    { htmlFor: op.id, className: 'input-group-addon box-transparent' },
                    link
                );
            }
            return React.createElement(
                'tr',
                { className: rowClassName },
                React.createElement(
                    'td',
                    { className: 'hidden-xs' },
                    React.createElement(
                        'a',
                        { href: '#', onClick: this.handleToggleDetails },
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
                    { className: 'hidden-xs' },
                    React.createElement(_operationTypeSelect2.default, {
                        operation: op,
                        onSelectId: this.handleSelectType
                    })
                ),
                React.createElement(
                    'td',
                    null,
                    React.createElement(_label.OperationListViewLabel, { operation: op, link: maybeLink })
                ),
                React.createElement(
                    'td',
                    { className: 'text-right' },
                    this.props.formatCurrency(op.amount)
                ),
                React.createElement(
                    'td',
                    { className: 'hidden-xs' },
                    React.createElement(_categorySelect2.default, {
                        operation: op,
                        onSelectId: this.handleSelectCategory
                    })
                )
            );
        }
    }]);
    return Operation;
}(React.Component);

exports.default = Operation;

},{"../../helpers":59,"../../store":62,"../ui/category-select":47,"../ui/operation-type-select":55,"./details":16,"./label":18,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _datePicker = require('../ui/date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SearchComponent = function (_React$Component) {
    (0, _inherits3.default)(SearchComponent, _React$Component);

    function SearchComponent(props) {
        (0, _classCallCheck3.default)(this, SearchComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SearchComponent).call(this, props));

        _this.state = _this.initialState();
        _this.handleToggleDetails = _this.handleToggleDetails.bind(_this);
        _this.handleSyncAmountHigh = _this.handleSyncAmountHigh.bind(_this);
        _this.handleSyncAmountLow = _this.handleSyncAmountLow.bind(_this);
        _this.handleChangeLowDate = _this.handleChangeLowDate.bind(_this);
        _this.handleChangeHighDate = _this.handleChangeHighDate.bind(_this);
        _this.handleSyncKeyword = _this.handleSyncKeyword.bind(_this);
        _this.handleSyncType = _this.handleSyncType.bind(_this);
        _this.handleSyncCategory = _this.handleSyncCategory.bind(_this);

        _this.handleClearSearchNoClose = _this.handleClearSearch.bind(_this, false);
        _this.handleClearSearchAndClose = _this.handleClearSearch.bind(_this, true);
        return _this;
    }

    (0, _createClass3.default)(SearchComponent, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return this.state.showDetails !== nextState.showDetails || this.state.dateLow !== nextState.dateLow || this.state.dateHigh !== nextState.dateHigh;
        }
    }, {
        key: 'initialState',
        value: function initialState() {
            return {
                showDetails: false,

                keywords: [],
                category: '',
                type: '',
                amountLow: '',
                amountHigh: '',
                dateLow: null,
                dateHigh: null
            };
        }
    }, {
        key: 'handleClearSearch',
        value: function handleClearSearch(close, event) {
            var initialState = this.initialState();
            initialState.showDetails = !close;
            this.setState(initialState, this.filter);
            this.ref('searchForm').reset();

            event.preventDefault();
        }
    }, {
        key: 'handleToggleDetails',
        value: function handleToggleDetails() {
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
        key: 'handleChangeLowDate',
        value: function handleChangeLowDate(value) {
            this.setState({
                dateLow: value
            }, this.filter);
        }
    }, {
        key: 'handleChangeHighDate',
        value: function handleChangeHighDate(value) {
            this.setState({
                dateHigh: value
            }, this.filter);
        }
    }, {
        key: 'handleSyncKeyword',
        value: function handleSyncKeyword() {
            var kw = this.ref('keywords');
            this.setState({
                keywords: kw.value.split(' ').map(function (w) {
                    return w.toLowerCase();
                })
            }, this.filter);
        }
    }, {
        key: 'handleSyncCategory',
        value: function handleSyncCategory() {
            var cat = this.ref('cat');
            this.setState({
                category: cat.value
            }, this.filter);
        }
    }, {
        key: 'handleSyncType',
        value: function handleSyncType() {
            var type = this.ref('type');
            this.setState({
                type: type.value
            }, this.filter);
        }
    }, {
        key: 'handleSyncAmountLow',
        value: function handleSyncAmountLow() {
            var low = this.ref('amount_low');
            this.setState({
                amountLow: low.value
            }, this.filter);
        }
    }, {
        key: 'handleSyncAmountHigh',
        value: function handleSyncAmountHigh() {
            var high = this.ref('amount_high');
            this.setState({
                amountHigh: high.value
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
                return op.categoryId === self.state.category;
            });

            operations = filterIf(this.state.type !== '', operations, function (op) {
                return op.operationTypeID === self.state.type;
            });

            operations = filterIf(this.state.amountLow !== '', operations, function (op) {
                return op.amount >= self.state.amountLow;
            });

            operations = filterIf(this.state.amountHigh !== '', operations, function (op) {
                return op.amount <= self.state.amountHigh;
            });

            operations = filterIf(this.state.dateLow !== null, operations, function (op) {
                return op.date >= self.state.dateLow;
            });

            operations = filterIf(this.state.dateHigh !== null, operations, function (op) {
                return op.date <= self.state.dateHigh;
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
            var details = void 0;
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
                        { key: c.id, value: c.id },
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
                            onKeyUp: this.handleSyncKeyword,
                            defaultValue: this.state.keywords.join(' '),
                            id: 'keywords', ref: 'keywords'
                        })
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
                                        onChange: this.handleSyncCategory,
                                        defaultValue: this.state.category,
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
                                        onChange: this.handleSyncType,
                                        defaultValue: this.state.type,
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
                                    onChange: this.handleSyncAmountLow,
                                    defaultValue: this.state.amountLow,
                                    id: 'amount-low', ref: 'amount_low'
                                })
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
                                    onChange: this.handleSyncAmountHigh,
                                    defaultValue: this.state.amountHigh,
                                    id: 'amount-high', ref: 'amount_high'
                                })
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
                                React.createElement(_datePicker2.default, {
                                    ref: 'date_low',
                                    id: 'date-low',
                                    key: 'date-low',
                                    onSelect: this.handleChangeLowDate,
                                    maxDate: this.state.dateHigh
                                })
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
                                React.createElement(_datePicker2.default, {
                                    ref: 'date_high',
                                    id: 'date-high',
                                    key: 'date-high',
                                    onSelect: this.handleChangeHighDate,
                                    minDate: this.state.dateLow
                                })
                            )
                        )
                    ),
                    React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'button',
                            { className: 'btn btn-warning pull-left', type: 'button',
                                onClick: this.handleClearSearchAndClose },
                            (0, _helpers.translate)('client.search.clearAndClose')
                        ),
                        React.createElement(
                            'button',
                            { className: 'btn btn-warning pull-right', type: 'button',
                                onClick: this.handleClearSearchNoClose },
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
                    { className: 'panel-heading clickable', onClick: this.handleToggleDetails },
                    React.createElement(
                        'h5',
                        { className: 'panel-title' },
                        (0, _helpers.translate)('client.search.title'),
                        React.createElement('span', {
                            className: 'pull-right fa fa-' + (this.state.showDetails ? 'minus' : 'plus') + '-square',
                            'aria-hidden': 'true' })
                    )
                ),
                details
            );
        }
    }]);
    return SearchComponent;
}(React.Component);

exports.default = SearchComponent;

},{"../../helpers":59,"../../store":62,"../ui/date-picker":53,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _errors = require('../../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SyncButton = function (_React$Component) {
    (0, _inherits3.default)(SyncButton, _React$Component);

    function SyncButton(props) {
        (0, _classCallCheck3.default)(this, SyncButton);

        (0, _helpers.has)(props, 'account');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SyncButton).call(this, props));

        _this.state = {
            isSynchronizing: false
        };
        _this.afterFetchOperations = _this.afterFetchOperations.bind(_this);
        _this.handleFetch = _this.handleFetch.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(SyncButton, [{
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            return this.state.isSynchronizing !== nextState.isSynchronizing || this.props.account.lastChecked !== nextProps.account.lastChecked;
        }
    }, {
        key: 'handleFetch',
        value: function handleFetch() {
            _store.store.once(_store.State.sync, this.afterFetchOperations);
            _store.Actions.fetchOperations();
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
            (0, _errors.maybeHandleSyncError)(err);
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
                    ' ',
                    new Date(this.props.account.lastChecked).toLocaleString()
                ),
                React.createElement(
                    'a',
                    { href: '#', onClick: this.handleFetch },
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

exports.default = SyncButton;

},{"../../errors":56,"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _package = require('../../../package.json');

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var About = function (_React$Component) {
    (0, _inherits3.default)(About, _React$Component);

    function About() {
        (0, _classCallCheck3.default)(this, About);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(About).apply(this, arguments));
    }

    (0, _createClass3.default)(About, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default about' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.settings.tab_about')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'h3',
                        { className: 'app-title' },
                        'KRESUS'
                    ),
                    React.createElement(
                        'span',
                        null,
                        'Version: ',
                        React.createElement(
                            'code',
                            null,
                            _package2.default.version
                        ),
                        '  ',
                        (0, _helpers.translate)('client.settings.license'),
                        ': ',
                        React.createElement(
                            'code',
                            null,
                            _package2.default.license
                        )
                    ),
                    React.createElement(
                        'p',
                        null,
                        (0, _helpers.translate)('client.about')
                    ),
                    React.createElement(
                        'div',
                        { className: 'btn-group' },
                        React.createElement(
                            'a',
                            { className: 'btn btn-default',
                                href: 'https://github.com/bnjbvr/kresus',
                                target: '_blank' },
                            React.createElement('i', { className: 'fa fa-code' }),
                            ' ',
                            (0, _helpers.translate)('client.settings.sources')
                        ),
                        React.createElement(
                            'a',
                            { className: 'btn btn-default',
                                href: 'https://forum.cozy.io/t/app-kresus',
                                target: '_blank' },
                            React.createElement('i', { className: 'fa fa-cloud' }),
                            ' ',
                            (0, _helpers.translate)('client.settings.forum_thread')
                        ),
                        React.createElement(
                            'a',
                            { className: 'btn btn-default',
                                href: 'https://blog.benj.me/tag/kresus',
                                target: '_blank' },
                            React.createElement('i', { className: 'fa fa-pencil-square-o' }),
                            ' ',
                            (0, _helpers.translate)('client.settings.blog')
                        )
                    )
                )
            );
        }
    }]);
    return About;
}(React.Component);

exports.default = About;

},{"../../../package.json":182,"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _store = require("../../store");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccountSelector = function (_React$Component) {
    (0, _inherits3.default)(AccountSelector, _React$Component);

    function AccountSelector() {
        (0, _classCallCheck3.default)(this, AccountSelector);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AccountSelector).apply(this, arguments));
    }

    (0, _createClass3.default)(AccountSelector, [{
        key: "value",
        value: function value() {
            return this.refs.select.getDOMNode().value;
        }
    }, {
        key: "render",
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

                            accounts.push([a.accountNumber, b.name + " - " + a.title]);
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
                    "option",
                    {
                        key: pair[0],
                        value: pair[0] },
                    pair[1]
                );
            });

            return React.createElement(
                "select",
                { className: "form-control", ref: "select" },
                options
            );
        }
    }]);
    return AccountSelector;
}(React.Component);

exports.default = AccountSelector;

},{"../../store":62,"babel-runtime/core-js/get-iterator":64,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _confirmDeleteModal = require('../ui/confirm-delete-modal');

var _confirmDeleteModal2 = _interopRequireDefault(_confirmDeleteModal);

var _addOperationModal = require('./add-operation-modal');

var _addOperationModal2 = _interopRequireDefault(_addOperationModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Account = function (_React$Component) {
    (0, _inherits3.default)(Account, _React$Component);

    function Account(props) {
        (0, _classCallCheck3.default)(this, Account);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Account).call(this, props));

        _this.listener = _this._listener.bind(_this);
        _this.handleSetDefault = _this.handleSetDefault.bind(_this);
        _this.handleDelete = _this.handleDelete.bind(_this);
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
        key: 'handleDelete',
        value: function handleDelete() {
            _store.Actions.deleteAccount(this.props.account);
        }
    }, {
        key: 'handleSetDefault',
        value: function handleSetDefault() {
            _store.Actions.changeSetting('defaultAccountId', this.props.account.id);
        }
    }, {
        key: 'render',
        value: function render() {
            var a = this.props.account;
            var label = a.iban ? a.title + ' (IBAN: ' + a.iban + ')' : a.title;
            var setDefaultAccountTitle = void 0;
            var selected = void 0;

            if (_store.store.getDefaultAccountId() === this.props.account.id) {
                setDefaultAccountTitle = '';
                selected = 'fa-star';
            } else {
                setDefaultAccountTitle = (0, _helpers.translate)('client.settings.set_default_account');
                selected = 'fa-star-o';
            }

            return React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    null,
                    React.createElement('span', { className: 'clickable fa ' + selected,
                        'aria-hidden': 'true',
                        onClick: this.handleSetDefault,
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
                        title: (0, _helpers.translate)('client.settings.delete_account_button') }),
                    React.createElement('span', { className: 'pull-right fa fa-plus-circle', 'aria-label': 'Add an operation',
                        'data-toggle': 'modal',
                        'data-target': '#addOperation' + a.id,
                        title: (0, _helpers.translate)('client.settings.add_operation') }),
                    React.createElement(_confirmDeleteModal2.default, {
                        modalId: 'confirmDeleteAccount' + a.id,
                        modalBody: (0, _helpers.translate)('client.settings.erase_account', { title: a.title }),
                        onDelete: this.handleDelete
                    }),
                    React.createElement(_addOperationModal2.default, {
                        account: a
                    })
                )
            );
        }
    }]);
    return Account;
}(React.Component);

exports.default = Account;

},{"../../helpers":59,"../../store":62,"../ui/confirm-delete-modal":52,"./add-operation-modal":25,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _modal = require('../ui/modal');

var _modal2 = _interopRequireDefault(_modal);

var _categorySelect = require('../ui/category-select');

var _categorySelect2 = _interopRequireDefault(_categorySelect);

var _operationTypeSelect = require('../ui/operation-type-select');

var _operationTypeSelect2 = _interopRequireDefault(_operationTypeSelect);

var _checkedText = require('../ui/checked-text');

var _checkedText2 = _interopRequireDefault(_checkedText);

var _checkedNumber = require('../ui/checked-number');

var _checkedNumber2 = _interopRequireDefault(_checkedNumber);

var _checkedDate = require('../ui/checked-date');

var _checkedDate2 = _interopRequireDefault(_checkedDate);

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

            _store.Actions.createOperation(this.props.account.id, operation);

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
            return this.isSubmitDisabled(this.state) !== this.isSubmitDisabled(nextState);
        }
    }, {
        key: 'isSubmitDisabled',
        value: function isSubmitDisabled(state) {
            return !(state.titleIsOK && state.amountIsOK && state.dateIsOK);
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
                    (0, _helpers.translate)('client.addoperationmodal.description', { account: this.props.account.title })
                ),
                React.createElement(
                    'form',
                    { id: 'formAddOperation' + this.props.account.id,
                        onSubmit: this.handleOnSubmit },
                    React.createElement(_checkedDate2.default, {
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
                        React.createElement(_operationTypeSelect2.default, {
                            operation: this.state.operation,
                            onSelectId: this.handleOnSelectOperationType
                        })
                    ),
                    React.createElement(_checkedText2.default, {
                        inputID: 'title' + this.props.account.id,
                        returnInputValue: this.returnTitleValue,
                        label: labelTitle,
                        ref: 'title'
                    }),
                    React.createElement(_checkedNumber2.default, {
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
                        React.createElement(_categorySelect2.default, {
                            operation: this.state.operation,
                            onSelectId: this.handleOnSelectCategory
                        })
                    )
                )
            );

            var modalTitle = (0, _helpers.translate)('client.addoperationmodal.add_operation', { account: this.props.account.title });
            var modalFooter = React.createElement(
                'div',
                null,
                React.createElement('input', { type: 'button', className: 'btn btn-default', 'data-dismiss': 'modal',
                    value: (0, _helpers.translate)('client.addoperationmodal.cancel')
                }),
                React.createElement('input', { type: 'submit', form: 'formAddOperation' + this.props.account.id,
                    className: 'btn btn-warning', value: (0, _helpers.translate)('client.addoperationmodal.submit'),
                    disabled: this.isSubmitDisabled(this.state)
                })
            );
            return React.createElement(_modal2.default, {
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

},{"../../helpers":59,"../../store":62,"../ui/category-select":47,"../ui/checked-date":48,"../ui/checked-number":49,"../ui/checked-text":50,"../ui/modal":54,"../ui/operation-type-select":55,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _confirmDeleteModal = require('../ui/confirm-delete-modal');

var _confirmDeleteModal2 = _interopRequireDefault(_confirmDeleteModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AlertItem = function (_React$Component) {
    (0, _inherits3.default)(AlertItem, _React$Component);

    function AlertItem(props) {
        (0, _classCallCheck3.default)(this, AlertItem);

        (0, _helpers.has)(props, 'alert');
        (0, _helpers.has)(props, 'account');
        (0, _helpers.has)(props, 'sendIfText');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AlertItem).call(this, props));

        _this.handleSelect = _this.handleSelect.bind(_this);
        _this.handleChangeLimit = _this.handleChangeLimit.bind(_this);
        _this.handleDelete = _this.handleDelete.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(AlertItem, [{
        key: 'handleSelect',
        value: function handleSelect() {
            var newValue = this.refs.select.getDOMNode().value;
            if (newValue === this.props.alert.order) return;
            _store.Actions.updateAlert(this.props.alert, { order: newValue });
        }
    }, {
        key: 'handleChangeLimit',
        value: function handleChangeLimit() {
            var newValue = parseFloat(this.refs.limit.getDOMNode().value);
            if (newValue === this.props.alert.limit || isNaN(newValue)) return;
            _store.Actions.updateAlert(this.props.alert, { limit: newValue });
        }
    }, {
        key: 'handleDelete',
        value: function handleDelete() {
            _store.Actions.deleteAlert(this.props.alert);
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
                    { className: 'col-md-3' },
                    account.title
                ),
                React.createElement(
                    'td',
                    { className: 'col-md-3' },
                    React.createElement(
                        'span',
                        { className: 'condition' },
                        this.props.sendIfText
                    )
                ),
                React.createElement(
                    'td',
                    { className: 'col-md-5' },
                    React.createElement(
                        'div',
                        { className: 'form-inline pull-right' },
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'select',
                                { className: 'form-control',
                                    defaultValue: alert.order,
                                    ref: 'select',
                                    onChange: this.handleSelect },
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
                            { className: 'input-group input-group-money' },
                            React.createElement('input', { type: 'number',
                                ref: 'limit',
                                className: 'form-control',
                                defaultValue: alert.limit,
                                onChange: this.handleChangeLimit
                            }),
                            React.createElement(
                                'span',
                                { className: 'input-group-addon' },
                                account.currencySymbol
                            )
                        )
                    )
                ),
                React.createElement(
                    'td',
                    { className: 'col-md-1' },
                    React.createElement('span', { className: 'pull-right fa fa-times-circle', 'aria-label': 'remove',
                        'data-toggle': 'modal',
                        'data-target': '#confirmDeleteAlert' + alert.id,
                        title: (0, _helpers.translate)('client.settings.emails.delete_alert') }),
                    React.createElement(_confirmDeleteModal2.default, {
                        modalId: 'confirmDeleteAlert' + alert.id,
                        modalBody: (0, _helpers.translate)('client.settings.emails.delete_alert_full_text'),
                        onDelete: this.handleDelete
                    })
                )
            );
        }
    }]);
    return AlertItem;
}(React.Component);

exports.default = AlertItem;

},{"../../helpers":59,"../../store":62,"../ui/confirm-delete-modal":52,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _createAlertModal = require('./create-alert-modal');

var _createAlertModal2 = _interopRequireDefault(_createAlertModal);

var _alert = require('./alert');

var _alert2 = _interopRequireDefault(_alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Alerts = function (_React$Component) {
    (0, _inherits3.default)(Alerts, _React$Component);

    function Alerts(props) {
        (0, _classCallCheck3.default)(this, Alerts);

        (0, _helpers.has)(props, 'alertType');
        (0, _helpers.has)(props, 'sendIfText');
        (0, _helpers.has)(props, 'titleTranslationKey');
        (0, _helpers.has)(props, 'panelTitleKey');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Alerts).call(this, props));

        _this.state = {
            alerts: _store.store.getAlerts(_this.props.alertType)
        };
        _this.onAlertChange = _this.onAlertChange.bind(_this);
        return _this;
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
            var _this2 = this;

            var pairs = this.state.alerts;
            var items = pairs.map(function (pair) {
                return React.createElement(_alert2.default, {
                    key: pair.alert.id,
                    alert: pair.alert,
                    account: pair.account,
                    sendIfText: _this2.props.sendIfText
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
                        (0, _helpers.translate)(this.props.panelTitleKey)
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: 'option-legend fa fa-plus-circle', 'aria-label': 'create alert',
                            'data-toggle': 'modal',
                            'data-target': '#alert-' + this.props.alertType + '-creation' })
                    )
                ),
                React.createElement(_createAlertModal2.default, {
                    modalId: 'alert-' + this.props.alertType + '-creation',
                    alertType: this.props.alertType,
                    titleTranslationKey: this.props.titleTranslationKey,
                    sendIfText: this.props.sendIfText
                }),
                React.createElement(
                    'div',
                    { className: 'table-responsive' },
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
                                React.createElement('th', null),
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

exports.default = Alerts;

},{"../../helpers":59,"../../store":62,"./alert":26,"./create-alert-modal":31,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _importModule = require('../shared/import-module');

var _importModule2 = _interopRequireDefault(_importModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BackupParameters = function (_React$Component) {
    (0, _inherits3.default)(BackupParameters, _React$Component);

    function BackupParameters() {
        (0, _classCallCheck3.default)(this, BackupParameters);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BackupParameters).apply(this, arguments));
    }

    (0, _createClass3.default)(BackupParameters, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.settings.tab_backup')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'form',
                        null,
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'div',
                                { className: 'row' },
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
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'label',
                                    { htmlFor: 'importInstance', className: 'col-xs-4 control-label' },
                                    (0, _helpers.translate)('client.settings.import_instance')
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-xs-8' },
                                    React.createElement(_importModule2.default, null),
                                    React.createElement(
                                        'span',
                                        { className: 'help-block' },
                                        (0, _helpers.translate)('client.settings.import_instance_help')
                                    )
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);
    return BackupParameters;
}(React.Component);

exports.default = BackupParameters;

},{"../../helpers":59,"../shared/import-module":41,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _addBankForm = require('../shared/add-bank-form');

var _addBankForm2 = _interopRequireDefault(_addBankForm);

var _bankAccounts = require('./bank-accounts');

var _bankAccounts2 = _interopRequireDefault(_bankAccounts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BankAccountsList = function (_React$Component) {
    (0, _inherits3.default)(BankAccountsList, _React$Component);

    function BankAccountsList(props) {
        (0, _classCallCheck3.default)(this, BankAccountsList);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankAccountsList).call(this, props));

        _this.state = {
            banks: _store.store.getBanks()
        };
        _this.listener = _this._listener.bind(_this);
        return _this;
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
            _store.store.on(_store.State.banks, this.listener);
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
                return React.createElement(_bankAccounts2.default, { key: bank.id, bank: bank });
            });

            return React.createElement(
                'div',
                null,
                React.createElement(_addBankForm2.default, { expanded: false }),
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

exports.default = BankAccountsList;

},{"../../store":62,"../shared/add-bank-form":39,"./bank-accounts":30,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _errors = require('../../errors');

var _confirmDeleteModal = require('../ui/confirm-delete-modal');

var _confirmDeleteModal2 = _interopRequireDefault(_confirmDeleteModal);

var _account = require('./account');

var _account2 = _interopRequireDefault(_account);

var _editAccessModal = require('./edit-access-modal');

var _editAccessModal2 = _interopRequireDefault(_editAccessModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BankAccounts = function (_React$Component) {
    (0, _inherits3.default)(BankAccounts, _React$Component);

    function BankAccounts(props) {
        (0, _classCallCheck3.default)(this, BankAccounts);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BankAccounts).call(this, props));

        _this.state = {
            accounts: _store.store.getBankAccounts(_this.props.bank.id)
        };
        _this.listener = _this._listener.bind(_this);
        _this.handleChangeAccess = _this.handleChangeAccess.bind(_this);
        _this.handleDelete = _this.handleDelete.bind(_this);
        _this.handleUpdate = _this.handleUpdate.bind(_this);
        return _this;
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
            _store.store.on(_store.State.accounts, this.listener);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.accounts, this.listener);
        }
    }, {
        key: 'handleDelete',
        value: function handleDelete() {
            _store.Actions.deleteBank(this.props.bank);
        }
    }, {
        key: 'handleUpdate',
        value: function handleUpdate() {
            if (this.state.accounts && this.state.accounts.length) {
                _store.store.once(_store.State.sync, _errors.maybeHandleSyncError);
                _store.Actions.fetchAccounts(this.props.bank, this.state.accounts[0]);
            }
        }
    }, {
        key: 'handleChangeAccess',
        value: function handleChangeAccess(login, password, customFields) {
            (0, _helpers.assert)(this.state.accounts && this.state.accounts.length);
            _store.Actions.updateAccess(this.state.accounts[0], login, password, customFields);
        }
    }, {
        key: 'render',
        value: function render() {
            var accounts = this.state.accounts.map(function (acc) {
                return React.createElement(_account2.default, { key: acc.id, account: acc });
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
                            onClick: this.handleUpdate,
                            title: (0, _helpers.translate)('client.settings.reload_accounts_button') }),
                        React.createElement('span', { className: 'option-legend fa fa-cog', 'aria-label': 'Edit bank access',
                            'data-toggle': 'modal',
                            'data-target': '#changePasswordBank' + b.id,
                            title: (0, _helpers.translate)('client.settings.change_password_button') }),
                        React.createElement('span', { className: 'option-legend fa fa-times-circle', 'aria-label': 'remove',
                            'data-toggle': 'modal',
                            'data-target': '#confirmDeleteBank' + b.id,
                            title: (0, _helpers.translate)('client.settings.delete_bank_button') })
                    )
                ),
                React.createElement(_confirmDeleteModal2.default, {
                    modalId: 'confirmDeleteBank' + b.id,
                    modalBody: (0, _helpers.translate)('client.settings.erase_bank', { name: b.name }),
                    onDelete: this.handleDelete
                }),
                React.createElement(_editAccessModal2.default, {
                    modalId: 'changePasswordBank' + b.id,
                    customFields: b.customFields,
                    onSave: this.handleChangeAccess
                }),
                React.createElement(
                    'table',
                    { className: 'table bank-accounts-list' },
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

exports.default = BankAccounts;

},{"../../errors":56,"../../helpers":59,"../../store":62,"../ui/confirm-delete-modal":52,"./account":24,"./edit-access-modal":34,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _accountSelect = require('./account-select');

var _accountSelect2 = _interopRequireDefault(_accountSelect);

var _modal = require('../ui/modal');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AlertCreationModal = function (_React$Component) {
    (0, _inherits3.default)(AlertCreationModal, _React$Component);

    function AlertCreationModal(props) {
        (0, _classCallCheck3.default)(this, AlertCreationModal);

        (0, _helpers.has)(props, 'alertType');
        (0, _helpers.has)(props, 'modalId');
        (0, _helpers.has)(props, 'titleTranslationKey');
        (0, _helpers.has)(props, 'sendIfText');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AlertCreationModal).call(this, props));

        _this.state = {
            maybeLimitError: ''
        };
        _this.handleSubmit = _this.handleSubmit.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(AlertCreationModal, [{
        key: 'handleSubmit',
        value: function handleSubmit() {

            // Validate data
            var limitDom = this.refs.limit.getDOMNode();
            var limit = parseFloat(limitDom.value);
            if (isNaN(limit)) {
                this.setState({
                    maybeLimitError: (0, _helpers.translate)('client.settings.emails.invalid_limit')
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

            _store.Actions.createAlert(newAlert);

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
            var modalTitle = (0, _helpers.translate)(this.props.titleTranslationKey);

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
                    React.createElement(_accountSelect2.default, { ref: 'account', id: 'account' })
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
                    React.createElement('input', { type: 'number', ref: 'limit', className: 'form-control',
                        defaultValue: '0'
                    })
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
                    { type: 'button', className: 'btn btn-success',
                        onClick: this.handleSubmit },
                    (0, _helpers.translate)('client.settings.emails.create')
                )
            );

            return React.createElement(_modal2.default, { modalId: this.props.modalId,
                modalTitle: modalTitle,
                modalBody: modalBody,
                modalFooter: modalFooter
            });
        }
    }]);
    return AlertCreationModal;
}(React.Component);

exports.default = AlertCreationModal;

},{"../../helpers":59,"../../store":62,"../ui/modal":54,"./account-select":23,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _modal = require('../ui/modal');

var _modal2 = _interopRequireDefault(_modal);

var _accountSelect = require('./account-select');

var _accountSelect2 = _interopRequireDefault(_accountSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReportCreationModal = function (_React$Component) {
    (0, _inherits3.default)(ReportCreationModal, _React$Component);

    function ReportCreationModal(props) {
        (0, _classCallCheck3.default)(this, ReportCreationModal);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ReportCreationModal).call(this, props));

        _this.handleCreate = _this.handleCreate.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ReportCreationModal, [{
        key: 'handleCreate',
        value: function handleCreate() {

            var newAlert = {
                type: 'report',
                bankAccount: this.refs.account.value(),
                frequency: this.refs.selector.getDOMNode().value
            };

            _store.Actions.createAlert(newAlert);
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
                    React.createElement(_accountSelect2.default, { ref: 'account', id: 'account' })
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
                        onClick: this.handleCreate },
                    (0, _helpers.translate)('client.settings.emails.create')
                )
            );

            return React.createElement(_modal2.default, { modalId: 'report-creation',
                modalTitle: modalTitle,
                modalBody: modalBody,
                modalFooter: modalFooter
            });
        }
    }]);
    return ReportCreationModal;
}(React.Component);

exports.default = ReportCreationModal;

},{"../../helpers":59,"../../store":62,"../ui/modal":54,"./account-select":23,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _operationsByCategoryPeriodSelect = require('../shared/operations-by-category-period-select');

var _operationsByCategoryPeriodSelect2 = _interopRequireDefault(_operationsByCategoryPeriodSelect);

var _operationsByCategoryTypeSelect = require('../shared/operations-by-category-type-select');

var _operationsByCategoryTypeSelect2 = _interopRequireDefault(_operationsByCategoryTypeSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultParameters = function (_React$Component) {
    (0, _inherits3.default)(DefaultParameters, _React$Component);

    function DefaultParameters(props) {
        (0, _classCallCheck3.default)(this, DefaultParameters);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DefaultParameters).call(this, props));

        _this.state = {
            duplicateThreshold: _store.store.getSetting('duplicateThreshold'),
            defaultChartType: _store.store.getSetting('defaultChartType'),
            defaultChartPeriod: _store.store.getSetting('defaultChartPeriod')
        };

        _this.handleDuplicateThresholdChange = _this.handleDuplicateThresholdChange.bind(_this);
        _this.handleDefaultChartTypeChange = _this.handleDefaultChartTypeChange.bind(_this);
        _this.handleDefaultChartPeriodChange = _this.handleDefaultChartPeriodChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(DefaultParameters, [{
        key: 'handleDuplicateThresholdChange',
        value: function handleDuplicateThresholdChange() {
            var val = this.refs.duplicateThreshold.getDOMNode().value;
            _store.Actions.changeSetting('duplicateThreshold', val);
            this.setState({
                duplicateThreshold: val
            });
            return true;
        }
    }, {
        key: 'handleDefaultChartTypeChange',
        value: function handleDefaultChartTypeChange() {
            var val = this.refs.defaultChartType.getValue();
            _store.Actions.changeSetting('defaultChartType', val);
            this.setState({
                defaultChartType: val
            });
            return true;
        }
    }, {
        key: 'handleDefaultChartPeriodChange',
        value: function handleDefaultChartPeriodChange() {
            var val = this.refs.defaultChartPeriod.getValue();
            _store.Actions.changeSetting('defaultChartPeriod', val);
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
                            { className: 'form-group' },
                            React.createElement(
                                'label',
                                { htmlFor: 'duplicateThreshold', className: 'col-xs-4 control-label' },
                                (0, _helpers.translate)('client.settings.duplicate_threshold')
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-8' },
                                React.createElement(
                                    'div',
                                    { className: 'input-group' },
                                    React.createElement('input', { id: 'duplicateThreshold', ref: 'duplicateThreshold',
                                        type: 'number', className: 'form-control',
                                        min: '0', step: '1',
                                        value: this.state.duplicateThreshold,
                                        onChange: this.handleDuplicateThresholdChange
                                    }),
                                    React.createElement(
                                        'span',
                                        { className: 'input-group-addon' },
                                        (0, _helpers.translate)('client.units.hours')
                                    )
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'help-block' },
                                    (0, _helpers.translate)('client.settings.duplicate_help')
                                )
                            )
                        )
                    )
                ),
                React.createElement(
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
                                React.createElement(_operationsByCategoryTypeSelect2.default, {
                                    defaultValue: this.state.defaultChartType,
                                    onChange: this.handleDefaultChartTypeChange,
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
                                React.createElement(_operationsByCategoryPeriodSelect2.default, {
                                    defaultValue: this.state.defaultChartPeriod,
                                    onChange: this.handleDefaultChartPeriodChange,
                                    ref: 'defaultChartPeriod',
                                    htmlId: 'defaultChartPeriod'
                                })
                            )
                        )
                    )
                )
            );
        }
    }]);
    return DefaultParameters;
}(React.Component);

exports.default = DefaultParameters;

},{"../../helpers":59,"../../store":62,"../shared/operations-by-category-period-select":42,"../shared/operations-by-category-type-select":43,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _helpers = require('../../helpers');

var _customBankField = require('../shared/custom-bank-field');

var _customBankField2 = _interopRequireDefault(_customBankField);

var _modal = require('../ui/modal');

var _modal2 = _interopRequireDefault(_modal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditAccessModal = function (_React$Component) {
    (0, _inherits3.default)(EditAccessModal, _React$Component);
    (0, _createClass3.default)(EditAccessModal, [{
        key: 'extractCustomFieldValue',
        value: function extractCustomFieldValue(field, index) {
            return this.refs['customField' + index].getValue();
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(event) {
            event.preventDefault();

            var newLogin = this.refs.login.getDOMNode().value.trim();
            var newPassword = this.refs.password.getDOMNode().value.trim();
            if (!newPassword || !newPassword.length) {
                alert((0, _helpers.translate)('client.editaccessmodal.not_empty'));
                return;
            }

            var customFields = void 0;
            if (this.props.customFields) {
                customFields = this.props.customFields.map(this.extractCustomFieldValue);
                if (customFields.some(function (f) {
                    return !f.value;
                })) {
                    alert((0, _helpers.translate)('client.editaccessmodal.customFields_not_empty'));
                    return;
                }
            }

            this.props.onSave(newLogin, newPassword, customFields);
            this.refs.password.getDOMNode().value = '';

            $('#' + this.props.modalId).modal('hide');
        }
    }]);

    function EditAccessModal(props) {
        (0, _classCallCheck3.default)(this, EditAccessModal);

        (0, _helpers.has)(props, 'modalId');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(EditAccessModal).call(this, props));

        _this.handleSubmit = _this.handleSubmit.bind(_this);
        _this.extractCustomFieldValue = _this.extractCustomFieldValue.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(EditAccessModal, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            $('#' + this.props.modalId).on('shown.bs.modal', function () {
                _this2.refs.password.getDOMNode().focus();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var customFields = void 0;

            if (this.props.customFields) {
                customFields = this.props.customFields.map(function (field, index) {
                    return React.createElement(_customBankField2.default, {
                        key: 'customField' + index,
                        ref: 'customField' + index,
                        params: field
                    });
                });
            }

            var modalTitle = (0, _helpers.translate)('client.editaccessmodal.title');

            var modalBody = React.createElement(
                'div',
                null,
                (0, _helpers.translate)('client.editaccessmodal.body'),
                React.createElement(
                    'form',
                    { id: this.props.modalId + '-form',
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
                        React.createElement('input', { type: 'text', className: 'form-control', id: 'login',
                            ref: 'login'
                        })
                    ),
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'password' },
                            (0, _helpers.translate)('client.settings.password')
                        ),
                        React.createElement('input', { type: 'password', className: 'form-control', id: 'password',
                            ref: 'password'
                        })
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
                    {
                        type: 'submit', form: this.props.modalId + '-form',
                        className: 'btn btn-success' },
                    (0, _helpers.translate)('client.editaccessmodal.save')
                )
            );

            return React.createElement(_modal2.default, { modalId: this.props.modalId,
                modalTitle: modalTitle,
                modalBody: modalBody,
                modalFooter: modalFooter
            });
        }
    }]);
    return EditAccessModal;
}(React.Component);

exports.default = EditAccessModal;

},{"../../helpers":59,"../shared/custom-bank-field":40,"../ui/modal":54,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _alerts = require('./alerts');

var _alerts2 = _interopRequireDefault(_alerts);

var _reports = require('./reports');

var _reports2 = _interopRequireDefault(_reports);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmailsParameters = function (_React$Component) {
    (0, _inherits3.default)(EmailsParameters, _React$Component);

    function EmailsParameters() {
        (0, _classCallCheck3.default)(this, EmailsParameters);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(EmailsParameters).apply(this, arguments));
    }

    (0, _createClass3.default)(EmailsParameters, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'emails' },
                React.createElement(_alerts2.default, {
                    alertType: 'balance',
                    sendIfText: (0, _helpers.translate)('client.settings.emails.send_if_balance_is'),
                    titleTranslationKey: 'client.settings.emails.add_balance',
                    panelTitleKey: 'client.settings.emails.balance_title'
                }),
                React.createElement(_alerts2.default, {
                    alertType: 'transaction',
                    sendIfText: (0, _helpers.translate)('client.settings.emails.send_if_transaction_is'),
                    titleTranslationKey: 'client.settings.emails.add_transaction',
                    panelTitleKey: 'client.settings.emails.transaction_title'
                }),
                React.createElement(_reports2.default, null)
            );
        }
    }]);
    return EmailsParameters;
}(React.Component);

exports.default = EmailsParameters;

},{"../../helpers":59,"./alerts":27,"./reports":38,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _weboobParameters = require('../shared/weboob-parameters');

var _weboobParameters2 = _interopRequireDefault(_weboobParameters);

var _about = require('./about');

var _about2 = _interopRequireDefault(_about);

var _bankAccountsSubsection = require('./bank-accounts-subsection');

var _bankAccountsSubsection2 = _interopRequireDefault(_bankAccountsSubsection);

var _defaultParametersSubsection = require('./default-parameters-subsection');

var _defaultParametersSubsection2 = _interopRequireDefault(_defaultParametersSubsection);

var _backupSubsection = require('./backup-subsection');

var _backupSubsection2 = _interopRequireDefault(_backupSubsection);

var _emailsSubsection = require('./emails-subsection');

var _emailsSubsection2 = _interopRequireDefault(_emailsSubsection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SettingsComponents = function (_React$Component) {
    (0, _inherits3.default)(SettingsComponents, _React$Component);

    function SettingsComponents(props) {
        (0, _classCallCheck3.default)(this, SettingsComponents);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SettingsComponents).call(this, props));

        _this.state = {
            showing: 'accounts'
        };
        return _this;
    }

    (0, _createClass3.default)(SettingsComponents, [{
        key: 'show',
        value: function show(which) {
            var _this2 = this;

            return function () {
                _this2.setState({
                    showing: which
                });
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var self = this;
            function maybeActive(name) {
                return self.state.showing === name ? 'active' : '';
            }

            var Tab = void 0;
            switch (this.state.showing) {
                case 'accounts':
                    Tab = React.createElement(_bankAccountsSubsection2.default, null);
                    break;
                case 'defaults':
                    Tab = React.createElement(_defaultParametersSubsection2.default, null);
                    break;
                case 'about':
                    Tab = React.createElement(_about2.default, null);
                    break;
                case 'backup':
                    Tab = React.createElement(_backupSubsection2.default, null);
                    break;
                case 'weboob':
                    Tab = React.createElement(_weboobParameters2.default, null);
                    break;
                case 'emails':
                    Tab = React.createElement(_emailsSubsection2.default, null);
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
                                    { className: 'collapse navbar-collapse sidebar-navbar-collapse',
                                        id: 'settings-menu-collapse' },
                                    React.createElement(
                                        'ul',
                                        { className: 'nav nav-pills nav-stacked' },
                                        React.createElement(
                                            'li',
                                            { role: 'presentation',
                                                className: maybeActive('accounts') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('accounts') },
                                                (0, _helpers.translate)('client.settings.tab_accounts')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation',
                                                className: maybeActive('emails') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('emails') },
                                                (0, _helpers.translate)('client.settings.tab_emails')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation',
                                                className: maybeActive('defaults') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('defaults') },
                                                (0, _helpers.translate)('client.settings.tab_defaults')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation',
                                                className: maybeActive('backup') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('backup') },
                                                (0, _helpers.translate)('client.settings.tab_backup')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation',
                                                className: maybeActive('weboob') },
                                            React.createElement(
                                                'a',
                                                { href: '#', onClick: this.show('weboob') },
                                                (0, _helpers.translate)('client.settings.tab_weboob')
                                            )
                                        ),
                                        React.createElement(
                                            'li',
                                            { role: 'presentation',
                                                className: maybeActive('about') },
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

},{"../../helpers":59,"../shared/weboob-parameters":45,"./about":22,"./backup-subsection":28,"./bank-accounts-subsection":29,"./default-parameters-subsection":33,"./emails-subsection":35,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _confirmDeleteModal = require('../ui/confirm-delete-modal');

var _confirmDeleteModal2 = _interopRequireDefault(_confirmDeleteModal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReportItem = function (_React$Component) {
    (0, _inherits3.default)(ReportItem, _React$Component);

    function ReportItem(props) {
        (0, _classCallCheck3.default)(this, ReportItem);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ReportItem).call(this, props));

        _this.handleOnSelectChange = _this.handleOnSelectChange.bind(_this);
        _this.handleOnDelete = _this.handleOnDelete.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ReportItem, [{
        key: 'handleOnSelectChange',
        value: function handleOnSelectChange() {
            var newValue = this.refs.selector.getDOMNode().value;
            if (newValue === this.props.alert.order) return;
            _store.Actions.updateAlert(this.props.alert, { frequency: newValue });
        }
    }, {
        key: 'handleOnDelete',
        value: function handleOnDelete() {
            _store.Actions.deleteAlert(this.props.alert);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var account = _props.account;
            var alert = _props.alert;


            (0, _helpers.has)(alert, 'frequency');
            (0, _helpers.assert)(alert.type === 'report');

            return React.createElement(
                'tr',
                null,
                React.createElement(
                    'td',
                    { className: 'col-md-3' },
                    account.title
                ),
                React.createElement(
                    'td',
                    { className: 'col-md-3' },
                    React.createElement(
                        'span',
                        { className: 'condition' },
                        (0, _helpers.translate)('client.settings.emails.send_report')
                    )
                ),
                React.createElement(
                    'td',
                    { className: 'col-md-5 frequency' },
                    React.createElement(
                        'select',
                        { className: 'form-control pull-right',
                            defaultValue: alert.frequency,
                            ref: 'selector',
                            onChange: this.handleOnSelectChange },
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
                ),
                React.createElement(
                    'td',
                    { className: 'col-md-1' },
                    React.createElement('span', { className: 'pull-right fa fa-times-circle', 'aria-label': 'remove',
                        'data-toggle': 'modal',
                        'data-target': '#confirmDeleteAlert' + alert.id,
                        title: (0, _helpers.translate)('client.settings.emails.delete_report') }),
                    React.createElement(_confirmDeleteModal2.default, {
                        modalId: 'confirmDeleteAlert' + alert.id,
                        modalBody: (0, _helpers.translate)('client.settings.emails.delete_report_full_text'),
                        onDelete: this.handleOnDelete
                    })
                )
            );
        }
    }]);
    return ReportItem;
}(React.Component);

exports.default = ReportItem;

},{"../../helpers":59,"../../store":62,"../ui/confirm-delete-modal":52,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

var _createReportModal = require('./create-report-modal');

var _createReportModal2 = _interopRequireDefault(_createReportModal);

var _report = require('./report');

var _report2 = _interopRequireDefault(_report);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Reports = function (_React$Component) {
    (0, _inherits3.default)(Reports, _React$Component);

    function Reports(props) {
        (0, _classCallCheck3.default)(this, Reports);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Reports).call(this, props));

        _this.state = {
            alerts: _store.store.getAlerts('report')
        };
        _this.onAlertChange = _this.onAlertChange.bind(_this);
        return _this;
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
                return React.createElement(_report2.default, {
                    key: pair.alert.id,
                    alert: pair.alert,
                    account: pair.account
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
                        (0, _helpers.translate)('client.settings.emails.reports_title')
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: 'option-legend fa fa-plus-circle', 'aria-label': 'create report',
                            'data-toggle': 'modal', 'data-target': '#report-creation' })
                    )
                ),
                React.createElement(_createReportModal2.default, null),
                React.createElement(
                    'div',
                    { className: 'table-responsive' },
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
                                React.createElement('th', null),
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

exports.default = Reports;

},{"../../helpers":59,"../../store":62,"./create-report-modal":32,"./report":37,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],39:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _errors = require('../../errors');

var _errors2 = _interopRequireDefault(_errors);

var _customBankField = require('./custom-bank-field');

var _customBankField2 = _interopRequireDefault(_customBankField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NewBankForm = function (_React$Component) {
    (0, _inherits3.default)(NewBankForm, _React$Component);

    function NewBankForm(props) {
        (0, _classCallCheck3.default)(this, NewBankForm);

        (0, _helpers.has)(props, 'expanded');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NewBankForm).call(this, props));

        var state = _this.getStateForBank(_store.store.getStaticBanks()[0]);
        state.expanded = _this.props.expanded;
        _this.state = state;
        _this.handleChangeBank = _this.handleChangeBank.bind(_this);
        _this.handleSubmit = _this.handleSubmit.bind(_this);
        _this.handleToggleExpand = _this.handleToggleExpand.bind(_this);
        _this.handleReset = _this.handleReset.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(NewBankForm, [{
        key: 'handleToggleExpand',
        value: function handleToggleExpand() {
            var state = this.getStateForBank(_store.store.getStaticBanks()[0]);
            state.expanded = !this.state.expanded;
            this.setState(state);
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
        key: 'getStateForBank',
        value: function getStateForBank(bank) {
            (0, _helpers.assert)(typeof bank !== 'undefined', 'There should be at least one bank in the list');
            return {
                bankUuid: bank.uuid,
                customFields: bank.customFields || []
            };
        }
    }, {
        key: 'handleChangeBank',
        value: function handleChangeBank() {
            var uuid = this.domBank().value;
            var found = _store.store.getStaticBanks().filter(function (b) {
                return b.uuid === uuid;
            });
            (0, _helpers.assert)(found.length === 1, 'selected bank doesnt exist');
            var bank = found[0];
            this.setState(this.getStateForBank(bank));
            this.domBank().focus();
        }
    }, {
        key: 'handleSubmit',
        value: function handleSubmit(e) {
            var _this2 = this;

            e.preventDefault();

            var bank = this.domBank().value;
            var id = this.domId().value.trim();
            var pwd = this.domPassword().value.trim();

            var customFields = void 0;
            if (this.state.customFields.length) {
                customFields = this.state.customFields.map(function (field, index) {
                    return _this2.refs['customField' + index + _this2.state.bankUuid].getValue();
                });
            }

            if (!id.length || !pwd.length) {
                alert((0, _helpers.translate)('client.settings.missing_login_or_password'));
                return;
            }

            _store.store.once(_store.State.sync, this._afterSync.bind(this));
            _store.Actions.createBank(bank, id, pwd, customFields);
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
                    alert((0, _helpers.translate)('client.sync.invalid_parameters', { content: err.content || '?' }));
                    break;
                case _errors2.default.EXPIRED_PASSWORD:
                    alert((0, _helpers.translate)('client.sync.expired_password'));
                    break;
                case _errors2.default.UNKNOWN_MODULE:
                    alert((0, _helpers.translate)('client.sync.unknown_module'));
                    break;
                default:
                    (0, _errors.genericErrorHandler)(err);
                    break;
            }
        }
    }, {
        key: 'handleReset',
        value: function handleReset() {
            this.setState(this.getStateForBank(_store.store.getStaticBanks()[0]));
            this.refs.form.getDOMNode().reset();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

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
                if (this.state.customFields.length > 0) {
                    maybeCustomFields = this.state.customFields.map(function (field, index) {
                        return React.createElement(_customBankField2.default, {
                            ref: 'customField' + index + _this3.state.bankUuid,
                            params: field,
                            key: 'customField' + index + _this3.state.bankUuid
                        });
                    });
                } else {
                    maybeCustomFields = React.createElement('div', null);
                }

                maybeForm = React.createElement(
                    'div',
                    { className: 'panel-body transition-expand' },
                    React.createElement(
                        'form',
                        { ref: 'form', onSubmit: this.handleSubmit },
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
                                { className: 'form-control', id: 'bank', ref: 'bank',
                                    onChange: this.handleChangeBank,
                                    defaultValue: this.state.bankUuid },
                                options
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'form-group' },
                            React.createElement(
                                'div',
                                { className: 'row' },
                                React.createElement(
                                    'div',
                                    { className: 'col-sm-6' },
                                    React.createElement(
                                        'label',
                                        { htmlFor: 'id' },
                                        (0, _helpers.translate)('client.settings.login')
                                    ),
                                    React.createElement('input', { type: 'text', className: 'form-control', id: 'id',
                                        ref: 'id'
                                    })
                                ),
                                React.createElement(
                                    'div',
                                    { className: 'col-sm-6' },
                                    React.createElement(
                                        'label',
                                        { htmlFor: 'password' },
                                        (0, _helpers.translate)('client.settings.password')
                                    ),
                                    React.createElement('input', { type: 'password', className: 'form-control', id: 'password',
                                        ref: 'password'
                                    })
                                )
                            )
                        ),
                        maybeCustomFields,
                        React.createElement(
                            'div',
                            { className: 'btn-toolbar pull-right' },
                            React.createElement(
                                'button',
                                { type: 'reset',
                                    className: 'btn btn-default',
                                    onClick: this.handleReset },
                                (0, _helpers.translate)('client.settings.reset')
                            ),
                            React.createElement('input', { type: 'submit',
                                className: 'btn btn-primary',
                                value: (0, _helpers.translate)('client.settings.submit')
                            })
                        )
                    )
                );
            }

            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading clickable',
                        onClick: this.handleToggleExpand },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.settings.new_bank_form_title')
                    ),
                    React.createElement(
                        'div',
                        { className: 'panel-options' },
                        React.createElement('span', { className: 'option-legend fa fa-' + (this.state.expanded ? 'minus' : 'plus') + '-circle',
                            'aria-label': 'add',
                            title: (0, _helpers.translate)('client.settings.add_bank_button') })
                    )
                ),
                maybeForm
            );
        }
    }]);
    return NewBankForm;
}(React.Component);

exports.default = NewBankForm;

},{"../../errors":56,"../../helpers":59,"../../store":62,"./custom-bank-field":40,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],40:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

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
                value: this.props.params.type === 'number' ? parseInt(node.value, 10) : node.value
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var customFieldFormInput = void 0,
                customFieldOptions = void 0,
                defaultValue = void 0;

            switch (this.props.params.type) {
                case 'select':
                    customFieldOptions = this.props.params.values.map(function (opt) {
                        return React.createElement(
                            'option',
                            { key: opt.value, value: opt.value },
                            opt.label
                        );
                    });
                    defaultValue = this.props.params.currentValue || this.props.params.default;
                    customFieldFormInput = React.createElement(
                        'select',
                        { name: this.props.params.name,
                            className: 'form-control',
                            id: this.props.params.name,
                            ref: 'field',
                            defaultValue: defaultValue },
                        customFieldOptions
                    );
                    break;

                case 'text':
                case 'number':
                case 'password':
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

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],41:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Global variables
var ImportModule = function (_React$Component) {
    (0, _inherits3.default)(ImportModule, _React$Component);

    function ImportModule(props) {
        (0, _classCallCheck3.default)(this, ImportModule);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ImportModule).call(this, props));

        _this.handleImport = _this.handleImport.bind(_this);
        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ImportModule, [{
        key: 'handleImport',
        value: function handleImport(e) {

            var $importFile = document.getElementById('importFile');
            if (!$importFile || !$importFile.files || !$importFile.files.length) {
                alert((0, _helpers.translate)('client.settings.no_file_selected'));
                e.preventDefault();
                return;
            }

            var fileReader = new FileReader();
            fileReader.onload = function (err) {
                var asText = err.target.result;
                var asJSON = void 0;
                try {
                    asJSON = JSON.parse(asText);
                    _store.Actions.importInstance({
                        content: asJSON
                    });
                } catch (jsonParseError) {
                    if (jsonParseError instanceof SyntaxError) {
                        alert('JSON file to import isnt valid!');
                    } else {
                        alert('Unexpected error: ' + jsonParseError.message);
                    }
                }
            };
            fileReader.readAsText($importFile.files[0]);

            $importFile.value = '';
            this.refs.fileName.getDOMNode().value = '';
            e.preventDefault();
            return;
        }
    }, {
        key: 'handleChange',
        value: function handleChange(e) {
            this.refs.fileName.getDOMNode().value = e.target.value;
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'input-group import-file' },
                React.createElement('input', { type: 'text', className: 'form-control', readOnly: true,
                    ref: 'fileName'
                }),
                React.createElement(
                    'span',
                    { className: 'input-group-btn' },
                    React.createElement(
                        'div',
                        { className: 'btn btn-primary btn-file' },
                        (0, _helpers.translate)('client.settings.browse'),
                        React.createElement('input', { type: 'file', name: 'importFile', id: 'importFile',
                            onChange: this.handleChange
                        })
                    )
                ),
                React.createElement(
                    'span',
                    { className: 'input-group-btn' },
                    React.createElement(
                        'button',
                        {
                            id: 'importInstance',
                            className: 'btn btn-primary',
                            onClick: this.handleImport },
                        (0, _helpers.translate)('client.settings.go_import_instance')
                    )
                )
            );
        }
    }]);
    return ImportModule;
}(React.Component);

exports.default = ImportModule;

},{"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],42:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _helpers = require('../../helpers');

var _selectWithDefault = require('./select-with-default');

var _selectWithDefault2 = _interopRequireDefault(_selectWithDefault);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OpCatChartPeriodSelect = function (_SelectWithDefault) {
    (0, _inherits3.default)(OpCatChartPeriodSelect, _SelectWithDefault);

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
}(_selectWithDefault2.default);

exports.default = OpCatChartPeriodSelect;

},{"../../helpers":59,"./select-with-default":44,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],43:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _helpers = require('../../helpers');

var _selectWithDefault = require('./select-with-default');

var _selectWithDefault2 = _interopRequireDefault(_selectWithDefault);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OpCatChartTypeSelect = function (_SelectWithDefault) {
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
}(_selectWithDefault2.default);

exports.default = OpCatChartTypeSelect;

},{"../../helpers":59,"./select-with-default":44,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],44:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SelectWithDefault = function (_React$Component) {
    (0, _inherits3.default)(SelectWithDefault, _React$Component);

    function SelectWithDefault(props, options) {
        (0, _classCallCheck3.default)(this, SelectWithDefault);

        (0, _helpers.has)(props, 'defaultValue');
        (0, _helpers.has)(props, 'onChange');
        (0, _helpers.has)(props, 'htmlId');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SelectWithDefault).call(this, props));

        _this.options = options;
        return _this;
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

exports.default = SelectWithDefault;

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _store = require('../../store');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BoolSetting = function (_React$Component) {
    (0, _inherits3.default)(BoolSetting, _React$Component);

    function BoolSetting(props) {
        (0, _classCallCheck3.default)(this, BoolSetting);

        (0, _helpers.has)(props, 'label');
        (0, _helpers.has)(props, 'setting');
        (0, _helpers.has)(props, 'onChange');
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BoolSetting).call(this, props));
    }

    (0, _createClass3.default)(BoolSetting, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'form-group clearfix' },
                React.createElement(
                    'label',
                    { className: 'col-xs-4 control-label' },
                    this.props.label
                ),
                React.createElement(
                    'div',
                    { className: 'col-xs-8' },
                    React.createElement('input', {
                        type: 'checkbox',
                        defaultChecked: _store.store.getBoolSetting(this.props.setting),
                        onChange: this.props.onChange
                    })
                )
            );
        }
    }]);
    return BoolSetting;
}(React.Component);

var WeboobParameters = function (_React$Component2) {
    (0, _inherits3.default)(WeboobParameters, _React$Component2);

    function WeboobParameters(props) {
        (0, _classCallCheck3.default)(this, WeboobParameters);

        var _this2 = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(WeboobParameters).call(this, props));

        _this2.onUpdated = _this2.onUpdated.bind(_this2);
        _this2.handleFireUpdate = _this2.handleFireUpdate.bind(_this2);
        _this2.state = {
            isUpdatingWeboob: false
        };
        return _this2;
    }

    (0, _createClass3.default)(WeboobParameters, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            _store.store.on(_store.State.weboob, this.onUpdated);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            _store.store.removeListener(_store.State.weboob, this.onUpdated);
        }
    }, {
        key: 'handleFireUpdate',
        value: function handleFireUpdate() {
            _store.Actions.updateWeboob();
            this.setState({
                isUpdatingWeboob: true
            });
        }
    }, {
        key: 'onUpdated',
        value: function onUpdated() {
            this.setState({
                isUpdatingWeboob: false
            });
        }
    }, {
        key: 'handleToggleAutoMergeAccounts',
        value: function handleToggleAutoMergeAccounts(e) {
            var newValue = e.target.checked;
            _store.Actions.changeBoolSetting('weboob-auto-merge-accounts', newValue);
        }
    }, {
        key: 'handleToggleAutoUpdate',
        value: function handleToggleAutoUpdate(e) {
            var newValue = e.target.checked;
            _store.Actions.changeBoolSetting('weboob-auto-update', newValue);
        }
    }, {
        key: 'handleToggleEnableDebug',
        value: function handleToggleEnableDebug(e) {
            var newValue = e.target.checked;
            _store.Actions.changeBoolSetting('weboob-enable-debug', newValue);
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'top-panel panel panel-default' },
                React.createElement(
                    'div',
                    { className: 'panel-heading' },
                    React.createElement(
                        'h3',
                        { className: 'title panel-title' },
                        (0, _helpers.translate)('client.settings.tab_weboob')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'panel-body' },
                    React.createElement(
                        'form',
                        null,
                        React.createElement(
                            'div',
                            { className: 'form-group clearfix' },
                            React.createElement(
                                'label',
                                { htmlFor: 'updateWeboob', className: 'col-xs-4 control-label' },
                                (0, _helpers.translate)('client.settings.weboob_version')
                            ),
                            React.createElement(
                                'label',
                                { className: 'col-xs-8 text-info' },
                                _store.store.getSetting('weboob-version')
                            )
                        ),
                        React.createElement(BoolSetting, {
                            label: (0, _helpers.translate)('client.settings.weboob_enable_debug'),
                            setting: 'weboob-enable-debug',
                            onChange: this.handleToggleEnableDebug
                        }),
                        React.createElement(BoolSetting, {
                            label: (0, _helpers.translate)('client.settings.weboob_auto_merge_accounts'),
                            setting: 'weboob-auto-merge-accounts',
                            onChange: this.handleToggleAutoMergeAccounts
                        }),
                        React.createElement(BoolSetting, {
                            label: (0, _helpers.translate)('client.settings.weboob_auto_update'),
                            setting: 'weboob-auto-update',
                            onChange: this.handleToggleAutoUpdate
                        }),
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
                                        onClick: this.handleFireUpdate,
                                        disabled: this.state.isUpdatingWeboob ? 'disabled' : false },
                                    (0, _helpers.translate)('client.settings.go_update_weboob')
                                ),
                                React.createElement(
                                    'span',
                                    { className: 'help-block' },
                                    (0, _helpers.translate)('client.settings.update_weboob_help')
                                )
                            )
                        )
                    )
                )
            );
        }
    }]);
    return WeboobParameters;
}(React.Component);

exports.default = WeboobParameters;

},{"../../helpers":59,"../../store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],46:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SelectableButtonComponent = function (_React$Component) {
    (0, _inherits3.default)(SelectableButtonComponent, _React$Component);

    function SelectableButtonComponent(props) {
        (0, _classCallCheck3.default)(this, SelectableButtonComponent);

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SelectableButtonComponent).call(this, props));

        _this.state = {
            editMode: false
        };
        _this.handleToggleEdit = _this.handleToggleEdit.bind(_this);
        _this.handleToggleStatic = _this.handleToggleStatic.bind(_this);
        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(SelectableButtonComponent, [{
        key: "dom",
        value: function dom() {
            return this.refs.select.getDOMNode();
        }
    }, {
        key: "handleChange",
        value: function handleChange() {
            var selectedId = this.dom().value;
            this.props.onSelectId(selectedId);
            this.handleToggleStatic();
        }
    }, {
        key: "handleToggleEdit",
        value: function handleToggleEdit() {
            this.setState({ editMode: true }, function () {
                this.dom().focus();
            });
        }
    }, {
        key: "handleToggleStatic",
        value: function handleToggleStatic() {
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
                        onClick: this.handleToggleEdit },
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
                    onChange: this.handleChange,
                    onBlur: this.handleToggleStatic,
                    defaultValue: selectedId,
                    ref: "select" },
                options
            );
        }
    }]);
    return SelectableButtonComponent;
}(React.Component);

exports.default = SelectableButtonComponent;

},{"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _buttonSelect = require('./button-select');

var _buttonSelect2 = _interopRequireDefault(_buttonSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CategorySelect = function (_React$Component) {
    (0, _inherits3.default)(CategorySelect, _React$Component);

    function CategorySelect(props) {
        (0, _classCallCheck3.default)(this, CategorySelect);

        (0, _helpers.has)(props, 'operation');
        (0, _helpers.has)(props, 'onSelectId');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(CategorySelect).call(this, props));

        _this.handleSelectId = _this.props.onSelectId.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(CategorySelect, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var getThisCategoryId = function getThisCategoryId() {
                return _this2.props.operation.categoryId;
            };
            var getCategoryTitle = function getCategoryTitle(id) {
                return _store.store.getCategoryFromId(id).title;
            };
            return React.createElement(_buttonSelect2.default, {
                operation: this.props.operation,
                optionsArray: _store.store.getCategories(),
                selectedId: getThisCategoryId,
                idToLabel: getCategoryTitle,
                onSelectId: this.handleSelectId
            });
        }
    }]);
    return CategorySelect;
}(React.Component);

exports.default = CategorySelect;

},{"../../helpers":59,"../../store":62,"./button-select":46,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _datePicker = require('./date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValidableInputDate = function (_React$Component) {
    (0, _inherits3.default)(ValidableInputDate, _React$Component);

    function ValidableInputDate(props) {
        (0, _classCallCheck3.default)(this, ValidableInputDate);

        (0, _helpers.has)(props, 'returnInputValue');
        (0, _helpers.has)(props, 'inputID');
        (0, _helpers.has)(props, 'label');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ValidableInputDate).call(this, props));

        _this.state = { valid: false };
        _this.handleSelect = _this.handleSelect.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ValidableInputDate, [{
        key: 'clear',
        value: function clear() {
            this.refs.inputdate.clear();
            this.handleSelect('');
        }
    }, {
        key: 'showValidity',
        value: function showValidity() {
            if (this.state.valid) {
                return React.createElement('span', { className: 'fa fa-check form-control-feedback', 'aria-hidden': 'true' });
            }
            return React.createElement('span', { className: 'fa fa-times form-control-feedback', 'aria-hidden': 'true' });
        }
    }, {
        key: 'handleSelect',
        value: function handleSelect(date) {
            var hasDate = !!date;
            this.setState({ valid: hasDate }, this.props.returnInputValue(hasDate ? date : null));
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
                React.createElement(_datePicker2.default, { id: this.props.inputID,
                    required: true,
                    onSelect: this.handleSelect,
                    ref: 'inputdate'
                }),
                this.showValidity()
            );
        }
    }]);
    return ValidableInputDate;
}(React.Component);

exports.default = ValidableInputDate;

},{"../../helpers":59,"./date-picker":53,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

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

        _this.state = { valid: false };
        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ValidableInputNumber, [{
        key: 'clear',
        value: function clear() {
            this.refs.number.getDOMNode().value = '';
            this.handleChange();
        }
    }, {
        key: 'handleChange',
        value: function handleChange() {
            var number = (0, _parseFloat2.default)(this.refs.number.getDOMNode().value.trim());
            if (!(0, _isNan2.default)(number) && (0, _isFinite2.default)(number) && 1 / number !== -Infinity) {
                this.setState({ valid: true }, this.props.returnInputValue(number));
            } else {
                this.setState({ valid: false }, this.props.returnInputValue(null));
            }
        }
    }, {
        key: 'showValidity',
        value: function showValidity() {
            if (this.state.valid) {
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
                    step: this.props.step, ref: 'number', onChange: this.handleChange,
                    required: true
                }),
                this.showValidity()
            );
        }
    }]);
    return ValidableInputNumber;
}(React.Component);

exports.default = ValidableInputNumber;

},{"../../helpers":59,"babel-runtime/core-js/number/is-finite":68,"babel-runtime/core-js/number/is-nan":69,"babel-runtime/core-js/number/parse-float":70,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValidableInputText = function (_React$Component) {
    (0, _inherits3.default)(ValidableInputText, _React$Component);

    function ValidableInputText(props) {
        (0, _classCallCheck3.default)(this, ValidableInputText);

        (0, _helpers.has)(props, 'returnInputValue');
        (0, _helpers.has)(props, 'inputID');
        (0, _helpers.has)(props, 'label');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ValidableInputText).call(this, props));

        _this.state = { valid: false };
        _this.handleChange = _this.handleChange.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(ValidableInputText, [{
        key: 'handleChange',
        value: function handleChange() {
            var title = this.refs.text.getDOMNode().value.trim();
            if (title.length > 0) {
                this.setState({ valid: true }, this.props.returnInputValue(title));
            } else {
                this.setState({ valid: false }, this.props.returnInputValue(null));
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.refs.text.getDOMNode().value = '';
            this.handleChange();
        }
    }, {
        key: 'showValidity',
        value: function showValidity() {
            if (this.state.valid) {
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
                    ref: 'text', required: true,
                    onChange: this.handleChange
                }),
                this.showValidity()
            );
        }
    }]);
    return ValidableInputText;
}(React.Component);

exports.default = ValidableInputText;

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals Modernizr: false */
var ColorPicker = function (_React$Component) {
    (0, _inherits3.default)(ColorPicker, _React$Component);

    function ColorPicker() {
        (0, _classCallCheck3.default)(this, ColorPicker);
        return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ColorPicker).apply(this, arguments));
    }

    (0, _createClass3.default)(ColorPicker, [{
        key: 'getValue',
        value: function getValue() {
            return this.refs.picker.getDOMNode().value;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (!Modernizr.inputtypes.color) $(this.refs.picker.getDOMNode()).minicolors().parent().css('width', '100%');
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (!Modernizr.inputtypes.color) $(this.refs.picker.getDOMNode()).minicolors('destroy');
        }
    }, {
        key: 'render',
        value: function render() {
            function generateColor() {
                var convertRGBToHex = function convertRGBToHex(rgb) {
                    var hexRed = rgb.r.toString(16).toUpperCase();
                    if (hexRed.length < 2) hexRed += hexRed;

                    var hexGreen = rgb.g.toString(16).toUpperCase();
                    if (hexGreen.length < 2) hexGreen += hexGreen;

                    var hexBlue = rgb.b.toString(16).toUpperCase();
                    if (hexBlue.length < 2) hexBlue += hexBlue;

                    return '#' + hexRed + hexGreen + hexBlue;
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

            return React.createElement('input', {
                type: Modernizr.inputtypes.color ? 'color' : 'hidden',
                className: 'form-control',
                defaultValue: this.props.defaultValue || generateColor(),
                ref: 'picker'
            });
        }
    }]);
    return ColorPicker;
}(React.Component);

exports.default = ColorPicker;

},{"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82,"babel-runtime/helpers/slicedToArray":83}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

var _modal = require('./modal');

var _modal2 = _interopRequireDefault(_modal);

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
                    {
                        type: 'button',
                        className: 'btn btn-default',
                        'data-dismiss': 'modal' },
                    (0, _helpers.translate)('client.confirmdeletemodal.dont_delete')
                ),
                React.createElement(
                    'button',
                    {
                        type: 'button',
                        className: 'btn btn-danger',
                        'data-dismiss': 'modal',
                        onClick: this.props.onDelete },
                    (0, _helpers.translate)('client.confirmdeletemodal.confirm')
                )
            );

            return React.createElement(_modal2.default, { modalId: this.props.modalId,
                modalBody: this.props.modalBody,
                modalTitle: modalTitle,
                modalFooter: modalFooter
            });
        }
    }]);
    return ConfirmDeleteModal;
}(React.Component);

exports.default = ConfirmDeleteModal;

},{"../../helpers":59,"./modal":54,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],53:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

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

            var pickerOptions = this.generateLocalizationObject();
            pickerOptions = this.setMaxOrMin(pickerOptions, this.props);
            var input = this.refs.elem.getDOMNode();
            this.pickadate = $(input).pickadate(pickerOptions).pickadate('picker');
            this.pickadate.on('set', function (value) {
                if ((0, _helpers.maybeHas)(value, 'clear') && _this2.props.onSelect) {
                    _this2.props.onSelect(null);
                } else if ((0, _helpers.maybeHas)(value, 'select')) {
                    var actualDate = new Date(value.select);

                    // pickadate returns UTC time, fix the timezone offset.
                    actualDate.setMinutes(actualDate.getMinutes() - actualDate.getTimezoneOffset());

                    if (_this2.props.onSelect) _this2.props.onSelect(+actualDate);
                }
            });
        }
    }, {
        key: 'setMaxOrMin',
        value: function setMaxOrMin(pickerOptions, props) {
            // Maybe a minimum or maximum value is set
            pickerOptions.max = props.maxDate ? new Date(props.maxDate) : false;
            pickerOptions.min = props.minDate ? new Date(props.minDate) : false;
            return pickerOptions;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            var pickerOptions = this.setMaxOrMin({}, newProps);
            this.pickadate.set(pickerOptions);
        }
    }, {
        key: 'localizationTable',
        value: function localizationTable(prefix, tableToLocalize) {
            return tableToLocalize.map(function (element) {
                return (0, _helpers.translate)('client.datepicker.' + prefix + '.' + element);
            });
        }
    }, {
        key: 'generateLocalizationObject',
        value: function generateLocalizationObject() {
            var monthTable = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            var weekdaysTable = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            return {
                monthsFull: this.localizationTable('monthsFull', monthTable),
                monthsShort: this.localizationTable('monthsShort', monthTable),
                weekdaysFull: this.localizationTable('weekdaysFull', weekdaysTable),
                weekdaysShort: this.localizationTable('weekdaysShort', weekdaysTable),
                today: (0, _helpers.translate)('client.datepicker.today'),
                clear: (0, _helpers.translate)('client.datepicker.clear'),
                close: (0, _helpers.translate)('client.datepicker.close'),
                firstDay: (0, _helpers.translate)('client.datepicker.firstDay'),
                format: (0, _helpers.translate)('client.datepicker.format'),
                formatSubmit: (0, _helpers.translate)('client.datepicker.formatSubmit'),
                labelMonthNext: (0, _helpers.translate)('client.datepicker.labelMonthNext'),
                labelMonthSelect: (0, _helpers.translate)('client.datepicker.labelMonthSelect'),
                labelYearSelect: (0, _helpers.translate)('client.datepicker.labelYearSelect')
            };
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.pickadate.clear();
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

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],54:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _helpers = require('../../helpers');

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

},{"../../helpers":59,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _store = require('../../store');

var _helpers = require('../../helpers');

var _buttonSelect = require('./button-select');

var _buttonSelect2 = _interopRequireDefault(_buttonSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OperationTypeSelectComponent = function (_React$Component) {
    (0, _inherits3.default)(OperationTypeSelectComponent, _React$Component);

    function OperationTypeSelectComponent(props) {
        (0, _classCallCheck3.default)(this, OperationTypeSelectComponent);

        (0, _helpers.has)(props, 'onSelectId');
        (0, _helpers.has)(props, 'operation');

        var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(OperationTypeSelectComponent).call(this, props));

        _this.handleSelectId = _this.props.onSelectId.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(OperationTypeSelectComponent, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var getThisTypeId = function getThisTypeId() {
                return _this2.props.operation.operationTypeID;
            };
            var getTypeLabel = function getTypeLabel(id) {
                return _store.store.operationTypeToLabel(id);
            };
            return React.createElement(_buttonSelect2.default, {
                operation: this.props.operation,
                optionsArray: _store.store.getOperationTypes(),
                selectedId: getThisTypeId,
                idToLabel: getTypeLabel,
                onSelectId: this.handleSelectId
            });
        }
    }]);
    return OperationTypeSelectComponent;
}(React.Component);

exports.default = OperationTypeSelectComponent;

},{"../../helpers":59,"../../store":62,"./button-select":46,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.genericErrorHandler = genericErrorHandler;
exports.maybeHandleSyncError = maybeHandleSyncError;

var _helpers = require('./helpers');

var _errors = require('../shared/errors.json');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */

function get(name) {
    if (typeof _errors2.default[name] !== 'undefined') return _errors2.default[name];
    throw 'unknown exception code!';
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
function genericErrorHandler(err) {
    // Show the error in the console
    console.error('A request has failed with the following information:\n- Code: ' + err.code + '\n- Message: ' + err.message + '\n- XHR Text: ' + err.xhrText + '\n- XHR Error: ' + err.xhrError + '\n- stringified: ' + (0, _stringify2.default)(err) + '\n- stack: ' + err.stack + '\n');

    var maybeCode = err.code ? ' (code ' + err.code + ')' : '';
    alert('Error: ' + err.message + maybeCode + '.\n          Please refer to the developers\' console for more information.');
}

function maybeHandleSyncError(err) {

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
            genericErrorHandler(err);
            break;
    }
}

},{"../shared/errors.json":184,"./helpers":59,"babel-runtime/core-js/json/stringify":66}],57:[function(require,module,exports){
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

},{"./invariant":58}],58:[function(require,module,exports){
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

},{}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.localeComparator = exports.NONE_CATEGORY_ID = exports.currency = exports.translate = exports.setupTranslator = exports.NYI = exports.has = exports.maybeHas = exports.assert = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.debug = debug;
exports.stringToColor = stringToColor;

var _helpers = require('../shared/helpers.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var assert = exports.assert = _helpers.assert; /*
                                                * HELPERS
                                                */

/* eslint no-console: 0 */

var maybeHas = exports.maybeHas = _helpers.maybeHas;
var has = exports.has = _helpers.has;
var NYI = exports.NYI = _helpers.NYI;
var setupTranslator = exports.setupTranslator = _helpers.setupTranslator;
var translate = exports.translate = _helpers.translate;
var currency = exports.currency = _helpers.currency;
var DEBUG = true;

function debug() {
    var _console;

    if (DEBUG) (_console = console).log.apply(_console, arguments);
}

var NONE_CATEGORY_ID = exports.NONE_CATEGORY_ID = '-1';

var localeComparator = exports.localeComparator = function () {
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

    return function (a, b) {
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
    for (var _i = 0; _i < 3; _i++) {
        var s = (hash >> _i * 8 & 0xFF).toString(16);
        while (s.length < 2) {
            s += '0';
        }color += s;
    }

    return color;
}

},{"../shared/helpers.js":185,"babel-runtime/core-js/map":67,"babel-runtime/helpers/typeof":84}],60:[function(require,module,exports){
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

var _accounts = require('./components/menu/accounts');

var _accounts2 = _interopRequireDefault(_accounts);

var _banks = require('./components/menu/banks');

var _banks2 = _interopRequireDefault(_banks);

var _categories = require('./components/categories');

var _categories2 = _interopRequireDefault(_categories);

var _charts = require('./components/charts');

var _charts2 = _interopRequireDefault(_charts);

var _operations = require('./components/operations');

var _operations2 = _interopRequireDefault(_operations);

var _duplicates = require('./components/duplicates');

var _duplicates2 = _interopRequireDefault(_duplicates);

var _settings = require('./components/settings');

var _settings2 = _interopRequireDefault(_settings);

var _accountWizard = require('./components/init/account-wizard');

var _accountWizard2 = _interopRequireDefault(_accountWizard);

var _weboobReadme = require('./components/init/weboob-readme');

var _weboobReadme2 = _interopRequireDefault(_weboobReadme);

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
                return React.createElement(_weboobReadme2.default, null);
            }

            if (_store.store.getCurrentBank() === null) {
                return React.createElement(_accountWizard2.default, null);
            }

            var mainComponent = void 0;
            var showing = this.state.showing;
            switch (showing) {
                case 'reports':
                    mainComponent = React.createElement(_operations2.default, null);
                    break;
                case 'charts':
                    mainComponent = React.createElement(_charts2.default, null);
                    break;
                case 'categories':
                    mainComponent = React.createElement(_categories2.default, null);
                    break;
                case 'similarities':
                    mainComponent = React.createElement(_duplicates2.default, null);
                    break;
                case 'settings':
                    mainComponent = React.createElement(_settings2.default, null);
                    break;
                default:
                    alert('unknown component to render: ' + showing + '!');
                    break;
            }

            function isActive(which) {
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
                        {
                            className: 'navbar-toggle',
                            'data-toggle': 'offcanvas',
                            'data-target': '.sidebar' },
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
                                { href: '#', className: 'app-title' },
                                (0, _helpers.translate)('client.KRESUS')
                            )
                        ),
                        React.createElement(
                            'div',
                            { className: 'banks-accounts-list' },
                            React.createElement(_banks2.default, null),
                            React.createElement(_accounts2.default, null)
                        ),
                        React.createElement(
                            'div',
                            { className: 'sidebar-section-list' },
                            React.createElement(
                                'ul',
                                null,
                                React.createElement(
                                    'li',
                                    {
                                        className: isActive('reports'),
                                        onClick: this.show('reports') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-briefcase' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.reports')
                                ),
                                React.createElement(
                                    'li',
                                    {
                                        className: isActive('charts'),
                                        onClick: this.show('charts') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-line-chart' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.charts')
                                ),
                                React.createElement(
                                    'li',
                                    {
                                        className: isActive('similarities'),
                                        onClick: this.show('similarities') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-clone' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.similarities')
                                ),
                                React.createElement(
                                    'li',
                                    {
                                        className: isActive('categories'),
                                        onClick: this.show('categories') },
                                    React.createElement(
                                        'i',
                                        { className: 'fa fa-list-ul' },
                                        ' '
                                    ),
                                    (0, _helpers.translate)('client.menu.categories')
                                ),
                                React.createElement(
                                    'li',
                                    {
                                        className: isActive('settings'),
                                        onClick: this.show('settings') },
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

},{"./components/categories":3,"./components/charts":6,"./components/duplicates":8,"./components/init/account-wizard":10,"./components/init/weboob-readme":11,"./components/menu/accounts":12,"./components/menu/banks":13,"./components/operations":17,"./components/settings":36,"./helpers":59,"./store":62,"babel-runtime/core-js/object/get-prototype-of":74,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79,"babel-runtime/helpers/inherits":81,"babel-runtime/helpers/possibleConstructorReturn":82}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Alert = exports.OperationType = exports.Setting = exports.Category = exports.Operation = exports.Account = exports.Bank = undefined;

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

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
    function Account(arg, defaultCurrency) {
        (0, _classCallCheck3.default)(this, Account);

        this.bank = (0, _helpers.has)(arg, 'bank') && arg.bank;
        this.bankAccess = (0, _helpers.has)(arg, 'bankAccess') && arg.bankAccess;
        this.title = (0, _helpers.has)(arg, 'title') && arg.title;
        this.accountNumber = (0, _helpers.has)(arg, 'accountNumber') && arg.accountNumber;
        this.initialAmount = (0, _helpers.has)(arg, 'initialAmount') && arg.initialAmount;
        this.lastChecked = (0, _helpers.has)(arg, 'lastChecked') && new Date(arg.lastChecked);
        this.id = (0, _helpers.has)(arg, 'id') && arg.id;
        this.iban = (0, _helpers.maybeHas)(arg, 'iban') && arg.iban || null;
        this.currency = (0, _helpers.maybeHas)(arg, 'currency') && _helpers.currency.isKnown(arg.currency) && arg.currency || defaultCurrency;
        this.formatCurrency = _helpers.currency.makeFormat(this.currency);
        this.currencySymbol = _helpers.currency.symbolFor(this.currency);

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
            this.currency = other.currency;
            this.formatCurrency = other.formatCurrency;
            this.currencySymbol = other.currencySymbol;
            // No need to merge ids, they're the same
        }
    }]);
    return Account;
}();

var Operation = exports.Operation = function Operation(arg, unknownTypeId) {
    (0, _classCallCheck3.default)(this, Operation);

    (0, _helpers.assert)(typeof unknownTypeId === 'string', 'unknown type id must be a string');
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
            (0, _helpers.assert)(other.id === this.id, 'merged categories ids must be equal');
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
        if (arg.type === 'report') (0, _helpers.assert)(['daily', 'weekly', 'monthly'].indexOf(arg.frequency) !== -1);

        // Data for balance/operation notifications
        this.limit = arg.type !== 'report' && (0, _helpers.has)(arg, 'limit') && arg.limit;
        this.order = arg.type !== 'report' && (0, _helpers.has)(arg, 'order') && arg.order;
        if (arg.type !== 'report') (0, _helpers.assert)(['lt', 'gt'].indexOf(arg.order) !== -1);
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

},{"./helpers":59,"babel-runtime/helpers/classCallCheck":78,"babel-runtime/helpers/createClass":79}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Actions = exports.store = exports.State = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _events = require('events');

var _helpers = require('./helpers');

var _models = require('./models');

var _dispatcher = require('./flux/dispatcher');

var _dispatcher2 = _interopRequireDefault(_dispatcher);

var _backend = require('./backend');

var backend = _interopRequireWildcard(_backend);

var _errors = require('./errors');

var _defaultSettings = require('../shared/default-settings');

var _defaultSettings2 = _interopRequireDefault(_defaultSettings);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var events = new _events.EventEmitter();

// Private data
var data = {
    categories: [],
    // maps category ids to categories
    categoryMap: new _map2.default(),

    currentBankId: null,
    currentAccountId: null,

    settings: new _map2.default(_defaultSettings2.default),

    // Map of Banks (id -> bank)
    // (Each bank has an "account" field which is a map (id -> account),
    //  each account has an "operation" field which is an array of Operation).
    banks: new _map2.default(),

    operationtypes: [],
    // Maps operation types to labels
    operationTypesLabel: new _map2.default(),

    alerts: [],

    // Contains static information about banks (name/uuid)
    StaticBanks: []
};

/*
 * EVENTS
 */
var Events = {
    forward: 'forward',
    // Events emitted by the user: clicks, submitting a form, etc.
    user: {
        changedPassword: 'the user changed the password of a bank access',
        changedSetting: 'the user changed a setting value',
        createdAlert: 'the user submitted an alert creation form',
        createdBank: 'the user submitted an access creation form',
        createdCategory: 'the user submitted a category creation form',
        createdOperation: 'the user created an operation for an account',
        deletedAccount: 'the user clicked in order to delete an account',
        deletedAlert: 'the user clicked in order to delete an alert',
        deletedBank: 'the user clicked in order to delete a bank',
        deletedCategory: 'the user clicked in order to delete a category',
        deletedOperation: 'the user clicked in order to delete an operation',
        fetchedAccounts: 'the user clicked in order to fetch new accounts/operations for a bank',
        fetchedOperations: 'the user clicked in order to fetch operations for a bank',
        importedInstance: 'the user sent a file to import a kresus instance',
        mergedOperations: 'the user clicked in order to merge two operations',
        selectedAccount: 'the user clicked in order to select an account',
        selectedBank: 'the user clicked to change the selected bank',
        updatedAlert: 'the user submitted an alert update form',
        updatedCategory: 'the user submitted a category update form',
        updatedOperationCategory: 'the user changed the category of an operation',
        updatedOperationType: 'the user changed the type of an operation',
        updatedOperationCustomLabel: 'the user updated the label of  an operation',
        updatedWeboob: 'the user asked to update weboob modules'
    },
    // Events emitted in an event loop: xhr callback, setTimeout/setInterval etc.
    server: {
        afterSync: 'new operations / accounts were fetched on the server.',
        deletedCategory: 'a category has just been deleted on the server',
        savedBank: 'a bank access was saved (created or updated) on the server.'
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

                    (0, _helpers.assert)(!accountMap.has(account.accountNumber), 'accountNumber should be globally unique');
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
            var alert = _step5.value;

            (0, _helpers.assert)(accountMap.has(alert.bankAccount), 'Unknown bank account for an alert: ' + alert.bankAccount);
            res.push({
                account: accountMap.get(alert.bankAccount),
                alert: alert
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

// Bool
store.getBoolSetting = function (key) {
    var val = store.getSetting(key);
    (0, _helpers.assert)(val === 'true' || val === 'false', 'A bool setting must be true or false');
    return val === 'true';
};

store.isWeboobInstalled = function () {
    if (!store.getBoolSetting('weboob-installed')) return false;

    var version = store.getSetting('weboob-version');
    return version !== '?' && version !== '1.0';
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
        return (0, _helpers.localeComparator)(ac, bc, data.settings.locale);
    });
}

function maybeSortSelectFields(field) {
    if ((0, _helpers.maybeHas)(field, 'values')) {
        field.values.sort(function (a, b) {
            return (0, _helpers.localeComparator)(a.label, b.label, data.settings.locale);
        });
    }
}

function sortBanks(banks) {
    banks.sort(function (a, b) {
        return (0, _helpers.localeComparator)(a.name, b.name, data.settings.locale);
    });

    // Sort the selects of customFields by alphabetical order.
    banks.forEach(function (bank) {
        if (bank.customFields) bank.customFields.forEach(maybeSortSelectFields);
    });
}

function sortAccounts(accounts) {
    accounts.sort(function (a, b) {
        return (0, _helpers.localeComparator)(a.title, b.title, data.settings.locale);
    });
}

function getRelatedAccounts(bankId, accounts) {
    return accounts.filter(function (acc) {
        return acc.bank === bankId;
    });
}
function getRelatedOperations(accountNumber, operations) {
    return operations.filter(function (op) {
        return op.bankAccount === accountNumber;
    });
}

function operationFromPOD(unknownOperationTypeId) {
    return function (op) {
        return new _models.Operation(op, unknownOperationTypeId);
    };
}

function normalizeData(acc) {
    var d = new Date();
    if (d.getDate() === 1 && d.getMonth() === 3 && Math.random() > 0.42) {
        var _loop = function _loop(i) {
            var op = acc.operations[i];
            setTimeout(function () {
                if (op.amount < 0) {
                    op.amount = -op.amount;
                    op.customLabel = 'Erreur de la banque en votre faveur : ' + (op.title.length > 3 ? op.title : op.raw);
                    _dispatcher2.default.dispatch({
                        type: Events.forward,
                        event: State.operations
                    });
                }
            }, Math.random() * 60 * 1000);
        };

        for (var i = 0; i < 5 && i < acc.operations.length; i++) {
            _loop(i);
        }
    }
}

store.setupKresus = function (cb) {
    backend.init().then(function (world) {

        (0, _helpers.has)(world, 'settings');
        store.setSettings(world.settings);

        (0, _helpers.has)(world, 'banks');
        sortBanks(world.banks);

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
            for (var _iterator7 = (0, _getIterator3.default)(world.banks), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var bankPOD = _step7.value;

                var bank = new _models.Bank(bankPOD);

                var accounts = getRelatedAccounts(bank.uuid, world.accounts);
                if (!accounts.length) continue;

                // Found a bank with accounts.
                data.banks.set(bank.id, bank);

                sortAccounts(accounts);

                bank.accounts = new _map2.default();
                var defaultCurrency = store.getSetting('defaultCurrency');
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = (0, _getIterator3.default)(accounts), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var accPOD = _step9.value;

                        var acc = new _models.Account(accPOD, defaultCurrency);
                        bank.accounts.set(acc.id, acc);

                        acc.operations = getRelatedOperations(acc.accountNumber, world.operations).map(operationFromPOD(unknownOperationTypeId));

                        sortOperations(acc.operations);

                        if (!data.currentAccountId) {
                            data.currentAccountId = acc.id;
                            data.currentBankId = bank.id;
                        }

                        if (acc.id === defaultAccountId) {
                            data.currentAccountId = acc.id;
                            data.currentBankId = bank.id;
                        }
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

        if (data.currentAccountId) normalizeData(store.getAccount(data.currentAccountId));

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

        if (cb) cb();
    }).catch(_errors.genericErrorHandler);
};

store.updateWeboob = function () {
    backend.updateWeboob().then(function () {
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    }).catch(function (err) {
        (0, _errors.genericErrorHandler)(err);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.weboob
        });
    });
};

store.importInstance = function (content) {
    backend.importInstance(content).then(function () {
        // Reload all the things!
        _dispatcher2.default.dispatch({
            type: Events.server.savedBank
        });
    }).catch(_errors.genericErrorHandler);
};

// BANKS
store.addBank = function (uuid, id, pwd, maybeCustomFields) {
    backend.addBank(uuid, id, pwd, maybeCustomFields).then(function () {
        _dispatcher2.default.dispatch({
            type: Events.server.savedBank
        });
    }).catch(function (err) {
        // Don't use genericErrorHandler here, because of special handling.
        // TODO fix this ^
        _dispatcher2.default.dispatch({
            type: Events.afterSync,
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
    backend.deleteBank(bankId).then(function () {
        store.deleteBankFromStore(bankId);
    }).catch(_errors.genericErrorHandler);
};

// ACCOUNTS
store.loadAccounts = function (_ref) {
    var bankId = _ref.id;

    var defaultCurrency = store.getSetting('defaultCurrency');
    var accountFromPOD = function accountFromPOD(acc) {
        return new _models.Account(acc, defaultCurrency);
    };

    backend.getAccounts(bankId).then(function (podAccounts) {

        var accounts = podAccounts.map(accountFromPOD);

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
    }).catch(_errors.genericErrorHandler);
};

store.deleteAccount = function (accountId) {
    backend.deleteAccount(accountId).then(function () {

        var found = false;
        var bank = void 0;
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

        (0, _helpers.assert)(found, 'Deleted account must have been present in the first place');

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
    }).catch(_errors.genericErrorHandler);
};

store.fetchAccounts = function (bankId, accountId, accessId) {
    (0, _helpers.assert)(data.banks.has(bankId));

    backend.getNewAccounts(accessId).then(function () {
        var bank = data.banks.get(bankId);
        store.loadAccounts(bank);
        // Retrieve operations of all bank accounts
        var _iteratorNormalCompletion12 = true;
        var _didIteratorError12 = false;
        var _iteratorError12 = undefined;

        try {
            for (var _iterator12 = (0, _getIterator3.default)(bank.accounts.values()), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                var acc = _step12.value;

                store.loadOperationsFor(bankId, acc.id);
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
        // Don't use genericErrorHandler, we have a specific error handling
        // TODO fix this ^
        _dispatcher2.default.dispatch({
            type: Events.afterSync,
            maybeError: err
        });
    });
};

// OPERATIONS
store.loadOperationsFor = function (bankId, accountId) {
    backend.getOperations(accountId).then(function (operations) {

        var bank = data.banks.get(bankId);
        var acc = bank.accounts.get(accountId);
        var unknownOperationTypeId = store.getUnknownOperationType().id;
        acc.operations = operations.map(operationFromPOD(unknownOperationTypeId));

        sortOperations(acc.operations);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(_errors.genericErrorHandler);
};

store.fetchOperations = function () {
    (0, _helpers.assert)(data.currentBankId !== null);
    (0, _helpers.assert)(data.currentAccountId !== null);

    var accessId = this.getCurrentAccount().bankAccess;
    (0, _helpers.assert)(typeof accessId !== 'undefined', 'Need an access for syncing operations');

    backend.getNewOperations(accessId).then(function () {
        // Reload accounts, for updating the 'last updated' date.
        var currentBank = store.getCurrentBank();
        store.loadAccounts(currentBank);
        // Reload operations, obviously.
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
            for (var _iterator13 = (0, _getIterator3.default)(currentBank.accounts.values()), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                var acc = _step13.value;

                store.loadOperationsFor(currentBank.id, acc.id);
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
            type: Events.afterSync
        });
    }).catch(function (err) {
        // Don't use genericErrorHandler here, we have special error handling.
        // TODO fix this ^
        _dispatcher2.default.dispatch({
            type: Events.afterSync,
            maybeError: err
        });
    });
};

store.updateCategoryForOperation = function (operation, categoryId) {

    // The server expects an empty string for replacing by none
    var serverCategoryId = categoryId === _helpers.NONE_CATEGORY_ID ? '' : categoryId;

    backend.setCategoryForOperation(operation.id, serverCategoryId).then(function () {
        operation.categoryId = categoryId;
        // No need to forward at the moment?
    }).catch(_errors.genericErrorHandler);
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

                if (t.name === 'type.unknown') {
                    cached = t;
                    return cached;
                }
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

        (0, _helpers.assert)(false, 'OperationTypes should have an Unknown type!');
    };
}();

store.updateTypeForOperation = function (operation, type) {

    (0, _helpers.assert)(type !== null, 'operations with no type should have been handled in setupKresus');

    backend.setTypeForOperation(operation.id, type).then(function () {
        operation.operationTypeID = type;
        // No need to forward at the moment?
    }).catch(_errors.genericErrorHandler);
};

store.updateCustomLabelForOperation = function (operation, customLabel) {
    backend.setCustomLabel(operation.id, customLabel).then(function () {
        operation.customLabel = customLabel;
        // No need to forward at the moment?
    }).catch(_errors.genericErrorHandler);
};

store.deleteOperation = function (operation) {
    var operationId = operation.id;
    backend.deleteOperation(operationId).then(function () {
        store.deleteOperationOfCurrentAccount(operationId);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(_errors.genericErrorHandler);
};

store.deleteOperationOfCurrentAccount = function (operationId) {
    var toDeleteIdx = null;

    var operations = store.getCurrentOperations();
    for (var i = 0; i < operations.length; i++) {
        var _op = operations[i];
        if (_op.id === operationId) {
            toDeleteIdx = i;
            break;
        }
    }
    (0, _helpers.assert)(toDeleteIdx !== null);

    operations.splice(toDeleteIdx, 1);
};

store.mergeOperations = function (toKeepId, toRemoveId) {
    backend.mergeOperations(toKeepId, toRemoveId).then(function (newToKeep) {

        var ops = store.getCurrentOperations();
        var unknownOperationTypeId = store.getUnknownOperationType().id;

        var found = 0;
        var toDeleteIndex = null;
        for (var i = 0; i < ops.length; i++) {
            var _op2 = ops[i];
            if (_op2.id === toKeepId) {
                ops[i] = new _models.Operation(newToKeep, unknownOperationTypeId);
                if (++found === 2) break;
            } else if (_op2.id === toRemoveId) {
                toDeleteIndex = i;
                if (++found === 2) break;
            }
        }
        (0, _helpers.assert)(found === 2, 'both operations had to be present');
        (0, _helpers.assert)(toDeleteIndex !== null);

        ops.splice(toDeleteIndex, 1);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(_errors.genericErrorHandler);
};

// CATEGORIES
store.addCategory = function (category) {
    backend.addCategory(category).then(function (created) {

        store.triggerNewCategory(created);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.categories
        });
    }).catch(_errors.genericErrorHandler);
};

store.updateCategory = function (id, category) {
    backend.updateCategory(id, category).then(function (newCat) {

        store.triggerUpdateCategory(id, newCat);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.categories
        });
    }).catch(_errors.genericErrorHandler);
};

store.deleteCategory = function (id, replaceById) {
    (0, _helpers.assert)(typeof replaceById !== 'undefined');

    // The server expects an empty string if there's no replacement category.
    var serverReplaceById = replaceById === _helpers.NONE_CATEGORY_ID ? '' : replaceById;

    backend.deleteCategory(id, serverReplaceById).then(function () {
        store.triggerDeleteCategory(id, replaceById);
        _dispatcher2.default.dispatch({
            type: Events.server.deletedCategory
        });
    }).catch(_errors.genericErrorHandler);
};

store.getCategoryFromId = function (id) {
    (0, _helpers.assert)(data.categoryMap.has(id), 'getCategoryFromId lookup failed for id: ' + id);
    return data.categoryMap.get(id);
};

function resetCategoryMap() {
    data.categories.sort(function (a, b) {
        return (0, _helpers.localeComparator)(a.title, b.title, data.settings.locale);
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
            var bank = _step16.value;
            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
                for (var _iterator17 = (0, _getIterator3.default)(bank.accounts.values()), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    var acc = _step17.value;
                    var _iteratorNormalCompletion18 = true;
                    var _didIteratorError18 = false;
                    var _iteratorError18 = undefined;

                    try {
                        for (var _iterator18 = (0, _getIterator3.default)(acc.operations), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
                            var _op3 = _step18.value;

                            if (_op3.categoryId === id) {
                                _op3.categoryId = replaceId;
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

store.setSettings = function (settings) {
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

    (0, _helpers.assert)(data.settings.has('locale'), 'Kresus needs a locale');
    var locale = data.settings.get('locale');
    (0, _helpers.setupTranslator)(locale);
};

store.changeSetting = function (key, value) {
    var previousValue = data.settings.get(key);
    data.settings.set(key, value);
    events.emit(State.settings);

    backend.saveSetting(String(key), String(value)).catch(function (err) {
        (0, _errors.genericErrorHandler)(err);
        data.settings.set(key, previousValue);

        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.settings
        });
    });
};

store.changeAccess = function (accessId, login, password, customFields) {
    backend.updateAccess(accessId, { login: login, password: password, customFields: customFields }).then(function () {
        // Nothing to do yet, accesses are not saved locally.
    }).catch(_errors.genericErrorHandler);
};

store.createOperationForAccount = function (accountID, operation) {
    backend.createOperation(operation).then(function (created) {
        var account = store.getAccount(accountID);
        var unknownOperationTypeId = store.getUnknownOperationType().id;
        account.operations.push(new _models.Operation(created, unknownOperationTypeId));
        sortOperations(account.operations);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.operations
        });
    }).catch(_errors.genericErrorHandler);
};

// OPERATION TYPES
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
        return (0, _helpers.localeComparator)(al, bl, data.settings.locale);
    });
}

store.setOperationTypes = function (operationtypes) {
    data.operationtypes = operationtypes.map(function (type) {
        return new _models.OperationType(type);
    });
    resetOperationTypesLabel();
};

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
    (0, _helpers.assert)(false, 'impossible to find the alert!');
}

store.createAlert = function (al) {
    backend.createAlert(al).then(function (createdAlert) {
        data.alerts.push(new _models.Alert(createdAlert));
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    }).catch(_errors.genericErrorHandler);
};

store.updateAlert = function (al, attributes) {
    backend.updateAlert(al.id, attributes).then(function () {
        var i = findAlertIndex(al);
        data.alerts[i].merge(attributes);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    }).catch(_errors.genericErrorHandler);
};

store.deleteAlert = function (al) {
    backend.deleteAlert(al.id).then(function () {
        var i = findAlertIndex(al);
        data.alerts.splice(i, 1);
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: State.alerts
        });
    }).catch(_errors.genericErrorHandler);
};

/*
 * ACTIONS
 **/
var Actions = exports.Actions = {

    // Main UI

    selectAccount: function selectAccount(account) {
        (0, _helpers.assert)(account instanceof _models.Account, 'SelectAccount expects an Account');
        _dispatcher2.default.dispatch({
            type: Events.user.selectedAccount,
            accountId: account.id
        });
    },
    selectBank: function selectBank(bank) {
        (0, _helpers.assert)(bank instanceof _models.Bank, 'SelectBank expects a Bank');
        _dispatcher2.default.dispatch({
            type: Events.user.selectedBank,
            bankId: bank.id
        });
    },


    // Categories

    createCategory: function createCategory(category) {
        (0, _helpers.has)(category, 'title', 'CreateCategory expects an object that has a title field');
        (0, _helpers.has)(category, 'color', 'CreateCategory expects an object that has a color field');
        _dispatcher2.default.dispatch({
            type: Events.user.createdCategory,
            category: category
        });
    },
    updateCategory: function updateCategory(category, newCategory) {
        (0, _helpers.assert)(category instanceof _models.Category, 'UpdateCategory first arg must be a Category');
        (0, _helpers.has)(newCategory, 'title', 'UpdateCategory second arg must have a title field');
        (0, _helpers.has)(newCategory, 'color', 'UpdateCategory second arg must have a color field');
        _dispatcher2.default.dispatch({
            type: Events.user.updatedCategory,
            id: category.id,
            category: newCategory
        });
    },
    deleteCategory: function deleteCategory(category, replace) {
        (0, _helpers.assert)(category instanceof _models.Category, 'DeleteCategory first arg must be a Category');
        (0, _helpers.assert)(typeof replace === 'string', 'DeleteCategory second arg must be a String');
        _dispatcher2.default.dispatch({
            type: Events.user.deletedCategory,
            id: category.id,
            replaceByCategoryId: replace
        });
    },


    // Operation list

    setOperationCategory: function setOperationCategory(operation, catId) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'SetOperationCategory 1st arg must be an Operation');
        (0, _helpers.assert)(typeof catId === 'string', 'SetOperationCategory 2nd arg must be String id');
        _dispatcher2.default.dispatch({
            type: Events.user.updatedOperationCategory,
            operation: operation,
            categoryId: catId
        });
    },
    fetchOperations: function fetchOperations() {
        _dispatcher2.default.dispatch({
            type: Events.user.fetchedOperations
        });
    },
    fetchAccounts: function fetchAccounts(bank, account) {
        (0, _helpers.assert)(bank instanceof _models.Bank, 'FetchAccounts first arg must be a Bank');
        (0, _helpers.assert)(account instanceof _models.Account, 'FetchAccounts second arg must be an Account');
        _dispatcher2.default.dispatch({
            type: Events.user.fetchedAccounts,
            bankId: bank.id,
            accountId: account.id,
            accessId: account.bankAccess
        });
    },
    setOperationType: function setOperationType(operation, typeId) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'SetOperationType first arg must be an Operation');
        (0, _helpers.assert)(typeof typeId === 'string', 'SetOperationType second arg must be a String id');
        _dispatcher2.default.dispatch({
            type: Events.user.updatedOperationType,
            operation: operation,
            typeId: typeId
        });
    },
    setCustomLabel: function setCustomLabel(operation, customLabel) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'SetCustomLabel 1st arg must be an Operation');
        (0, _helpers.assert)(typeof customLabel === 'string', 'SetCustomLabel 2nd arg must be a String');
        _dispatcher2.default.dispatch({
            type: Events.user.updatedOperationCustomLabel,
            operation: operation,
            customLabel: customLabel
        });
    },
    deleteOperation: function deleteOperation(operation) {
        (0, _helpers.assert)(operation instanceof _models.Operation, 'deleteOperation arg must be an Operation');
        _dispatcher2.default.dispatch({
            type: Events.user.deletedOperation,
            operation: operation
        });
    },


    // Settings
    deleteAccount: function deleteAccount(account) {
        (0, _helpers.assert)(account instanceof _models.Account, 'DeleteAccount expects an Account');
        _dispatcher2.default.dispatch({
            type: Events.user.deletedAccount,
            accountId: account.id
        });
    },
    deleteBank: function deleteBank(bank) {
        (0, _helpers.assert)(bank instanceof _models.Bank, 'DeleteBank expects an Bank');
        _dispatcher2.default.dispatch({
            type: Events.user.deletedBank,
            bankId: bank.id
        });
    },
    createBank: function createBank(uuid, login, passwd, customFields) {
        (0, _helpers.assert)(typeof uuid === 'string' && uuid.length, 'uuid must be a non-empty string');
        (0, _helpers.assert)(typeof login === 'string' && login.length, 'login must be a non-empty string');
        (0, _helpers.assert)(typeof passwd === 'string' && passwd.length, 'passwd must be a non-empty string');

        var eventObject = {
            type: Events.user.createdBank,
            bankUuid: uuid,
            id: login,
            pwd: passwd
        };
        if (typeof customFields !== 'undefined') eventObject.customFields = customFields;

        _dispatcher2.default.dispatch(eventObject);
    },
    changeSetting: function changeSetting(key, value) {
        (0, _helpers.assert)(typeof key === 'string', 'key must be a string');
        (0, _helpers.assert)(typeof value === 'string', 'value must be a string');
        (0, _helpers.assert)(key.length + value.length, 'key and value must be non-empty');
        _dispatcher2.default.dispatch({
            type: Events.user.changedSetting,
            key: key,
            value: value
        });
    },
    changeBoolSetting: function changeBoolSetting(key, value) {
        (0, _helpers.assert)(typeof value === 'boolean', 'value must be a boolean');
        this.changeSetting(key, value.toString());
    },
    updateWeboob: function updateWeboob() {
        _dispatcher2.default.dispatch({
            type: Events.user.updatedWeboob
        });
    },
    updateAccess: function updateAccess(account, login, password, customFields) {
        (0, _helpers.assert)(account instanceof _models.Account, 'first param must be an account');
        (0, _helpers.assert)(typeof password === 'string', 'second param must be the password');

        if (typeof login !== 'undefined') {
            (0, _helpers.assert)(typeof login === 'string', 'third param must be the login');
        }

        if (typeof customFields !== 'undefined') {
            (0, _helpers.assert)(customFields instanceof Array && customFields.every(function (f) {
                return (0, _helpers.has)(f, 'name') && (0, _helpers.has)(f, 'value');
            }), 'if not omitted, third param must have the shape [{name, value}]');
        }

        _dispatcher2.default.dispatch({
            type: Events.user.changedPassword,
            accessId: account.bankAccess,
            login: login,
            password: password,
            customFields: customFields
        });
    },
    importInstance: function importInstance(action) {
        (0, _helpers.has)(action, 'content');
        _dispatcher2.default.dispatch({
            type: Events.user.importedInstance,
            content: action.content
        });
    },
    createOperation: function createOperation(accountID, operation) {
        (0, _helpers.assert)(typeof accountID === 'string' && accountID.length, 'createOperation first arg must be a non empty string');
        _dispatcher2.default.dispatch({
            type: Events.user.createdOperation,
            operation: operation,
            accountID: accountID
        });
    },


    // Duplicates

    mergeOperations: function mergeOperations(toKeep, toRemove) {
        (0, _helpers.assert)(toKeep instanceof _models.Operation && toRemove instanceof _models.Operation, 'MergeOperation expects two Operation');
        _dispatcher2.default.dispatch({
            type: Events.user.mergedOperations,
            toKeepId: toKeep.id,
            toRemoveId: toRemove.id
        });
    },


    // Alerts
    createAlert: function createAlert(alert) {
        (0, _helpers.assert)((typeof alert === 'undefined' ? 'undefined' : (0, _typeof3.default)(alert)) === 'object');
        (0, _helpers.has)(alert, 'type');
        (0, _helpers.has)(alert, 'bankAccount');
        _dispatcher2.default.dispatch({
            type: Events.user.createdAlert,
            alert: alert
        });
    },
    updateAlert: function updateAlert(alert, attributes) {
        (0, _helpers.assert)(alert instanceof _models.Alert, 'UpdateAlert expects an instance of Alert');
        (0, _helpers.assert)((typeof attributes === 'undefined' ? 'undefined' : (0, _typeof3.default)(attributes)) === 'object', 'Second attribute to UpdateAlert must be an object');
        _dispatcher2.default.dispatch({
            type: Events.user.updatedAlert,
            alert: alert,
            attributes: attributes
        });
    },
    deleteAlert: function deleteAlert(alert) {
        (0, _helpers.assert)(alert instanceof _models.Alert, 'DeleteAlert expects an instance of Alert');
        _dispatcher2.default.dispatch({
            type: Events.user.deletedAlert,
            alert: alert
        });
    }
};

function makeForwardEvent(event) {
    return function () {
        _dispatcher2.default.dispatch({
            type: Events.forward,
            event: event
        });
    };
}

_dispatcher2.default.register(function (action) {
    switch (action.type) {

        // User events
        case Events.user.changedPassword:
            (0, _helpers.has)(action, 'accessId');
            (0, _helpers.has)(action, 'password');
            store.changeAccess(action.accessId, action.login, action.password, action.customFields);
            break;

        case Events.user.changedSetting:
            (0, _helpers.has)(action, 'key');
            (0, _helpers.has)(action, 'value');
            store.changeSetting(action.key, action.value);
            break;

        case Events.user.createdBank:
            (0, _helpers.has)(action, 'bankUuid');
            (0, _helpers.has)(action, 'id');
            (0, _helpers.has)(action, 'pwd');
            store.addBank(action.bankUuid, action.id, action.pwd, action.customFields);
            break;

        case Events.user.createdCategory:
            (0, _helpers.has)(action, 'category');
            store.addCategory(action.category);
            break;

        case Events.user.deletedAccount:
            (0, _helpers.has)(action, 'accountId');
            store.deleteAccount(action.accountId);
            break;

        case Events.user.deletedAlert:
            (0, _helpers.has)(action, 'alert');
            store.deleteAlert(action.alert);
            break;

        case Events.user.deletedBank:
            (0, _helpers.has)(action, 'bankId');
            store.deleteBank(action.bankId);
            break;

        case Events.user.deletedCategory:
            (0, _helpers.has)(action, 'id');
            (0, _helpers.has)(action, 'replaceByCategoryId');
            store.deleteCategory(action.id, action.replaceByCategoryId);
            break;

        case Events.user.importedInstance:
            (0, _helpers.has)(action, 'content');
            store.importInstance(action.content);
            break;

        case Events.user.mergedOperations:
            (0, _helpers.has)(action, 'toKeepId');
            (0, _helpers.has)(action, 'toRemoveId');
            store.mergeOperations(action.toKeepId, action.toRemoveId);
            break;

        case Events.user.deletedOperation:
            (0, _helpers.has)(action, 'operation');
            store.deleteOperation(action.operation);
            break;

        case Events.user.fetchedOperations:
            store.fetchOperations();
            break;

        case Events.user.fetchedAccounts:
            (0, _helpers.has)(action, 'bankId');
            (0, _helpers.has)(action, 'accessId');
            (0, _helpers.has)(action, 'accountId');
            store.fetchAccounts(action.bankId, action.accountId, action.accessId);
            break;

        case Events.user.selectedAccount:
            (0, _helpers.has)(action, 'accountId');
            (0, _helpers.assert)(store.getAccount(action.accountId) !== null, 'Selected account must exist');
            data.currentAccountId = action.accountId;
            events.emit(State.accounts);
            break;

        case Events.user.selectedBank:
            {
                (0, _helpers.has)(action, 'bankId');
                var currentBank = store.getBank(action.bankId);
                (0, _helpers.assert)(currentBank !== null, 'Selected bank must exist');
                data.currentBankId = currentBank.id;
                data.currentAccountId = currentBank.accounts.keys().next().value;
                events.emit(State.banks);
                break;
            }

        case Events.user.createdAlert:
            (0, _helpers.has)(action, 'alert');
            store.createAlert(action.alert);
            break;

        case Events.user.updatedAlert:
            (0, _helpers.has)(action, 'alert');
            (0, _helpers.has)(action, 'attributes');
            store.updateAlert(action.alert, action.attributes);
            break;

        case Events.user.updatedCategory:
            (0, _helpers.has)(action, 'id');
            (0, _helpers.has)(action, 'category');
            store.updateCategory(action.id, action.category);
            break;

        case Events.user.updatedOperationCategory:
            (0, _helpers.has)(action, 'operation');
            (0, _helpers.has)(action, 'categoryId');
            store.updateCategoryForOperation(action.operation, action.categoryId);
            break;

        case Events.user.updatedOperationType:
            (0, _helpers.has)(action, 'operation');
            (0, _helpers.has)(action, 'typeId');
            store.updateTypeForOperation(action.operation, action.typeId);
            break;

        case Events.user.updatedOperationCustomLabel:
            (0, _helpers.has)(action, 'operation');
            (0, _helpers.has)(action, 'customLabel');
            store.updateCustomLabelForOperation(action.operation, action.customLabel);
            break;

        case Events.user.createdOperation:
            (0, _helpers.has)(action, 'accountID');
            (0, _helpers.has)(action, 'operation');
            store.createOperationForAccount(action.accountID, action.operation);
            events.emit(State.operations);
            break;

        case Events.user.updatedWeboob:
            store.updateWeboob();
            break;

        // Server events. Most of these events should be forward events, as the
        // logic on events is handled directly in backend callbacks.
        case Events.server.savedBank:
            // Should be pretty rare, so we can reload everything.
            store.setupKresus(makeForwardEvent(State.banks));
            break;

        case Events.server.deletedCategory:
            events.emit(State.categories);
            // Deleting a category will change operations affected to that category
            events.emit(State.operations);
            break;

        case Events.forward:
            (0, _helpers.has)(action, 'event');
            events.emit(action.event);
            break;

        case Events.afterSync:
            events.emit(State.sync, action.maybeError);
            break;

        default:
            (0, _helpers.assert)(false, 'unhandled event in store switch: ' + action.type);
    }
});

function checkEvent(event) {
    (0, _helpers.assert)(event === State.alerts || event === State.banks || event === State.accounts || event === State.settings || event === State.operations || event === State.categories || event === State.weboob || event === State.sync, 'component subscribed to an unknown / forbidden event: ' + event);
}

store.on = function (event, cb) {
    checkEvent(event);
    events.on(event, cb);
};

store.once = function (event, cb) {
    checkEvent(event);
    events.once(event, cb);
};

store.removeListener = function (event, cb) {
    events.removeListener(event, cb);
};

},{"../shared/default-settings":183,"./backend":1,"./errors":56,"./flux/dispatcher":57,"./helpers":59,"./models":61,"babel-runtime/core-js/get-iterator":64,"babel-runtime/core-js/map":67,"babel-runtime/helpers/typeof":84,"events":174}],63:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":85}],64:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/get-iterator"), __esModule: true };
},{"core-js/library/fn/get-iterator":86}],65:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/is-iterable"), __esModule: true };
},{"core-js/library/fn/is-iterable":87}],66:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":88}],67:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/map"), __esModule: true };
},{"core-js/library/fn/map":89}],68:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/is-finite"), __esModule: true };
},{"core-js/library/fn/number/is-finite":90}],69:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/is-nan"), __esModule: true };
},{"core-js/library/fn/number/is-nan":91}],70:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/number/parse-float"), __esModule: true };
},{"core-js/library/fn/number/parse-float":92}],71:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":93}],72:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":94}],73:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":95}],74:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":96}],75:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":97}],76:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":98}],77:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":99}],78:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],79:[function(require,module,exports){
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
},{"../core-js/object/define-property":72}],80:[function(require,module,exports){
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
},{"../core-js/object/get-own-property-descriptor":73,"../core-js/object/get-prototype-of":74}],81:[function(require,module,exports){
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
},{"../core-js/object/create":71,"../core-js/object/set-prototype-of":75,"../helpers/typeof":84}],82:[function(require,module,exports){
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
},{"../helpers/typeof":84}],83:[function(require,module,exports){
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
},{"../core-js/get-iterator":64,"../core-js/is-iterable":65}],84:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _symbol = require("../core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof _Symbol !== "undefined" && obj.constructor === _Symbol ? "symbol" : typeof obj; }

exports.default = function (obj) {
  return obj && typeof _symbol2.default !== "undefined" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"../core-js/symbol":77}],85:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/$.core').Array.from;
},{"../../modules/$.core":108,"../../modules/es6.array.from":159,"../../modules/es6.string.iterator":170}],86:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.get-iterator');
},{"../modules/core.get-iterator":157,"../modules/es6.string.iterator":170,"../modules/web.dom.iterable":173}],87:[function(require,module,exports){
require('../modules/web.dom.iterable');
require('../modules/es6.string.iterator');
module.exports = require('../modules/core.is-iterable');
},{"../modules/core.is-iterable":158,"../modules/es6.string.iterator":170,"../modules/web.dom.iterable":173}],88:[function(require,module,exports){
var core = require('../../modules/$.core');
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return (core.JSON && core.JSON.stringify || JSON.stringify).apply(JSON, arguments);
};
},{"../../modules/$.core":108}],89:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.map');
require('../modules/es7.map.to-json');
module.exports = require('../modules/$.core').Map;
},{"../modules/$.core":108,"../modules/es6.map":161,"../modules/es6.object.to-string":168,"../modules/es6.string.iterator":170,"../modules/es7.map.to-json":172,"../modules/web.dom.iterable":173}],90:[function(require,module,exports){
require('../../modules/es6.number.is-finite');
module.exports = require('../../modules/$.core').Number.isFinite;
},{"../../modules/$.core":108,"../../modules/es6.number.is-finite":162}],91:[function(require,module,exports){
require('../../modules/es6.number.is-nan');
module.exports = require('../../modules/$.core').Number.isNaN;
},{"../../modules/$.core":108,"../../modules/es6.number.is-nan":163}],92:[function(require,module,exports){
require('../../modules/es6.number.parse-float');
module.exports = parseFloat;
},{"../../modules/es6.number.parse-float":164}],93:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":133}],94:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":133}],95:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.get-own-property-descriptor');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":133,"../../modules/es6.object.get-own-property-descriptor":165}],96:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/$.core').Object.getPrototypeOf;
},{"../../modules/$.core":108,"../../modules/es6.object.get-prototype-of":166}],97:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/$.core').Object.setPrototypeOf;
},{"../../modules/$.core":108,"../../modules/es6.object.set-prototype-of":167}],98:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/$.core').Promise;
},{"../modules/$.core":108,"../modules/es6.object.to-string":168,"../modules/es6.promise":169,"../modules/es6.string.iterator":170,"../modules/web.dom.iterable":173}],99:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
module.exports = require('../../modules/$.core').Symbol;
},{"../../modules/$.core":108,"../../modules/es6.object.to-string":168,"../../modules/es6.symbol":171}],100:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],101:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],102:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":126}],103:[function(require,module,exports){
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
},{"./$.cof":104,"./$.wks":155}],104:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],105:[function(require,module,exports){
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
},{"./$":133,"./$.ctx":109,"./$.defined":110,"./$.descriptors":111,"./$.for-of":116,"./$.has":119,"./$.hide":120,"./$.is-object":126,"./$.iter-define":129,"./$.iter-step":131,"./$.redefine-all":139,"./$.set-species":143,"./$.strict-new":147,"./$.uid":154}],106:[function(require,module,exports){
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
},{"./$.classof":103,"./$.for-of":116}],107:[function(require,module,exports){
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
},{"./$":133,"./$.descriptors":111,"./$.export":114,"./$.fails":115,"./$.for-of":116,"./$.global":118,"./$.hide":120,"./$.is-object":126,"./$.redefine-all":139,"./$.set-to-string-tag":144,"./$.strict-new":147}],108:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],109:[function(require,module,exports){
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
},{"./$.a-function":100}],110:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],111:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./$.fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./$.fails":115}],112:[function(require,module,exports){
var isObject = require('./$.is-object')
  , document = require('./$.global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./$.global":118,"./$.is-object":126}],113:[function(require,module,exports){
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
},{"./$":133}],114:[function(require,module,exports){
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
},{"./$.core":108,"./$.ctx":109,"./$.global":118}],115:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],116:[function(require,module,exports){
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
},{"./$.an-object":102,"./$.ctx":109,"./$.is-array-iter":124,"./$.iter-call":127,"./$.to-length":152,"./core.get-iterator-method":156}],117:[function(require,module,exports){
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
},{"./$":133,"./$.to-iobject":151}],118:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],119:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],120:[function(require,module,exports){
var $          = require('./$')
  , createDesc = require('./$.property-desc');
module.exports = require('./$.descriptors') ? function(object, key, value){
  return $.setDesc(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./$":133,"./$.descriptors":111,"./$.property-desc":138}],121:[function(require,module,exports){
module.exports = require('./$.global').document && document.documentElement;
},{"./$.global":118}],122:[function(require,module,exports){
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
},{}],123:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":104}],124:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./$.iterators')
  , ITERATOR   = require('./$.wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./$.iterators":132,"./$.wks":155}],125:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./$.cof');
module.exports = Array.isArray || function(arg){
  return cof(arg) == 'Array';
};
},{"./$.cof":104}],126:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],127:[function(require,module,exports){
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
},{"./$.an-object":102}],128:[function(require,module,exports){
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
},{"./$":133,"./$.hide":120,"./$.property-desc":138,"./$.set-to-string-tag":144,"./$.wks":155}],129:[function(require,module,exports){
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
},{"./$":133,"./$.export":114,"./$.has":119,"./$.hide":120,"./$.iter-create":128,"./$.iterators":132,"./$.library":135,"./$.redefine":140,"./$.set-to-string-tag":144,"./$.wks":155}],130:[function(require,module,exports){
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
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./$.wks":155}],131:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],132:[function(require,module,exports){
module.exports = {};
},{}],133:[function(require,module,exports){
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
},{}],134:[function(require,module,exports){
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
},{"./$":133,"./$.to-iobject":151}],135:[function(require,module,exports){
module.exports = true;
},{}],136:[function(require,module,exports){
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
},{"./$.cof":104,"./$.global":118,"./$.task":149}],137:[function(require,module,exports){
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
},{"./$.core":108,"./$.export":114,"./$.fails":115}],138:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],139:[function(require,module,exports){
var redefine = require('./$.redefine');
module.exports = function(target, src){
  for(var key in src)redefine(target, key, src[key]);
  return target;
};
},{"./$.redefine":140}],140:[function(require,module,exports){
module.exports = require('./$.hide');
},{"./$.hide":120}],141:[function(require,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],142:[function(require,module,exports){
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
},{"./$":133,"./$.an-object":102,"./$.ctx":109,"./$.is-object":126}],143:[function(require,module,exports){
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
},{"./$":133,"./$.core":108,"./$.descriptors":111,"./$.wks":155}],144:[function(require,module,exports){
var def = require('./$').setDesc
  , has = require('./$.has')
  , TAG = require('./$.wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./$":133,"./$.has":119,"./$.wks":155}],145:[function(require,module,exports){
var global = require('./$.global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./$.global":118}],146:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./$.an-object')
  , aFunction = require('./$.a-function')
  , SPECIES   = require('./$.wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./$.a-function":100,"./$.an-object":102,"./$.wks":155}],147:[function(require,module,exports){
module.exports = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
},{}],148:[function(require,module,exports){
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
},{"./$.defined":110,"./$.to-integer":150}],149:[function(require,module,exports){
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
},{"./$.cof":104,"./$.ctx":109,"./$.dom-create":112,"./$.global":118,"./$.html":121,"./$.invoke":122}],150:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],151:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":110,"./$.iobject":123}],152:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./$.to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./$.to-integer":150}],153:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./$.defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./$.defined":110}],154:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],155:[function(require,module,exports){
var store  = require('./$.shared')('wks')
  , uid    = require('./$.uid')
  , Symbol = require('./$.global').Symbol;
module.exports = function(name){
  return store[name] || (store[name] =
    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
};
},{"./$.global":118,"./$.shared":145,"./$.uid":154}],156:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./$.classof":103,"./$.core":108,"./$.iterators":132,"./$.wks":155}],157:[function(require,module,exports){
var anObject = require('./$.an-object')
  , get      = require('./core.get-iterator-method');
module.exports = require('./$.core').getIterator = function(it){
  var iterFn = get(it);
  if(typeof iterFn != 'function')throw TypeError(it + ' is not iterable!');
  return anObject(iterFn.call(it));
};
},{"./$.an-object":102,"./$.core":108,"./core.get-iterator-method":156}],158:[function(require,module,exports){
var classof   = require('./$.classof')
  , ITERATOR  = require('./$.wks')('iterator')
  , Iterators = require('./$.iterators');
module.exports = require('./$.core').isIterable = function(it){
  var O = Object(it);
  return O[ITERATOR] !== undefined
    || '@@iterator' in O
    || Iterators.hasOwnProperty(classof(O));
};
},{"./$.classof":103,"./$.core":108,"./$.iterators":132,"./$.wks":155}],159:[function(require,module,exports){
'use strict';
var ctx         = require('./$.ctx')
  , $export     = require('./$.export')
  , toObject    = require('./$.to-object')
  , call        = require('./$.iter-call')
  , isArrayIter = require('./$.is-array-iter')
  , toLength    = require('./$.to-length')
  , getIterFn   = require('./core.get-iterator-method');
$export($export.S + $export.F * !require('./$.iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , $$      = arguments
      , $$len   = $$.length
      , mapfn   = $$len > 1 ? $$[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        result[index] = mapping ? mapfn(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});

},{"./$.ctx":109,"./$.export":114,"./$.is-array-iter":124,"./$.iter-call":127,"./$.iter-detect":130,"./$.to-length":152,"./$.to-object":153,"./core.get-iterator-method":156}],160:[function(require,module,exports){
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
},{"./$.add-to-unscopables":101,"./$.iter-define":129,"./$.iter-step":131,"./$.iterators":132,"./$.to-iobject":151}],161:[function(require,module,exports){
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
},{"./$.collection":107,"./$.collection-strong":105}],162:[function(require,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export   = require('./$.export')
  , _isFinite = require('./$.global').isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"./$.export":114,"./$.global":118}],163:[function(require,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = require('./$.export');

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"./$.export":114}],164:[function(require,module,exports){
// 20.1.2.12 Number.parseFloat(string)
var $export = require('./$.export');

$export($export.S, 'Number', {parseFloat: parseFloat});
},{"./$.export":114}],165:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./$.to-iobject');

require('./$.object-sap')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./$.object-sap":137,"./$.to-iobject":151}],166:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject = require('./$.to-object');

require('./$.object-sap')('getPrototypeOf', function($getPrototypeOf){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./$.object-sap":137,"./$.to-object":153}],167:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./$.export');
$export($export.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.export":114,"./$.set-proto":142}],168:[function(require,module,exports){

},{}],169:[function(require,module,exports){
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
  , empty      = function(){ /* empty */ }
  , Wrapper;

var testResolve = function(sub){
  var test = new P(empty), promise;
  if(sub)test.constructor = function(exec){
    exec(empty, empty);
  };
  (promise = P.resolve(test))['catch'](empty);
  return promise === test;
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
},{"./$":133,"./$.a-function":100,"./$.an-object":102,"./$.classof":103,"./$.core":108,"./$.ctx":109,"./$.descriptors":111,"./$.export":114,"./$.for-of":116,"./$.global":118,"./$.is-object":126,"./$.iter-detect":130,"./$.library":135,"./$.microtask":136,"./$.redefine-all":139,"./$.same-value":141,"./$.set-proto":142,"./$.set-species":143,"./$.set-to-string-tag":144,"./$.species-constructor":146,"./$.strict-new":147,"./$.wks":155}],170:[function(require,module,exports){
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
},{"./$.iter-define":129,"./$.string-at":148}],171:[function(require,module,exports){
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
},{"./$":133,"./$.an-object":102,"./$.descriptors":111,"./$.enum-keys":113,"./$.export":114,"./$.fails":115,"./$.get-names":117,"./$.global":118,"./$.has":119,"./$.is-array":125,"./$.keyof":134,"./$.library":135,"./$.property-desc":138,"./$.redefine":140,"./$.set-to-string-tag":144,"./$.shared":145,"./$.to-iobject":151,"./$.uid":154,"./$.wks":155}],172:[function(require,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = require('./$.export');

$export($export.P, 'Map', {toJSON: require('./$.collection-to-json')('Map')});
},{"./$.collection-to-json":106,"./$.export":114}],173:[function(require,module,exports){
require('./es6.array.iterator');
var Iterators = require('./$.iterators');
Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
},{"./$.iterators":132,"./es6.array.iterator":160}],174:[function(require,module,exports){
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
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
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

},{}],175:[function(require,module,exports){
module.exports = [
  {
    code: 'AED',
    symbol: 'د.إ.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'AFN',
    symbol: '؋',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'ALL',
    symbol: 'Lek',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'AMD',
    symbol: '֏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'ANG',
    symbol: 'ƒ',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'AOA',
    symbol: 'Kz',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'ARS',
    symbol: '$',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'AUD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'AWG',
    symbol: 'ƒ',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'AZN',
    symbol: '₼',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'BAM',
    symbol: 'КМ',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'BBD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'BDT',
    symbol: '৳',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 0
  },
  {
    code: 'BGN',
    symbol: 'лв.',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'BHD',
    symbol: 'د.ب.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 3
  },
  {
    code: 'BIF',
    symbol: 'FBu',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'BMD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'BND',
    symbol: '$',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'BOB',
    symbol: 'Bs',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'BRL',
    symbol: 'R$',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'BSD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'BTC',
    symbol: 'Ƀ',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'BTN',
    symbol: 'Nu.',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 1
  },
  {
    code: 'BWP',
    symbol: 'P',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'BYR',
    symbol: 'р.',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'BZD',
    symbol: 'BZ$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CAD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CDF',
    symbol: 'FC',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CHF',
    symbol: 'Fr.',
    thousandsSeparator: '\'',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'CLP',
    symbol: '$',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'CNY',
    symbol: '¥',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'COP',
    symbol: '$',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'CRC',
    symbol: '₡',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CUC',
    symbol: 'CUC',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CUP',
    symbol: '$MN',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CVE',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'CZK',
    symbol: 'Kč',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'DJF',
    symbol: 'Fdj',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'DKK',
    symbol: 'kr.',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'DOP',
    symbol: 'RD$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'DZD',
    symbol: 'د.ج.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'EGP',
    symbol: 'ج.م.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'ERN',
    symbol: 'Nfk',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'ETB',
    symbol: 'ETB',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'EUR',
    symbol: '€',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'FJD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
    {
    code: 'FKP',
    symbol: '£',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'GBP',
    symbol: '£',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'GEL',
    symbol: 'Lari',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'GHS',
    symbol: '₵',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'GIP',
    symbol: '£',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'GMD',
    symbol: 'D',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'GNF',
    symbol: 'FG',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'GTQ',
    symbol: 'Q',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'GYD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'HKD',
    symbol: 'HK$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'HNL',
    symbol: 'L.',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'HRK',
    symbol: 'kn',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'HTG',
    symbol: 'G',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'HUF',
    symbol: 'Ft',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'IDR',
    symbol: 'Rp',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'ILS',
    symbol: '₪',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'INR',
    symbol: '₹',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'IQD',
    symbol: 'د.ع.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'IRR',
    symbol: '﷼',
    thousandsSeparator: ',',
    decimalSeparator: '/',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'ISK',
    symbol: 'kr.',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 0
  },
  {
    code: 'JMD',
    symbol: 'J$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'JOD',
    symbol: 'د.ا.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 3
  },
  {
    code: 'JPY',
    symbol: '¥',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'KES',
    symbol: 'S',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'KGS',
    symbol: 'сом',
    thousandsSeparator: ' ',
    decimalSeparator: '-',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'KHR',
    symbol: '៛',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'KMF',
    symbol: 'CF',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'KPW',
    symbol: '₩',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'KRW',
    symbol: '₩',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'KWD',
    symbol: 'د.ك.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 3
  },
  {
    code: 'KYD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'KZT',
    symbol: '₸',
    thousandsSeparator: ' ',
    decimalSeparator: '-',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'LAK',
    symbol: '₭',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'LBP',
    symbol: 'ل.ل.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'LKR',
    symbol: '₨',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 0
  },
  {
    code: 'LRD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'LSL',
    symbol: 'M',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'LYD',
    symbol: 'د.ل.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 3
  },
  {
    code: 'MAD',
    symbol: 'د.م.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'MDL',
    symbol: 'lei',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'MGA',
    symbol: 'Ar',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'MKD',
    symbol: 'ден.',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'MMK',
    symbol: 'K',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MNT',
    symbol: '₮',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MOP',
    symbol: 'MOP$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MRO',
    symbol: 'UM',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MTL',
    symbol: '₤',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MUR',
    symbol: '₨',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MVR',
    symbol: 'MVR',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 1
  },
  {
    code: 'MWK',
    symbol: 'MK',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MXN',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MYR',
    symbol: 'RM',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'MZN',
    symbol: 'MT',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'NAD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'NGN',
    symbol: '₦',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'NIO',
    symbol: 'C$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'NOK',
    symbol: 'kr',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'NPR',
    symbol: '₨',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'NZD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'OMR',
    symbol: '﷼',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 3
  },
  {
    code: 'PAB',
    symbol: 'B/.',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'PEN',
    symbol: 'S/.',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'PGK',
    symbol: 'K',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'PHP',
    symbol: '₱',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'PKR',
    symbol: '₨',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'PLN',
    symbol: 'zł',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'PYG',
    symbol: '₲',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'QAR',
    symbol: '﷼',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'RON',
    symbol: 'lei',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'RSD',
    symbol: 'Дин.',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'RUB',
    symbol: '₽',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'RWF',
    symbol: 'RWF',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'SAR',
    symbol: '﷼',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'SBD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SCR',
    symbol: '₨',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SDD',
    symbol: 'LSd',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SDG',
    symbol: '£‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SEK',
    symbol: 'kr',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'SGD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SHP',
    symbol: '£',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SLL',
    symbol: 'Le',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SOS',
    symbol: 'S',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SRD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'STD',
    symbol: 'Db',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SVC',
    symbol: '₡',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'SYP',
    symbol: '£',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'SZL',
    symbol: 'E',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'THB',
    symbol: '฿',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'TJS',
    symbol: 'TJS',
    thousandsSeparator: ' ',
    decimalSeparator: ';',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'TMT',
    symbol: 'm',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'TND',
    symbol: 'د.ت.‏',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 3
  },
  {
    code: 'TOP',
    symbol: 'T$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'TRY',
    symbol: 'TL',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'TTD',
    symbol: 'TT$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'TVD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'TWD',
    symbol: 'NT$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'TZS',
    symbol: 'TSh',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'UAH',
    symbol: '₴',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'UGX',
    symbol: 'USh',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'USD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'UYU',
    symbol: '$U',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'UZS',
    symbol: 'сўм',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'VEB',
    symbol: 'Bs.',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'VEF',
    symbol: 'Bs. F.',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'VND',
    symbol: '₫',
    thousandsSeparator: '.',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 1
  },
  {
    code: 'VUV',
    symbol: 'VT',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 0
  },
  {
    code: 'WST',
    symbol: 'WS$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'XAF',
    symbol: 'F',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'XCD',
    symbol: '$',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'XOF',
    symbol: 'F',
    thousandsSeparator: ' ',
    decimalSeparator: ',',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'XPF',
    symbol: 'F',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: false,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  },
  {
    code: 'YER',
    symbol: '﷼',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'ZAR',
    symbol: 'R',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: true,
    decimalDigits: 2
  },
  {
    code: 'ZMW',
    symbol: 'ZK',
    thousandsSeparator: ',',
    decimalSeparator: '.',
    symbolOnLeft: true,
    spaceBetweenAmountAndSymbol: false,
    decimalDigits: 2
  }
]

},{}],176:[function(require,module,exports){
var currencies = require('./currencies')
var accounting = require('accounting')
/*
  This polyfill intends to emulate the Array.prototy.find() method
  for browsers who don't support it yet.
*/
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

exports.defaultCurrency = {
  symbol: '',
  thousandsSeparator: ',',
  decimalSeparator: '.',
  symbolOnLeft: true,
  spaceBetweenAmountAndSymbol: false,
  decimalDigits: 2
}

exports.currencies = currencies

exports.format = function (value, options) {
  var currency = findCurrency(options.code) || exports.defaultCurrency

  var symbolOnLeft = currency.symbolOnLeft
  var spaceBetweenAmountAndSymbol = currency.spaceBetweenAmountAndSymbol

  var format = ''
  if (symbolOnLeft) {
    format = spaceBetweenAmountAndSymbol
              ? '%s %v'
              : '%s%v'
  } else {
    format = spaceBetweenAmountAndSymbol
              ? '%v %s'
              : '%v%s'
  }

  return accounting.formatMoney(value, {
    symbol: isUndefined(options.symbol)
              ? currency.symbol
              : options.symbol,

    decimal: isUndefined(options.decimal)
              ? currency.decimalSeparator
              : options.decimal,

    thousand: isUndefined(options.thousand)
              ? currency.thousandsSeparator
              : options.thousand,

    precision: typeof options.precision === 'number'
              ? options.precision
              : currency.decimalDigits,

    format: typeof options.format === 'string'
              ? options.format
              : format
  })
}

function findCurrency (currencyCode) {
  return currencies.find(function (c) { return c.code === currencyCode })
}

exports.findCurrency = findCurrency

function isUndefined (val) {
  return typeof val === 'undefined'
}

},{"./currencies":175,"accounting":177}],177:[function(require,module,exports){
/*!
 * accounting.js v0.4.1
 * Copyright 2014 Open Exchange Rates
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * http://openexchangerates.github.io/accounting.js/
 */

(function(root, undefined) {

	/* --- Setup --- */

	// Create the local library object, to be exported or referenced globally later
	var lib = {};

	// Current version
	lib.version = '0.4.1';


	/* --- Exposed settings --- */

	// The library's settings configuration object. Contains default parameters for
	// currency and number formatting
	lib.settings = {
		currency: {
			symbol : "$",		// default currency symbol is '$'
			format : "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
			decimal : ".",		// decimal point separator
			thousand : ",",		// thousands separator
			precision : 2,		// decimal places
			grouping : 3		// digit grouping (not implemented yet)
		},
		number: {
			precision : 0,		// default precision on numbers is 0
			grouping : 3,		// digit grouping (not implemented yet)
			thousand : ",",
			decimal : "."
		}
	};


	/* --- Internal Helper Methods --- */

	// Store reference to possibly-available ECMAScript 5 methods for later
	var nativeMap = Array.prototype.map,
		nativeIsArray = Array.isArray,
		toString = Object.prototype.toString;

	/**
	 * Tests whether supplied parameter is a string
	 * from underscore.js
	 */
	function isString(obj) {
		return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
	}

	/**
	 * Tests whether supplied parameter is a string
	 * from underscore.js, delegates to ECMA5's native Array.isArray
	 */
	function isArray(obj) {
		return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
	}

	/**
	 * Tests whether supplied parameter is a true object
	 */
	function isObject(obj) {
		return obj && toString.call(obj) === '[object Object]';
	}

	/**
	 * Extends an object with a defaults object, similar to underscore's _.defaults
	 *
	 * Used for abstracting parameter handling from API methods
	 */
	function defaults(object, defs) {
		var key;
		object = object || {};
		defs = defs || {};
		// Iterate over object non-prototype properties:
		for (key in defs) {
			if (defs.hasOwnProperty(key)) {
				// Replace values with defaults only if undefined (allow empty/zero values):
				if (object[key] == null) object[key] = defs[key];
			}
		}
		return object;
	}

	/**
	 * Implementation of `Array.map()` for iteration loops
	 *
	 * Returns a new Array as a result of calling `iterator` on each array value.
	 * Defers to native Array.map if available
	 */
	function map(obj, iterator, context) {
		var results = [], i, j;

		if (!obj) return results;

		// Use native .map method if it exists:
		if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);

		// Fallback for native .map:
		for (i = 0, j = obj.length; i < j; i++ ) {
			results[i] = iterator.call(context, obj[i], i, obj);
		}
		return results;
	}

	/**
	 * Check and normalise the value of precision (must be positive integer)
	 */
	function checkPrecision(val, base) {
		val = Math.round(Math.abs(val));
		return isNaN(val)? base : val;
	}


	/**
	 * Parses a format string or object and returns format obj for use in rendering
	 *
	 * `format` is either a string with the default (positive) format, or object
	 * containing `pos` (required), `neg` and `zero` values (or a function returning
	 * either a string or object)
	 *
	 * Either string or format.pos must contain "%v" (value) to be valid
	 */
	function checkCurrencyFormat(format) {
		var defaults = lib.settings.currency.format;

		// Allow function as format parameter (should return string or object):
		if ( typeof format === "function" ) format = format();

		// Format can be a string, in which case `value` ("%v") must be present:
		if ( isString( format ) && format.match("%v") ) {

			// Create and return positive, negative and zero formats:
			return {
				pos : format,
				neg : format.replace("-", "").replace("%v", "-%v"),
				zero : format
			};

		// If no format, or object is missing valid positive value, use defaults:
		} else if ( !format || !format.pos || !format.pos.match("%v") ) {

			// If defaults is a string, casts it to an object for faster checking next time:
			return ( !isString( defaults ) ) ? defaults : lib.settings.currency.format = {
				pos : defaults,
				neg : defaults.replace("%v", "-%v"),
				zero : defaults
			};

		}
		// Otherwise, assume format was fine:
		return format;
	}


	/* --- API Methods --- */

	/**
	 * Takes a string/array of strings, removes all formatting/cruft and returns the raw float value
	 * Alias: `accounting.parse(string)`
	 *
	 * Decimal must be included in the regular expression to match floats (defaults to
	 * accounting.settings.number.decimal), so if the number uses a non-standard decimal 
	 * separator, provide it as the second argument.
	 *
	 * Also matches bracketed negatives (eg. "$ (1.99)" => -1.99)
	 *
	 * Doesn't throw any errors (`NaN`s become 0) but this may change in future
	 */
	var unformat = lib.unformat = lib.parse = function(value, decimal) {
		// Recursively unformat arrays:
		if (isArray(value)) {
			return map(value, function(val) {
				return unformat(val, decimal);
			});
		}

		// Fails silently (need decent errors):
		value = value || 0;

		// Return the value as-is if it's already a number:
		if (typeof value === "number") return value;

		// Default decimal point comes from settings, but could be set to eg. "," in opts:
		decimal = decimal || lib.settings.number.decimal;

		 // Build regex to strip out everything except digits, decimal point and minus sign:
		var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
			unformatted = parseFloat(
				("" + value)
				.replace(/\((.*)\)/, "-$1") // replace bracketed values with negatives
				.replace(regex, '')         // strip out any cruft
				.replace(decimal, '.')      // make sure decimal point is standard
			);

		// This will fail silently which may cause trouble, let's wait and see:
		return !isNaN(unformatted) ? unformatted : 0;
	};


	/**
	 * Implementation of toFixed() that treats floats more like decimals
	 *
	 * Fixes binary rounding issues (eg. (0.615).toFixed(2) === "0.61") that present
	 * problems for accounting- and finance-related software.
	 */
	var toFixed = lib.toFixed = function(value, precision) {
		precision = checkPrecision(precision, lib.settings.number.precision);
		var power = Math.pow(10, precision);

		// Multiply up by precision, round accurately, then divide and use native toFixed():
		return (Math.round(lib.unformat(value) * power) / power).toFixed(precision);
	};


	/**
	 * Format a number, with comma-separated thousands and custom precision/decimal places
	 * Alias: `accounting.format()`
	 *
	 * Localise by overriding the precision and thousand / decimal separators
	 * 2nd parameter `precision` can be an object matching `settings.number`
	 */
	var formatNumber = lib.formatNumber = lib.format = function(number, precision, thousand, decimal) {
		// Resursively format arrays:
		if (isArray(number)) {
			return map(number, function(val) {
				return formatNumber(val, precision, thousand, decimal);
			});
		}

		// Clean up number:
		number = unformat(number);

		// Build options object from second param (if object) or all params, extending defaults:
		var opts = defaults(
				(isObject(precision) ? precision : {
					precision : precision,
					thousand : thousand,
					decimal : decimal
				}),
				lib.settings.number
			),

			// Clean up precision
			usePrecision = checkPrecision(opts.precision),

			// Do some calc:
			negative = number < 0 ? "-" : "",
			base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
			mod = base.length > 3 ? base.length % 3 : 0;

		// Format the number:
		return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
	};


	/**
	 * Format a number into currency
	 *
	 * Usage: accounting.formatMoney(number, symbol, precision, thousandsSep, decimalSep, format)
	 * defaults: (0, "$", 2, ",", ".", "%s%v")
	 *
	 * Localise by overriding the symbol, precision, thousand / decimal separators and format
	 * Second param can be an object matching `settings.currency` which is the easiest way.
	 *
	 * To do: tidy up the parameters
	 */
	var formatMoney = lib.formatMoney = function(number, symbol, precision, thousand, decimal, format) {
		// Resursively format arrays:
		if (isArray(number)) {
			return map(number, function(val){
				return formatMoney(val, symbol, precision, thousand, decimal, format);
			});
		}

		// Clean up number:
		number = unformat(number);

		// Build options object from second param (if object) or all params, extending defaults:
		var opts = defaults(
				(isObject(symbol) ? symbol : {
					symbol : symbol,
					precision : precision,
					thousand : thousand,
					decimal : decimal,
					format : format
				}),
				lib.settings.currency
			),

			// Check format (returns object with pos, neg and zero):
			formats = checkCurrencyFormat(opts.format),

			// Choose which format to use for this value:
			useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

		// Return with currency symbol added:
		return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
	};


	/**
	 * Format a list of numbers into an accounting column, padding with whitespace
	 * to line up currency symbols, thousand separators and decimals places
	 *
	 * List should be an array of numbers
	 * Second parameter can be an object containing keys that match the params
	 *
	 * Returns array of accouting-formatted number strings of same length
	 *
	 * NB: `white-space:pre` CSS rule is required on the list container to prevent
	 * browsers from collapsing the whitespace in the output strings.
	 */
	lib.formatColumn = function(list, symbol, precision, thousand, decimal, format) {
		if (!list) return [];

		// Build options object from second param (if object) or all params, extending defaults:
		var opts = defaults(
				(isObject(symbol) ? symbol : {
					symbol : symbol,
					precision : precision,
					thousand : thousand,
					decimal : decimal,
					format : format
				}),
				lib.settings.currency
			),

			// Check format (returns object with pos, neg and zero), only need pos for now:
			formats = checkCurrencyFormat(opts.format),

			// Whether to pad at start of string or after currency symbol:
			padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false,

			// Store value for the length of the longest string in the column:
			maxLength = 0,

			// Format the list according to options, store the length of the longest string:
			formatted = map(list, function(val, i) {
				if (isArray(val)) {
					// Recursively format columns if list is a multi-dimensional array:
					return lib.formatColumn(val, opts);
				} else {
					// Clean up the value
					val = unformat(val);

					// Choose which format to use for this value (pos, neg or zero):
					var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

						// Format this value, push into formatted list and save the length:
						fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.precision), opts.thousand, opts.decimal));

					if (fVal.length > maxLength) maxLength = fVal.length;
					return fVal;
				}
			});

		// Pad each number in the list and send back the column of numbers:
		return map(formatted, function(val, i) {
			// Only if this is a string (not a nested array, which would have already been padded):
			if (isString(val) && val.length < maxLength) {
				// Depending on symbol position, pad after symbol or at index 0:
				return padAfterSymbol ? val.replace(opts.symbol, opts.symbol+(new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
			}
			return val;
		});
	};


	/* --- Module Definition --- */

	// Export accounting for CommonJS. If being loaded as an AMD module, define it as such.
	// Otherwise, just add `accounting` to the global object
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = lib;
		}
		exports.accounting = lib;
	} else if (typeof define === 'function' && define.amd) {
		// Return the library as an AMD module:
		define([], function() {
			return lib;
		});
	} else {
		// Use accounting.noConflict to restore `accounting` back to its original value.
		// Returns a reference to the library's `accounting` object;
		// e.g. `var numbers = accounting.noConflict();`
		lib.noConflict = (function(oldAccounting) {
			return function() {
				// Reset the value of the root's `accounting` variable:
				root.accounting = oldAccounting;
				// Delete the noConflict method:
				lib.noConflict = undefined;
				// Return reference to the library to re-assign it:
				return lib;
			};
		})(root.accounting);

		// Declare `fx` on the root (global/window) object:
		root['accounting'] = lib;
	}

	// Root will be `window` in browser or `global` on the server:
}(this));

},{}],178:[function(require,module,exports){
/**
 * lodash 4.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var debounce = require('lodash.debounce');

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide an options object to indicate whether
 * `func` should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify invoking on the leading
 *  edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify invoking on the trailing
 *  edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = throttle;

},{"lodash.debounce":179}],179:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
function now() {
  return Date.now();
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide an options object to indicate whether `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent calls
 * to the debounced function return the result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
 * on the trailing edge of the timeout only if the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8 which returns 'object' for typed array and weak map constructors,
  // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = isFunction(value.valueOf) ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

},{}],180:[function(require,module,exports){
// Added for convenience in the Node environment.
// The meat and potatoes exist in ./lib/polyglot.js.
module.exports = require('./lib/polyglot');

},{"./lib/polyglot":181}],181:[function(require,module,exports){
//     (c) 2012 Airbnb, Inc.
//
//     polyglot.js may be freely distributed under the terms of the BSD
//     license. For all licensing information, details, and documention:
//     http://airbnb.github.com/polyglot.js
//
//
// Polyglot.js is an I18n helper library written in JavaScript, made to
// work both in the browser and in Node. It provides a simple solution for
// interpolation and pluralization, based off of Airbnb's
// experience adding I18n functionality to its Backbone.js and Node apps.
//
// Polylglot is agnostic to your translation backend. It doesn't perform any
// translation; it simply gives you a way to manage translated phrases from
// your client- or server-side JavaScript application.
//


(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return factory(root);
    });
  } else if (typeof exports === 'object') {
    module.exports = factory(root);
  } else {
    root.Polyglot = factory(root);
  }
}(this, function(root) {
  'use strict';

  var replace = String.prototype.replace;

  // ### Polyglot class constructor
  function Polyglot(options) {
    options = options || {};
    this.phrases = {};
    this.extend(options.phrases || {});
    this.currentLocale = options.locale || 'en';
    this.allowMissing = !!options.allowMissing;
    this.warn = options.warn || warn;
  }

  // ### Version
  Polyglot.VERSION = '1.0.0';

  // ### polyglot.locale([locale])
  //
  // Get or set locale. Internally, Polyglot only uses locale for pluralization.
  Polyglot.prototype.locale = function(newLocale) {
    if (newLocale) this.currentLocale = newLocale;
    return this.currentLocale;
  };

  // ### polyglot.extend(phrases)
  //
  // Use `extend` to tell Polyglot how to translate a given key.
  //
  //     polyglot.extend({
  //       "hello": "Hello",
  //       "hello_name": "Hello, %{name}"
  //     });
  //
  // The key can be any string.  Feel free to call `extend` multiple times;
  // it will override any phrases with the same key, but leave existing phrases
  // untouched.
  //
  // It is also possible to pass nested phrase objects, which get flattened
  // into an object with the nested keys concatenated using dot notation.
  //
  //     polyglot.extend({
  //       "nav": {
  //         "hello": "Hello",
  //         "hello_name": "Hello, %{name}",
  //         "sidebar": {
  //           "welcome": "Welcome"
  //         }
  //       }
  //     });
  //
  //     console.log(polyglot.phrases);
  //     // {
  //     //   'nav.hello': 'Hello',
  //     //   'nav.hello_name': 'Hello, %{name}',
  //     //   'nav.sidebar.welcome': 'Welcome'
  //     // }
  //
  // `extend` accepts an optional second argument, `prefix`, which can be used
  // to prefix every key in the phrases object with some string, using dot
  // notation.
  //
  //     polyglot.extend({
  //       "hello": "Hello",
  //       "hello_name": "Hello, %{name}"
  //     }, "nav");
  //
  //     console.log(polyglot.phrases);
  //     // {
  //     //   'nav.hello': 'Hello',
  //     //   'nav.hello_name': 'Hello, %{name}'
  //     // }
  //
  // This feature is used internally to support nested phrase objects.
  Polyglot.prototype.extend = function(morePhrases, prefix) {
    var phrase;

    for (var key in morePhrases) {
      if (morePhrases.hasOwnProperty(key)) {
        phrase = morePhrases[key];
        if (prefix) key = prefix + '.' + key;
        if (typeof phrase === 'object') {
          this.extend(phrase, key);
        } else {
          this.phrases[key] = phrase;
        }
      }
    }
  };

  // ### polyglot.unset(phrases)
  // Use `unset` to selectively remove keys from a polyglot instance.
  //
  //     polyglot.unset("some_key");
  //     polyglot.unset({
  //       "hello": "Hello",
  //       "hello_name": "Hello, %{name}"
  //     });
  //
  // The unset method can take either a string (for the key), or an object hash with
  // the keys that you would like to unset.
  Polyglot.prototype.unset = function(morePhrases, prefix) {
    var phrase;

    if (typeof morePhrases === 'string') {
      delete this.phrases[morePhrases];
    } else {
      for (var key in morePhrases) {
        if (morePhrases.hasOwnProperty(key)) {
          phrase = morePhrases[key];
          if (prefix) key = prefix + '.' + key;
          if (typeof phrase === 'object') {
            this.unset(phrase, key);
          } else {
            delete this.phrases[key];
          }
        }
      }
    }
  };

  // ### polyglot.clear()
  //
  // Clears all phrases. Useful for special cases, such as freeing
  // up memory if you have lots of phrases but no longer need to
  // perform any translation. Also used internally by `replace`.
  Polyglot.prototype.clear = function() {
    this.phrases = {};
  };

  // ### polyglot.replace(phrases)
  //
  // Completely replace the existing phrases with a new set of phrases.
  // Normally, just use `extend` to add more phrases, but under certain
  // circumstances, you may want to make sure no old phrases are lying around.
  Polyglot.prototype.replace = function(newPhrases) {
    this.clear();
    this.extend(newPhrases);
  };


  // ### polyglot.t(key, options)
  //
  // The most-used method. Provide a key, and `t` will return the
  // phrase.
  //
  //     polyglot.t("hello");
  //     => "Hello"
  //
  // The phrase value is provided first by a call to `polyglot.extend()` or
  // `polyglot.replace()`.
  //
  // Pass in an object as the second argument to perform interpolation.
  //
  //     polyglot.t("hello_name", {name: "Spike"});
  //     => "Hello, Spike"
  //
  // If you like, you can provide a default value in case the phrase is missing.
  // Use the special option key "_" to specify a default.
  //
  //     polyglot.t("i_like_to_write_in_language", {
  //       _: "I like to write in %{language}.",
  //       language: "JavaScript"
  //     });
  //     => "I like to write in JavaScript."
  //
  Polyglot.prototype.t = function(key, options) {
    var phrase, result;
    options = options == null ? {} : options;
    // allow number as a pluralization shortcut
    if (typeof options === 'number') {
      options = {smart_count: options};
    }
    if (typeof this.phrases[key] === 'string') {
      phrase = this.phrases[key];
    } else if (typeof options._ === 'string') {
      phrase = options._;
    } else if (this.allowMissing) {
      phrase = key;
    } else {
      this.warn('Missing translation for key: "'+key+'"');
      result = key;
    }
    if (typeof phrase === 'string') {
      options = clone(options);
      result = choosePluralForm(phrase, this.currentLocale, options.smart_count);
      result = interpolate(result, options);
    }
    return result;
  };


  // ### polyglot.has(key)
  //
  // Check if polyglot has a translation for given key
  Polyglot.prototype.has = function(key) {
    return key in this.phrases;
  };


  // #### Pluralization methods
  // The string that separates the different phrase possibilities.
  var delimeter = '||||';

  // Mapping from pluralization group plural logic.
  var pluralTypes = {
    chinese:   function(n) { return 0; },
    german:    function(n) { return n !== 1 ? 1 : 0; },
    french:    function(n) { return n > 1 ? 1 : 0; },
    russian:   function(n) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; },
    czech:     function(n) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; },
    polish:    function(n) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); },
    icelandic: function(n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
  };

  // Mapping from pluralization group to individual locales.
  var pluralTypeToLanguages = {
    chinese:   ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
    german:    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
    french:    ['fr', 'tl', 'pt-br'],
    russian:   ['hr', 'ru'],
    czech:     ['cs'],
    polish:    ['pl'],
    icelandic: ['is']
  };

  function langToTypeMap(mapping) {
    var type, langs, l, ret = {};
    for (type in mapping) {
      if (mapping.hasOwnProperty(type)) {
        langs = mapping[type];
        for (l in langs) {
          ret[langs[l]] = type;
        }
      }
    }
    return ret;
  }

  // Trim a string.
  var trimRe = /^\s+|\s+$/g;
  function trim(str){
    return replace.call(str, trimRe, '');
  }

  // Based on a phrase text that contains `n` plural forms separated
  // by `delimeter`, a `locale`, and a `count`, choose the correct
  // plural form, or none if `count` is `null`.
  function choosePluralForm(text, locale, count){
    var ret, texts, chosenText;
    if (count != null && text) {
      texts = text.split(delimeter);
      chosenText = texts[pluralTypeIndex(locale, count)] || texts[0];
      ret = trim(chosenText);
    } else {
      ret = text;
    }
    return ret;
  }

  function pluralTypeName(locale) {
    var langToPluralType = langToTypeMap(pluralTypeToLanguages);
    return langToPluralType[locale] || langToPluralType.en;
  }

  function pluralTypeIndex(locale, count) {
    return pluralTypes[pluralTypeName(locale)](count);
  }

  // ### interpolate
  //
  // Does the dirty work. Creates a `RegExp` object for each
  // interpolation placeholder.
  var dollarRegex = /\$/g;
  var dollarBillsYall = '$$$$';
  function interpolate(phrase, options) {
    for (var arg in options) {
      if (arg !== '_' && options.hasOwnProperty(arg)) {
        // Ensure replacement value is escaped to prevent special $-prefixed
        // regex replace tokens. the "$$$$" is needed because each "$" needs to
        // be escaped with "$" itself, and we need two in the resulting output.
        var replacement = options[arg];
        if (typeof replacement === 'string') {
          replacement = replace.call(options[arg], dollarRegex, dollarBillsYall);
        }
        // We create a new `RegExp` each time instead of using a more-efficient
        // string replace so that the same argument can be replaced multiple times
        // in the same phrase.
        phrase = replace.call(phrase, new RegExp('%\\{'+arg+'\\}', 'g'), replacement);
      }
    }
    return phrase;
  }

  // ### warn
  //
  // Provides a warning in the console if a phrase key is missing.
  function warn(message) {
    root.console && root.console.warn && root.console.warn('WARNING: ' + message);
  }

  // ### clone
  //
  // Clone an object.
  function clone(source) {
    var ret = {};
    for (var prop in source) {
      ret[prop] = source[prop];
    }
    return ret;
  }

  return Polyglot;
}));

},{}],182:[function(require,module,exports){
module.exports={
  "name": "kresus",
  "version": "0.7.6",
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
    "currency-formatter": "1.0.2",
    "moment": "2.10.6",
    "node-polyglot": "1.0.0",
    "path-extra": "3.0.0",
    "pouchdb": "5.0.0",
    "printit": "0.1.3"
  },
  "devDependencies": {
    "babel-cli": "6.3.17",
    "babel-eslint": "4.1.7",
    "babel-plugin-transform-runtime": "6.3.13",
    "babel-preset-es2015": "6.3.13",
    "babel-preset-react": "6.3.13",
    "babel-preset-stage-0": "6.3.13",
    "babelify": "7.2.0",
    "browserify": "12.0.1",
    "eslint": "1.10.3",
    "eslint-plugin-import": "0.12.1",
    "eslint-plugin-react": "3.14.0",
    "lodash.throttle": "4.0.1",
    "onchange": "2.0.0",
    "sprity-cli": "1.0.1",
    "watchify": "3.6.1"
  },
  "scripts": {
    "start": "node build/server/index.js",
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

},{}],183:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultSettings = new _map2.default();

DefaultSettings.set('locale', 'en');
DefaultSettings.set('weboob-auto-update', 'true');
DefaultSettings.set('weboob-auto-merge-accounts', 'true');
DefaultSettings.set('weboob-installed', 'false');
DefaultSettings.set('weboob-version', '?');
DefaultSettings.set('weboob-enable-debug', 'false');
DefaultSettings.set('duplicateThreshold', '24');
DefaultSettings.set('defaultChartType', 'all');
DefaultSettings.set('defaultChartPeriod', 'current-month');
DefaultSettings.set('defaultAccountId', '');
DefaultSettings.set('defaultCurrency', 'EUR');

exports.default = DefaultSettings;

},{"babel-runtime/core-js/map":67}],184:[function(require,module,exports){
module.exports={
    "UNKNOWN_WEBOOB_MODULE": "UNKNOWN_WEBOOB_MODULE",
    "NO_PASSWORD": "NO_PASSWORD",
    "INVALID_PASSWORD": "INVALID_PASSWORD",
    "EXPIRED_PASSWORD": "EXPIRED_PASSWORD",
    "BANK_ALREADY_EXISTS": "BANK_ALREADY_EXISTS",
    "INVALID_PARAMETERS": "INVALID_PARAMETERS",
    "GENERIC_EXCEPTION": "GENERIC_EXCEPTION"
}

},{}],185:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.currency = undefined;
exports.assert = assert;
exports.maybeHas = maybeHas;
exports.has = has;
exports.NYI = NYI;
exports.setupTranslator = setupTranslator;
exports.translate = translate;

var _nodePolyglot = require('node-polyglot');

var _nodePolyglot2 = _interopRequireDefault(_nodePolyglot);

var _currencyFormatter = require('currency-formatter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint no-console: 0 */

// Locales
// Force importing locales here, so that the module system loads them ahead
// of time.
var localesPath = './locales/';

require('./locales/fr');
require('./locales/en');

var ASSERTS = true;

function assert(x, wat) {
    if (!x) {
        var text = 'Assertion error: ' + (wat ? wat : '') + '\n' + new Error().stack;
        if (ASSERTS) {
            if (window && window.alert) {
                alert(text);
            }
            console.error(text);
        }
        return false;
    }
    return true;
}

function maybeHas(obj, prop) {
    return obj && obj.hasOwnProperty(prop);
}

function has(obj, prop, wat) {
    return assert(maybeHas(obj, prop), wat || 'object should have property ' + prop);
}

function NYI() {
    throw 'Not yet implemented';
}

var translator = null;
var alertMissing = null;
function setupTranslator(locale) {
    var p = new _nodePolyglot2.default({ allowMissing: true });
    var found = false;
    try {
        p.extend(require(localesPath + locale));
        found = true;
    } catch (e) {
        // Default locale is 'en', so the error shouldn't be shown in this
        // case.
        if (locale !== 'en') {
            console.log(e);
            p.extend(require(localesPath + 'en'));
        }
    }
    translator = p.t.bind(p);
    alertMissing = found;
}

function translate(format) {
    var bindings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var augmentedBindings = bindings;
    augmentedBindings._ = '';

    var ret = translator(format, augmentedBindings);
    if (ret === '' && alertMissing) {
        console.log('Missing translation key for "' + format + '"');
        return format;
    }

    return ret;
}

var currency = exports.currency = {
    isKnown: function isKnown(c) {
        return typeof (0, _currencyFormatter.findCurrency)(c) !== 'undefined';
    },
    symbolFor: function symbolFor(c) {
        return (0, _currencyFormatter.findCurrency)(c).symbol;
    },
    makeFormat: function makeFormat(c) {
        return function (amount) {
            return (0, _currencyFormatter.format)(amount, { code: c });
        };
    }
};

},{"./locales/en":186,"./locales/fr":187,"currency-formatter":176,"node-polyglot":180}],186:[function(require,module,exports){
'use strict';

module.exports = {

    client: {

        KRESUS: 'KRESUS',
        about: 'Kresus is a personal finance manager that allows you to have a better understanding of what your main expenses are, by computing useful statistics about your bank transactions.',

        accountwizard: {
            title: 'Welcome!',
            content: 'Kresus is a personal finance manager that allows you to have a better understanding of what your main expenses are, by computing useful statistics about your bank transactions. To start, please set up a bank account below:',
            import_title: 'Import',
            import: 'If you have exported your previous Kresus instance, you can also import it back now by selecting the JSON file created on export.',
            advanced: 'Advanced options'
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
            dont_replace: 'Don\'t replace',
            erase: 'This will erase the "%{title}" category. If there are transactions mapped to this category, and you would like to move them to an existing category, you can do so in this list (by default, all transactions will move to the "None" category). Are you sure about this?',
            title: 'Categories',
            label: 'Label'
        },

        editaccessmodal: {
            not_empty: 'Please fill the password field',
            customFields_not_empty: 'Please fill all the custom fields',
            title: 'Edit bank access',
            body: 'If your bank password changed, you need to update it in Kresus so that the bank link keeps on syncing operations from your bank account.',
            cancel: 'Cancel',
            save: 'Save'
        },

        confirmdeletemodal: {
            title: 'Confirm deletion',
            confirm: 'Confirm deletion',
            dont_delete: 'Don\'t delete'
        },

        charts: {
            amount: 'Amounts',
            balance: 'balance',
            by_category: 'by category',
            differences_all: 'differences',
            spent: 'Spent',
            received: 'Received',
            saved: 'Saved',
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
            spent: 'Spent',
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
            add_custom_label: 'Add a custom label',

            delete_operation_button: "Delete this operation",
            warning_delete: "Before deleting the operation by this mean, ensure it does not appear in the duplicates list, you can delete it there with the 'merge button'.",
            are_you_sure: 'Are you sure you still want to delete the operation %{label} (%{amount}) of %{date} ?'
        },

        search: {
            any_category: 'Any category',
            any_type: 'Any type',
            keywords: 'Keywords:',
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
            auth_type: 'Authentication type',
            birthday: 'Birthday',
            birthdate: 'Birthday',
            merchant_id: 'Merchant ID',
            birthday_placeholder: 'DDMMYYYY',
            secret: 'Secret',
            secret_placeholder: 'Enter your secret phrase here',
            favorite_code_editor: 'Favorite code editor',
            challengeanswer1: 'Challenge Answer 1',
            question1: 'Question 1',
            question2: 'Question 2',
            question3: 'Question 3',
            answer1: 'Answer 1',
            answer2: 'Answer 2',
            answer3: 'Answer 3',
            bank: 'Bank',
            login: 'Login',
            password: 'Password',
            new_bank_form_title: 'Configure a new bank access',
            duplicate_threshold: 'Duplication threshold',
            duplicate_help: 'Two transactions will appear in the Duplicates section if they both happen within this period of time of each other.',

            weboob_auto_update: 'Automatically update Weboob modules',
            weboob_auto_merge_accounts: 'Automatically merge Weboob accounts',
            weboob_enable_debug: 'Enable Weboob debug logging',
            weboob_version: "Weboob's version",

            update_weboob: 'Update weboob',
            go_update_weboob: 'Fire the update!',
            update_weboob_help: 'This will update Weboob without reinstalling it from scratch. This should be done as a first step, in case fetching transactions doesn\'t work anymore.',

            export_instance: 'Export Kresus instance',
            go_export_instance: 'Export',
            export_instance_help: 'This will export the instance to a JSON file that another Kresus instance can import. This won\'t contain the passwords of your bank accesses, which need to be reset manually when importing data from another instance.',

            browse: 'Browse',
            import_instance: 'Import Kresus instance',
            go_import_instance: 'Import',
            import_instance_help: 'This will import an existing instance, exported with the above button. It won\'t try to merge any data, so please ensure that your data is clean and delete any existing data with the DataBrowser, if needed.',
            no_file_selected: 'No file selected',

            title: 'Settings',

            tab_accounts: 'Bank accounts',
            tab_about: 'About',
            tab_backup: 'Backup / restore data',
            tab_defaults: 'Default parameters',
            tab_emails: 'Emails',
            tab_weboob: 'Weboob management',

            erase_account: 'This will erase the "%{title}" account, and all its transactions. If this is the last account bound to this bank, the bank will be erased as well. Are you sure about this?',
            erase_bank: 'This will erase the "%{name}" bank, and all its associated accounts and transactions. Are you sure about this?',
            missing_login_or_password: 'Missing login or password',
            reset: 'Reset',
            submit: 'Submit',

            delete_account_button: 'Delete account',
            delete_bank_button: 'Delete bank',
            reload_accounts_button: 'Reload accounts',
            change_password_button: 'Edit bank access',
            add_bank_button: 'Add a new bank access',
            set_default_account: 'Set as default account',
            add_operation: 'Add an operation',

            emails: {
                invalid_limit: 'Limit value is invalid',
                add_balance: 'Add a new balance notification',
                add_transaction: 'Add a new transaction notification',
                add_report: 'Add a new email report',
                account: 'Account',
                create: 'Create',
                cancel: 'Cancel',
                details: 'Details',
                balance_title: 'Balance alerts',
                transaction_title: 'Transaction alerts',
                reports_title: 'Reports',
                send_if_balance_is: 'Notify me if balance is',
                send_if_transaction_is: 'Notify me if a transaction\'s amount is',
                send_report: 'Send me a report',
                greater_than: 'greater than',
                less_than: 'less than',
                delete_alert: 'Delete alert',
                delete_report: 'Delete report',
                delete_alert_full_text: 'This will erase this alert and you won\'t receive emails and notifications about it anymore. Are you sure you want to remove this alert?',
                delete_report_full_text: 'This will erase this report and you won\'t receive emails about it anymore. Are you sure you want to remove this alert?',
                daily: 'daily',
                weekly: 'weekly',
                monthly: 'monthly'
            },

            default_chart_type: 'Default amount type',
            default_chart_period: 'Default period',
            blog: 'Blog',
            forum_thread: 'Cozy forum thread',
            license: 'License',
            sources: 'Sources'
        },

        similarity: {
            nothing_found: 'No similar transactions found.',
            title: 'Duplicates',
            help: 'Sometimes, importing bank transactions may lead to duplicate transactions, e.g. if the bank added information to a given transaction a few days after its effective date. This screen shows similarities between suspected transactions, and allows you to manually remove duplicates. Note: Categories may be transferred upon deletion: if you have a pair of duplicates A/B, in which A has a category but B doesn\'t, and you choose to delete A, then B will inherit A\'s category.',
            date: 'Date',
            label: 'Label',
            amount: 'Amount',
            category: 'Category',
            imported_on: 'Imported on',
            merge: 'Merge',
            type: 'Type'
        },

        sync: {
            no_password: 'This access\' password isn\'t set. Please set it in your bank settings and retry.',
            wrong_password: 'Your password appears to be rejected by the bank website, please go to your Kresus settings and update it.',
            first_time_wrong_password: 'The password seems to be incorrect, please type it again.',
            invalid_parameters: 'The format of one of your login or password might be incorrect: %{content}',
            expired_password: 'Your password has expired. Please change it on your bank website and update it in Kresus.',
            unknown_module: 'Unknown bank module. Please try updating Weboob.',
            unknown_error: 'Unknown error, please report: %{content}'
        },

        type: {
            none: 'None',
            unknown: 'Unknown',
            transfer: 'Transfer',
            order: 'Order',
            check: 'Check',
            deposit: 'Deposit',
            payback: 'Payback',
            withdrawal: 'Withdrawal',
            card: 'Card',
            loan_payment: 'Loan payment',
            bankfee: 'Bank fee',
            cash_deposit: 'Cash deposit'
        },

        units: {
            hours: 'hours'
        },

        addoperationmodal: {
            label: 'Title',
            amount: 'Amount',
            category: 'Category',
            cancel: 'Cancel',
            submit: 'Create',
            add_operation: 'Create an operation for the account %{account}',
            type: 'Type',
            date: 'Date',
            description: 'You\'re about to create an operation for account %{account}. Make sure your account is synced before creating it. In case you want to delete an operation which was created by mistake, please use the databrowser app.'
        },

        weboobinstallreadme: {
            title: 'Please install Weboob 1.1 or later',
            content: 'In order to work as expected, Kresus has a single dependency called Weboob. To offer you the best experience, the latest stable version of Weboob has to be installed (1.1 or later, at this point). If you are hosted by CozyCloud, this should be already installed for you and this is an error; please let the CozyCloud administrators know about this by sending an email to contact@cozycloud.cc. If you are self-hosted, you\'ll need to install Weboob as described in the README file: '
        },

        datepicker: {
            monthsFull: {
                january: 'January',
                february: 'February',
                march: 'March',
                april: 'April',
                may: 'May',
                june: 'June',
                july: 'July',
                august: 'August',
                september: 'September',
                october: 'October',
                november: 'November',
                december: 'December'
            },
            monthsShort: {
                january: 'Jan',
                february: 'Feb',
                march: 'Mar',
                april: 'Apr',
                may: 'May',
                june: 'Jun',
                july: 'Jul',
                august: 'Aug',
                september: 'Sep',
                october: 'Oct',
                november: 'Nov',
                december: 'Dec'
            },
            weekdaysFull: {
                sunday: 'Sunday',
                monday: 'Monday',
                tuesday: 'Tuesday',
                wednesday: 'Wednesday',
                thursday: 'Thursday',
                friday: 'Friday',
                saturday: 'Saturday'
            },
            weekdaysShort: {
                sunday: 'Sun',
                monday: 'Mon',
                tuesday: 'Tue',
                wednesday: 'Wed',
                thursday: 'Thu',
                friday: 'Fri',
                saturday: 'Sat'
            },
            today: 'Today',
            clear: 'Clear',
            close: 'Close',
            firstDay: '0',
            format: 'dd mmmm yyyy',
            formatSubmit: 'yyyy/mm/dd',
            labelMonthNext: 'Next month',
            labelMonthPrev: 'Previous month',
            labelMonthSelect: 'Select a month',
            labelYearSelect: 'Select a year'
        }
    },

    server: {
        alert: {
            operation: {
                title: 'Alert on transaction amount',
                lessThan: 'less than',
                greaterThan: 'greater than',
                content: 'Alert: the transaction "%{title}" from %{date} on the account "%{account}" has an amount of %{amount}, %{cmp} %{limit}.'
            },
            balance: {
                title: 'Alert on balance amount',
                lessThan: 'below the',
                greaterThan: 'above the',
                content: 'Alert: the balance on the account %{title} is %{cmp} alert threshold of %{limit}, with a balance of %{balance}.'
            }
        },

        email: {
            hello: 'Dear Kresus user,',
            signature: 'Yours truly, Kresus.\n\n(if you would like to unsubscribe or change the frequency to which you receive notifications, log into your Kresus and go to Settings > Emails)\n',
            seeyoulater: {
                notifications: 'See you soon for new notifications',
                report: 'See you soon for another report'
            },
            report: {
                daily: 'daily',
                weekly: 'weekly',
                monthly: 'monthly',
                subject: 'Your %{frequency} bank report',
                pre: '\nHere\'s your bank report of the %{today}.\n\nYour accounts\' balances:',
                last_sync: 'last sync on the',
                new_operations: 'New operations imported during this period:',
                no_new_operations: 'No new operations have been imported during that period.'
            },
            fetch_error: {
                subject: 'Error when fetching operations',
                UNKNOWN_WEBOOB_MODULE: 'The module is unknown',
                NO_PASSWORD: 'The password is not set',
                INVALID_PASSWORD: 'The password is invalid',
                EXPIRED_PASSWORD: 'The password expired',
                INVALID_PARAMETERS: 'The credentials are invalid',
                GENERIC_EXCEPTION: 'Unknown error',
                text: 'Kresus detected the following error when fetching operations from the bank %{bank}: \n%{error} (%{message}).\n',
                pause_poll: 'Please note no automatic polling will be retried until you fix the problem'
            }
        },
        notification: {
            new_operation: 'Kresus: %{smart_count} new transaction imported |||| Kresus: %{smart_count} new transactions imported'
        }
    }
};

},{}],187:[function(require,module,exports){
'use strict';

module.exports = {

    client: {

        KRESUS: 'KRESUS',
        about: 'Kresus est un gestionnaire de finances personnelles qui vous permet de mieux comprendre quelles sont vos dépenses, en calculant des statistiques intéressantes sur vos opérations bancaires.',

        accountwizard: {
            title: 'Bienvenue !',
            content: 'Kresus est un gestionnaire de finances personnelles qui vous permet de mieux comprendre quelles sont vos dépenses, en calculant des statistiques intéressantes sur vos opérations bancaires. Pour commencer, veuillez remplir le formulaire ci-dessous :',
            import_title: 'Import',
            import: 'Si vous avez exporté votre précédente instance de Kresus, vous pouvez également l\'importer de nouveau en sélectionnant le fichier JSON créé lors de l\'import.',
            advanced: 'Options avancées'
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
            erase: 'Cela va supprimer la catégorie \'%{title}\'. S\'il y a des opérations affectées à cette catégorie, vous pouvez les réaffecter à une catégorie existante à l\'aide du menu déroulant (sinon, ces opérations n\'auront plus de catégorie). Êtes-vous sûr de vouloir supprimer cette catégorie ?',
            title: 'Catégories',
            label: 'Libellé'
        },

        editaccessmodal: {
            not_empty: 'Le mot de passe est obligatoire !',
            customFields_not_empty: 'Veuillez renseigner tous les champs personnalisés',
            title: 'Changer les informations de connexion du compte',
            body: 'Si votre mot de passe bancaire a changé, vous pouvez le changer ici afin que le lien de Kresus continue de fonctionner.',
            cancel: 'Annuler',
            save: 'Sauver'
        },

        confirmdeletemodal: {
            title: 'Demande de confirmation',
            confirm: 'Confirmer la suppression',
            dont_delete: 'Ne pas supprimer'
        },

        charts: {
            amount: 'Montant',
            balance: 'solde',
            by_category: 'par catégorie',
            differences_all: 'rentrées et sorties (tous les comptes)',
            spent: 'Dépensé',
            received: 'Reçu',
            saved: 'Économisé',
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

        menu: {
            banks: 'Banques',
            categories: 'Catégories',
            charts: 'Graphiques',
            settings: 'Préférences',
            similarities: 'Doublons',
            sublists: 'Comptes',
            reports: 'Relevé'
        },

        operations: {
            amount: 'Montant :',

            column_date: 'Date',
            column_name: 'Opération',
            column_amount: 'Montant',
            column_category: 'Catégorie',
            column_type: 'Type',

            current_balance: 'Solde en cours',
            as_of: 'À la date du',
            received: 'Reçus',
            spent: 'Dépensés',
            saved: 'Économisés',

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
            add_custom_label: 'Ajouter un libellé personnalisé',

            delete_operation_button: "Supprimer l'opération",
            warning_delete: "Avant de supprimer l'opération par ce moyen, assurez-vous que celle-ci n'apparait pas dans la liste des doublons, vous pourrez la supprimer avec le bouton 'fusionner'.",
            are_you_sure: 'Êtes-vous sur(e) de toujours vouloir supprimer l\'opération %{label} (%{amount}) du %{date} ?'
        },

        search: {
            any_category: 'N\'importe quelle catégorie',
            any_type: 'N\'importe quel type',
            keywords: 'Mots-clés :',
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
            auth_type: 'Type d\'authentification',
            birthday: 'Date d\'anniversaire',
            birthdate: 'Date d\'anniversaire',
            merchant_id: 'Identifiant de marchand',
            birthday_placeholder: 'JJMMAAAA',
            secret: 'Phrase secrète',
            secret_placeholder: 'Entrez votre phrase secrète ici',
            favorite_code_editor: 'Éditeur de code préféré',
            challengeanswer1: 'Challenge Answer 1',
            question1: 'Question 1',
            question2: 'Question 2',
            question3: 'Question 3',
            answer1: 'Réponse 1',
            answer2: 'Réponse 2',
            answer3: 'Réponse 3',
            bank: 'Banque',
            login: 'Identifiant',
            password: 'Mot de passe',
            new_bank_form_title: 'Configurer un nouvel accès',
            duplicate_threshold: 'Seuil de doublon',
            duplicate_help: 'Deux opérations seront considérées comme étant des doublons dans la partie Doublons si celles-ci sont arrivées au cours de cette période temporelle (en heures).',

            weboob_auto_update: 'Mettre à jour Weboob automatiquement',
            weboob_auto_merge_accounts: 'Fusionner automatiquement les comptes Weboob',
            weboob_enable_debug: 'Activer le journal de debogue de Weboob',
            weboob_version: 'Version de Weboob',

            update_weboob: 'Mettre Weboob à jour',
            go_update_weboob: 'Lancer la mise à jour',
            update_weboob_help: 'Cette procédure va mettre à jour Weboob sans le réinstaller entièrement. Cela peut prendre quelques minutes, durant lesquelles vous ne pourrez pas importer vos comptes et opérations. À utiliser quand mettre à jour ne synchronise plus vos opérations !',

            export_instance: 'Exporter l\'instance',
            go_export_instance: 'Exporter',
            export_instance_help: 'Cela va exporter l\'instance entière au format JSON, dans un format qu\'une autre instance de Kresus peut par la suite ré-importer. Cela n\'enregistrera pas les mots de passe de vos accès bancaires, qui devront être définis après avoir importé manuellement l\'instance.',

            browse: 'Parcourir',
            import_instance: 'Importer une instance',
            go_import_instance: 'Importer',
            import_instance_help: 'Cela va importer une instance déjà existante, exportée à l\'aide du bouton ci-dessus. Aucune donnée ne sera fusionnée avec les données existantes, il est donc nécessaire de vous assurer que vous n\'avez pas déjà des données présentes ; si besoin est, vous pouvez supprimer des données existantes à l\'aide de l\'application DataBrowser.',
            no_file_selected: 'Aucun fichier sélectionné',

            title: 'Paramètres',

            tab_accounts: 'Comptes bancaires',
            tab_about: 'À propos',
            tab_backup: 'Sauvegarde et restauration',
            tab_defaults: 'Paramètres par défaut',
            tab_emails: 'Emails',
            tab_weboob: 'Gestion de Weboob',

            erase_account: 'Cela va supprimer le compte \'%{title}\' et toutes les opérations bancaires qu\'il contient. Si c\'est le dernier compte lié à cette banque, le lien bancaire sera supprimé. Êtes-vous sûr de vouloir supprimer ce compte ?',
            erase_bank: 'Cela va supprimer la banque nommée \'%{name}\', tous les comptes et toutes les opérations liées à cette banque. Êtes-vous sûr de vouloir supprimer cette banque et tous ses comptes liés ?',
            missing_login_or_password: 'Le login et le mot de passe sont obligatoires',
            reset: 'Réinitialiser',
            submit: 'Sauvegarder',

            delete_account_button: 'Supprimer compte',
            delete_bank_button: 'Supprimer banque',
            reload_accounts_button: 'Mettre à jour les comptes',
            change_password_button: 'Mettre à jour les informations de connexion',
            add_bank_button: 'Ajouter une banque',
            set_default_account: 'Définir comme compte par défaut',
            add_operation: 'Ajouter une opération',

            emails: {
                invalid_limit: 'La valeur de seuil est invalide',
                add_balance: 'Ajouter une notification sur le solde',
                add_transaction: 'Ajouter une notification sur opération',
                add_report: 'Ajouter un nouveau rapport',
                account: 'Compte',
                create: 'Créer',
                cancel: 'Annuler',
                details: 'Description',
                balance_title: 'Alertes sur solde',
                transaction_title: 'Alertes sur opérations',
                reports_title: 'Rapports',
                send_if_balance_is: 'Me prévenir si le solde est',
                send_if_transaction_is: 'Me prévenir si le montant d\'une opération est',
                send_report: 'M\'envoyer un rapport',
                greater_than: 'supérieur à',
                less_than: 'inférieur à',
                delete_alert: 'supprimer l\'alerte',
                delete_report: 'supprimer le rapport',
                delete_alert_full_text: 'Cela va supprimer l\'alerte et vous ne recevrez plus les emails et notifications associés. Êtes-vous sûr de vouloir continuer ?',
                delete_report_full_text: 'Cela va supprimer le rapport email et vous ne recevrez plus les emails associés. Êtes-vous sûr de vouloir continuer ?',
                daily: 'tous les jours',
                weekly: 'toutes les semaines',
                monthly: 'tous les mois'
            },

            default_chart_type: 'Type d\'opérations par défaut',
            default_chart_period: 'Période par défaut',
            blog: 'Blog',
            forum_thread: 'Sujet sur le forum de Cozy',
            license: 'Licence',
            sources: 'Sources'
        },

        similarity: {
            nothing_found: 'Aucune paire d\'opérations similaires n\'a été trouvée.',
            title: 'Doublons',
            help: 'Il arrive lors de l\'import des opérations bancaires que certaines d\'entre elles soient importées en double, par exemple quand la banque ajoute des informations sur une opération bancaire quelques jours après que celle-ci a eu lieu. Cet écran vous montre les potentiels doublons (opérations qui ont le même montant sur une période temporelle donnée). Remarque : les catégories sont transférées lors de la suppression : si dans une paire de doublons A / B dans laquelle A a une catégorie et B n\'en a pas, supprimer A réaffectera automatiquement sa catégorie à B.',
            date: 'Date',
            label: 'Libellé de l\'opération',
            amount: 'Montant',
            category: 'Catégorie',
            imported_on: 'Importé le',
            merge: 'Fusionner',
            type: 'Type'
        },

        sync: {
            no_password: 'Aucun mot de passe n\'est associé à ce compte, veuillez le définir dans les préférences et réessayer.',
            wrong_password: 'Le mot de passe est incorrect, veuillez le mettre à jour dans les préférences.',
            first_time_wrong_password: 'Le mot de passe semble incorrect, veuillez réessayer.',
            invalid_parameters: 'Le format de votre login ou mot de passe semble être incorrect : %{content}',
            expired_password: 'Votre mot de passe a expiré. Veuillez le mettre à jour sur le site de votre banque et dans les préférences.',
            unknown_module: 'Votre banque utilise un module non supporté par Kresus (et Weboob). Essayez de mettre à jour Weboob ou contactez un mainteneur.',
            unknown_error: 'Erreur inattendue: %{content}'
        },

        type: {
            none: 'Aucun',
            unknown: 'Inconnu',
            transfer: 'Virement',
            order: 'Prélèvement',
            check: 'Chèque',
            deposit: 'Dépôt',
            payback: 'Remboursement',
            withdrawal: 'Retrait',
            card: 'Carte',
            loan_payment: 'Remboursement d\'emprunt',
            bankfee: 'Frais bancaire',
            cash_deposit: 'Dépôt d\'espèces'
        },

        units: {
            hours: 'heures'
        },

        addoperationmodal: {
            label: 'Libellé de l\'opération',
            amount: 'Montant',
            category: 'Catégorie',
            cancel: 'Annuler',
            submit: 'Créer',
            add_operation: 'Créer une opération pour le compte %{account}',
            type: 'Type',
            date: 'Date',
            description: 'Vous vous apprêtez à créer une opération pour le compte %{account}. Assurez-vous que votre compte est bien à jour avant de la créer. Si vous voulez supprimer une opération créée à tort, utilisez l\'application databrowser.'
        },

        weboobinstallreadme: {
            title: 'Il vous manque Weboob en version 1.1 ou supérieure',
            content: 'Afin de fonctionner, Kresus a besoin d\'une dépendance unique, Weboob. Pour vous offrir la meilleure expérience possible, il est nécessaire que Weboob soit installé en version stable ou expérimentale (1.1 à ce jour). Si vous êtes hébergés par CozyCloud, cela devrait déjà avoir été installé pour vous et c\'est une erreur ; merci de contacter un administrateur de CozyCloud pour leur en faire part sur contact@cozycloud.cc. Si vous êtes auto-hébergés, vous devriez installer Weboob manuellement, comme indiqué dans le fichier lisezmoi : '
        },

        datepicker: {
            monthsFull: {
                january: 'Janvier',
                february: 'Février',
                march: 'Mars',
                april: 'Avril',
                may: 'Mai',
                june: 'Juin',
                july: 'Juillet',
                august: 'Août',
                september: 'Septembre',
                october: 'Octobre',
                november: 'Novembre',
                december: 'Décembre'
            },
            monthsShort: {
                january: 'Jan',
                february: 'Fev',
                march: 'Mar',
                april: 'Avr',
                may: 'Mai',
                june: 'Juin',
                july: 'Juil',
                august: 'Aou',
                september: 'Sep',
                october: 'Oct',
                november: 'Nov',
                december: 'Déc'
            },
            weekdaysFull: {
                sunday: 'Dimanche',
                monday: 'Lundi',
                tuesday: 'Mardi',
                wednesday: 'Mercredi',
                thursday: 'Jeudi',
                friday: 'Vendredi',
                saturday: 'Samedi'
            },
            weekdaysShort: {
                sunday: 'Dim',
                monday: 'Lun',
                tuesday: 'Mar',
                wednesday: 'Mer',
                thursday: 'Jeu',
                friday: 'Ven',
                saturday: 'Sam'
            },
            today: "Aujourd'hui",
            clear: 'Effacer',
            close: 'Fermer',
            firstDay: '1',
            format: 'dd mmmm yyyy',
            formatSubmit: 'yyyy/mm/dd',
            labelMonthNext: 'Mois suivant',
            labelMonthPrev: 'Mois précédent',
            labelMonthSelect: 'Sélectionner un mois',
            labelYearSelect: 'Sélectionner une année'
        }
    },

    server: {
        alert: {
            operation: {
                title: 'Alerte sur transaction',
                lessThan: 'inférieur',
                greaterThan: 'supérieur',
                content: 'Alerte : transaction "%{title}" du %{date} (compte %{account}) d\'un montant de %{amount}, %{cmp} à %{limit}.'
            },
            balance: {
                title: 'Alerte sur solde de compte',
                lessThan: 'sous le',
                greaterThan: 'au dessus du',
                content: 'Alerte : le solde sur le compte %{title} est %{cmp} seuil d\'alerte de %{limit}, avec un solde de %{balance}.'
            }
        },

        email: {
            hello: 'Bonjour cher.e utilisateur.rice de Kresus,',
            signature: 'Votre serviteur, Kresus.\n\n(si vous souhaitez vous désinscrire de ces notifications ou modifier la fréquence à laquelle celles-ci arrivent, connectez-vous à votre Kresus et visitez l\'onglet Préférences, puis Emails)\n',
            seeyoulater: {
                notifications: 'A bientôt pour de nouvelles notifications',
                report: 'A bientôt pour un autre rapport'
            },
            report: {
                daily: 'quotidien',
                weekly: 'hebdomadaire',
                monthly: 'mensuel',
                subject: 'Votre rapport bancaire %{frequency}',
                pre: '\nVoici votre rapport bancaire du %{today}, tout droit sorti du four.\n\nSolde de vos comptes :',
                last_sync: 'synchronisé pour la dernière fois le',
                new_operations: 'Nouvelles opérations importées durant cette période :',
                no_new_operations: 'Aucune nouvelle opération n\'a été importée au cours de cette période.'
            },
            fetch_error: {
                subject: 'Erreur de récupération des opérations bancaires',
                UNKNOWN_WEBOOB_MODULE: 'Le module weboob est inconnu',
                NO_PASSWORD: 'Le mot de passe est absent',
                INVALID_PASSWORD: 'Le mot de passe est invalide',
                EXPIRED_PASSWORD: 'Le mot de passe a expiré',
                INVALID_PARAMETERS: 'Les paramètres de connexion sont invalides',
                GENERIC_EXCEPTION: 'Erreur inconnue',
                text: 'Kresus a détecté les erreurs suivantes lors de la récuperation des operations des comptes attachés à la banque %{bank}: \n%{error} (%{message}).\n',
                pause_poll: "Veuillez noter qu'aucun import d'opération automatique ne sera tenté tant que vous n'avez pas corrigé les problèmes de connexion."
            }
        },
        notification: {
            new_operation: 'Kresus: %{smart_count} nouvelle operation importée |||| Kresus: %{smart_count} nouvelles operations importées'
        }
    }
};

},{}]},{},[60]);
