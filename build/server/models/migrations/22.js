"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addExcludeFromSync1731961575709 = void 0;
const typeorm_1 = require("typeorm");
// Add the "excludeFromPoll" column to accesses.
class addExcludeFromSync1731961575709 {
    async up(q) {
        await q.addColumn('access', new typeorm_1.TableColumn({
            name: 'excludeFromPoll',
            type: 'boolean',
            isNullable: false,
            default: false,
        }));
    }
    async down(q) {
        await q.dropColumn('access', 'excludeFromPoll');
    }
}
exports.addExcludeFromSync1731961575709 = addExcludeFromSync1731961575709;
