"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanksUpdate1695709108939 = void 0;
const banks_20230926_1 = require("../data-migrations/banks-20230926");
// Banks update, 2023-09-26
class BanksUpdate1695709108939 {
    async up(q) {
        await (0, banks_20230926_1.updateBanks)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.BanksUpdate1695709108939 = BanksUpdate1695709108939;
