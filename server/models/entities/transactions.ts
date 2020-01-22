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
    DeepPartial
} from 'typeorm';

import User from './users';
import Account from './accounts';
import Category from './categories';

import { makeLogger, UNKNOWN_OPERATION_TYPE, unwrap } from '../../helpers';
import { mergeWith, ForceNumericColumn, DatetimeType, bulkInsert } from '../helpers';

const log = makeLogger('models/entities/transactions');

// Whenever you're adding something to the model, don't forget to modify
// the mergeWith function in the helpers file.

@Entity()
export default class Transaction {
    @PrimaryGeneratedColumn()
    id;

    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // Internal account id, to which the transaction is attached
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account;

    @Column('integer')
    accountId;

    // internal category id.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => Category, { cascade: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn()
    category;

    @Column('integer', { nullable: true, default: null })
    categoryId;

    // external (backend) type id or UNKNOWN_OPERATION_TYPE.
    @Column('varchar', { default: UNKNOWN_OPERATION_TYPE })
    type = UNKNOWN_OPERATION_TYPE;

    // ************************************************************************
    // TEXT FIELDS
    // ************************************************************************

    // short summary of what the operation is about.
    @Column('varchar')
    label;

    // long description of what the operation is about.
    @Column('varchar')
    rawLabel;

    // description entered by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel;

    // ************************************************************************
    // DATE FIELDS
    // ************************************************************************

    // date at which the operation has been processed by the backend.
    @Column({ type: DatetimeType })
    date;

    // date at which the operation has been imported into kresus.
    @Column({ type: DatetimeType })
    importDate;

    // date at which the operation has to be applied.
    @Column({ type: DatetimeType, nullable: true, default: null })
    budgetDate = null;

    // date at which the transaction was (or will be) debited.
    @Column({ type: DatetimeType, nullable: true, default: null })
    debitDate;

    // ************************************************************************
    // OTHER TRANSACTION FIELDS
    // ************************************************************************

    // amount of the operation, in a certain currency.
    @Column('numeric', { transformer: new ForceNumericColumn() })
    amount;

    // whether the user has created the operation by itself, or if the backend
    // did.
    @Column('boolean', { default: false })
    createdByUser = false;

    // Methods.

    mergeWith(other: Transaction): DeepPartial<Transaction> {
        return mergeWith(this, other);
    }

    // Static methods

    static renamings = {
        raw: 'rawLabel',
        dateImport: 'importDate',
        title: 'label'
    };

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args): Transaction {
        return repo().create(args);
    }

    static async create(userId, attributes): Promise<Transaction> {
        const entity = repo().create({ userId, ...attributes });
        return await repo().save(entity);
    }

    // Note: doesn't return the inserted entities.
    static async bulkCreate(userId, transactions): Promise<void> {
        const fullTransactions = transactions.map(op => {
            return { userId, ...op };
        });
        return await bulkInsert(repo(), fullTransactions);
    }

    static async find(userId, transactionId): Promise<Transaction | undefined> {
        return await repo().findOne({ where: { userId, id: transactionId } });
    }

    static async all(userId): Promise<Transaction[]> {
        return await repo().find({ userId });
    }

    static async destroy(userId, transactionId): Promise<void> {
        await repo().delete({ userId, id: transactionId });
    }

    static async destroyAll(userId): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(userId, transactionId, fields): Promise<Transaction> {
        await repo().update({ userId, id: transactionId }, fields);
        return unwrap(await Transaction.find(userId, transactionId));
    }

    static async byAccount(userId, account): Promise<Transaction[]> {
        if (typeof account !== 'object' || typeof account.id !== 'number') {
            log.warn('Transaction.byAccount misuse: account must be an Account');
        }
        return await repo().find({ userId, accountId: account.id });
    }

    static async byAccounts(userId, accountIds): Promise<Transaction[]> {
        if (!(accountIds instanceof Array)) {
            log.warn('Transaction.byAccounts misuse: accountIds must be an array');
        }
        return await repo().find({ userId, accountId: In(accountIds) });
    }

    static async byBankSortedByDateBetweenDates(
        userId,
        account,
        minDate,
        maxDate
    ): Promise<Transaction[]> {
        if (typeof account !== 'object' || typeof account.id !== 'number') {
            log.warn(
                'Transaction.byBankSortedByDateBetweenDates misuse: account must be an Account'
            );
        }

        const lowDate = minDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z');
        const highDate = maxDate.toISOString().replace(/T.*$/, 'T00:00:00.000Z');

        return await repo().find({
            where: {
                userId,
                accountId: account.id,
                date: Between(lowDate, highDate)
            },
            order: {
                date: 'DESC'
            }
        });
    }

    static async destroyByAccount(userId, accountId): Promise<void> {
        if (typeof accountId !== 'number') {
            log.warn('Transaction.destroyByAccount misuse: accountId must be a string');
        }
        await repo().delete({ userId, accountId });
    }

    static async byCategory(userId, categoryId): Promise<Transaction[]> {
        if (typeof categoryId !== 'number') {
            log.warn(`Transaction.byCategory API misuse: ${categoryId}`);
        }
        return await repo().find({ userId, categoryId });
    }

    // Checks the input object has the minimum set of attributes required for being an operation.
    static isOperation(input): boolean {
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
