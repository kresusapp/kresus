import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Repository } from 'typeorm';

import { getRepository } from '..';

import User from './users';
import Access from './accesses';

import { assert, unwrap } from '../../helpers';

@Entity('access_fields')
export default class AccessField {
    private static REPO: Repository<AccessField> | null = null;

    private static repo(): Repository<AccessField> {
        if (AccessField.REPO === null) {
            AccessField.REPO = getRepository(AccessField);
        }
        return AccessField.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // The access unique identifier of the access the field is attached to.
    @ManyToOne(() => Access, access => access.fields, {
        cascade: true,
        onDelete: 'CASCADE',
        nullable: false,
    })
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
        const entity = AccessField.repo().create({ ...attributes, userId });
        return await AccessField.repo().save(entity);
    }

    static async find(userId: number, fieldId: number): Promise<AccessField | null> {
        return await AccessField.repo().findOne({ where: { id: fieldId, userId } });
    }

    static async all(userId: number): Promise<AccessField[]> {
        return await AccessField.repo().findBy({ userId });
    }

    static async exists(userId: number, fieldId: number): Promise<boolean> {
        const found = await AccessField.repo().findOne({ where: { userId, id: fieldId } });
        return !!found;
    }

    static async destroy(userId: number, fieldId: number): Promise<void> {
        await AccessField.repo().delete({ userId, id: fieldId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await AccessField.repo().delete({ userId });
    }

    static async update(
        userId: number,
        fieldId: number,
        attributes: Partial<AccessField>
    ): Promise<AccessField | null> {
        await AccessField.repo().update({ userId, id: fieldId }, attributes);
        const updated = await AccessField.find(userId, fieldId);
        return unwrap(updated);
    }
}
