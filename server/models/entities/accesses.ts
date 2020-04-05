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
import AccessField from './access-fields';

import { FETCH_STATUS_SUCCESS, unwrap } from '../../helpers';
import { bankVendorByUuid } from '../../lib/bank-vendors';

@Entity('access')
export default class Access {
    @PrimaryGeneratedColumn()
    id!: number;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // External (backend) unique identifier.
    @Column('varchar')
    vendorId!: string;

    // Credentials to connect to the bank's website.
    @Column('varchar')
    login!: string;

    @Column('varchar', { nullable: true, default: null })
    password: string | null = null;

    // Text status indicating whether the last poll was successful or not.
    @Column('varchar', { default: FETCH_STATUS_SUCCESS })
    fetchStatus: string = FETCH_STATUS_SUCCESS;

    // Text label set by the user.
    @Column('varchar', { nullable: true, default: null })
    customLabel: string | null = null;

    @OneToMany(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => AccessField,
        accessField => accessField.access,
        { cascade: ['insert'] }
    )
    fields!: AccessField[];

    // A JSON-serialized session's content.
    @Column('varchar', { nullable: true, default: null })
    session: string | null = null;

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
            this.fetchStatus !== 'AUTH_METHOD_NYI' &&
            this.fetchStatus !== 'REQUIRES_INTERACTIVE'
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
        const fieldsWithUserId: Partial<AccessField>[] = fields.map(field => ({
            userId,
            ...field
        }));
        const entity = repo().create({ userId, ...other, fields: fieldsWithUserId });
        const access = await repo().save(entity);
        return access;
    }

    static async find(userId: number, accessId: number): Promise<Access | undefined> {
        return await repo().findOne({ where: { userId, id: accessId }, relations: ['fields'] });
    }

    static async all(userId: number): Promise<Access[]> {
        return await repo().find({ where: { userId }, relations: ['fields'] });
    }

    static async exists(userId: number, accessId: number): Promise<boolean> {
        const found = await repo().findOne({ where: { userId, id: accessId } });
        return !!found;
    }

    static async destroy(userId: number, accessId: number): Promise<void> {
        await repo().delete({ userId, id: accessId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(
        userId: number,
        accessId: number,
        { fields = [], ...other }: Partial<Access>
    ): Promise<Access> {
        await AccessField.batchUpdateOrCreate(userId, accessId, fields);
        await repo().update({ userId, id: accessId }, other);

        return unwrap(await Access.find(userId, accessId));
    }

    static async byVendorId(
        userId: number,
        { uuid: vendorId }: { uuid: string }
    ): Promise<Access[]> {
        return await repo().find({ where: { userId, vendorId }, relations: ['fields'] });
    }
}

let REPO: Repository<Access> | null = null;
function repo(): Repository<Access> {
    if (REPO === null) {
        REPO = getRepository(Access);
    }
    return REPO;
}
