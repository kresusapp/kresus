"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetDefaultBalance1648536789093 = void 0;
const set_default_balance_1 = require("../data-migrations/set-default-balance");
class SetDefaultBalance1648536789093 {
    async up(q) {
        await (0, set_default_balance_1.setDefaultRealBalance)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.SetDefaultBalance1648536789093 = SetDefaultBalance1648536789093;
