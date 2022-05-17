"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksUpdate1622062715989 = void 0;
const banks_20210526_1 = require("../data-migrations/banks-20210526");
// Banks update, 2021-05-26
class BanksUpdate1622062715989 {
    async up(q) {
        await (0, banks_20210526_1.updateBanks)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.BanksUpdate1622062715989 = BanksUpdate1622062715989;
