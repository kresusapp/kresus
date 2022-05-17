"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMigratedFromCozydb1588347903900 = void 0;
const remove_migrated_from_cozydb_1 = require("../data-migrations/remove-migrated-from-cozydb");
class RemoveMigratedFromCozydb1588347903900 {
    async up(q) {
        await (0, remove_migrated_from_cozydb_1.run)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.RemoveMigratedFromCozydb1588347903900 = RemoveMigratedFromCozydb1588347903900;
