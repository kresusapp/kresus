import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Repository } from 'typeorm';
import { assert } from '../../helpers';

import { getRepository } from '..';

import RecurringTransactions from './recurring-transactions';
import Account from './accounts';
import User from './users';

@Entity('applied-recurring-transaction')
export default class AppliedRecurringTransaction {
    private static REPO: Repository<AppliedRecurringTransaction> | null = null;

    private static repo(): Repository<AppliedRecurringTransaction> {
        if (AppliedRecurringTransaction.REPO === null) {
            AppliedRecurringTransaction.REPO = getRepository(AppliedRecurringTransaction);
        }
        return AppliedRecurringTransaction.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    @ManyToOne(() => RecurringTransactions, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    recurringTransaction!: RecurringTransactions;

    @Column('integer')
    recurringTransactionId!: number;

    @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account!: Account;

    @Column('integer')
    accountId!: number;

    @Column('integer')
    month!: number;

    @Column('integer')
    year!: number;

    // Static methods.

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<AppliedRecurringTransaction>): AppliedRecurringTransaction {
        return AppliedRecurringTransaction.repo().create(args);
    }

    static async all(userId: number): Promise<AppliedRecurringTransaction[]> {
        return await AppliedRecurringTransaction.repo().find({ where: { userId } });
    }

    static async find(
        userId: number,
        accountId: number,
        recurringTransactionId: number,
        month: number,
        year: number
    ): Promise<AppliedRecurringTransaction | null> {
        return await AppliedRecurringTransaction.repo().findOne({
            where: {
                userId,
                accountId,
                recurringTransactionId,
                month,
                year,
            },
        });
    }

    static async byMonthAndYear(
        userId: number,
        month: number,
        year: number
    ): Promise<AppliedRecurringTransaction[]> {
        return await AppliedRecurringTransaction.repo().findBy({
            userId,
            month,
            year,
        });
    }

    static async exists(
        userId: number,
        accountId: number,
        recurringTransactionId: number,
        month: number,
        year: number
    ): Promise<boolean> {
        const found = await AppliedRecurringTransaction.find(
            userId,
            accountId,
            recurringTransactionId,
            month,
            year
        );
        return !!found;
    }

    static async create(
        userId: number,
        attributes: Partial<AppliedRecurringTransaction>
    ): Promise<AppliedRecurringTransaction> {
        assert(
            typeof attributes.accountId === 'number',
            'applied recurring transaction must have an accountId'
        );
        assert(
            typeof attributes.recurringTransactionId === 'number',
            'applied recurring transaction must have a recurring transaction id'
        );
        assert(
            typeof attributes.month === 'number' && attributes.month >= 0 && attributes.month <= 12,
            'applied recurring transaction must have a month'
        );
        assert(
            typeof attributes.year === 'number' && attributes.year > 0,
            'applied recurring transaction must have a year'
        );

        const appliedRecurringTransaction = AppliedRecurringTransaction.repo().create({
            ...attributes,
            userId,
        });
        return await AppliedRecurringTransaction.repo().save(appliedRecurringTransaction);
    }

    static async destroyAll(userId: number): Promise<void> {
        await AppliedRecurringTransaction.repo().delete({ userId });
    }

    static async replaceAccount(
        userId: number,
        accountId: number,
        replacementAccountId: number
    ): Promise<void> {
        await AppliedRecurringTransaction.repo()
            .createQueryBuilder()
            .update()
            .set({ accountId: replacementAccountId })
            .where({ userId, accountId })
            .execute();
    }
}
