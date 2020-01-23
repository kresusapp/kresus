import {
    DeepPartial,
    getRepository,
    Entity,
    Repository,
    PrimaryGeneratedColumn,
    Column
} from 'typeorm';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id;

    // User name.
    @Column('varchar')
    login;

    // Static methods.

    static async create(attributes: DeepPartial<User>): Promise<User> {
        const user = repo().create(attributes);
        return await repo().save(user);
    }

    static async find(userId) {
        return await repo().findOne(userId);
    }

    static async all() {
        return await repo().find();
    }

    static async destroy(userId) {
        return await repo().delete({ id: userId });
    }
}

let REPO: Repository<User> | null = null;
function repo(): Repository<User> {
    if (REPO === null) {
        REPO = getRepository(User);
    }
    return REPO;
}
