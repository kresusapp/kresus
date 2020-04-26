import {
    In,
    Between,
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
    DeepPartial,
} from 'typeorm';

import User from './users';
import Account from './accounts';
import Category from './categories';

import { UNKNOWN_OPERATION_TYPE, unwrap } from '../../helpers';
import { mergeWith, ForceNumericColumn, DatetimeType, bulkInsert } from '../helpers';

// Whenever you're adding something to the model, don't forget to modify
// the mergeWith function in the helpers file.

@Entity('transaction')
export default class Transaction {
    @PrimaryGeneratedColumn()
    id!: number;

    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // Internal account id, to which the transaction is attached
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account!: Account;

    @Column('integer')
    accountId!: number;

    // internal category id.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => Category, { cascade: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn()
    category: Category | null = null;

    @Column('integer', { nullable: true, default: null })
    categoryId: number | null = null;

    // external (backend) type id or UNKNOWN_OPERATION_TYPE.
    @Column('varchar', { default: UNKNOWN_OPERATION_TYPE })
    type: string = UNKNOWN_OPERATION_TYPE;

    // ************************************************************************
    // TEXT FIELDS
    // ************************************************************************

    // short summary of what the operation is about.
    @Column('varchar')
    label!: string;

    // long description of what the operation is about.
    @Column('varchar')
    rawLabel!: string;

    // description entered by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel: string | null = null;

    // ************************************************************************
    // DATE FIELDS
    // ************************************************************************

    // date at which the operation has been processed by the backend.
    @Column({ type: DatetimeType })
    date!: Date;

    // date at which the operation has been imported into kresus.
    @Column({ type: DatetimeType })
    importDate!: Date;

    // date at which the operation has to be applied.
    @Column({ type: DatetimeType, nullable: true, default: null })
    budgetDate: Date | null = null;

    // date at which the transaction was (or will be) debited.
    @Column({ type: DatetimeType, nullable: true, default: null })
    debitDate: Date | null = null;

    // ************************************************************************
    // OTHER TRANSACTION FIELDS
    // ************************************************************************

    // amount of the operation, in a certain currency.
    @Column('numeric', { transformer: new ForceNumericColumn() })
    amount!: number;

    // whether the user has created the operation by itself, or if the backend
    // did.
    @Column('boolean', { default: false })
    createdByUser = false;

    // True if the user changed the transaction's type.
    @Column('boolean', { default: false })
    isUserDefinedType = false;

    // Methods.

    mergeWith(other: Transaction): DeepPartial<Transaction> {
        return mergeWith(this, other);
    }

    // Static methods

    static renamings = {
        raw: 'rawLabel',
        dateImport: 'importDate',
        title: 'label',
    };

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Transaction>): Transaction {
        return repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Transaction>): Promise<Transaction> {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }

    // Note: doesn't return the inserted entities.
    static async bulkCreate(userId: number, transactions: Partial<Transaction>[]): Promise<void> {
        const fullTransactions = transactions.map(op => {
            return { userId, ...op };
        });
        return await bulkInsert(repo(), fullTransactions);
    }

    static async find(userId: number, transactionId: number): Promise<Transaction | undefined> {
        return await repo().findOne({ where: { userId, id: transactionId } });
    }

    static async all(userId: number): Promise<Transaction[]> {
        return await repo().find({ userId });
    }

    static async destroy(userId: number, transactionId: number): Promise<void> {
        await repo().delete({ userId, id: transactionId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(
        userId: number,
        transactionId: number,
        fields: Partial<Transaction>
    ): Promise<Transaction> {
        await repo().update({ userId, id: transactionId }, fields);
        return unwrap(await Transaction.find(userId, transactionId));
    }

    static async byAccount(
        userId: number,
        { id: accountId }: { id: number }
    ): Promise<Transaction[]> {
        return await repo().find({ userId, accountId });
    }

    static async byAccounts(userId: number, accountIds: number[]): Promise<Transaction[]> {
        return await repo().find({ userId, accountId: In(accountIds) });
    }

    static async byBankSortedByDateBetweenDates(
        userId: number,
        account: Account,
        minDate: Date,
        maxDate: Date
    ): Promise<Transaction[]> {
        // TypeORM inserts datetime as "yyyy-mm-dd hh:mm:ss" but SELECT queries use ISO format
        // by default so we need to modify the format.
        // See https://github.com/typeorm/typeorm/issues/2694
        const lowDate = minDate.toISOString().replace(/T.*$/, ' 00:00:00.000');
        const highDate = maxDate.toISOString().replace(/T.*$/, ' 23:59:59.999');

        return await repo().find({
            where: {
                userId,
                accountId: account.id,
                date: Between(lowDate, highDate),
            },
            order: {
                date: 'DESC',
            },
        });
    }

    static async destroyByAccount(userId: number, accountId: number): Promise<void> {
        await repo().delete({ userId, accountId });
    }

    static async byCategory(userId: number, categoryId: number): Promise<Transaction[]> {
        return await repo().find({ userId, categoryId });
    }

    // Checks the input object has the minimum set of attributes required for being an operation.
    static isOperation(input: Partial<Transaction>): boolean {
        return (
            input.hasOwnProperty('accountId') &&
            input.hasOwnProperty('label') &&
            input.hasOwnProperty('date') &&
            input.hasOwnProperty('amount') &&
            input.hasOwnProperty('type')
        );
    }
}

let REPO: Repository<Transaction> | null = null;
function repo(): Repository<Transaction> {
    if (REPO === null) {
        REPO = getRepository(Transaction);
    }
    return REPO;
}
