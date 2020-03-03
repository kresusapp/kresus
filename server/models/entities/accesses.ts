import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    OneToMany,
    Repository
} from 'typeorm';

import User from './users';
import AccessFields from './access-fields';

import { FETCH_STATUS_SUCCESS, makeLogger, unwrap } from '../../helpers';
import { bankVendorByUuid } from '../../lib/bank-vendors';

const log = makeLogger('models/entities/accesses');

@Entity()
export default class Access {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    @OneToMany(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => AccessFields,
        accessField => accessField.access
    )
    fields;

    // Entity methods.

    hasPassword(): boolean {
        return typeof this.password === 'string' && this.password.length > 0;
    }

    // Is the access enabled?
    isEnabled(): boolean {
        return this.password !== null;
    }

    // Returns a cleaned up label for this access.
    getLabel(): string {
        if (this.customLabel) {
            return this.customLabel;
        }
        return bankVendorByUuid(this.vendorId).name;
    }

    // Can the access be polled?
    canBePolled(): boolean {
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

    // Static attributes.

    static renamings = {
        bank: 'vendorId'
    };

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Access>): Access {
        return repo().create(args);
    }

    static async create(
        userId: number,
        { fields = [], ...other }: Partial<Access>
    ): Promise<Access> {
        const entity = repo().create({ userId, ...other });
        const access = await repo().save(entity);
        if (fields.length) {
            await AccessFields.batchCreate(userId, access.id, fields);
            access.fields = await AccessFields.allByAccessId(userId, access.id);
        }
        return access;
    }

    static async find(userId, accessId): Promise<Access | undefined> {
        return await repo().findOne({ where: { userId, id: accessId }, relations: ['fields'] });
    }

    static async all(userId): Promise<Access[]> {
        return await repo().find({ where: { userId }, relations: ['fields'] });
    }

    static async exists(userId, accessId): Promise<boolean> {
        const found = await repo().findOne({ where: { userId, id: accessId } });
        return !!found;
    }

    static async destroy(userId, accessId): Promise<void> {
        await repo().delete({ userId, id: accessId });
    }

    static async destroyAll(userId): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(userId, accessId, { fields = [], ...other }): Promise<Access> {
        await AccessFields.batchUpdateOrCreate(userId, accessId, fields);
        await repo().update({ userId, id: accessId }, other);

        return unwrap(await Access.find(userId, accessId));
    }

    static async byVendorId(userId, bank): Promise<Access[]> {
        if (typeof bank !== 'object' || typeof bank.uuid !== 'string') {
            log.warn('Access.byVendorId misuse: bank must be a Bank instance.');
        }
        return await repo().find({ where: { userId, vendorId: bank.uuid }, relations: ['fields'] });
    }
}

let REPO: Repository<Access> | null = null;
function repo(): Repository<Access> {
    if (REPO === null) {
        REPO = getRepository(Access);
    }
    return REPO;
}
