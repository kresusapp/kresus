"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetDefaultBalance1648536789093 = void 0;
class SetDefaultBalance1648536789093 {
    async up(_q) {
        // No-op: used to set the default balance based on the computed balance, but this is mostly
        // wrong nowadays. Removed in #3192.
    }
    async down() {
        // Empty
    }
}
exports.SetDefaultBalance1648536789093 = SetDefaultBalance1648536789093;
