"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddSessionInAccess1585594463828 = void 0;
const typeorm_1 = require("typeorm");
// Add a new column "session" that contains a serialized JSON object containing
// the current cookie/session store for a bank backend.
class AddSessionInAccess1585594463828 {
    async up(q) {
        await q.addColumn('access', new typeorm_1.TableColumn({
            name: 'session',
            type: 'varchar',
            isNullable: true,
            default: null,
        }));
    }
    async down(q) {
        await q.dropColumn('access', 'session');
    }
}
exports.AddSessionInAccess1585594463828 = AddSessionInAccess1585594463828;
