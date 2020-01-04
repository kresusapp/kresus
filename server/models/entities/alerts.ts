import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository
} from 'typeorm';

import Account from './accounts';
import User from './users';

import { formatDate, translate as $t, makeLogger } from '../../helpers';
import { ForceNumericColumn, DatetimeType } from '../helpers';

const log = makeLogger('models/entities/alert');

@Entity()
export default class Alert {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // Account related to the alert.
    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account;

    @Column('integer')
    accountId;

    // Alert type. Possible options are: report, balance, transaction.
    @Column('varchar')
    type;

    // Frequency, for reports : daily, weekly, monthly.
    @Column('varchar', { nullable: true, default: null })
    frequency;

    // Threshold value, for balance/transaction alerts.
    @Column('numeric', { nullable: true, default: null, transformer: new ForceNumericColumn() })
    limit;

    // Ordering, for balance/transaction alerts: gt, lt.
    @Column('varchar', { nullable: true, default: null })
    order;

    // When did the alert get triggered for the last time?
    @Column({ type: DatetimeType, nullable: true, default: null })
    lastTriggeredDate;

    // Methods.

    testTransaction(operation) {
        if (this.type !== 'transaction') {
            return false;
        }
        const amount = Math.abs(operation.amount);
        return (
            (this.order === 'lt' && amount <= this.limit) ||
            (this.order === 'gt' && amount >= this.limit)
        );
    }

    testBalance(balance) {
        if (this.type !== 'balance') {
            return false;
        }
        return (
            (this.order === 'lt' && balance <= this.limit) ||
            (this.order === 'gt' && balance >= this.limit)
        );
    }

    formatOperationMessage(operation, accountName, formatCurrency) {
        const cmp =
            this.order === 'lt'
                ? $t('server.alert.operation.lessThan')
                : $t('server.alert.operation.greaterThan');

        const amount = formatCurrency(operation.amount);
        const date = formatDate.toShortString(operation.date);
        const limit = formatCurrency(this.limit);

        return $t('server.alert.operation.content', {
            label: operation.label,
            account: accountName,
            amount,
            cmp,
            date,
            limit
        });
    }

    formatAccountMessage(label, balance, formatCurrency) {
        const cmp =
            this.order === 'lt'
                ? $t('server.alert.balance.lessThan')
                : $t('server.alert.balance.greaterThan');

        const limit = formatCurrency(this.limit);
        const formattedBalance = formatCurrency(balance);

        return $t('server.alert.balance.content', {
            label,
            cmp,
            limit,
            balance: formattedBalance
        });
    }

    // Static methods
    static async byAccountAndType(userId, accountId, type) {
        if (typeof accountId !== 'number') {
            log.warn('Alert.byAccountAndType misuse: accountId must be a number');
        }
        if (typeof type !== 'string') {
            log.warn('Alert.byAccountAndType misuse: type must be a string');
        }
        return await repo().find({ userId, accountId, type });
    }

    static async reportsByFrequency(userId, frequency) {
        if (typeof frequency !== 'string') {
            log.warn('Alert.reportsByFrequency misuse: frequency must be a string');
        }
        return await repo().find({ where: { userId, type: 'report', frequency } });
    }

    static async destroyByAccount(userId, accountId) {
        if (typeof accountId !== 'number') {
            log.warn("Alert.destroyByAccount API misuse: accountId isn't a number");
        }
        await repo().delete({ userId, accountId });
    }

    static async find(userId, alertId) {
        return await repo().findOne({ where: { id: alertId, userId } });
    }

    static async exists(userId, alertId) {
        const found = await Alert.find(userId, alertId);
        return !!found;
    }

    static async all(userId) {
        return await repo().find({ userId });
    }

    static async create(userId, attributes) {
        const alert = repo().create({ userId, ...attributes });
        return await repo().save(alert);
    }

    static async destroy(userId, alertId) {
        return await repo().delete({ id: alertId, userId });
    }

    static async update(userId, alertId, fields) {
        await repo().update({ userId, id: alertId }, fields);
        return await Alert.find(userId, alertId);
    }
}

let REPO: Repository<Alert> | null = null;
function repo(): Repository<Alert> {
    if (REPO === null) {
        REPO = getRepository(Alert);
    }
    return REPO;
}
