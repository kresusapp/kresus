"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGracePeriod1727285965918 = void 0;
const typeorm_1 = require("typeorm");
// Add the "gracePeriod" column to accounts
class addGracePeriod1727285965918 {
    async up(q) {
        await q.addColumn('account', new typeorm_1.TableColumn({
            name: 'gracePeriod',
            type: 'numeric',
            isNullable: false,
            default: 0,
        }));
    }
    async down(q) {
        await q.dropColumn('account', 'gracePeriod');
    }
}
exports.addGracePeriod1727285965918 = addGracePeriod1727285965918;
