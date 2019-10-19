import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    OneToMany
} from 'typeorm';

import User from './users';
import AccessFields from './access-fields';

import { FETCH_STATUS_SUCCESS, makeLogger } from '../../helpers';
import { bankVendorByUuid } from '../../lib/bank-vendors';

let log = makeLogger('models/entities/accesses');

@Entity()
export default class Access {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // External (backend) unique identifier.
    @Column('varchar')
    vendorId;

    // Credentials to connect to the bank's website.
    @Column('varchar')
    login;

    @Column('varchar', { nullable: true, default: null })
    password;

    // Text status indicating whether the last poll was successful or not.
    @Column('varchar', { default: FETCH_STATUS_SUCCESS })
    fetchStatus;

    // Text label set by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel = null;

    // eslint-disable-next-line no-unused-vars
    @OneToMany(type => AccessFields, accessField => accessField.access)
    fields;

    // Entity methods.

    hasPassword() {
        return typeof this.password === 'string' && this.password.length > 0;
    }

    // Is the access enabled?
    isEnabled() {
        return this.password !== null;
    }

    // Returns a cleaned up label for this access.
    getLabel() {
        if (this.customLabel) {
            return this.customLabel;
        }
        return bankVendorByUuid(this.vendorId).name;
    }

    // Can the access be polled?
    canBePolled() {
        return (
            this.isEnabled() &&
            this.fetchStatus !== 'INVALID_PASSWORD' &&
            this.fetchStatus !== 'EXPIRED_PASSWORD' &&
            this.fetchStatus !== 'INVALID_PARAMETERS' &&
            this.fetchStatus !== 'NO_PASSWORD' &&
            this.fetchStatus !== 'ACTION_NEEDED' &&
            this.fetchStatus !== 'AUTH_METHOD_NYI'
        );
    }
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(Access);
    }
    return REPO;
}

Access.renamings = {
    bank: 'vendorId'
};

// Doesn't insert anything in db, only creates a new instance and normalizes its fields.
Access.cast = function(...args) {
    return repo().create(...args);
};

Access.create = async function(userId, { fields = null, ...other }) {
    let entity = repo().create({ userId, ...other });
    let access = await repo().save(entity);
    if (fields !== null) {
        await AccessFields.batchCreate(userId, access.id, fields);
    }
    access.fields = await AccessFields.allByAccessId(userId, access.id);
    return access;
};

Access.find = async function(userId, accessId) {
    return await repo().findOne({ where: { userId, id: accessId }, relations: ['fields'] });
};

Access.all = async function(userId) {
    return await repo().find({ userId, relations: ['fields'] });
};

Access.exists = async function(userId, accessId) {
    let found = await repo().findOne({ where: { userId, id: accessId } });
    return !!found;
};

Access.destroy = async function(userId, accessId) {
    return await repo().delete({ userId, id: accessId });
};

Access.update = async function(userId, accessId, { fields = [], ...other }) {
    await AccessFields.batchUpdateOrCreate(userId, accessId, fields);
    await repo().update({ userId, id: accessId }, other);
    return await Access.find(userId, accessId);
};

Access.byVendorId = async function byVendorId(userId, bank) {
    if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
        log.warn('Access.byVendorId misuse: bank must be a Bank instance.');
    }
    return await repo().find({ userId, vendorId: bank.uuid, relations: ['fields'] });
};
