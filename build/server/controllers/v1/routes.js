"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var accesses = _interopRequireWildcard(require("./accesses"));

var accounts = _interopRequireWildcard(require("./accounts"));

var operations = _interopRequireWildcard(require("./operations"));

var alerts = _interopRequireWildcard(require("./alerts"));

var categories = _interopRequireWildcard(require("./categories"));

var budgets = _interopRequireWildcard(require("./budgets"));

var settings = _interopRequireWildcard(require("./settings"));

var all = _interopRequireWildcard(require("./all"));

var logs = _interopRequireWildcard(require("./logs"));

var demo = _interopRequireWildcard(require("./demo"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const namespace = 'api/v1';
const routes = {
  // Initialization
  'all/': {
    get: all.all,
    post: all.import_
  },
  'all/import/ofx': {
    post: all.importOFX_
  },
  'all/export': {
    post: all.export_
  },
  // Accesses
  accessId: {
    param: accesses.preloadAccess
  },
  accesses: {
    post: accesses.create
  },
  'accesses/poll': {
    get: accesses.poll
  },
  'accesses/:accessId': {
    put: accesses.update,
    delete: accesses.destroy
  },
  'accesses/:accessId/fetch/operations': {
    get: accesses.fetchOperations
  },
  'accesses/:accessId/fetch/accounts': {
    get: accesses.fetchAccounts,
    put: accesses.updateAndFetchAccounts
  },
  // Accounts
  accountId: {
    param: accounts.preloadAccount
  },
  'accounts/:accountId': {
    put: accounts.update,
    delete: accounts.destroy
  },
  'accounts/:accountId/resync-balance': {
    get: accounts.resyncBalance
  },
  // Categories
  categories: {
    post: categories.create
  },
  categoryId: {
    param: categories.preloadCategory
  },
  'categories/:categoryId': {
    put: categories.update,
    delete: categories.destroy
  },
  // Operations
  operations: {
    post: operations.create
  },
  operationID: {
    param: operations.preloadOperation
  },
  otherOperationID: {
    param: operations.preloadOtherOperation
  },
  'operations/:operationID': {
    put: operations.update,
    delete: operations.destroy
  },
  'operations/:operationID/mergeWith/:otherOperationID': {
    put: operations.merge
  },
  // Budgets
  'budgets/:year/:month': {
    get: budgets.getByYearAndMonth
  },
  'budgets/:budgetCatId/:year/:month': {
    put: budgets.update
  },
  // Settings
  settings: {
    post: settings.save
  },
  'settings/weboob': {
    get: settings.getWeboobVersion,
    put: settings.updateWeboob
  },
  'settings/test-email': {
    post: settings.testEmail
  },
  alertId: {
    param: alerts.loadAlert
  },
  alerts: {
    post: alerts.create
  },
  'alerts/:alertId': {
    put: alerts.update,
    delete: alerts.destroy
  },
  // Logs
  logs: {
    get: logs.getLogs,
    delete: logs.clearLogs
  },
  // Demo
  demo: {
    post: demo.enable,
    delete: demo.disable
  }
};
const exportedRoutes = {};
Object.keys(routes).forEach(key => {
  exportedRoutes[`${namespace}/${key}`] = routes[key];
});
var _default = exportedRoutes;
exports.default = _default;