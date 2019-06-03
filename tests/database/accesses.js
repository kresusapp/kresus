// There's a bug between eslint and prettier with spacing around async arrow
// functions, so we need to explicitly use async functions instead.
/* eslint-disable prefer-arrow-callback */

import { clear } from './helpers';

let AccessFields = null;
let Accesses = null;

before(async function() {
    AccessFields = require('../../server/models/access-fields');
    Accesses = require('../../server/models/accesses');
});

describe('Accesses model API', () => {
    describe('Access creation', () => {
        before(async function() {
            await clear(Accesses);
            await clear(AccessFields);
        });

        let accessWithoutFields = {
            login: 'login',
            password: 'password',
            fields: [],
            bank: 'bank'
        };

        let allAccesses, allFields;

        it('The access should be in the database', async function() {
            await Accesses.create(0, accessWithoutFields);
            allAccesses = await Accesses.all(0);
            allFields = await AccessFields.all(0);

            should.equal(allAccesses.length, 1);
            allAccesses.should.containDeep([accessWithoutFields]);

            should.equal(allFields.length, 0);
        });

        let fields = [{ name: 'name', value: 'toto' }, { name: 'website', value: 'other' }];
        let accessWithFields = { ...accessWithoutFields, fields };

        it('The access and the fields should be in the database', async function() {
            let accessWithoutFieldsId = (await Accesses.create(0, accessWithFields)).id;

            allAccesses = await Accesses.all(0);
            allFields = await AccessFields.all(0);

            should.equal(allAccesses.length, 2);
            allAccesses.should.containDeep([accessWithFields, accessWithoutFields]);

            should.equal(allFields.length, 2);
            allFields.should.containDeep(fields);
            for (let field of allFields) {
                should.equal(field.accessId, accessWithoutFieldsId);
            }
        });
    });

    describe('Access deletion', () => {
        before(async function() {
            await clear(Accesses);
            await clear(AccessFields);
        });

        let accessWithoutFields = {
            login: 'login',
            password: 'password',
            fields: [],
            bank: 'bank'
        };

        let fields = [{ name: 'name', value: 'toto' }, { name: 'website', value: 'other' }];
        let accessWithFields = { ...accessWithoutFields, fields };

        let allAccesses, allFields, accessWithFieldsId;

        it('The access should be in the database', async function() {
            await Accesses.create(0, accessWithoutFields);
            accessWithFieldsId = (await Accesses.create(0, accessWithFields)).id;
            allAccesses = await Accesses.all(0);
            allFields = await AccessFields.all(0);

            should.equal(allAccesses.length, 2);
            allAccesses.should.containDeep([accessWithFields, accessWithoutFields]);

            should.equal(allFields.length, 2);
            allFields.should.containDeep(fields);
        });

        it('The access should be deleted', async function() {
            await Accesses.destroy(0, accessWithFieldsId);

            allFields = await AccessFields.all(0);
            should.equal(allFields.length, 0);

            allAccesses = await Accesses.all(0);
            should.equal(allAccesses.length, 1);
        });
    });
});
