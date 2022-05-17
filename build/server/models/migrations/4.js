"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksUpdate1586890559919 = void 0;
const banks_20200414_1 = require("../data-migrations/banks-20200414");
// Banks update, 2020-04-14
class BanksUpdate1586890559919 {
    async up(q) {
        await (0, banks_20200414_1.updateBanks)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.BanksUpdate1586890559919 = BanksUpdate1586890559919;
