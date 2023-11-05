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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModels = exports.getManager = exports.getRepository = exports.setupOrm = exports.AppliedRecurringTransaction = exports.RecurringTransaction = exports.User = exports.TransactionRuleCondition = exports.TransactionRuleAction = exports.TransactionRule = exports.Transaction = exports.Setting = exports.Category = exports.Budget = exports.Alert = exports.Account = exports.AccessField = exports.Access = void 0;
const path = __importStar(require("path"));
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
const accesses_1 = __importDefault(require("./entities/accesses"));
exports.Access = accesses_1.default;
const access_fields_1 = __importDefault(require("./entities/access-fields"));
exports.AccessField = access_fields_1.default;
const accounts_1 = __importDefault(require("./entities/accounts"));
exports.Account = accounts_1.default;
const alerts_1 = __importDefault(require("./entities/alerts"));
exports.Alert = alerts_1.default;
const budgets_1 = __importDefault(require("./entities/budgets"));
exports.Budget = budgets_1.default;
const categories_1 = __importDefault(require("./entities/categories"));
exports.Category = categories_1.default;
const settings_1 = __importDefault(require("./entities/settings"));
exports.Setting = settings_1.default;
const transactions_1 = __importDefault(require("./entities/transactions"));
exports.Transaction = transactions_1.default;
const transaction_rule_1 = __importDefault(require("./entities/transaction-rule"));
exports.TransactionRule = transaction_rule_1.default;
const transaction_rule_action_1 = __importDefault(require("./entities/transaction-rule-action"));
exports.TransactionRuleAction = transaction_rule_action_1.default;
const transaction_rule_condition_1 = __importDefault(require("./entities/transaction-rule-condition"));
exports.TransactionRuleCondition = transaction_rule_condition_1.default;
const users_1 = __importDefault(require("./entities/users"));
exports.User = users_1.default;
const recurring_transactions_1 = __importDefault(require("./entities/recurring-transactions"));
exports.RecurringTransaction = recurring_transactions_1.default;
const applied_recurring_transactions_1 = __importDefault(require("./entities/applied-recurring-transactions"));
exports.AppliedRecurringTransaction = applied_recurring_transactions_1.default;
const log = (0, helpers_1.makeLogger)('models/index');
let dataSource;
function makeOrmConfig() {
    let ormConfig;
    // Keep this switch in sync with ../config.ts!
    switch (process.kresus.dbType) {
        case 'sqlite':
            (0, helpers_1.assert)(process.kresus.sqlitePath !== null, 'missing db path in server/models');
            ormConfig = {
                type: 'sqlite',
                database: process.kresus.sqlitePath,
                logging: process.kresus.dbLog,
            };
            break;
        case 'postgres':
        case 'mysql':
        case 'mariadb':
            (0, helpers_1.assert)(typeof process.kresus.dbHost === 'string', 'missing db host in server/models');
            (0, helpers_1.assert)(typeof process.kresus.dbPort === 'number', 'missing db port in server/models');
            (0, helpers_1.assert)(typeof process.kresus.dbUsername === 'string', 'missing db username in server/models');
            (0, helpers_1.assert)(typeof process.kresus.dbPassword === 'string', 'missing db password in server/models');
            (0, helpers_1.assert)(typeof process.kresus.dbName === 'string', 'missing db name in server/models');
            ormConfig = {
                type: process.kresus.dbType,
                host: process.kresus.dbHost,
                port: process.kresus.dbPort,
                username: process.kresus.dbUsername,
                password: process.kresus.dbPassword,
                database: process.kresus.dbName,
                logging: process.kresus.dbLog,
            };
            break;
        default:
            (0, helpers_1.panic)('unexpected db type in server/models');
    }
    return ormConfig;
}
async function setupOrm() {
    const ormConfig = Object.assign(makeOrmConfig(), {
        // Automatically run migrations.
        migrationsRun: true,
        // Entity models.
        entities: [path.join(__dirname, 'entities/*')],
        // Migration files.
        migrations: [path.join(__dirname, 'migrations/*')],
        // Use one transaction by migration, avoiding issues on promises hanging after alter table.
        migrationsTransactionMode: 'each',
        // Automatically synchronize the database schema on startup. Very
        // unsafe, use only to look at queries generated by the ORM.
        synchronize: false,
    });
    dataSource = new typeorm_1.DataSource(ormConfig);
    await dataSource.initialize();
    log.info('database is ready');
    return dataSource;
}
exports.setupOrm = setupOrm;
function getRepository(x) {
    if (dataSource === null || typeof dataSource === 'undefined') {
        (0, helpers_1.panic)('Expected data source to be initialized');
    }
    return dataSource.getRepository(x);
}
exports.getRepository = getRepository;
function getManager() {
    if (dataSource === null || typeof dataSource === 'undefined') {
        (0, helpers_1.panic)('Expected data source to be initialized');
    }
    return dataSource.manager;
}
exports.getManager = getManager;
async function initModels() {
    dataSource = await setupOrm();
    let userId;
    if (process.kresus.providedUserId !== null) {
        userId = process.kresus.providedUserId;
        // Check that the user actually exists already.
        const user = await users_1.default.find(userId);
        if (!user) {
            throw new Error(`The user with provided ID ${userId} doesn't exist. Did you run "kresus create:user" first?`);
        }
    }
    else {
        // Create default user.
        let user;
        const users = await users_1.default.all();
        if (!users.length) {
            const { login } = process.kresus.user;
            (0, helpers_1.assert)(!!login, 'There should be a default login set!');
            log.info('Creating default user...');
            user = await users_1.default.create({ login });
        }
        else if (users.length > 1) {
            throw new Error('Several users in database but no user ID provided. Please provide a user ID');
        }
        else {
            user = users[0];
        }
        userId = user.id;
    }
    process.kresus.user.id = userId;
    log.info(`User has id ${userId}`);
}
exports.initModels = initModels;
