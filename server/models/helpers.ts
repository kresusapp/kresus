import { DeepPartial, QueryRunner, Repository } from 'typeorm';

import { UNKNOWN_OPERATION_TYPE, makeLogger } from '../helpers';
import { Transaction } from './';

const log = makeLogger('models/helpers');

const hasCategory = (op: Transaction): boolean => op.categoryId !== null;

const hasType = (op: Transaction): boolean => {
    return typeof op.type !== 'undefined' && op.type !== UNKNOWN_OPERATION_TYPE;
};
const hasCustomLabel = (op: Transaction): boolean => typeof op.customLabel === 'string';
const hasBudgetDate = (op: Transaction): boolean => {
    return typeof op.budgetDate !== 'undefined' && op.budgetDate !== null;
};
const hasDebitDate = (op: Transaction): boolean => {
    return typeof op.debitDate !== 'undefined' && op.debitDate !== null;
};

export function mergeWith(target: Transaction, other: Transaction): DeepPartial<Transaction> {
    const update: DeepPartial<Transaction> = {};

    // Always trigger an update for the import date, to avoid duplicate
    // transactions to appear in reports around the date where the duplicate
    // has been imported.
    // This should be always true, but we stay defensive here.
    if (typeof other.importDate !== 'undefined' && other.importDate !== null) {
        update.importDate = other.importDate;
    }

    if (!hasCategory(target) && hasCategory(other)) {
        update.categoryId = other.categoryId;
    }

    if (!hasType(target) && hasType(other)) {
        update.type = other.type;
        update.isUserDefinedType = other.isUserDefinedType;
    }

    if (!hasCustomLabel(target) && hasCustomLabel(other)) {
        update.customLabel = other.customLabel;
    }

    if (!hasBudgetDate(target) && hasBudgetDate(other)) {
        update.budgetDate = other.budgetDate;
    }

    if (!hasDebitDate(target) && hasDebitDate(other)) {
        update.debitDate = other.debitDate;
    }

    return update;
}

// A hack to make sure that a value read from the database is coerced into a
// number, if it's not it in the first place. Useful to support postgres's
// numerical type which returns a string.
export class ForceNumericColumn {
    // This direction is fine.
    to(data: any) {
        return data;
    }

    // Converts from a string to a number.
    from(data: any) {
        let ret;
        if (['undefined', 'number'].includes(typeof data) || data === null) {
            ret = data;
        } else {
            ret = Number.parseFloat(data);
        }
        if (Number.isNaN(ret)) {
            log.error('unexpected NaN stored in column');
        }
        return ret;
    }
}

// The type to use in entities declarations for datetime (date with a
// timestamp), Note it must be used like this: { type: DatetimeType }, because
// of limitations of the ORM.
export const DatetimeType = Date;

// Normalizes the datetime type for the database for migrations.
export function datetimeType(queryRunner: QueryRunner): string {
    return queryRunner.connection.driver.normalizeType({ type: Date });
}

// sqlite can't use more than 999 variables in a single query. If an entity has
// N fields, then we can't insert more than 999/N entities at once; in this
// case, we need to split up the batches into smaller ones.
//
// 50 ought to be enough for everyone, since it allows up to 19 fields.
const NUM_NEW_ENTITIES_IN_BATCH = 50;

// Note: doesn't return the inserted entities.
export async function bulkInsert<T>(
    repository: Repository<T>,
    entities: DeepPartial<T>[]
): Promise<void> {
    // Do not call `repository.insert` without actual entities, that will generate an empty insert
    // query and throw an error.
    // See https://github.com/typeorm/typeorm/issues/3111
    if (entities.length === 0) {
        return;
    }

    let remaining = entities;
    if (repository.manager.connection.driver.options.type === 'sqlite') {
        log.info('bulk insert: splitting up batches for sqlite');
        while (remaining.length > 0) {
            const nextRemaining = remaining.splice(NUM_NEW_ENTITIES_IN_BATCH);
            await repository.insert(remaining);
            remaining = nextRemaining;
        }
    } else {
        log.info('bulk insert: inserting all at once');
        await repository.insert(remaining);
    }
}
