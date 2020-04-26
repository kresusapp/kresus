import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
} from 'typeorm';

import User from './users';
import { unwrap } from '../../helpers';

@Entity('category')
export default class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
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

    static async find(userId, categoryId): Promise<Category | undefined> {
        return await repo().findOne({ where: { id: categoryId, userId } });
    }

    static async exists(userId, categoryId): Promise<boolean> {
        const found = await Category.find(userId, categoryId);
        return !!found;
    }

    static async all(userId): Promise<Category[]> {
        return await repo().find({ userId });
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<Category>): Category {
        return repo().create(args);
    }

    static async create(userId: number, attributes: Partial<Category>): Promise<Category> {
        const category = repo().create({ userId, ...attributes });
        return await repo().save(category);
    }

    static async destroy(userId: number, categoryId: number): Promise<void> {
        await repo().delete({ id: categoryId, userId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await repo().delete({ userId });
    }

    static async update(
        userId: number,
        categoryId: number,
        fields: Partial<Category>
    ): Promise<Category> {
        await repo().update({ userId, id: categoryId }, fields);
        return unwrap(await Category.find(userId, categoryId));
    }
}

let REPO: Repository<Category> | null = null;
function repo(): Repository<Category> {
    if (REPO === null) {
        REPO = getRepository(Category);
    }
    return REPO;
}
