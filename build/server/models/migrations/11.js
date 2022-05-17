"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddBalanceInAccount1631037503295 = void 0;
const typeorm_1 = require("typeorm");
class AddBalanceInAccount1631037503295 {
    async up(q) {
        await q.addColumn('account', new typeorm_1.TableColumn({
            name: 'balance',
            type: 'numeric',
            isNullable: true,
            default: null,
        }));
    }
    async down(q) {
        await q.dropColumn('account', 'balance');
    }
}
exports.AddBalanceInAccount1631037503295 = AddBalanceInAccount1631037503295;
