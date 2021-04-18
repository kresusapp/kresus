"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsUserDefinedTypeToTransaction1586769077310 = void 0;
const typeorm_1 = require("typeorm");
class AddIsUserDefinedTypeToTransaction1586769077310 {
    async up(q) {
        await q.addColumn('transaction', new typeorm_1.TableColumn({
            name: 'isUserDefinedType',
            type: 'boolean',
            isNullable: false,
            default: false,
        }));
        // Mark existing transactions as having a user defined type; we can't
        // know for sure, but assuming it's not user-defined could lead to
        // creation of new duplicates.
        await q.manager.update('transaction', {}, { isUserDefinedType: true });
    }
    async down(q) {
        await q.dropColumn('transaction', 'isUserDefinedType');
    }
}
exports.AddIsUserDefinedTypeToTransaction1586769077310 = AddIsUserDefinedTypeToTransaction1586769077310;
