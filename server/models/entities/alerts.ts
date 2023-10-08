import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Repository } from 'typeorm';

import { getRepository, Transaction, Account, User } from '../';

import { assert, formatDate, translate as $t, unwrap } from '../../helpers';
import { I18NObject } from '../../shared/helpers';
import { ForceNumericColumn, DatetimeType } from '../helpers';

@Entity('alert')
export default class Alert {
    private static REPO: Repository<Alert> | null = null;

    private static repo(): Repository<Alert> {
        if (Alert.REPO === null) {
            Alert.REPO = getRepository(Alert);
        }
        return Alert.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // Account related to the alert.
    @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account!: Account;

    @Column('integer')
    accountId!: number;

    // Alert type. Possible options are: report, balance, transaction.
    @Column('varchar')
    type!: string;

    // Frequency, for reports : daily, weekly, monthly.
    @Column('varchar', { nullable: true, default: null })
    frequency: string | null = null;

    // Threshold value, for balance/transaction alerts.
    @Column('numeric', { nullable: true, default: null, transformer: new ForceNumericColumn() })
    limit: number | null = null;

    // Ordering, for balance/transaction alerts: gt, lt.
    @Column('varchar', { nullable: true, default: null })
    order: string | null = null;

    // When did the alert get triggered for the last time?
    @Column({ type: DatetimeType, nullable: true, default: null })
    lastTriggeredDate: Date | null = null;

    // Methods.

    testTransaction(tr: Transaction): boolean {
        if (this.type !== 'transaction') {
            return false;
        }
        assert(this.limit !== null, 'limit must be set for testTransaction');
        const amount = Math.abs(tr.amount);
        return (
            (this.order === 'lt' && amount <= this.limit) ||
            (this.order === 'gt' && amount >= this.limit)
        );
    }

    testBalance(balance: number): boolean {
        if (this.type !== 'balance') {
            return false;
        }
        assert(this.limit !== null, 'limit must be set for testBalance');
        return (
            (this.order === 'lt' && balance <= this.limit) ||
            (this.order === 'gt' && balance >= this.limit)
        );
    }

    formatTransactionMessage(
        i18n: I18NObject,
        transaction: Transaction,
        accountName: string,
        formatCurrency: (x: number) => string
    ): string {
        const cmp =
            this.order === 'lt'
                ? $t(i18n, 'server.alert.transaction.lessThan')
                : $t(i18n, 'server.alert.transaction.greaterThan');

        const amount = formatCurrency(transaction.amount);
        const date = formatDate(i18n.localeId).toShortString(transaction.date);

        assert(this.limit !== null, 'limit must be set for formatTransactionMessage');
        const limit = formatCurrency(this.limit);

        return $t(i18n, 'server.alert.transaction.content', {
            label: transaction.label,
            account: accountName,
            amount,
            cmp,
            date,
            limit,
        });
    }

    formatAccountMessage(
        i18n: I18NObject,
        label: string,
        balance: number,
        formatCurrency: (x: number) => string
    ): string {
        const cmp =
            this.order === 'lt'
                ? $t(i18n, 'server.alert.balance.lessThan')
                : $t(i18n, 'server.alert.balance.greaterThan');

        assert(this.limit !== null, 'limit must be set for formatAccountMessage');
        const limit = formatCurrency(this.limit);
        const formattedBalance = formatCurrency(balance);

        return $t(i18n, 'server.alert.balance.content', {
            label,
            cmp,
            limit,
            balance: formattedBalance,
        });
    }

    // Static methods

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Alert>): Alert {
        return Alert.repo().create(args);
    }

    static async byAccountAndType(
        userId: number,
        accountId: number,
        type: string
    ): Promise<Alert[]> {
        return await Alert.repo().findBy({ userId, accountId, type });
    }

    static async reportsByFrequency(userId: number, frequency: string): Promise<Alert[]> {
        return await Alert.repo().find({ where: { userId, type: 'report', frequency } });
    }

    static async destroyByAccount(userId: number, accountId: number): Promise<void> {
        await Alert.repo().delete({ userId, accountId });
    }

    static async find(userId: number, alertId: number): Promise<Alert | null> {
        return await Alert.repo().findOne({ where: { id: alertId, userId } });
    }

    static async exists(userId: number, alertId: number): Promise<boolean> {
        const found = await Alert.find(userId, alertId);
        return !!found;
    }

    static async all(userId: number): Promise<Alert[]> {
        return await Alert.repo().findBy({ userId });
    }

    static async create(userId: number, attributes: Partial<Alert>): Promise<Alert> {
        const alert = Alert.repo().create({ ...attributes, userId });
        return await Alert.repo().save(alert);
    }

    static async destroy(userId: number, alertId: number): Promise<void> {
        await Alert.repo().delete({ id: alertId, userId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await Alert.repo().delete({ userId });
    }

    static async update(userId: number, alertId: number, fields: Partial<Alert>): Promise<Alert> {
        await Alert.repo().update({ userId, id: alertId }, fields);
        return unwrap(await Alert.find(userId, alertId));
    }

    static async replaceAccount(
        userId: number,
        accountId: number,
        replacementAccountId: number
    ): Promise<void> {
        await Alert.repo()
            .createQueryBuilder()
            .update()
            .set({ accountId: replacementAccountId })
            .where({ userId, accountId })
            .execute();
    }
}
