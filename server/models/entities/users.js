import { getRepository, Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id;

    // User name.
    @Column('varchar')
    login;
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(User);
    }
    return REPO;
}

User.create = async function(attributes) {
    let user = repo().create(attributes);
    return await repo().save(user);
};

User.find = async function(userId) {
    return await repo().findOne(userId);
};

User.all = async function() {
    return await repo().find();
};

User.destroy = async function(userId) {
    return await repo().delete({ userId });
};
