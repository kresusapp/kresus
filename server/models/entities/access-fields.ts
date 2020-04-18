import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Repository
} from 'typeorm';

import User from './users';
import Access from './accesses';

import { assert, unwrap } from '../../helpers';

@Entity('access_fields')
export default class AccessField {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => User,
        { cascade: true, onDelete: 'CASCADE', nullable: false }
    )
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // The access unique identifier of the access the field is attached to.
    @ManyToOne(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        type => Access,
        access => access.fields,
        { cascade: true, onDelete: 'CASCADE', nullable: false }
    )
    @JoinColumn()
    access!: Access;

    @Column('integer')
    accessId!: number;

    // The name of the field.
    @Column('varchar')
    name!: string;

    // The value of the field.
    @Column('varchar')
    value!: string;

    static async create(userId: number, attributes: Partial<AccessField>): Promise<AccessField> {
        const { accessId } = attributes;
        assert(
            typeof accessId === 'number',
            'AccessField.create second arg should have "accessId" id property'
        );
        const entity = repo().create(Object.assign({}, attributes, { userId }));
        return await repo().save(entity);
    }

    static async find(userId: number, fieldId: number): Promise<AccessField | undefined> {
        return await repo().findOne({ where: { id: fieldId, userId } });
    }

    static async all(userId: number): Promise<AccessField[]> {
        return await repo().find({ userId });
    }

    static async exists(userId: number, fieldId: number): Promise<boolean> {
        const found = await repo().findOne({ where: { userId, id: fieldId } });
        return !!found;
    }

    static async destroy(userId: number, fieldId: number): Promise<void> {
        await repo().delete({ userId, id: fieldId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(
        userId: number,
        fieldId: number,
        attributes: Partial<AccessField>
    ): Promise<AccessField> {
        await repo().update({ userId, id: fieldId }, attributes);
        const updated = await AccessField.find(userId, fieldId);
        return unwrap(updated);
    }
}

let REPO: Repository<AccessField> | null = null;
function repo(): Repository<AccessField> {
    if (REPO === null) {
        REPO = getRepository(AccessField);
    }
    return REPO;
}
