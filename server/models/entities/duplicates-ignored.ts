import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    type Repository,
} from 'typeorm';

import { getRepository } from '..';

import Transaction from './transactions';
import User from './users';

// A pair of transactions the user explicitly marked as not being duplicates of each other.
// The pair is stored in a canonical form (smallest transaction id first), so that a given pair
// can only be stored once, whatever the order the two ids were submitted in.
@Entity('duplicates-ignored')
export default class DuplicatesIgnored {
    private static REPO: Repository<DuplicatesIgnored> | null = null;

    private static repo(): Repository<DuplicatesIgnored> {
        if (DuplicatesIgnored.REPO === null) {
            DuplicatesIgnored.REPO = getRepository(DuplicatesIgnored);
        }
        return DuplicatesIgnored.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    @ManyToOne(() => Transaction, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn()
    transaction!: Transaction;

    @Column('integer')
    transactionId!: number;

    @ManyToOne(() => Transaction, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn()
    otherTransaction!: Transaction;

    @Column('integer')
    otherTransactionId!: number;

    // Static methods.

    // Returns the pair in its canonical form: smallest id first.
    static sortPair(
        transactionId: number,
        otherTransactionId: number
    ): [first: number, second: number] {
        return transactionId < otherTransactionId
            ? [transactionId, otherTransactionId]
            : [otherTransactionId, transactionId];
    }

    static async all(userId: number): Promise<DuplicatesIgnored[]> {
        return await DuplicatesIgnored.repo().findBy({ userId });
    }

    // Same as all(), but with the first transaction of each pair loaded. Both transactions of a
    // pair always belong to the same account, so this is enough to know a pair's account.
    static async allWithTransaction(userId: number): Promise<DuplicatesIgnored[]> {
        return await DuplicatesIgnored.repo().find({
            where: { userId },
            relations: { transaction: true },
        });
    }

    static async find(
        userId: number,
        transactionId: number,
        otherTransactionId: number
    ): Promise<DuplicatesIgnored | null> {
        const [first, second] = DuplicatesIgnored.sortPair(transactionId, otherTransactionId);
        return await DuplicatesIgnored.repo().findOneBy({
            userId,
            transactionId: first,
            otherTransactionId: second,
        });
    }

    static async create(
        userId: number,
        transactionId: number,
        otherTransactionId: number
    ): Promise<DuplicatesIgnored> {
        const [first, second] = DuplicatesIgnored.sortPair(transactionId, otherTransactionId);

        // Don't create the same pair twice.
        const existing = await DuplicatesIgnored.find(userId, first, second);
        if (existing !== null) {
            return existing;
        }

        const entity = DuplicatesIgnored.repo().create({
            userId,
            transactionId: first,
            otherTransactionId: second,
        });
        return await DuplicatesIgnored.repo().save(entity);
    }

    static async destroy(
        userId: number,
        transactionId: number,
        otherTransactionId: number
    ): Promise<void> {
        const [first, second] = DuplicatesIgnored.sortPair(transactionId, otherTransactionId);
        await DuplicatesIgnored.repo().delete({
            userId,
            transactionId: first,
            otherTransactionId: second,
        });
    }

    static async destroyAll(userId: number): Promise<void> {
        await DuplicatesIgnored.repo().delete({ userId });
    }
}
