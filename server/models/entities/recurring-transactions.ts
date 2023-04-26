import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Repository } from 'typeorm';
import { UNKNOWN_TRANSACTION_TYPE, assert, unwrap } from '../../helpers';
import { ForceNumericColumn } from '../helpers';

import { getRepository } from '..';

import Account from './accounts';
import User from './users';
import AppliedRecurringTransaction from './applied-recurring-transactions';

@Entity('recurring-transaction')
export default class RecurringTransaction {
    private static REPO: Repository<RecurringTransaction> | null = null;

    private static repo(): Repository<RecurringTransaction> {
        if (RecurringTransaction.REPO === null) {
            RecurringTransaction.REPO = getRepository(RecurringTransaction);
        }
        return RecurringTransaction.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account!: Account;

    @Column('integer')
    accountId!: number;

    @Column('varchar', { default: UNKNOWN_TRANSACTION_TYPE })
    type: string = UNKNOWN_TRANSACTION_TYPE;

    @Column('varchar', { nullable: false })
    label!: string;

    @Column('numeric', { transformer: new ForceNumericColumn() })
    amount!: number;

    @Column('integer')
    dayOfMonth!: number;

    // List of months for which the recurring transaction creation applies.
    // Either 'all' (lowercase) for all months or the list of months indexes,
    // starting from 1 to 12, separated by a semicolon (ex: '1;3;12').
    @Column('varchar', { nullable: false, default: "'all'" })
    listOfMonths!: string;

    // Static methods.

    static isValidListOfMonths(list: string): boolean {
        if (list === 'all') {
            return true;
        }

        return /^[1-9][0-2]?(?:;[1-9][0-2]?)*$/.test(list);
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<RecurringTransaction>): RecurringTransaction {
        return RecurringTransaction.repo().create(args);
    }

    static async all(userId: number): Promise<RecurringTransaction[]> {
        return await RecurringTransaction.repo().find({ where: { userId } });
    }

    static async byAccountId(
        userId: number,
        accountId: number
    ): Promise<RecurringTransaction[] | null> {
        return await RecurringTransaction.repo().find({ where: { userId, accountId } });
    }

    static async find(userId: number, recurringTrId: number): Promise<RecurringTransaction | null> {
        return await RecurringTransaction.repo().findOne({ where: { id: recurringTrId, userId } });
    }

    static async exists(userId: number, recurringTrId: number): Promise<boolean> {
        const found = await RecurringTransaction.find(userId, recurringTrId);
        return !!found;
    }

    static async create(
        userId: number,
        attributes: Partial<RecurringTransaction>
    ): Promise<RecurringTransaction> {
        assert(
            typeof attributes.accountId === 'number',
            'recurring transaction must have an accountId'
        );
        assert(typeof attributes.type !== 'undefined', 'recurring transaction must have a type');
        assert(typeof attributes.label === 'string', 'recurring transaction must have a label');
        assert(typeof attributes.amount === 'number', 'recurring transaction must have an amount');
        assert(
            typeof attributes.dayOfMonth === 'number' &&
                attributes.dayOfMonth >= 0 &&
                attributes.dayOfMonth <= 31,
            'recurring transaction must have a day of month'
        );
        assert(
            typeof attributes.listOfMonths === 'string' &&
                RecurringTransaction.isValidListOfMonths(attributes.listOfMonths),
            'recurring transaction must have a valid list of months'
        );

        const recurringTransaction = RecurringTransaction.repo().create({ ...attributes, userId });
        return await RecurringTransaction.repo().save(recurringTransaction);
    }

    static async destroy(userId: number, recurringTrId: number): Promise<void> {
        await RecurringTransaction.repo().delete({ id: recurringTrId, userId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await RecurringTransaction.repo().delete({ userId });
    }

    static async update(
        userId: number,
        recurringTrId: number,
        fields: Partial<RecurringTransaction>
    ): Promise<RecurringTransaction> {
        // Do not allow accountId changes (that could lead to duplicates and the recurrent
        // transaction modification should be done by account anyway).
        if (typeof fields.accountId !== 'undefined') {
            delete fields.accountId;
        }
        await RecurringTransaction.repo().update({ userId, id: recurringTrId }, fields);
        return unwrap(await RecurringTransaction.find(userId, recurringTrId));
    }

    static async getCurrentMonthMissingRecurringTransactions(
        userId: number,
        accountId: number,
        month: number,
        year: number
    ): Promise<RecurringTransaction[]> {
        const qb = RecurringTransaction.repo().createQueryBuilder('recurring');
        return await qb
            .where(
                `recurring.id NOT IN ${qb
                    .subQuery()
                    .select('applied.recurringTransactionId')
                    .from(AppliedRecurringTransaction, 'applied')
                    .where('applied.userId = :userId')
                    .andWhere('applied.accountId = :accountId')
                    .andWhere('applied.month = :month')
                    .andWhere('applied.year = :year')
                    .getQuery()}`
            )
            .andWhere('recurring.userId = :userId')
            .andWhere('recurring.accountId = :accountId')
            .setParameter('userId', userId)
            .setParameter('accountId', accountId)
            .setParameter('month', month)
            .setParameter('year', year)
            .getMany();
    }
}
