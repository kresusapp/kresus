import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Repository } from 'typeorm';

import { getRepository } from '..';

import User from './users';
import { unwrap } from '../../helpers';

@Entity('category')
export default class Category {
    private static REPO: Repository<Category> | null = null;

    private static repo(): Repository<Category> {
        if (Category.REPO === null) {
            Category.REPO = getRepository(Category);
        }
        return Category.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // Label of the category.
    @Column('varchar')
    label!: string;

    // Hexadecimal RGB format.
    @Column('varchar', { nullable: true, default: null })
    color: string | null = null;

    // Static methods

    static renamings = {
        title: 'label',
    };

    static async find(userId: number, categoryId: number): Promise<Category | null> {
        return await Category.repo().findOne({ where: { id: categoryId, userId } });
    }

    static async exists(userId: number, categoryId: number): Promise<boolean> {
        const found = await Category.find(userId, categoryId);
        return !!found;
    }

    static async all(userId: number): Promise<Category[]> {
        return await Category.repo().findBy({ userId });
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Category>): Category {
        return Category.repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Category>): Promise<Category> {
        const category = Category.repo().create({ ...attributes, userId });
        return await Category.repo().save(category);
    }

    // Make sure to update attached rules as well!
    static async destroy(userId: number, categoryId: number): Promise<void> {
        await Category.repo().delete({ id: categoryId, userId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await Category.repo().delete({ userId });
    }

    static async update(
        userId: number,
        categoryId: number,
        fields: Partial<Category>
    ): Promise<Category> {
        await Category.repo().update({ userId, id: categoryId }, fields);
        return unwrap(await Category.find(userId, categoryId));
    }
}
