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
import { TransactionRuleConditionType } from '../../shared/types';
import TransactionRule from './transaction-rule';

import User from './users';

@Entity('transaction-rule-condition')
export default class TransactionRuleCondition {
    private static REPO: Repository<TransactionRuleCondition> | null = null;

    private static repo(): Repository<TransactionRuleCondition> {
        if (TransactionRuleCondition.REPO === null) {
            TransactionRuleCondition.REPO = getRepository(TransactionRuleCondition);
        }
        return TransactionRuleCondition.REPO;
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
    type!: TransactionRuleConditionType;

    @Column('varchar')
    value!: string;

    // Static methods.

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<TransactionRuleCondition>): TransactionRuleCondition {
        return TransactionRuleCondition.repo().create(args);
    }

    static async find(
        userId: number,
        conditionId: number
    ): Promise<TransactionRuleCondition | undefined> {
        return await TransactionRuleCondition.repo().findOne({
            where: { id: conditionId, userId },
        });
    }

    static async exists(userId: number, conditionId: number): Promise<boolean> {
        const found = await TransactionRuleCondition.find(userId, conditionId);
        return !!found;
    }

    static async all(userId: number): Promise<TransactionRuleCondition[]> {
        return await TransactionRuleCondition.repo().find({ userId });
    }

    static async create(
        userId: number,
        attributes: Partial<TransactionRuleCondition>
    ): Promise<TransactionRuleCondition> {
        const alert = TransactionRuleCondition.repo().create({ ...attributes, userId });
        return await TransactionRuleCondition.repo().save(alert);
    }

    static async destroy(userId: number, conditionId: number): Promise<void> {
        await TransactionRuleCondition.repo().delete({ id: conditionId, userId });
    }

    static async update(
        userId: number,
        conditionId: number,
        fields: Partial<TransactionRuleCondition>
    ): Promise<TransactionRuleCondition> {
        await TransactionRuleCondition.repo().update({ userId, id: conditionId }, fields);
        return unwrap(await TransactionRuleCondition.find(userId, conditionId));
    }
}
