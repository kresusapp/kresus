import {
    getRepository,
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';

import User from './users';
import Access from './accesses';

import { assert } from '../../helpers';

@Entity()
export default class AccessFields {
    @PrimaryGeneratedColumn()
    id;

    @ManyToOne(
        // eslint-disable-next-line no-unused-vars
        type => User,
        { cascade: true, onDelete: 'CASCADE', nullable: false }
    )
    @JoinColumn()
    user;

    @Column('integer')
    userId;

    // The access unique identifier of the access the field is attached to.
    @ManyToOne(
        // eslint-disable-next-line no-unused-vars
        type => Access,
        { cascade: true, onDelete: 'CASCADE', nullable: false },
        access => access.fields
    )
    @JoinColumn()
    access;

    @Column('integer')
    accessId;

    // The name of the field.
    @Column('varchar')
    name;

    // The value of the field.
    @Column('varchar')
    value;
}

let REPO = null;
function repo() {
    if (REPO === null) {
        REPO = getRepository(AccessFields);
    }
    return REPO;
}

AccessFields.create = async function(userId, attributes) {
    let { accessId } = attributes;
    assert(
        typeof accessId === 'number',
        'AccessFields.create second arg should have "accessId" id property'
    );
    let entity = repo().create(Object.assign({}, attributes, { userId }));
    return await repo().save(entity);
};

AccessFields.find = async function(userId, fieldId) {
    return await repo().findOne({ where: { id: fieldId, userId } });
};

AccessFields.all = async function(userId) {
    return await repo().find({ userId });
};

AccessFields.exists = async function(userId, fieldId) {
    let found = await repo().findOne({ where: { userId, id: fieldId } });
    return !!found;
};

AccessFields.destroy = async function(userId, fieldId) {
    return await repo().delete({ userId, id: fieldId });
};

AccessFields.update = async function(userId, fieldId, attributes) {
    return await repo().update({ userId, id: fieldId }, attributes);
};

// TODO optimize with SQL?
AccessFields.batchCreate = async function batchCreate(userId, accessId, fields) {
    assert(
        typeof accessId === 'number',
        'AccessFields.batchCreate second arg should be an id "accessId"'
    );
    assert(fields instanceof Array, 'AccessFields.batchCreate third arg should be an array.');

    let fieldsFromDb = [];
    for (let field of fields) {
        fieldsFromDb.push(await AccessFields.create(userId, { ...field, accessId }));
    }
    return fieldsFromDb;
};

AccessFields.allByAccessId = async function allByAccessId(userId, accessId) {
    assert(
        typeof accessId === 'number',
        'AccessFields.allByAccessId second arg should be an id "accessId".'
    );
    return await repo().find({ accessId, userId });
};

AccessFields.updateOrCreateByAccessIdAndName = async function(userId, accessId, name, value) {
    if (value === null) {
        return await repo().delete({ accessId, name });
    }

    // TODO optimize with upsert() if available?
    let field = await repo().find({ accessId, name });
    if (field instanceof Array && field.length) {
        assert(field.length === 1, 'more than one value set for a given custom field');
        field = field[0];
        return await AccessFields.update(userId, field.id, { value });
    }

    return await AccessFields.create(userId, { name, value, accessId });
};

AccessFields.batchUpdateOrCreate = async function batchUpdateOrCreate(
    userId,
    accessId,
    fields = []
) {
    assert(fields instanceof Array, 'AccessFields.batchUpdateOrCreate third arg must be an array.');
    for (let field of fields) {
        await AccessFields.updateOrCreateByAccessIdAndName(
            userId,
            accessId,
            field.name,
            field.value
        );
    }
};
