"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DuplicatesIgnored_1;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const __1 = require("..");
const transactions_1 = __importDefault(require("./transactions"));
const users_1 = __importDefault(require("./users"));
// A pair of transactions the user explicitly marked as not being duplicates of each other.
// The pair is stored in a canonical form (smallest transaction id first), so that a given pair
// can only be stored once, whatever the order the two ids were submitted in.
let DuplicatesIgnored = DuplicatesIgnored_1 = class DuplicatesIgnored {
    static repo() {
        if (DuplicatesIgnored_1.REPO === null) {
            DuplicatesIgnored_1.REPO = (0, __1.getRepository)(DuplicatesIgnored_1);
        }
        return DuplicatesIgnored_1.REPO;
    }
    // Static methods.
    // Returns a new sorted pair in its canonical form: smallest id first.
    static sortedPair(transactionId, otherTransactionId) {
        return transactionId < otherTransactionId
            ? [transactionId, otherTransactionId]
            : [otherTransactionId, transactionId];
    }
    static async all(userId) {
        return await DuplicatesIgnored_1.repo().findBy({ userId });
    }
    // Same as all(), but with the first transaction of each pair loaded. Both transactions of a
    // pair always belong to the same account, so this is enough to know a pair's account.
    static async allWithTransaction(userId) {
        return await DuplicatesIgnored_1.repo().find({
            where: { userId },
            relations: { transaction: true },
        });
    }
    static async find(userId, transactionId, otherTransactionId) {
        const [first, second] = DuplicatesIgnored_1.sortedPair(transactionId, otherTransactionId);
        return await DuplicatesIgnored_1.repo().findOneBy({
            userId,
            transactionId: first,
            otherTransactionId: second,
        });
    }
    static async create(userId, transactionId, otherTransactionId) {
        const [first, second] = DuplicatesIgnored_1.sortedPair(transactionId, otherTransactionId);
        // Don't create the same pair twice.
        const existing = await DuplicatesIgnored_1.find(userId, first, second);
        if (existing !== null) {
            return existing;
        }
        const entity = DuplicatesIgnored_1.repo().create({
            userId,
            transactionId: first,
            otherTransactionId: second,
        });
        return await DuplicatesIgnored_1.repo().save(entity);
    }
    // Destroy the ignored pair from the database.
    //
    // Order of the transaction id doesn't matter as it's normalized before deletion.
    //
    // Returns a boolean indicating whether a deletion actually happened.
    static async destroy(userId, transactionId, otherTransactionId) {
        const [first, second] = DuplicatesIgnored_1.sortedPair(transactionId, otherTransactionId);
        const deleteResult = await DuplicatesIgnored_1.repo().delete({
            userId,
            transactionId: first,
            otherTransactionId: second,
        });
        return typeof deleteResult.affected === 'number' && deleteResult.affected > 0;
    }
    static async destroyAll(userId) {
        await DuplicatesIgnored_1.repo().delete({ userId });
    }
};
DuplicatesIgnored.REPO = null;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DuplicatesIgnored.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_1.default, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", users_1.default)
], DuplicatesIgnored.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], DuplicatesIgnored.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transactions_1.default, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", transactions_1.default)
], DuplicatesIgnored.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], DuplicatesIgnored.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => transactions_1.default, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", transactions_1.default)
], DuplicatesIgnored.prototype, "otherTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)('integer'),
    __metadata("design:type", Number)
], DuplicatesIgnored.prototype, "otherTransactionId", void 0);
DuplicatesIgnored = DuplicatesIgnored_1 = __decorate([
    (0, typeorm_1.Entity)('duplicates-ignored')
], DuplicatesIgnored);
exports.default = DuplicatesIgnored;
