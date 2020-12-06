import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
} from 'typeorm';
import { unwrap } from '../../helpers';

import { TransactionRuleActionType } from '../../shared/types';
import TransactionRule from './transaction-rule';
import Category from './categories';
import User from './users';

@Entity('transaction-rule-action')
export default class TransactionRuleAction {
    private static REPO: Repository<TransactionRuleAction> | null = null;

    private static repo(): Repository<TransactionRuleAction> {
        if (TransactionRuleAction.REPO === null) {
            TransactionRuleAction.REPO = getRepository(TransactionRuleAction);
        }
        return TransactionRuleAction.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    @ManyToOne(() => TransactionRule, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    rule!: TransactionRule;

    @Column('integer')
    ruleId!: number;

    @Column('varchar')
    type!: TransactionRuleActionType;

    @ManyToOne(() => Category, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    category!: Category;

    @Column('integer')
    categoryId!: number;

    // Static methods.

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<TransactionRuleAction>): TransactionRuleAction {
        return TransactionRuleAction.repo().create(args);
    }

    static async find(
        userId: number,
        actionId: number
    ): Promise<TransactionRuleAction | undefined> {
        return await TransactionRuleAction.repo().findOne({ where: { id: actionId, userId } });
    }

    static async exists(userId: number, actionId: number): Promise<boolean> {
        const found = await TransactionRuleAction.find(userId, actionId);
        return !!found;
    }

    static async all(userId: number): Promise<TransactionRuleAction[]> {
        return await TransactionRuleAction.repo().find({ userId });
    }

    static async create(
        userId: number,
        attributes: Partial<TransactionRuleAction>
    ): Promise<TransactionRuleAction> {
        const alert = TransactionRuleAction.repo().create({ ...attributes, userId });
        return await TransactionRuleAction.repo().save(alert);
    }

    static async destroy(userId: number, actionId: number): Promise<void> {
        await TransactionRuleAction.repo().delete({ id: actionId, userId });
    }

    static async update(
        userId: number,
        actionId: number,
        fields: Partial<TransactionRuleAction>
    ): Promise<TransactionRuleAction> {
        await TransactionRuleAction.repo().update({ userId, id: actionId }, fields);
        return unwrap(await TransactionRuleAction.find(userId, actionId));
    }
}
