(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
module.exports = {
  initialize: function() {
    var Router;
    Router = require('router');
    this.router = new Router();
    Backbone.history.start();
    if (typeof Object.freeze === 'function') {
      return Object.freeze(this);
    }
  }
};

});

require.register("collections/bank_accesses", function(exports, require, module) {
var BankAccess, BankAccesses, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAccess = require('../models/bank_access');

module.exports = BankAccesses = (function(_super) {
  __extends(BankAccesses, _super);

  function BankAccesses() {
    _ref = BankAccesses.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAccesses.prototype.model = BankAccess;

  BankAccesses.prototype.url = "bankaccesses";

  return BankAccesses;

})(Backbone.Collection);

});

require.register("collections/bank_accounts", function(exports, require, module) {
var BankAccount, BankAccounts, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAccount = require('../models/bank_account');

module.exports = BankAccounts = (function(_super) {
  __extends(BankAccounts, _super);

  function BankAccounts() {
    _ref = BankAccounts.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAccounts.prototype.model = BankAccount;

  BankAccounts.prototype.url = "bankaccounts";

  return BankAccounts;

})(Backbone.Collection);

});

require.register("collections/bank_operations", function(exports, require, module) {
var BankOperation, BankOperations, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankOperation = require('../models/bank_operation');

module.exports = BankOperations = (function(_super) {
  __extends(BankOperations, _super);

  function BankOperations() {
    _ref = BankOperations.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankOperations.prototype.model = BankOperation;

  BankOperations.prototype.url = "bankoperations";

  return BankOperations;

})(Backbone.Collection);

});

require.register("collections/banks", function(exports, require, module) {
var Bank, Banks, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Bank = require('../models/bank');

module.exports = Banks = (function(_super) {
  __extends(Banks, _super);

  function Banks() {
    _ref = Banks.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Banks.prototype.model = Bank;

  Banks.prototype.url = "banks";

  Banks.prototype.getSum = function() {
    var bank, sum, _i, _len, _ref1;
    sum = 0;
    _ref1 = window.collections.banks.models;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      bank = _ref1[_i];
      sum += Number(bank.get("amount"));
    }
    return Number(sum);
  };

  return Banks;

})(Backbone.Collection);

});

require.register("initialize", function(exports, require, module) {
var AppView, BankOperationsCollection, BanksCollection, app;

app = require('application');

AppView = require('views/app');

BanksCollection = require('collections/banks');

BankOperationsCollection = require('collections/bank_operations');

$(function() {
  require('lib/app_helpers');
  /*
          global variables
  */

  window.app = app;
  window.polyglot = new Polyglot({
    "phrases": require('locale/en')
  });
  window.i18n = function(key) {
    return window.polyglot.t(key);
  };
  window.collections = {};
  window.views = {};
  window.collections.banks = new BanksCollection();
  window.collections.operations = new BankOperationsCollection();
  /*
          views
  */

  window.views.appView = new AppView();
  window.views.appView.render();
  $('.nice-scroll').niceScroll();
  window.activeObjects = {};
  _.extend(window.activeObjects, Backbone.Events);
  return app.initialize();
});

});

require.register("lib/app_helpers", function(exports, require, module) {
(function() {
  return (function() {
    var console, dummy, method, methods, _results;
    console = window.console = window.console || {};
    method = void 0;
    dummy = function() {};
    methods = 'assert,count,debug,dir,dirxml,error,exception,\
                   group,groupCollapsed,groupEnd,info,log,markTimeline,\
                   profile,profileEnd,time,timeEnd,trace,warn'.split(',');
    _results = [];
    while (method = methods.pop()) {
      _results.push(console[method] = console[method] || dummy);
    }
    return _results;
  })();
})();

Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
  var i, j, n, sign;
  n = this;
  decPlaces = (isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces);
  decSeparator = (decSeparator === undefined ? "." : decSeparator);
  thouSeparator = (thouSeparator === undefined ? "," : thouSeparator);
  sign = (n < 0 ? "-" : "");
  i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "";
  j = ((j = i.length) > 3 ? j % 3 : 0);
  return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

Number.prototype.money = function() {
  return this.formatMoney(2, " ", ",");
};

Date.prototype.dateString = function() {
  var myDate;
  myDate = this;
  return (myDate.getDate() + 1) + "/" + myDate.getMonth() + "/" + myDate.getFullYear();
};

});

require.register("lib/base_view", function(exports, require, module) {
var BaseView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    _ref = BaseView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BaseView.prototype.template = function() {};

  BaseView.prototype.initialize = function() {};

  BaseView.prototype.getRenderData = function() {
    return {
      model: this.model
    };
  };

  BaseView.prototype.render = function() {
    this.beforeRender();
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  };

  BaseView.prototype.beforeRender = function() {};

  BaseView.prototype.afterRender = function() {};

  BaseView.prototype.destroy = function() {
    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    return Backbone.View.prototype.remove.call(this);
  };

  return BaseView;

})(Backbone.View);

});

require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(_super) {
  __extends(ViewCollection, _super);

  function ViewCollection() {
    this.removeItem = __bind(this.removeItem, this);
    this.addItem = __bind(this.addItem, this);
    _ref = ViewCollection.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ViewCollection.prototype.itemview = null;

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.template = function() {
    return '';
  };

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.collectionEl = null;

  ViewCollection.prototype.onChange = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    return this.$collectionEl.append(view.el);
  };

  ViewCollection.prototype.initialize = function() {
    var collectionEl;
    ViewCollection.__super__.initialize.apply(this, arguments);
    this.views = {};
    this.listenTo(this.collection, "reset", this.onReset);
    this.listenTo(this.collection, "add", this.addItem);
    this.listenTo(this.collection, "remove", this.removeItem);
    if (this.collectionEl == null) {
      return collectionEl = el;
    }
  };

  ViewCollection.prototype.render = function() {
    var id, view, _ref1;
    _ref1 = this.views;
    for (id in _ref1) {
      view = _ref1[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var id, view, _ref1;
    this.$collectionEl = $(this.collectionEl);
    _ref1 = this.views;
    for (id in _ref1) {
      view = _ref1[id];
      this.appendView(view.$el);
    }
    this.onReset(this.collection);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.remove = function() {
    this.onReset([]);
    return ViewCollection.__super__.remove.apply(this, arguments);
  };

  ViewCollection.prototype.onReset = function(newcollection) {
    var id, view, _ref1;
    _ref1 = this.views;
    for (id in _ref1) {
      view = _ref1[id];
      view.remove();
    }
    return newcollection.forEach(this.addItem);
  };

  ViewCollection.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemview(options);
    this.views[model.cid] = view.render();
    this.appendView(view);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.removeItem = function(model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
    return this.onChange(this.views);
  };

  return ViewCollection;

})(BaseView);

});

require.register("locale/en", function(exports, require, module) {
module.exports = {
  "menu_accounts": "Accounts",
  "menu_balance": "Balance",
  "menu_add_bank": "Add a new bank access",
  "overall_balance": "overall balance:",
  "add_bank_bank": "Bank",
  "add_bank_credentials": "Credentials",
  "add_bank_login": "Login",
  "add_bank_login_placeholder": "enter login here",
  "add_bank_password": "Password",
  "add_bank_password_placeholder": "enter password here",
  "add_bank_security_notice": "Security notice",
  "add_bank_security_notice_text": "In order to protect our customers, we implemented the best solutions...",
  "add_bank_cancel": "cancel",
  "add_bank_ok": "Verify & Save",
  "accounts_delete_bank": "remove this bank from Cozy",
  "accounts_delete_bank_title": "Confirmation requires",
  "accounts_delete_bank_prompt": "Are you sure ? This can't be undone, and will erase ALL your data from this bank.",
  "accounts_delete_account": "remove this account permanently",
  "accounts_delete_account_title": "Confirmation required",
  "accounts_delete_account_prompt": "Are you sure ? This can't be undone, and will erase ALL your data from this account.",
  "loading": "loading...",
  "verifying": "verifying...",
  "removing": "removing...",
  "error": "error...",
  "sent": "sent successfully...",
  "error_refresh": "Sorry, there was an error. Please refresh and try again.",
  "alert_sure_delete_bank": "Are you sure ? This will remove all of your data from this bank, and can't be undone.",
  "alert_sure_delete_account": "Are you sure ? This will remove all of your data from this account, and can't be undone.",
  "error_loading_accounts": "There was an error loading bank accounts. Please refresh and try again later.",
  "balance_please_choose_account": "Please select an account on the left to display its operations",
  "balance_banks_empty": "There are currently no banks accounts saved. Go ahead and create the first one now !"
};

});

require.register("models/bank", function(exports, require, module) {
var Bank, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Bank = (function(_super) {
  __extends(Bank, _super);

  function Bank() {
    _ref = Bank.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Bank.prototype.defaults = {
    amount: 0
  };

  return Bank;

})(Backbone.Model);

});

require.register("models/bank_access", function(exports, require, module) {
var BankAccess, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankAccess = (function(_super) {
  __extends(BankAccess, _super);

  function BankAccess() {
    _ref = BankAccess.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAccess.prototype.url = "bankaccesses";

  return BankAccess;

})(Backbone.Model);

});

require.register("models/bank_account", function(exports, require, module) {
var BankAccount, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankAccount = (function(_super) {
  __extends(BankAccount, _super);

  function BankAccount() {
    _ref = BankAccount.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return BankAccount;

})(Backbone.Model);

});

require.register("models/bank_operation", function(exports, require, module) {
var BankOperation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankOperation = (function(_super) {
  __extends(BankOperation, _super);

  function BankOperation() {
    _ref = BankOperation.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return BankOperation;

})(Backbone.Model);

});

require.register("router", function(exports, require, module) {
var AppView, BalanceView, MockupView, Router, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MockupView = require('views/mockup');

AppView = require('views/app');

BalanceView = require('views/balance');

module.exports = Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    _ref = Router.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Router.prototype.routes = {
    '': 'balance',
    'accounts': 'accounts',
    'mockup': 'mockup',
    'mockup2': 'mockup2'
  };

  Router.prototype.balance = function() {
    var _ref1;
    return (_ref1 = window.views.balanceView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.accounts = function() {
    var _ref1;
    if (window.views.accountsView) {
      return (_ref1 = window.views.accountsView) != null ? _ref1.render() : void 0;
    } else {
      return this.navigate("/");
    }
  };

  Router.prototype.mockup = function() {
    var mainView;
    mainView = new MockupView();
    return mainView.render();
  };

  Router.prototype.mockup2 = function() {
    var accountsView;
    accountsView = new MockupView();
    accountsView.template = require('./views/templates/mockup_accounts');
    return accountsView.render();
  };

  return Router;

})(Backbone.Router);

});

require.register("views/accounts", function(exports, require, module) {
var AccountsBankView, AccountsView, BaseView, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

AccountsBankView = require('./accounts_bank');

module.exports = AccountsView = (function(_super) {
  __extends(AccountsView, _super);

  function AccountsView() {
    this.render = __bind(this.render, this);
    _ref = AccountsView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AccountsView.prototype.template = require('./templates/accounts');

  AccountsView.prototype.el = 'div#content';

  AccountsView.prototype.elBanks = '.content-right-column';

  AccountsView.prototype.render = function() {
    var bank, view, _i, _len, _ref1;
    AccountsView.__super__.render.call(this);
    _ref1 = window.collections.banks.models;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      bank = _ref1[_i];
      view = new AccountsBankView(bank);
      this.$(this.elBanks).append(view.render().el);
    }
    return this;
  };

  return AccountsView;

})(BaseView);

});

require.register("views/accounts_bank", function(exports, require, module) {
var AccountsBankAccountView, AccountsBanksView, BankAccountsCollection, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankAccountsCollection = require('../collections/bank_accounts');

AccountsBankAccountView = require('./accounts_bank_account');

module.exports = AccountsBanksView = (function(_super) {
  __extends(AccountsBanksView, _super);

  AccountsBanksView.prototype.template = require('./templates/accounts_bank');

  AccountsBanksView.prototype.className = 'bank-group';

  AccountsBanksView.prototype.inUse = false;

  AccountsBanksView.prototype.events = {
    "click a.delete-bank": "deleteBank"
  };

  function AccountsBanksView(model) {
    this.model = model;
    AccountsBanksView.__super__.constructor.call(this);
  }

  AccountsBanksView.prototype.initialize = function() {
    this.accounts = new BankAccountsCollection();
    return this.accounts.url = "banks/getAccounts/" + this.model.get("id");
  };

  AccountsBanksView.prototype.deleteBank = function(event) {
    var button, oldText, url, view;
    event.preventDefault();
    view = this;
    button = $(event.target);
    if (!this.inUse && confirm(window.i18n("alert_sure_delete_bank"))) {
      this.inUse = true;
      oldText = button.html();
      button.addClass("disabled");
      button.html(window.i18n("removing") + " <img src='./loader_red.gif' />");
      return $.ajax({
        url: url = "banks/" + this.model.get("id"),
        type: "DELETE",
        success: function(model) {
          console.log("destroyed");
          return view.destroy();
        },
        error: function(err) {
          var inUse;
          console.log("there was an error");
          console.log(err);
          return inUse = false;
        }
      });
    }
  };

  AccountsBanksView.prototype.render = function() {
    var view, viewEl;
    view = this;
    viewEl = this.$el;
    this.accounts.fetch({
      success: function(accounts) {
        var account, accountView, _i, _len, _ref;
        view.$el.html(view.template({
          model: view.model
        }));
        _ref = accounts.models;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          account = _ref[_i];
          accountView = new AccountsBankAccountView(account);
          view.$("tbody#account-container").append(accountView.render().el);
          console.log(view.$("tbody#account-container"));
        }
        if (accounts.length === 0) {
          return view.$el.html("");
        }
      },
      error: function() {
        return alert(window.i18n("error_loading_accounts"));
      }
    });
    return this;
  };

  return AccountsBanksView;

})(BaseView);

});

require.register("views/accounts_bank_account", function(exports, require, module) {
var AccountsBankAccountView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = AccountsBankAccountView = (function(_super) {
  __extends(AccountsBankAccountView, _super);

  AccountsBankAccountView.prototype.template = require('./templates/accounts_bank_account');

  AccountsBankAccountView.prototype.tagName = "tr";

  AccountsBankAccountView.prototype.events = {
    "click a.delete-account": "deleteAccount"
  };

  function AccountsBankAccountView(model) {
    this.model = model;
    AccountsBankAccountView.__super__.constructor.call(this);
  }

  AccountsBankAccountView.prototype.deleteAccount = function(event) {
    var button, oldText, view;
    event.preventDefault();
    view = this;
    button = $(event.target);
    if (!this.inUse && confirm(window.i18n("alert_sure_delete_account"))) {
      this.inUse = true;
      oldText = button.html();
      button.addClass("disabled");
      button.html(window.i18n("removing") + " <img src='./loader_yellow.gif' />");
      this.model.url = "bankaccounts/" + this.model.get("id");
      return this.model.destroy({
        success: function(model) {
          console.log("destroyed");
          window.collections.banks.trigger("account_removed");
          return view.destroy();
        },
        error: function(err) {
          var inUse;
          console.log("there was an error");
          console.log(err);
          return inUse = false;
        }
      });
    }
  };

  AccountsBankAccountView.prototype.render = function() {
    this.$el.html(this.template({
      model: this.model
    }));
    return this;
  };

  return AccountsBankAccountView;

})(BaseView);

});

require.register("views/app", function(exports, require, module) {
var AccountsView, AppView, BalanceView, BaseView, NavbarView, NewBankView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

NavbarView = require('views/navbar');

NewBankView = require('views/new_bank');

AccountsView = require('views/accounts');

BalanceView = require('views/balance');

module.exports = AppView = (function(_super) {
  __extends(AppView, _super);

  function AppView() {
    _ref = AppView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AppView.prototype.template = require('./templates/app');

  AppView.prototype.el = 'body.application';

  AppView.prototype.afterRender = function() {
    return window.collections.banks.fetch({
      success: function() {
        if (!this.navbarView) {
          this.navbarView = new NavbarView();
        }
        if (!this.newbankView) {
          this.newbankView = new NewBankView();
        }
        if (!window.views.balanceView) {
          window.views.balanceView = new BalanceView();
        }
        if (!window.views.accountsView) {
          window.views.accountsView = new AccountsView();
        }
        this.navbarView.render();
        this.newbankView.render();
        return window.views.balanceView.render();
      },
      error: function() {
        console.log("Fatal error: could not get the banks list");
        return alert("Something went wrong. Refresh.");
      }
    });
  };

  return AppView;

})(BaseView);

});

require.register("views/balance", function(exports, require, module) {
var BalanceBanksView, BalanceOperationsView, BalanceView, BankAccountsCollection, BaseView, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BalanceBanksView = require('./balance_banks');

BalanceOperationsView = require("./balance_operations");

BankAccountsCollection = require('../collections/bank_accounts');

module.exports = BalanceView = (function(_super) {
  __extends(BalanceView, _super);

  function BalanceView() {
    this.render = __bind(this.render, this);
    _ref = BalanceView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BalanceView.prototype.template = require('./templates/balance');

  BalanceView.prototype.el = 'div#content';

  BalanceView.prototype.elAccounts = '#balance-column-left';

  BalanceView.prototype.elOperations = '#balance-column-right';

  BalanceView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, "new_access_added_successfully", this.render);
  };

  BalanceView.prototype.render = function() {
    var treatment, view;
    BalanceView.__super__.render.call(this);
    this.operations = new BalanceOperationsView(this.$(this.elOperations));
    this.operations.render();
    view = this;
    treatment = function(bank, callback) {
      var viewBank;
      viewBank = new BalanceBanksView(bank);
      viewBank.accounts = new BankAccountsCollection();
      viewBank.accounts.url = "banks/getAccounts/" + bank.get("id");
      viewBank.$el.html("<p class='loading'>" + window.i18n("loading") + " <img src='./loader.gif' /></p>");
      $(view.elAccounts).append(viewBank.el);
      return viewBank.accounts.fetch({
        success: function(col) {
          callback(null, col.length);
          return viewBank.render();
        },
        error: function(col, err, opts) {
          console.log(col);
          callback(null, col.length);
          return viewBank.$el.html("");
        }
      });
    };
    async.concat(window.collections.banks.models, treatment, function(err, results) {
      if (err) {
        console.log(err);
        alert(window.i18n("error_loading_accounts"));
      }
      if (results.length === 0) {
        return $(view.elAccounts).html(require("./templates/balance_banks_empty"));
      }
    });
    return this;
  };

  return BalanceView;

})(BaseView);

});

require.register("views/balance_banks", function(exports, require, module) {
var BalanceBanksView, BankSubTitleView, BankTitleView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankTitleView = require('./bank_title');

BankSubTitleView = require('./bank_subtitle');

module.exports = BalanceBanksView = (function(_super) {
  __extends(BalanceBanksView, _super);

  BalanceBanksView.prototype.templateSub = require('./templates/balance_bank_subtitle');

  BalanceBanksView.prototype.className = 'bank';

  function BalanceBanksView(model) {
    this.model = model;
    BalanceBanksView.__super__.constructor.call(this);
  }

  BalanceBanksView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, "new_access_added_successfully", this.checkIfRenderNeccessary);
  };

  BalanceBanksView.prototype.checkIfRenderNeccessary = function(model) {
    if (this.model.get("id") === model.get("bank")) {
      return this.render;
    }
  };

  BalanceBanksView.prototype.render = function() {
    var sum, view, viewTitle;
    view = this;
    view.$el.html("");
    if (view.accounts.length > 0) {
      sum = 0;
      view.accounts.each(function(account) {
        var viewAccount;
        sum = sum + Number(account.get("amount"));
        viewAccount = new BankSubTitleView(account);
        return view.$el.append(viewAccount.render().el);
      });
      view.model.set("amount", sum);
      viewTitle = new BankTitleView(view.model);
      view.$el.prepend(viewTitle.render().el);
    }
    return this;
  };

  return BalanceBanksView;

})(BaseView);

});

require.register("views/balance_operations", function(exports, require, module) {
var BalanceBanksView, BalanceOperationsView, BankOperationsCollection, BaseView,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BalanceBanksView = require('./balance_banks');

BankOperationsCollection = require("../collections/bank_operations");

module.exports = BalanceOperationsView = (function(_super) {
  __extends(BalanceOperationsView, _super);

  BalanceOperationsView.prototype.templateHeader = require('./templates/balance_operations_header');

  BalanceOperationsView.prototype.templateElement = require('./templates/balance_operations_element');

  function BalanceOperationsView(el) {
    this.el = el;
    this.reload = __bind(this.reload, this);
    BalanceOperationsView.__super__.constructor.call(this);
  }

  BalanceOperationsView.prototype.initialize = function() {
    this.operations = new BankOperationsCollection;
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.reload);
  };

  BalanceOperationsView.prototype.render = function() {
    this.$el.html(require("./templates/balance_operations_empty"));
    return this;
  };

  BalanceOperationsView.prototype.reload = function(account) {
    var view;
    view = this;
    this.account = account;
    this.operations.url = "bankaccounts/getOperations/" + this.account.get("id");
    this.$el.html(this.templateHeader({
      model: this.account
    }));
    this.operations.fetch({
      success: function(operations) {
        view.$("#table-operations").html("");
        return operations.each(function(operation) {
          return view.$("#table-operations").append(view.templateElement({
            model: operation
          }));
        });
      }
    });
    return this;
  };

  return BalanceOperationsView;

})(BaseView);

});

require.register("views/bank_subtitle", function(exports, require, module) {
var BankSubTitleView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = BankSubTitleView = (function(_super) {
  __extends(BankSubTitleView, _super);

  BankSubTitleView.prototype.template = require('./templates/balance_bank_subtitle');

  function BankSubTitleView(model) {
    this.model = model;
    BankSubTitleView.__super__.constructor.call(this);
  }

  BankSubTitleView.prototype.events = {
    "click .row": "chooseAccount"
  };

  BankSubTitleView.prototype.initialize = function() {
    this.listenTo(this.model, 'change', this.render);
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.checkActive);
  };

  BankSubTitleView.prototype.chooseAccount = function(event) {
    console.log("Account chosen: " + this.model.get("title"));
    return window.activeObjects.trigger("changeActiveAccount", this.model);
  };

  BankSubTitleView.prototype.checkActive = function(account) {
    this.$(".row").removeClass("active");
    if (account === this.model) {
      return this.$(".row").addClass("active");
    }
  };

  return BankSubTitleView;

})(BaseView);

});

require.register("views/bank_title", function(exports, require, module) {
var BankTitleView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = BankTitleView = (function(_super) {
  __extends(BankTitleView, _super);

  BankTitleView.prototype.template = require('./templates/balance_bank_title');

  function BankTitleView(model) {
    this.model = model;
    BankTitleView.__super__.constructor.call(this);
  }

  BankTitleView.prototype.initialize = function() {
    return this.listenTo(this.model, 'change', this.render);
  };

  return BankTitleView;

})(BaseView);

});

require.register("views/mockup", function(exports, require, module) {
var AppView, BaseView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = AppView = (function(_super) {
  __extends(AppView, _super);

  function AppView() {
    _ref = AppView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AppView.prototype.template = require('./templates/mockup_balance');

  AppView.prototype.el = 'body.application';

  AppView.prototype.afterRender = function() {
    return $('.content-right-column').niceScroll();
  };

  return AppView;

})(BaseView);

});

require.register("views/navbar", function(exports, require, module) {
var BaseView, NavbarView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = NavbarView = (function(_super) {
  __extends(NavbarView, _super);

  function NavbarView() {
    _ref = NavbarView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  NavbarView.prototype.template = require('./templates/navbar');

  NavbarView.prototype.el = 'div#navbar';

  NavbarView.prototype.events = {
    "click .menu-position": "chooseMenuPosition"
  };

  NavbarView.prototype.initialize = function() {
    this.listenTo(window.activeObjects, 'changeActiveMenuPosition', this.checkActive);
    this.listenTo(window.collections.banks, 'change', this.refreshOverallBalance);
    return this.listenTo(window.collections.banks, 'destroy', this.refreshOverallBalance);
  };

  NavbarView.prototype.refreshOverallBalance = function() {
    var sum;
    sum = window.collections.banks.getSum();
    return $("span#total-amount").html(sum.money());
  };

  NavbarView.prototype.chooseMenuPosition = function(event) {
    return window.activeObjects.trigger("changeActiveMenuPosition", event.target);
  };

  NavbarView.prototype.checkActive = function(him) {
    this.$(".menu-position").removeClass("active");
    return $(him).parent().addClass("active");
  };

  return NavbarView;

})(BaseView);

});

require.register("views/new_bank", function(exports, require, module) {
var BankAccessModel, BaseView, NewBankView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankAccessModel = require('../models/bank_access');

module.exports = NewBankView = (function(_super) {
  __extends(NewBankView, _super);

  function NewBankView() {
    _ref = NewBankView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  NewBankView.prototype.template = require('./templates/new_bank');

  NewBankView.prototype.el = 'div#add-bank-window';

  NewBankView.prototype.events = {
    'click #btn-add-bank-save': "saveBank"
  };

  NewBankView.prototype.saveBank = function(event) {
    var bankAccess, button, data, oldText, view;
    event.preventDefault();
    view = this;
    button = $(event.target);
    console.log(button);
    oldText = button.html();
    button.addClass("disabled");
    button.html(window.i18n("verifying") + "<img src='./loader_green.gif' />");
    data = {
      login: $("#inputLogin").val(),
      pass: $("#inputPass").val(),
      bank: $("#inputBank").val()
    };
    bankAccess = new BankAccessModel(data);
    return bankAccess.save(data, {
      success: function(model, response, options) {
        var hide;
        button.html(window.i18n("sent") + " <img src='./loader_green.gif' />");
        hide = function() {
          $("#add-bank-window").modal("hide");
          button.removeClass("disabled");
          return button.html(oldText);
        };
        setTimeout(hide, 500);
        return window.activeObjects.trigger("new_access_added_successfully", model);
      },
      error: function(model, xhr, options) {
        console.log("Error :" + xhr);
        button.html(window.i18n("error"));
        return alert(window.i18n("error_refresh"));
      }
    });
  };

  NewBankView.prototype.getRenderData = function() {
    return {
      banks: window.collections.banks.models
    };
  };

  return NewBankView;

})(BaseView);

});

require.register("views/templates/accounts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row content-background"><div class="col-lg-12 content-right-column"></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/accounts_bank", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h2>' + escape((interp = model.get("name")) == null ? '' : interp) + '<a class="btn btn-danger pull-right delete-bank">' + escape((interp = window.i18n("accounts_delete_bank")) == null ? '' : interp) + '</a></h2><table class="table-accounts table table-striped table-hover table-bordered"><tbody id="account-container"></tbody></table>');
}
return buf.join("");
};
});

require.register("views/templates/accounts_bank_account", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td class="account-title">' + escape((interp = model.get("title")) == null ? '' : interp) + '</td><td class="operation-amount"><span class="pull-right"></span><a class="btn btn-small btn-warning pull-right delete-account">' + escape((interp = window.i18n("accounts_delete_account")) == null ? '' : interp) + '</a></td>');
}
return buf.join("");
};
});

require.register("views/templates/app", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<!-- navigation bar--><div id="navbar" class="navbar navbar-fixed-top navbar-inverse"></div><!-- modal window to add a new bank--><div id="add-bank-window" class="modal"></div><!-- content--><div id="content" class="container"></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row content-background"><div id="balance-column-left" class="col-lg-4 content-left-column"></div><div id="balance-column-right" class="col-lg-8 content-right-column"></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance_bank_subtitle", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row accounts-sub"><div class="col-lg-7"><p class="pull-left">' + escape((interp = model.get('title')) == null ? '' : interp) + '</p></div><div class="col-lg-5"><p class="pull-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + ' <span class="euro-sign">&euro;</span></p></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance_bank_title", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row accounts-top"><div class="col-lg-7"><p class="pull-left">' + escape((interp = model.get('name')) == null ? '' : interp) + '</p></div><div class="col-lg-5"><p class="pull-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + ' <span class="euro-sign">&euro;</span></p></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/balance_banks_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<p class="arrow text-right"><img src="images/arrow_vertical.png"/></p><p class="loading">' + escape((interp = window.i18n("balance_banks_empty")) == null ? '' : interp) + '</p>');
}
return buf.join("");
};
});

require.register("views/templates/balance_operations_element", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
if ( (model.get("amount") > 0))
{
buf.push('<tr class="success"><td class="operation-date">' + escape((interp = new Date(model.get('date')).dateString()) == null ? '' : interp) + '</td><td class="operation-title">' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="operation-amount"><span class="pull-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</span></td></tr>');
}
else
{
buf.push('<tr><td class="operation-date">' + escape((interp = new Date(model.get('date')).dateString()) == null ? '' : interp) + '</td><td class="operation-title">' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="operation-amount"><span class="pull-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</span></td></tr>');
}
}
return buf.join("");
};
});

require.register("views/templates/balance_operations_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<br/><br/><p class="loading">' + escape((interp = window.i18n("balance_please_choose_account")) == null ? '' : interp) + '</p>');
}
return buf.join("");
};
});

require.register("views/templates/balance_operations_header", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h2>' + escape((interp = model.get("title")) == null ? '' : interp) + '</h2><table class="table table-striped table-hover"><tbody id="table-operations"><tr><td><p class="loading"><img src="./loader.gif"/></p></td></tr></tbody></table>');
}
return buf.join("");
};
});

require.register("views/templates/mockup_accounts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<!-- navigation bar--><div class="navbar navbar-fixed-top navbar-inverse"><div class="container"><button type="button" data-toggle="collapse" data-target=".nav-collapse" class="navbar-toggle"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><span class="navbar-brand">Cozy PFM</span><div class="nav-collapse collapse"><ul class="nav navbar-nav"><li><a id="menu-pos-balance" href="#">' + escape((interp = window.i18n("menu_balance")) == null ? '' : interp) + '</a></li><li class="active"><a id="menu-pos-accounts" href="#accounts">' + escape((interp = window.i18n("menu_accounts")) == null ? '' : interp) + '</a></li><li><a id="menu-pos-new-bank" data-toggle="modal" href="#add-bank-window">' + escape((interp = window.i18n("menu_add_bank")) == null ? '' : interp) + '</a></li></ul><ul class="nav navbar-nav pull-right"><p class="navbar-text">' + escape((interp = window.i18n("overall_balance")) == null ? '' : interp) + ' <span id="total-amount">+12967.72</span></p></ul></div></div></div><!-- modal window to add a new bank--><div id="add-bank-window" class="modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">' + escape((interp = window.i18n("menu_add_bank")) == null ? '' : interp) + '</h4></div><div class="modal-body"><form><fieldset><legend>' + escape((interp = window.i18n("add_bank_bank")) == null ? '' : interp) + '</legend><div class="form-group"><select class="form-control"><option>Le Crédit Lyonnais</option><option>Société Générale</option></select></div></fieldset><fieldset><legend>' + escape((interp = window.i18n("add_bank_credentials")) == null ? '' : interp) + '</legend><div class="form-group"><label for="inputLogin">' + escape((interp = window.i18n("add_bank_login")) == null ? '' : interp) + '</label><input');
buf.push(attrs({ 'id':('inputLogin'), 'type':('text'), 'placeholder':(window.i18n("add_bank_login_placeholder")), "class": ('form-control') }, {"type":true,"placeholder":true}));
buf.push('/></div><div class="form-group"><label for="inputPass">' + escape((interp = window.i18n("add_bank_password")) == null ? '' : interp) + '</label><input');
buf.push(attrs({ 'id':('inputPass'), 'type':('password'), 'placeholder':(window.i18n("add_bank_password_placeholder")), "class": ('form-control') }, {"type":true,"placeholder":true}));
buf.push('/></div></fieldset></form><h3 class="important-notice"> \n' + escape((interp = window.i18n("add_bank_security_notice")) == null ? '' : interp) + '</h3><p> \n' + escape((interp = window.i18n("add_bank_security_notice_text")) == null ? '' : interp) + '</p></div><div class="modal-footer"><a data-dismiss="modal" href="#" class="btn btn-link">' + escape((interp = window.i18n("add_bank_cancel")) == null ? '' : interp) + '</a><a href="#" class="btn btn-success">' + escape((interp = window.i18n("add_bank_ok")) == null ? '' : interp) + '</a></div></div></div></div><!-- content--><div id="content" class="container"><div class="row content-background"><div class="col-lg-12 content-right-column"><div class="group-bank"><h2>Le Crédit Lyonnais<a class="btn btn-danger pull-right"> \n' + escape((interp = window.i18n("accounts_delete_bank")) == null ? '' : interp) + '</a></h2><table class="table-accounts table table-striped table-hover table-bordered"><tbody><tr><td class="account-title">Compte bancaire</td><td class="operation-amount"><span class="pull-right"><a class="btn btn-small btn-warning pull-right">' + escape((interp = window.i18n("accounts_delete_account")) == null ? '' : interp) + '</a></span></td></tr></tbody></table></div><div class="group-bank"><h2>Société Générale<a class="btn btn-danger pull-right">' + escape((interp = window.i18n("accounts_delete_bank")) == null ? '' : interp) + '</a></h2><table class="table-accounts table table-striped table-hover table-bordered"><tbody><tr><td class="account-title">Compte bancaire 1</td><td class="operation-amount"><span class="pull-right"><a class="btn btn-small btn-warning pull-right">' + escape((interp = window.i18n("accounts_delete_account")) == null ? '' : interp) + '</a></span></td></tr><tr><td class="account-title">Compte bancaire 2</td><td class="operation-amount"><span class="pull-right"><a class="btn btn-small btn-warning pull-right">' + escape((interp = window.i18n("accounts_delete_account")) == null ? '' : interp) + '</a></span></td></tr></tbody></table></div></div></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/mockup_balance", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="navbar navbar-fixed-top navbar-inverse"><div class="container"><button type="button" data-toggle="collapse" data-target=".nav-collapse" class="navbar-toggle"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><span class="navbar-brand">Cozy PFM</span><div class="nav-collapse collapse"><ul class="nav navbar-nav"><li class="active"><a id="menu-pos-balance" href="#">Balance</a></li><li><a id="menu-pos-accounts" href="#accounts">Accounts</a></li><li><a id="menu-pos-new-bank" data-toggle="modal" href="#add-bank-window">Add a new bank</a></li></ul><ul class="nav navbar-nav pull-right"><p class="navbar-text">overall balance <span id="total-amount">+12967.72</span></p></ul></div></div></div><div id="content" class="container"><div class="row content-background"><div class="col-lg-4 content-left-column"><div class="row accounts-top"><div class="col-lg-8"><p class="pull-left">Le Crédit Lyonnais</p></div><div class="col-lg-4"><p class="pull-right">+12942.23 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-sub"><div class="col-lg-8"><p class="pull-left">Compte bancaire</p></div><div class="col-lg-4"><p class="pull-right">+12942.23 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-top active"><div class="col-lg-8"><p class="pull-left">Société Générale</p></div><div class="col-lg-4"><p class="pull-right">+25.49 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-sub"><div class="col-lg-8"><p class="pull-left">Compte bancaire 1</p></div><div class="col-lg-4"><p class="pull-right">+26.49 <span class="euro-sign">&euro;</span></p></div></div><div class="row accounts-sub"><div class="col-lg-8"><p class="pull-left">Compte bancaire 2</p></div><div class="col-lg-4"><p class="pull-right">-1.00 <span class="euro-sign">&euro;</span></p></div></div></div><div class="col-lg-8 content-right-column"><h2>Société Générale</h2><table id="table-operations" class="table table-striped table-hover"><tbody><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr class="success"><td class="operation-date">17/07/2013</td><td class="operation-title">CB Tesco</td><td class="operation-amount"><span class="pull-right positive-balance">+123.30</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-12.90</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">Ferrari Paris</td><td class="operation-amount"><span class="pull-right">-490550.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Apple</td><td class="operation-amount"><span class="pull-right">- 1899.00</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-1.23</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-25.39</span></td></tr><tr><td class="operation-date">17/07/2013</td><td class="operation-title">CB Intermarché</td><td class="operation-amount"><span class="pull-right">-0.12</span></td></tr></tbody></table></div></div><div id="add-bank-window" class="modal"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">Add a new bank</h4></div><div class="modal-body"><form><fieldset><legend>Bank</legend><div class="form-group"><select class="form-control"><option>Le Crédit Lyonnais</option><option>Société Générale</option></select></div></fieldset><fieldset><legend>Credentials</legend><div class="form-group"><label for="inputLogin">Login</label><input id="inputLogin" type="text" placeholder="enter login" class="form-control"/></div><div class="form-group"><label for="inputPass">Password</label><input id="inputPass" type="password" placeholder="enter password" class="form-control"/></div></fieldset></form><h3 class="important-notice">Security notice</h3><p>In order to protect our customers, we implemented the best solutions.</p><p>We are great, because ...</p></div><div class="modal-footer"><a data-dismiss="modal" href="#" class="btn btn-link">cancel</a><a href="#" class="btn btn-success">Verify & Save</a></div></div></div></div><!--.row#foot<div class="col-lg-12"><p class="text-muted">Click here to read about <a href="#">our highest security standards</a></p><p class="text-muted pull-right"><a href="http://cozycloud.cc">CozyCloud.cc </a>- the cloud you own.</p></div>--></div>');
}
return buf.join("");
};
});

require.register("views/templates/navbar", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="container"><button type="button" data-toggle="collapse" data-target=".nav-collapse" class="navbar-toggle"><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><span class="navbar-brand">Cozy PFM</span><div class="nav-collapse collapse"><ul class="nav navbar-nav"><li class="menu-position active"><a id="menu-pos-balance" href="#">' + escape((interp = window.i18n("menu_balance")) == null ? '' : interp) + '</a></li><li class="menu-position"><a id="menu-pos-accounts" href="#accounts">' + escape((interp = window.i18n("menu_accounts")) == null ? '' : interp) + '</a></li><li><a id="menu-pos-new-bank" data-toggle="modal" href="#add-bank-window">' + escape((interp = window.i18n("menu_add_bank")) == null ? '' : interp) + '</a></li></ul><ul class="nav navbar-nav pull-right"><p class="navbar-text">' + escape((interp = window.i18n("overall_balance")) == null ? '' : interp) + ' <span id="total-amount">0,00</span></p></ul></div></div>');
}
return buf.join("");
};
});

require.register("views/templates/new_bank", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" class="close">x</button><h4 class="modal-title">' + escape((interp = window.i18n("menu_add_bank")) == null ? '' : interp) + '</h4></div><div class="modal-body"><form><fieldset><legend>' + escape((interp = window.i18n("add_bank_bank")) == null ? '' : interp) + '</legend><div class="form-group"><select id="inputBank" class="form-control">');
// iterate banks
;(function(){
  if ('number' == typeof banks.length) {

    for (var $index = 0, $$l = banks.length; $index < $$l; $index++) {
      var bank = banks[$index];

buf.push('<option');
buf.push(attrs({ 'value':(bank.get("id")) }, {"value":true}));
buf.push('>');
var __val__ = bank.get("name")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</option>');
    }

  } else {
    var $$l = 0;
    for (var $index in banks) {
      $$l++;      var bank = banks[$index];

buf.push('<option');
buf.push(attrs({ 'value':(bank.get("id")) }, {"value":true}));
buf.push('>');
var __val__ = bank.get("name")
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</option>');
    }

  }
}).call(this);

buf.push('</select></div></fieldset><fieldset><legend>' + escape((interp = window.i18n("add_bank_credentials")) == null ? '' : interp) + '</legend><div class="form-group"><label for="inputLogin">' + escape((interp = window.i18n("add_bank_login")) == null ? '' : interp) + '</label><input');
buf.push(attrs({ 'id':('inputLogin'), 'type':('text'), 'placeholder':(window.i18n("add_bank_login_placeholder")), "class": ('form-control') }, {"type":true,"placeholder":true}));
buf.push('/></div><div class="form-group"><label for="inputPass">' + escape((interp = window.i18n("add_bank_password")) == null ? '' : interp) + '</label><input');
buf.push(attrs({ 'id':('inputPass'), 'type':('password'), 'placeholder':(window.i18n("add_bank_password_placeholder")), "class": ('form-control') }, {"type":true,"placeholder":true}));
buf.push('/></div></fieldset></form><h3 class="important-notice"> \n' + escape((interp = window.i18n("add_bank_security_notice")) == null ? '' : interp) + '</h3><p> \n' + escape((interp = window.i18n("add_bank_security_notice_text")) == null ? '' : interp) + '</p></div><div class="modal-footer"><a data-dismiss="modal" href="#" class="btn btn-link">' + escape((interp = window.i18n("add_bank_cancel")) == null ? '' : interp) + '</a><a id="btn-add-bank-save" href="#" class="btn btn-success">' + escape((interp = window.i18n("add_bank_ok")) == null ? '' : interp) + '</a></div></div></div>');
}
return buf.join("");
};
});


//@ sourceMappingURL=app.js.map