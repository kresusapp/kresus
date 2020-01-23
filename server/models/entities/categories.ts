import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository
} from 'typeorm';

import User from './users';

@Entity()
export default class Category {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @ManyToOne(type => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // Label of the category.
    @Column('varchar')
    label;

    // Hexadecimal RGB format.
    @Column('varchar', { nullable: true })
    color;

    // Static methods

    static renamings = {
        title: 'label'
    };

    static async find(userId, categoryId) {
        return await repo().findOne({ where: { id: categoryId, userId } });
    }

    static async exists(userId, categoryId) {
        const found = await Category.find(userId, categoryId);
        return !!found;
    }

    static async all(userId) {
        return await repo().find({ userId });
    }

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args): Category {
        return repo().create(args);
    }

    static async create(userId, attributes) {
        const category = repo().create({ userId, ...attributes });
        return await repo().save(category);
    }

    static async destroy(userId, categoryId) {
        return await repo().delete({ id: categoryId, userId });
    }

    static async destroyAll(userId) {
        return await repo().delete({ userId });
    }

    static async update(userId, categoryId, fields) {
        await repo().update({ userId, id: categoryId }, fields);
        return await Category.find(userId, categoryId);
    }
}

let REPO: Repository<Category> | null = null;
function repo(): Repository<Category> {
    if (REPO === null) {
        REPO = getRepository(Category);
    }
    return REPO;
}
