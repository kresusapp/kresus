import { Model } from 'objection';

import { assert, makeLogger } from '../helpers';

const log = makeLogger('models/accounts');

// Model.
export class AccountModel extends Model {
    static get tableName() {
        return 'accounts';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                sourceAccountNumber: { type: 'string' },
                sourceLabel: { type: 'string' },
                iban: { type: 'string' },
                currency: { type: 'string' },
                initialBalance: { type: 'number' },
                importedAt: { type: 'date' },
                lastCheckedAt: { type: 'datetime' },
                excludeFromBalance: { type: 'boolean' }
            }
        };
    }

    static get relationMappings() {
        let OperationModel = require('./operation').OperationModel;
        return {
            customFields: {
                relation: Model.HasManyRelation,
                modelClass: OperationModel,
                join: {
                    from: 'accounts.id',
                    to: 'transactions.accountId'
                }
            }
        };
    }

    // Deprecated members helpers.
    get bank() {
        log.error(`Trying to access undefined bank property!`);
        log.warn(new Error().stack);
    }

    get bankAccess() {
        log.error(`Don't use deprecated bankAccess but use accessId instead!`);
        log.warn(new Error().stack);
        return this.accessId;
    }

    get accountNumber() {
        log.error(`Don't use deprecated accountNumber but use sourceAccountNumber instead!`);
        log.warn(new Error().stack);
        return this.sourceAccountNumber;
    }

    get importDate() {
        log.error(`Don't use deprecated importDate but use importedAt instead!`);
        log.warn(new Error().stack);
        return this.importedAt;
    }

    get initialAmount() {
        log.error(`Don't use deprecated initialAmount but use initialBalance instead!`);
        log.warn(new Error().stack);
        return this.initialBalance;
    }

    get lastChecked() {
        log.error(`Don't use deprecated lastChecked but use lastCheckedAt instead!`);
        log.warn(new Error().stack);
        return this.lastCheckedAt;
    }

    get title() {
        log.error(`Don't use deprecated title but use sourceLabel instead!`);
        log.warn(new Error().stack);
        return this.sourceLabel;
    }
}

// TODO finish accounts!

// Collection.
export default class Accounts {
    static async all(userId) {
        return await AccountModel.query()
            .where({ userId });
    }

    static async byAccess(userId, access) {
        return await AccountModel.query()
            .where({ userId, accessId: access.id });
    }

    static async create(userId, accountccess) {
        assert(typeof access !== 'undefined' && access.customFields instanceof Array);
        let accountModel = { ...account, userId };
        await AccountModel.query().insertGraph(accountModel);
    }

    static async update(userId, id, fields) {
        await AccountModel.query()
            .patch(fields)
            .where({ id, userId });
    }

    static async remove(userId, id) {
        await AccountModel.query()
            .delete()
            .where({ id, userId });
    }

    static async byId(userId, id) {
        let results = await AccountModel.query().where({ id, userId });
        if (results.length) {
            return results[0];
        }
        return null;
    }
}
