import { DeepPartial, Entity, Repository, PrimaryGeneratedColumn, Column } from 'typeorm';

import { getRepository } from '..';

@Entity('user')
export default class User {
    private static REPO: Repository<User> | null = null;

    private static repo(): Repository<User> {
        if (User.REPO === null) {
            User.REPO = getRepository(User);
        }
        return User.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    // User name.
    @Column('varchar')
    login!: string;

    // Static methods.

    static async create(attributes: DeepPartial<User>): Promise<User> {
        const user = User.repo().create(attributes);
        return await User.repo().save(user);
    }

    static async find(userId: number): Promise<User | null> {
        return await User.repo().findOneBy({ id: userId });
    }

    static async all(): Promise<User[]> {
        return await User.repo().find();
    }

    static async destroy(userId: number): Promise<void> {
        await User.repo().delete({ id: userId });
    }
}
