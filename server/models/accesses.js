import { Model } from 'objection';

import { assert, makeLogger, KError, isEmailEnabled, checkWeboobMinimalVersion } from '../helpers';

const log = makeLogger('models/accesses');

// Model.
export class AccessModel extends Model {
    static tableName = 'accesses';

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                sourceId: { type: "string" },
                login: { type: "string" },
                password: { type: "string" },
                fetchStatus: { type: "string" },
                enabled: { type: "boolean" },
            }
        };
    }

    static get relationMappings() {
        let CustomFieldModel = require('./custom-fields').CustomFieldModel;
        return {
            customFields: {
                relation: Model.HasManyRelation,
                modelClass: CustomFieldModel,
                join: {
                    from: 'accesses.id',
                    to: 'custom_fields.access_id'
                }
            }
        };
    };

    get bank() {
        log.error(`Shouldn't use access.bank anymore! Prefer non-deprecated sourceId. Accessed from:
${new Error().stack}`);
        return this.sourceId;
    }

    // Helper functions.
    hasPassword() {
        return typeof this.password !== 'undefined';
    }

    canBePolled() {
        return (
            this.enabled &&
            this.fetchStatus !== 'INVALID_PASSWORD' &&
            this.fetchStatus !== 'EXPIRED_PASSWORD' &&
            this.fetchStatus !== 'INVALID_PARAMETERS' &&
            this.fetchStatus !== 'NO_PASSWORD' &&
            this.fetchStatus !== 'ACTION_NEEDED'
        );
    }
}

// Collection.
export default class Accesses {
    static async all() {
        return await AccessModel.query().eager('customFields');
    }

    static async create(access) {
        assert(typeof access !== 'undefined' && access.customFields instanceof Array);
        await AccessModel.query().insertGraph(access);
    }

    static async update(id, fields) {
        await AccessModel.query().patch(fields).where('id', '=', id);
    }

    static async remove(id) {
        await AccessModel.query().delete().where('id', '=', id);
    }

    static async byId(id) {
        let results = await AccessModel.query().where('id', '=', id);
        if (results.length)
            return results[0];
        return null;
    }

    static async allLike({ sourceId, login, password }) {
        assert(typeof sourceId === 'string' &&
               typeof login === 'string' &&
               typeof password === 'string', "access must have at least sourceId/login/password");
        return await AccessModel.query()
            .where('sourceId', '=', sourceId)
            .andWhere('login', '=', login)
            .andWhere('password', '=', password);
    }
}
