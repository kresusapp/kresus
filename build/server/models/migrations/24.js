"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddIsAdminInUser1741675783114 = void 0;
const typeorm_1 = require("typeorm");
// Add a new column "isAdmin" (boolean) to the User model.
class AddIsAdminInUser1741675783114 {
    async up(q) {
        await q.addColumn('user', new typeorm_1.TableColumn({
            name: 'isAdmin',
            type: 'boolean',
            isNullable: false,
            default: false,
        }));
        // Enable current users as administrators.
        await q.manager.update('user', {}, { isAdmin: true });
    }
    async down(q) {
        await q.dropColumn('user', 'isAdmin');
    }
}
exports.AddIsAdminInUser1741675783114 = AddIsAdminInUser1741675783114;
