"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areFieldsComplete = exports.LOW_NUM_ENTITIES_IN_BATCH = exports.DatetimeType = exports.ForceNumericColumn = void 0;
exports.mergeWith = mergeWith;
exports.datetimeType = datetimeType;
exports.isSqlite = isSqlite;
exports.isUniqueConstraintViolation = isUniqueConstraintViolation;
exports.bulkInsert = bulkInsert;
exports.bulkDelete = bulkDelete;
exports.idColumn = idColumn;
exports.foreignKey = foreignKey;
exports.foreignKeyUserId = foreignKeyUserId;
const typeorm_1 = require("typeorm");
const helpers_1 = require("../helpers");
const providers_1 = require("../providers");
const log = (0, helpers_1.makeLogger)('models/helpers');
const hasCategory = (tr) => tr.categoryId !== null;
const hasType = (tr) => {
    return typeof tr.type !== 'undefined' && tr.type !== helpers_1.UNKNOWN_TRANSACTION_TYPE;
};
const hasCustomLabel = (tr) => typeof tr.customLabel === 'string';
const hasBudgetDate = (tr) => {
    return typeof tr.budgetDate !== 'undefined' && tr.budgetDate !== null;
};
const hasDebitDate = (tr) => {
    return typeof tr.debitDate !== 'undefined' && tr.debitDate !== null;
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
    // If this is a recurring transaction but not the other, the other is probably
    // a manual or real transaction, which should have the priority.
    if (target.isRecurrentTransaction && !other.isRecurrentTransaction) {
        update.isRecurrentTransaction = false;
    }
    return update;
}
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
// sqlite can't use more than 999 variables in a single query. If an entity has
// N fields, then we can't insert more than 999/N entities at once; in this
// case, we need to split up the batches into smaller ones.
//
// 50 ought to be enough for everyone, since it allows up to 19 fields.
exports.LOW_NUM_ENTITIES_IN_BATCH = 50;
// The same issue happens with postgres which can't bind more than 64K features at once.
const NUM_ENTITIES_IN_BATCH = 1000;
function isSqlite(connection) {
    const dbType = connection.driver.options.type;
    return dbType === 'better-sqlite3';
}
function isUniqueConstraintViolation(err) {
    var _a;
    if (!(err instanceof typeorm_1.QueryFailedError)) {
        return false;
    }
    const code = (_a = err.driverError) === null || _a === void 0 ? void 0 : _a.code;
    // The error codes reported when a UNIQUE constraint is violated: better-sqlite3 uses an extended
    // sqlite result code, postgres the SQLSTATE for unique_violation.
    // See https://www.sqlite.org/c3ref/c_abort_rollback.html#:~:text=SQLITE_CONSTRAINT_UNIQUE
    // See https://www.postgresql.org/docs/current/errcodes-appendix.html#:~:text=23505
    return typeof code === 'string' && (code === 'SQLITE_CONSTRAINT_UNIQUE' || code === '23505');
}
// Note: doesn't return the inserted entities, only their ids, in the same order as the entities
// which were passed as arguments.
async function bulkInsert(repository, entities) {
    // Do not call `repository.insert` without actual entities, that will generate an empty insert
    // query and throw an error.
    // See https://github.com/typeorm/typeorm/issues/3111
    if (entities.length === 0) {
        return [];
    }
    const insertedIds = [];
    let remaining = entities;
    let batchSize = NUM_ENTITIES_IN_BATCH;
    if (isSqlite(repository.manager.connection)) {
        batchSize = exports.LOW_NUM_ENTITIES_IN_BATCH;
    }
    log.info(`bulk insert: splitting up batches with a size of ${batchSize}`);
    while (remaining.length > 0) {
        const nextRemaining = remaining.splice(batchSize);
        const result = await repository.insert(remaining);
        insertedIds.push(...result.identifiers.map(identifier => identifier.id));
        remaining = nextRemaining;
    }
    return insertedIds;
}
async function bulkDelete(repository, ids) {
    if (ids.length === 0) {
        return;
    }
    let remaining = ids;
    let batchSize = NUM_ENTITIES_IN_BATCH;
    if (isSqlite(repository.manager.connection)) {
        batchSize = exports.LOW_NUM_ENTITIES_IN_BATCH;
    }
    log.info(`bulk delete: splitting up batches with a size of ${batchSize}`);
    while (remaining.length > 0) {
        const nextRemaining = remaining.splice(batchSize);
        await repository.delete(remaining);
        remaining = nextRemaining;
    }
}
function idColumn() {
    return {
        name: 'id',
        type: 'integer',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
    };
}
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
function foreignKeyUserId(tableName) {
    return foreignKey(`${tableName}_ref_user_id`, 'userId', 'user', 'id');
}
const areFieldsComplete = (vendorId, fields) => {
    let vendorDescriptor;
    try {
        vendorDescriptor = (0, providers_1.bankVendorByUuid)(vendorId);
    }
    catch (_a) {
        return false;
    }
    // Check that for every non-optional field, we do have a corresponding value.
    if (!vendorDescriptor.customFields) {
        return vendorDescriptor.noCredentials === true;
    }
    const mandatoryFields = vendorDescriptor.customFields
        .filter(f => !('optional' in f) || f.optional === false)
        .map(f => f.name);
    if (fields.length < mandatoryFields.length) {
        return false;
    }
    return mandatoryFields.every(fieldName => fields.find(f => f.name === fieldName && !!f.value));
};
exports.areFieldsComplete = areFieldsComplete;
