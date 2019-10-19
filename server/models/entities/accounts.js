import {
    In,
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    JoinColumn,
    Column,
    ManyToOne
} from 'typeorm';
import moment from 'moment';

import User from './users';
import Access from './accesses';
import AccessFields from './access-fields';
import Transaction from './transactions';
import Setting from './settings';

import {
    currency,
    UNKNOWN_ACCOUNT_TYPE,
    shouldIncludeInBalance,
    shouldIncludeInOutstandingSum,
    makeLogger
} from '../../helpers';
import { ForceNumericColumn, DatetimeType } from '../helpers';

let log = makeLogger('models/entities/accounts');

@Entity()
export default class Account {
    @PrimaryGeneratedColumn()
    id;

    // ************************************************************************
    // EXTERNAL LINKS
    // ************************************************************************

    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // Access instance containing the account.
    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => Access, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    access;

    @Column('integer')
    accessId;

    // External (backend) bank module identifier, determining which source to use.
    // TODO could be removed, since this is in the linked access?
    @Column('varchar')
    vendorId;

    // Account number provided by the source. Acts as an id for other models.
    @Column('varchar')
    vendorAccountId;

    // external (backend) type id or UNKNOWN_ACCOUNT_TYPE.
    @Column('varchar', { default: UNKNOWN_ACCOUNT_TYPE })
    type = UNKNOWN_ACCOUNT_TYPE;

    // ************************************************************************
    // ACCOUNT INFORMATION
    // ************************************************************************

    // Date at which the account has been imported.
    @Column({ type: DatetimeType })
    importDate;

    // Balance on the account, at the date at which it has been imported.
    @Column('numeric', { transformer: new ForceNumericColumn() })
    initialBalance;

    // Date at which the account has been polled for the last time.
    @Column({ type: DatetimeType })
    lastCheckDate;

    // Label describing the account provided by the source.
    @Column('varchar')
    label;

    // description entered by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel;

    // IBAN provided by the source (optional).
    @Column('varchar', { nullable: true, default: null })
    iban = null;

    // Currency used by the account.
    @Column('varchar', { nullable: true, default: null })
    currency;

    // If true, this account is not used to eval the balance of an access.
    @Column('boolean', { default: false })
    excludeFromBalance;

    // Methods.
    computeBalance = async () => {
        let ops = await Transaction.byAccount(this.userId, this);
        let today = moment();
        let s = ops
            .filter(op => shouldIncludeInBalance(op, today, this.type))
            .reduce((sum, op) => sum + op.amount, this.initialBalance);
        return Math.round(s * 100) / 100;
    };

    computeOutstandingSum = async () => {
        let ops = await Transaction.byAccount(this.userId, this);
        let s = ops
            .filter(op => shouldIncludeInOutstandingSum(op))
            .reduce((sum, op) => sum + op.amount, 0);
        return Math.round(s * 100) / 100;
    };

    getCurrencyFormatter = async () => {
        let curr = currency.isKnown(this.currency)
            ? this.currency
            : (await Setting.findOrCreateDefault(await this.userId, 'default-currency')).value;
        return currency.makeFormat(curr);
    };
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(Account);
    }
    return REPO;
}

Account.renamings = {
    initialAmount: 'initialBalance',
    bank: 'vendorId',
    lastChecked: 'lastCheckDate',
    bankAccess: 'accessId',
    accountNumber: 'vendorAccountId',
    title: 'label'
};

Account.byVendorId = async function byVendorId(userId, bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Account.byVendorId misuse: bank must be a Bank instance');
    }
    return await repo().find({ userId, vendorId: bank.uuid });
};

Account.findMany = async function findMany(userId, accountIds) {
    if (!(accountIds instanceof Array)) {
        log.warn('Account.findMany misuse: accountIds must be an Array');
    }
    if (accountIds.length && typeof accountIds[0] !== 'number') {
        log.warn('Account.findMany misuse: accountIds must be a [Number]');
    }
    return await repo().find({ userId, id: In(accountIds) });
};

Account.byAccess = async function byAccess(userId, access) {
    if (typeof access !== 'object' || typeof access.id !== 'number') {
        log.warn('Account.byAccess misuse: access must be an Access instance');
    }
    return await repo().find({ userId, accessId: access.id });
};

// Doesn't insert anything in db, only creates a new instance and normalizes its fields.
Account.cast = function(...args) {
    return repo().create(...args);
};

Account.create = async function(userId, attributes) {
    let entity = repo().create({ userId, ...attributes });
    return await repo().save(entity);
};

Account.find = async function(userId, accessId) {
    return await repo().findOne({ where: { userId, id: accessId } });
};

Account.all = async function(userId) {
    return await repo().find({ userId });
};

Account.exists = async function(userId, accessId) {
    let found = await repo().findOne({ where: { userId, id: accessId } });
    return !!found;
};

Account.destroy = async function(userId, accessId) {
    return await repo().delete({ userId, id: accessId });
};

Account.update = async function(userId, accessId, { fields = [], ...other }) {
    await AccessFields.batchUpdateOrCreate(userId, accessId, fields);
    await repo().update({ userId, id: accessId }, other);
    return await Account.find(userId, accessId);
};
