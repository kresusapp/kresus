import {
    Entity,
    Repository,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';

import { assert, unwrap } from '../../helpers';
import { PartialOnePlus } from '../helpers';

import { getRepository } from '..';

import User from './users';
import ViewAccount from './view-accounts';

@Entity('view')
export default class View {
    private static REPO: Repository<View> | null = null;

    private static repo(): Repository<View> {
        if (View.REPO === null) {
            View.REPO = getRepository(View);
        }
        return View.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // View name.
    @Column('varchar')
    label!: string;

    // whether the user has created the view by itself, or if the backend
    // did. This can be used to discriminate deletable views on the client side.
    @Column('boolean', { default: false })
    createdByUser = false;

    @OneToMany(() => ViewAccount, viewAccount => viewAccount.view, { cascade: ['insert'] })
    accounts!: ViewAccount[];

    // Static methods.

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<View>): View {
        return View.repo().create(args);
    }

    // Subscribers will need to pass the repository (to do things inside a same transaction).
    static async create(
        userId: number,
        attributes: PartialOnePlus<View>,
        repository?: Repository<View>
    ): Promise<View> {
        const repo = repository || View.repo();

        assert(typeof attributes.accounts !== 'undefined', 'view must have at least one account');
        assert(attributes.accounts.length > 0, 'view must have at least one account');

        attributes.accounts = attributes.accounts.map(ViewAccount.cast);

        const view = repo.create({ ...attributes, userId });
        return await repo.save(view);
    }

    static async find(userId: number, viewId: number): Promise<View | null> {
        return await View.repo().findOne({
            where: { id: viewId, userId },
            relations: ['accounts'],
        });
    }

    static async exists(userId: number, viewId: number): Promise<boolean> {
        const found = await View.find(userId, viewId);
        return !!found;
    }

    static async all(userId: number): Promise<View[]> {
        return await View.repo().find({ where: { userId }, relations: ['accounts'] });
    }

    static async destroy(userId: number, viewId: number): Promise<void> {
        await View.repo().delete({ id: viewId, userId });
    }

    static async destroyAll(userId: number): Promise<void> {
        await View.repo().delete({ userId });
    }

    /**
     * This method will destroy any view that does not have any account linked.
     * The method can be called after accounts deletion to ensure no empty
     * view remains.
     */
    static async destroyViewsWithoutAccounts(userId: number): Promise<void> {
        const qb = View.repo().createQueryBuilder('view');

        await qb
            .delete()
            .where(
                `view.id NOT IN ${qb
                    .subQuery()
                    .select('viewAccount.viewId', 'view.id')
                    .distinct()
                    .from(ViewAccount, 'viewAccount')
                    .addFrom(View, 'view')
                    .where('view.id = viewAccount.viewId')
                    .andWhere('view.userId = :userId')
                    .setParameter('userId', userId)
                    .getQuery()}`
            )
            .andWhere('userId = :userId')
            .setParameter('userId', userId)
            .execute();
    }

    static async update(userId: number, viewId: number, fields: Partial<View>): Promise<View> {
        // We cannot use View.repo().update due to https://github.com/typeorm/typeorm/issues/8404
        const view = await View.find(userId, viewId);
        if (view) {
            if (fields.accounts) {
                // This is a mess but I could not find a way to tell typeorm to automatically remove old view accounts and create the new ones.
                await ViewAccount.destroyFromView(viewId);

                const viewAccounts = [];
                for (const va of fields.accounts) {
                    const entity = await ViewAccount.create({ ...va, viewId });
                    viewAccounts.push(entity);
                }

                view.accounts = viewAccounts;
            }

            if (fields.label) {
                view.label = fields.label;
            }

            await View.repo().save(view);
        }

        return unwrap(view);
    }
}
