import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne
} from 'typeorm';

import User from './users';

@Entity()
export default class Category {
    @PrimaryGeneratedColumn()
    id;

    // eslint-disable-next-line no-unused-vars
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
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(Category);
    }
    return REPO;
}

Category.renamings = {
    title: 'label'
};

Category.find = async function(userId, categoryId) {
    return await repo().findOne({ where: { id: categoryId, userId } });
};

Category.exists = async function(userId, categoryId) {
    let found = await Category.find(userId, categoryId);
    return !!found;
};

Category.all = async function(userId) {
    return await repo().find({ userId });
};

// Doesn't insert anything in db, only creates a new instance and normalizes its fields.
Category.cast = function(...args) {
    return repo().create(...args);
};

Category.create = async function(userId, attributes) {
    let category = repo().create({ userId, ...attributes });
    return await repo().save(category);
};

Category.destroy = async function(userId, categoryId) {
    return await repo().delete({ id: categoryId, userId });
};

Category.update = async function(userId, categoryId, fields) {
    await repo().update({ userId, id: categoryId }, fields);
    return await Category.find(userId, categoryId);
};
