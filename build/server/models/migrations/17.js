"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveWoobUseNss1692772704000 = void 0;
const remove_woob_nss_setting_1 = require("../data-migrations/remove-woob-nss-setting");
class RemoveWoobUseNss1692772704000 {
    async up(q) {
        await (0, remove_woob_nss_setting_1.run)(null, q.manager);
    }
    async down() {
        // Empty
    }
}
exports.RemoveWoobUseNss1692772704000 = RemoveWoobUseNss1692772704000;
