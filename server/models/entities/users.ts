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
    id!: number;

    // User name.
    @Column('varchar')
    login!: string;

    // Static methods.

    static async create(attributes: DeepPartial<User>): Promise<User> {
        const user = repo().create(attributes);
        return await repo().save(user);
    }

    static async find(userId: number): Promise<User | undefined> {
        return await repo().findOne(userId);
    }

    static async all(): Promise<User[]> {
        return await repo().find();
    }

    static async destroy(userId: number): Promise<void> {
        await repo().delete({ id: userId });
    }
}

let REPO: Repository<User> | null = null;
function repo(): Repository<User> {
    if (REPO === null) {
        REPO = getRepository(User);
    }
    return REPO;
}
