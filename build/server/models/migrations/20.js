"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksUpdate1714649322180 = void 0;
const banks_20240502_1 = require("../data-migrations/banks-20240502");
// Banks update, 2024-05-02
class BanksUpdate1714649322180 {
    async up(q) {
        await (0, banks_20240502_1.updateBanks)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.BanksUpdate1714649322180 = BanksUpdate1714649322180;
