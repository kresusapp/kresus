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

import { UNKNOWN_TRANSACTION_TYPE, unwrap } from '../../helpers';
import { mergeWith, ForceNumericColumn, DatetimeType, bulkInsert } from '../helpers';

// Whenever you're adding something to the model, don't forget to modify
// the mergeWith function in the helpers file.

@Entity('transaction')
export default class Transaction {
    private static REPO: Repository<Transaction> | null = null;

    private static repo(): Repository<Transaction> {
        if (Transaction.REPO === null) {
            Transaction.REPO = getRepository(Transaction);
        }
        return Transaction.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // Internal account id, to which the transaction is attached
    @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account!: Account;

    @Column('integer')
    accountId!: number;

    // internal category id.
    @ManyToOne(() => Category, { cascade: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn()
    category: Category | null = null;

    @Column('integer', { nullable: true, default: null })
    categoryId: number | null = null;

    // external (backend) type id or UNKNOWN_TRANSACTION_TYPE.
    @Column('varchar', { default: UNKNOWN_TRANSACTION_TYPE })
    type: string = UNKNOWN_TRANSACTION_TYPE;

    // ************************************************************************
    // TEXT FIELDS
    // ************************************************************************

    // short summary of what the transaction is about.
    @Column('varchar')
    label!: string;

    // long description of what the transaction is about.
    @Column('varchar')
    rawLabel!: string;

    // description entered by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel: string | null = null;

    // ************************************************************************
    // DATE FIELDS
    // ************************************************************************

    // date at which the transaction has been processed by the backend.
    @Column({ type: DatetimeType })
    date!: Date;

    // date at which the transaction has been imported into kresus.
    @Column({ type: DatetimeType })
    importDate!: Date;

    // date at which the transaction has to be applied.
    @Column({ type: DatetimeType, nullable: true, default: null })
    budgetDate: Date | null = null;

    // date at which the transaction was (or will be) debited.
    @Column({ type: DatetimeType, nullable: true, default: null })
    debitDate: Date | null = null;

    // ************************************************************************
    // OTHER TRANSACTION FIELDS
    // ************************************************************************

    // amount of the transaction, in a certain currency.
    @Column('numeric', { transformer: new ForceNumericColumn() })
    amount!: number;

    // whether the user has created the transaction by itself, or if the backend
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
        return Transaction.repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Transaction>): Promise<Transaction> {
        const entity = Transaction.repo().create({ ...attributes, userId });
        return await Transaction.repo().save(entity);
    }

    // Note: doesn't return the inserted entities.
    static async bulkCreate(userId: number, transactions: Partial<Transaction>[]): Promise<void> {
        const fullTransactions = transactions.map(tr => {
            return { ...tr, userId };
        });
        return await bulkInsert(Transaction.repo(), fullTransactions);
    }

    static async find(userId: number, transactionId: number): Promise<Transaction | undefined> {
        return await Transaction.repo().findOne({ where: { userId, id: transactionId } });
    }

    static async all(userId: number): Promise<Transaction[]> {
        return await Transaction.repo().find({ userId });
    }

    static async destroy(userId: number, transactionId: number): Promise<void> {
        await Transaction.repo().delete({ userId, id: transactionId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await Transaction.repo().delete({ userId });
    }

    static async update(
        userId: number,
        transactionId: number,
        fields: DeepPartial<Transaction>
    ): Promise<Transaction> {
        await Transaction.repo().update({ userId, id: transactionId }, fields);
        return unwrap(await Transaction.find(userId, transactionId));
    }

    static async byAccount(
        userId: number,
        { id: accountId }: { id: number }
    ): Promise<Transaction[]> {
        return await Transaction.repo().find({ userId, accountId });
    }

    static async byAccounts(userId: number, accountIds: number[]): Promise<Transaction[]> {
        return await Transaction.repo().find({ userId, accountId: In(accountIds) });
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
        const lowDate = `${minDate.getFullYear()}-${(minDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${minDate.getDate().toString().padStart(2, '0')} 00:00:00.000`;
        const highDate = `${maxDate.getFullYear()}-${(maxDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}-${maxDate.getDate().toString().padStart(2, '0')} 23:59:59.999`;

        return await Transaction.repo().find({
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
        await Transaction.repo().delete({ userId, accountId });
    }

    static async replaceCategory(
        userId: number,
        categoryId: number,
        replacementCategoryId: number
    ): Promise<void> {
        await Transaction.repo()
            .createQueryBuilder()
            .update()
            .set({ categoryId: replacementCategoryId })
            .where({ userId, categoryId })
            .execute();
    }

    // Checks the input object has the minimum set of attributes required for being a transaction.
    static isTransaction(input: Partial<Transaction>): boolean {
        return (
            input.hasOwnProperty('accountId') &&
            input.hasOwnProperty('label') &&
            input.hasOwnProperty('date') &&
            input.hasOwnProperty('amount') &&
            input.hasOwnProperty('type')
        );
    }
}
