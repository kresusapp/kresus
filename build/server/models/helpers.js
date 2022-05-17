"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foreignKeyUserId = exports.foreignKey = exports.idColumn = exports.bulkDelete = exports.bulkInsert = exports.datetimeType = exports.DatetimeType = exports.ForceNumericColumn = exports.mergeWith = void 0;
const helpers_1 = require("../helpers");
const log = (0, helpers_1.makeLogger)('models/helpers');
const hasCategory = (op) => op.categoryId !== null;
const hasType = (op) => {
    return typeof op.type !== 'undefined' && op.type !== helpers_1.UNKNOWN_OPERATION_TYPE;
};
const hasCustomLabel = (op) => typeof op.customLabel === 'string';
const hasBudgetDate = (op) => {
    return typeof op.budgetDate !== 'undefined' && op.budgetDate !== null;
};
const hasDebitDate = (op) => {
    return typeof op.debitDate !== 'undefined' && op.debitDate !== null;
};
function mergeWith(target, other) {
    const update = {};
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
    if (!hasCustomLabel(target)) {
        if (hasCustomLabel(other)) {
            update.customLabel = other.customLabel;
        }
        else if (other.createdByUser) {
            // If the transaction was manually created the label is probably better suited.
            update.customLabel = other.label;
        }
    }
    if (!hasBudgetDate(target) && hasBudgetDate(other)) {
        update.budgetDate = other.budgetDate;
    }
    if (!hasDebitDate(target) && hasDebitDate(other)) {
        update.debitDate = other.debitDate;
    }
    // If the other transaction was not created by the user it means
    // the current one was probably created as a provisional transaction
    // and should now be considered as the actual (coming from the bank)
    // transaction.
    if (target.createdByUser && !other.createdByUser) {
        update.createdByUser = false;
    }
    return update;
}
exports.mergeWith = mergeWith;
// A hack to make sure that a value read from the database is coerced into a
// number, if it's not it in the first place. Useful to support postgres's
// numerical type which returns a string.
class ForceNumericColumn {
    // This direction is fine.
    to(data) {
        return data;
    }
    // Converts from a string to a number.
    from(data) {
        let ret;
        if (['undefined', 'number'].includes(typeof data) || data === null) {
            ret = data;
        }
        else {
            ret = Number.parseFloat(data);
        }
        if (Number.isNaN(ret)) {
            log.error('unexpected NaN stored in column');
        }
        return ret;
    }
}
exports.ForceNumericColumn = ForceNumericColumn;
// The type to use in entities declarations for datetime (date with a
// timestamp), Note it must be used like this: { type: DatetimeType }, because
// of limitations of the ORM.
exports.DatetimeType = Date;
// Normalizes the datetime type for the database for migrations.
function datetimeType(queryRunner) {
    return queryRunner.connection.driver.normalizeType({ type: Date });
}
exports.datetimeType = datetimeType;
// sqlite can't use more than 999 variables in a single query. If an entity has
// N fields, then we can't insert more than 999/N entities at once; in this
// case, we need to split up the batches into smaller ones.
//
// 50 ought to be enough for everyone, since it allows up to 19 fields.
const LOW_NUM_ENTITIES_IN_BATCH = 50;
// The same issue happens with postgres which can't bind more than 64K features at once.
const NUM_ENTITIES_IN_BATCH = 1000;
// Note: doesn't return the inserted entities.
async function bulkInsert(repository, entities) {
    // Do not call `repository.insert` without actual entities, that will generate an empty insert
    // query and throw an error.
    // See https://github.com/typeorm/typeorm/issues/3111
    if (entities.length === 0) {
        return;
    }
    let remaining = entities;
    let batchSize = NUM_ENTITIES_IN_BATCH;
    if (repository.manager.connection.driver.options.type === 'sqlite') {
        batchSize = LOW_NUM_ENTITIES_IN_BATCH;
    }
    log.info(`bulk insert: splitting up batches with a size of ${batchSize}`);
    while (remaining.length > 0) {
        const nextRemaining = remaining.splice(batchSize);
        await repository.insert(remaining);
        remaining = nextRemaining;
    }
}
exports.bulkInsert = bulkInsert;
async function bulkDelete(repository, ids) {
    if (ids.length === 0) {
        return;
    }
    let remaining = ids;
    let batchSize = NUM_ENTITIES_IN_BATCH;
    if (repository.manager.connection.driver.options.type === 'sqlite') {
        batchSize = LOW_NUM_ENTITIES_IN_BATCH;
    }
    log.info(`bulk delete: splitting up batches with a size of ${batchSize}`);
    while (remaining.length > 0) {
        const nextRemaining = remaining.splice(batchSize);
        await repository.delete(remaining);
        remaining = nextRemaining;
    }
}
exports.bulkDelete = bulkDelete;
function idColumn() {
    return {
        name: 'id',
        type: 'integer',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
    };
}
exports.idColumn = idColumn;
function foreignKey(constraintName, columnName, referencedTableName, referencedColumnName, cascadeOpts = {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
}) {
    return {
        name: constraintName,
        columnNames: [columnName],
        referencedColumnNames: [referencedColumnName],
        referencedTableName,
        ...cascadeOpts,
    };
}
exports.foreignKey = foreignKey;
function foreignKeyUserId(tableName) {
    return foreignKey(`${tableName}_ref_user_id`, 'userId', 'user', 'id');
}
exports.foreignKeyUserId = foreignKeyUserId;
