import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    OneToMany,
    Repository,
} from 'typeorm';

import { getRepository } from '..';

import User from './users';
import AccessField from './access-fields';

import { FETCH_STATUS_SUCCESS, unwrap } from '../../helpers';
import { bankVendorByUuid } from '../../lib/bank-vendors';

@Entity('access')
export default class Access {
    private static REPO: Repository<Access> | null = null;

    private static repo(): Repository<Access> {
        if (Access.REPO === null) {
            Access.REPO = getRepository(Access);
        }
        return Access.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
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

    @OneToMany(() => AccessField, accessField => accessField.access, { cascade: ['insert'] })
    fields!: AccessField[];

    // A JSON-serialized session's content.
    @Column('varchar', { nullable: true, default: null })
    session: string | null = null;

    // Whether the access should not be polled regularly (for instance, because it always requires
    // an interactive authentication).
    @Column('boolean', { default: false })
    excludeFromPoll = false;

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
            !this.excludeFromPoll &&
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
        bank: 'vendorId',
    };

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Access>): Access {
        return Access.repo().create(args);
    }

    static async create(
        userId: number,
        { fields = [], ...other }: Partial<Access>
    ): Promise<Access> {
        const fieldsWithUserId: Partial<AccessField>[] = fields.map(field => ({
            ...field,
            userId,
        }));
        const entity = Access.repo().create({ ...other, userId, fields: fieldsWithUserId });
        const access = await Access.repo().save(entity);
        return access;
    }

    static async find(userId: number, accessId: number): Promise<Access | null> {
        return await Access.repo().findOne({
            where: { userId, id: accessId },
            relations: ['fields'],
        });
    }

    static async all(userId: number): Promise<Access[]> {
        return await Access.repo().find({ where: { userId }, relations: ['fields'] });
    }

    static async exists(userId: number, accessId: number): Promise<boolean> {
        const found = await Access.repo().findOne({ where: { userId, id: accessId } });
        return !!found;
    }

    static async destroy(userId: number, accessId: number): Promise<void> {
        await Access.repo().delete({ userId, id: accessId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await Access.repo().delete({ userId });
    }

    static async update(
        userId: number,
        accessId: number,
        newAttributes: Partial<Access>
    ): Promise<Access> {
        if (typeof newAttributes.fields !== 'undefined') {
            throw new Error('API error: use AccessField model instead!');
        }
        await Access.repo().update({ userId, id: accessId }, newAttributes);
        return unwrap(await Access.find(userId, accessId));
    }

    static async byVendorId(
        userId: number,
        { uuid: vendorId }: { uuid: string }
    ): Promise<Access[]> {
        return await Access.repo().find({ where: { userId, vendorId }, relations: ['fields'] });
    }

    static async byCredentials(
        userId: number,
        { uuid: vendorId, login }: { uuid: string; login: string }
    ): Promise<Access> {
        const found = await Access.repo().findOne({
            where: { userId, vendorId, login },
            relations: ['fields'],
        });
        return unwrap(found);
    }
}
