"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsOrphanColumn1704905841767 = void 0;
const typeorm_1 = require("typeorm");
// Add the "isOrphan" column to accounts.
class AddIsOrphanColumn1704905841767 {
    async up(q) {
        await q.addColumn('account', new typeorm_1.TableColumn({
            name: 'isOrphan',
            type: 'boolean',
            isNullable: false,
            default: false,
        }));
    }
    async down() {
        // Empty
    }
}
exports.AddIsOrphanColumn1704905841767 = AddIsOrphanColumn1704905841767;
