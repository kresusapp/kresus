import {
    In,
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    Column,
    ManyToOne,
    Repository,
} from 'typeorm';

import { getRepository } from '..';

import User from './users';
import Access from './accesses';
import Transaction from './transactions';
import Setting from './settings';

import {
    assert,
    currency,
    currencyFormatter,
    CurrencyFormatter,
    UNKNOWN_ACCOUNT_TYPE,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    unwrap,
} from '../../helpers';
import { ForceNumericColumn, DatetimeType } from '../helpers';
import { DEFAULT_CURRENCY, LIMIT_ONGOING_TO_CURRENT_MONTH } from '../../shared/settings';

@Entity('account')
export default class Account {
    private static REPO: Repository<Account> | null = null;

    private static repo(): Repository<Account> {
        if (Account.REPO === null) {
            Account.REPO = getRepository(Account);
        }
        return Account.REPO;
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

    // Access instance containing the account.
    @ManyToOne(() => Access, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    access!: Access;

    @Column('integer')
    accessId!: number;

    // Account number provided by the source. Acts as an id for other models.
    @Column('varchar')
    vendorAccountId!: string;

    // external (backend) type id or UNKNOWN_ACCOUNT_TYPE.
    @Column('varchar', { default: UNKNOWN_ACCOUNT_TYPE })
    type: string = UNKNOWN_ACCOUNT_TYPE;

    // ************************************************************************
    // ACCOUNT INFORMATION
    // ************************************************************************

    // Date at which the account has been imported.
    @Column({ type: DatetimeType })
    importDate!: Date;

    // Balance on the account, at the date at which it has been imported.
    @Column('numeric', { transformer: new ForceNumericColumn() })
    initialBalance!: number;

    // Date at which the account has been polled for the last time.
    @Column({ type: DatetimeType })
    lastCheckDate!: Date;

    // Label describing the account provided by the source.
    @Column('varchar')
    label!: string;

    // description entered by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel: string | null = null;

    // IBAN provided by the source (optional).
    @Column('varchar', { nullable: true, default: null })
    iban: string | null = null;

    // Currency used by the account.
    @Column('varchar', { nullable: true, default: null })
    currency: string | null = null;

    // If true, this account is not used to eval the balance of an access.
    @Column('boolean', { default: false })
    excludeFromBalance = false;

    // Balance on the account, updated at each account update.
    @Column('numeric', { nullable: true, default: null, transformer: new ForceNumericColumn() })
    balance: number | null = null;

    // Set to true if in the latest sync, this account didn't match any account on the provider's website.
    @Column('boolean', { default: false })
    isOrphan = false;

    // Minimum transaction age (in days) to be integrated in the database. This avoids duplicates for some banks which poorly handle details for recent transactions
    @Column('numeric', { default: 0, transformer: new ForceNumericColumn() })
    gracePeriod = 0;

    // Methods.

    computeBalance = async (offset = 0): Promise<number> => {
        // If more Account fields are ever required to make this function work, don't forget to
        // update migration #13 too!

        // We only select the columns we need, to avoid migrations issues when
        // columns are added later to the transaction model.
        const ops = await Transaction.byAccount(this.userId, this.id, [
            'amount',
            'type',
            'debitDate',
            'date',
        ]);
        const today = new Date();
        const s = ops
            .filter(op => shouldIncludeInBalance(op, today, this.type))
            .reduce((sum, op) => sum + op.amount, offset);

        return Math.round(s * 100) / 100;
    };

    computeOutstandingSum = async (): Promise<number> => {
        const ops = await Transaction.byAccount(this.userId, this.id);
        const isOngoingLimitedToCurrentMonth = await Setting.findOrCreateDefaultBooleanValue(
            this.userId,
            LIMIT_ONGOING_TO_CURRENT_MONTH
        );
        const s = ops
            .filter(op => shouldIncludeInOutstandingSum(op, isOngoingLimitedToCurrentMonth))
            .reduce((sum, op) => sum + op.amount, 0);
        return Math.round(s * 100) / 100;
    };

    getCurrencyFormatter = async (): Promise<CurrencyFormatter> => {
        let checkedCurrency;
        if (currency.isKnown(this.currency)) {
            checkedCurrency = this.currency;
        } else {
            checkedCurrency = (await Setting.findOrCreateDefault(this.userId, DEFAULT_CURRENCY))
                .value;
        }
        assert(checkedCurrency !== null, 'currency is known at this point');
        return currencyFormatter(checkedCurrency);
    };

    static async ensureBalance(account: Account): Promise<void> {
        // If there is no balance for an account, compute one based on the initial amount and the
        // transactions.
        if (account.balance === null) {
            account.balance = await account.computeBalance();
        }
    }

    // Static methods
    static renamings = {
        initialAmount: 'initialBalance',
        lastChecked: 'lastCheckDate',
        bankAccess: 'accessId',
        accountNumber: 'vendorAccountId',
        title: 'label',
    };

    static async findMany(userId: number, accountIds: number[]): Promise<Account[]> {
        const accounts = await Account.repo().findBy({ userId, id: In(accountIds) });
        await Promise.all(accounts.map(Account.ensureBalance));
        return accounts;
    }

    static async byAccess(userId: number, access: Access | { id: number }): Promise<Account[]> {
        const accounts = await Account.repo().findBy({ userId, accessId: access.id });
        await Promise.all(accounts.map(Account.ensureBalance));
        return accounts;
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Account>): Account {
        return Account.repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Account>): Promise<Account> {
        const entity = Account.repo().create({ ...attributes, userId });
        const account = await Account.repo().save(entity);
        await Account.ensureBalance(account);
        return account;
    }

    static async find(userId: number, accountId: number): Promise<Account | null> {
        const account = await Account.repo().findOne({ where: { userId, id: accountId } });
        if (account) {
            await Account.ensureBalance(account);
        }
        return account;
    }

    static async all(userId: number, ensureBalance = true): Promise<Account[]> {
        const accounts = await Account.repo().findBy({ userId });
        if (ensureBalance) {
            await Promise.all(accounts.map(Account.ensureBalance));
        }
        return accounts;
    }

    static async exists(userId: number, accountId: number): Promise<boolean> {
        const found = await Account.repo().findOne({ where: { userId, id: accountId } });
        return !!found;
    }

    static async destroy(userId: number, accountId: number): Promise<void> {
        await Account.repo().delete({ userId, id: accountId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await Account.repo().delete({ userId });
    }

    static async update(
        userId: number,
        accountId: number,
        attributes: Partial<Account>
    ): Promise<Account> {
        await Account.repo().update({ userId, id: accountId }, attributes);
        return unwrap(await Account.find(userId, accountId));
    }
}
