"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveVendorIdInAccount1654086373481 = void 0;
class RemoveVendorIdInAccount1654086373481 {
    async up(q) {
        await q.dropColumn('account', 'vendorId');
    }
    async down() {
        // Empty
    }
}
exports.RemoveVendorIdInAccount1654086373481 = RemoveVendorIdInAccount1654086373481;
