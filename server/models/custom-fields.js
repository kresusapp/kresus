import { Model } from 'objection';

// Model.
export class CustomFieldModel extends Model {
    static get tableName() {
        return 'custom_fields';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'value'],
            properties: {
                name: { type: 'string' },
                value: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        let AccessModel = require('./access').AccessModel;
        return {
            access: {
                relation: Model.BelongsToOneRelation,
                modelClass: AccessModel,
                join: {
                    from: 'custom_fields.accessId',
                    to: 'accesses.id'
                }
            }
        };
    }
}
