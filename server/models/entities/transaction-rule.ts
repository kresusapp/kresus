import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    ManyToOne,
    Repository,
    OneToMany,
} from 'typeorm';
import { TransactionRuleAction, TransactionRuleCondition } from '..';
import { assert, unwrap } from '../../helpers';

import User from './users';

// As Partial<T>, but accepting one extra level of Partial-ness for its
// attributes. This allows passing Partial<Action> to the TransactionRule's
// creator.
// (Inspired from typeorm's DeepPartial)
declare type PartialOnePlus<T> = {
    [P in keyof T]?: T[P] extends Array<infer U>
        ? Array<Partial<U>>
        : T[P] extends ReadonlyArray<infer U>
        ? ReadonlyArray<Partial<U>>
        : Partial<T[P]> | T[P];
};

@Entity('transaction-rule')
export default class TransactionRule {
    private static REPO: Repository<TransactionRule> | null = null;

    private static repo(): Repository<TransactionRule> {
        if (TransactionRule.REPO === null) {
            TransactionRule.REPO = getRepository(TransactionRule);
        }
        return TransactionRule.REPO;
    }

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { cascade: true, onDelete: 'CASCADE', nullable: false })
    @JoinColumn()
    user!: User;

    @Column('integer')
    userId!: number;

    // Order in the linked list of transaction rules.
    @Column('integer')
    position!: number;

    @OneToMany(() => TransactionRuleCondition, condition => condition.rule, { cascade: ['insert'] })
    conditions!: TransactionRuleCondition[];

    @OneToMany(() => TransactionRuleAction, action => action.rule, { cascade: ['insert'] })
    actions!: TransactionRuleAction[];

    // Static methods.

    // Doesn't insert anything in db, only creates a new instance and normalizes its fields.
    static cast(args: Partial<TransactionRule>): TransactionRule {
        return TransactionRule.repo().create(args);
    }

    static async find(userId: number, ruleId: number): Promise<TransactionRule | undefined> {
        return await TransactionRule.repo().findOne({ where: { id: ruleId, userId } });
    }

    static async exists(userId: number, ruleId: number): Promise<boolean> {
        const found = await TransactionRule.find(userId, ruleId);
        return !!found;
    }

    static async allOrdered(userId: number): Promise<TransactionRule[]> {
        return await TransactionRule.repo().find({
            where: { userId },
            relations: ['conditions', 'actions'],
            order: {
                position: 'ASC',
            },
        });
    }

    // Returns the maximum rule position already included in the database.
    static async maxPosition(userId: number): Promise<number | null> {
        const rule = await TransactionRule.repo().findOne({
            where: { userId },
            order: { position: 'DESC' },
        });
        return rule ? rule.position : null;
    }

    static async create(
        userId: number,
        attributes: PartialOnePlus<TransactionRule>
    ): Promise<TransactionRule> {
        assert(typeof attributes.actions !== 'undefined', 'rule must have at least one action');
        assert(attributes.actions.length > 0, 'rule must have at least one action');
        assert(
            typeof attributes.conditions !== 'undefined',
            'rule must have at least one condition'
        );
        assert(attributes.conditions.length > 0, 'rule must have at least one condition');

        let i = 0;
        for (const action of attributes.actions) {
            attributes.actions[i++] = TransactionRuleAction.cast({ ...action, userId });
        }
        i = 0;
        for (const condition of attributes.conditions) {
            attributes.conditions[i++] = TransactionRuleCondition.cast({ ...condition, userId });
        }

        const rule = TransactionRule.repo().create({ ...attributes, userId });
        return await TransactionRule.repo().save(rule);
    }

    static async destroy(userId: number, ruleId: number): Promise<void> {
        await TransactionRule.repo().delete({ id: ruleId, userId });
    }

    static async update(
        userId: number,
        ruleId: number,
        fields: Partial<TransactionRule>
    ): Promise<TransactionRule> {
        await TransactionRule.repo().update({ userId, id: ruleId }, fields);
        return unwrap(await TransactionRule.find(userId, ruleId));
    }

    // Get categorize rules for which there's at least one action that would
    // categorize with the given categoryId.
    static async getCategorizeRules(
        userId: number,
        categoryId: number
    ): Promise<TransactionRule[]> {
        const qb = TransactionRule.repo().createQueryBuilder('rule');
        // Note: we bind a `categorize` variable explicitly because postgres
        // doesn't seem to like that we embed a string directly in there. Oh
        // well.
        return await qb
            .where(
                `rule.id IN ${qb
                    .subQuery()
                    .select('action.ruleId')
                    .from(TransactionRuleAction, 'action')
                    .where('action.type = :categorize')
                    .andWhere('action.categoryId = :categoryId')
                    .andWhere('action.userId = :userId')
                    .getQuery()}`
            )
            .setParameter('categorize', 'categorize')
            .setParameter('userId', userId)
            .setParameter('categoryId', categoryId)
            .leftJoinAndSelect('rule.actions', 'actions')
            .leftJoinAndSelect('rule.conditions', 'conditions')
            .getMany();
    }
}
