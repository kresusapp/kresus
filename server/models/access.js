import { Model } from 'objection';

import { assert, KError, isEmailEnabled, checkWeboobMinimalVersion } from '../helpers';

// Model.
export class AccessModel extends Model {
    static tableName = 'accesses';

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                source_id: { type: "string" },
                login: { type: "string" },
                password: { type: "string" },
                fetch_status: { type: "string" },
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

    // Useful aliases. TODO: replace them in user code
    get bank() {
        return this.source_id;
    }
    get fetchStatus() {
        return this.fetch_status;
    }
}

export default class Accesses {
    static async all() {
        // Example data TODO remove
        //await AccessModel.query().insertGraph({
            //source_id: 'jeej',
            //login: "bonjour",
            //password: 'lol',
            //customFields: [{
                //name: 'customFieldName',
                //value: 'customFieldValue'
            //}, {
                //name: 'LALALA',
                //value: 'BRABRABRA'
            //}]
        //});

        let values = await AccessModel.query().eager('customFields');

        for (let v of values) {
            console.log(v.login, v.bank, v.fetchStatus, v.customFields);
        }

        return values;
    }

    // TODO (bnjbvr)
    // XXX implement other functions
    // XXX rename file to accesses.js
    // XXX update everyone so we don't use JSON.parse/JSON.stringify anymore
    // for custom fields
}
