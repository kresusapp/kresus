import {
    DeepPartial,
    Entity,
    Repository,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

import { getRepository } from '..';

import Account from './accounts';
import View from './views';

@Entity('view-accounts')
export default class ViewAccount {
    private static REPO: Repository<ViewAccount> | null = null;

    private static repo(): Repository<ViewAccount> {
        if (ViewAccount.REPO === null) {
            ViewAccount.REPO = getRepository(ViewAccount);
        }
        return ViewAccount.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => View, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    view!: View;

    @Column('integer')
    viewId!: number;

    @ManyToOne(() => Account, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    account!: Account;

    @Column('integer')
    accountId!: number;

    // Static methods.

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<ViewAccount>): ViewAccount {
        return ViewAccount.repo().create(args);
    }

    static async create(attributes: DeepPartial<ViewAccount>): Promise<ViewAccount> {
        const link = ViewAccount.repo().create(attributes);
        return await ViewAccount.repo().save(link);
    }

    static async all(): Promise<ViewAccount[]> {
        return await ViewAccount.repo().find();
    }

    static async destroy(linkId: number): Promise<void> {
        await ViewAccount.repo().delete({ id: linkId });
    }

    static async destroyFromView(viewId: number): Promise<void> {
        await ViewAccount.repo().delete({ viewId });
    }
}
