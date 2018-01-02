import { Model } from 'objection';

// Model.
export class UserModel extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                login: { type: 'string' },
                password: { type: 'string' },
                email: { type: 'string' }
            }
        };
    }
}

// Collection.
export default class Users {
    static async exists({ login, email }) {
        let results = await UserModel.query().where({ login, email });
        if (results.length) {
            return results[0];
        }
        return null;
    }

    static async create({ login, password, email }) {
        return await UserModel.query().insert({ login, password, email });
    }
}
