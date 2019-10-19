import { assert } from '../../helpers';

const Users = {
    async exists() {
        // Hardcoded until we have SQL.
        return {
            id: 0
        };
    },

    async create() {
        assert(false, "don't create User until we implement SQL");
    },

    async all() {
        return [
            {
                id: 0
            }
        ];
    }
};

export default Users;
