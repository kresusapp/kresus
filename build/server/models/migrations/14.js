"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksUpdate1654732800000 = void 0;
const banks_20220609_1 = require("../data-migrations/banks-20220609");
// Banks update, 2022-06-09
class BanksUpdate1654732800000 {
    async up(q) {
        await (0, banks_20220609_1.updateBanks)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.BanksUpdate1654732800000 = BanksUpdate1654732800000;
