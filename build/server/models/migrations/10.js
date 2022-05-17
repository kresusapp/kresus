"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksUpdate1628960505241 = void 0;
const banks_20210814_1 = require("../data-migrations/banks-20210814");
// Banks update, 2021-08-14
class BanksUpdate1628960505241 {
    async up(q) {
        await (0, banks_20210814_1.updateBanks)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.BanksUpdate1628960505241 = BanksUpdate1628960505241;
