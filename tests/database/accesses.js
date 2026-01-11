import assert from 'node:assert';

import { AccessField, Access } from '../../server/models';

import { checkObjectIsSubsetOf } from '../helpers';

describe('Access model API', () => {
    let accessWithoutFields = {
        login: 'login',
        password: 'password',
        vendorId: 'gnagnagna',
    };

    let USER_ID = null;
    before(() => {
        // applyConfig must have already been called.
        USER_ID = process.kresus.defaultUser.id;
    });

    describe('Access creation', () => {
        before(async () => {
            await Access.destroyAll(USER_ID);
            await AccessField.destroyAll(USER_ID);
        });

        let allAccesses, allFields;

        it('The access should be in the database', async () => {
            await Access.create(USER_ID, accessWithoutFields);
            allAccesses = await Access.all(USER_ID);

            assert.strictEqual(allAccesses.length, 1);
            assert.ok(checkObjectIsSubsetOf(accessWithoutFields, allAccesses[0]));

            allFields = await AccessField.all(USER_ID);
            assert.strictEqual(allFields.length, 0);
        });

        let fields = [
            { name: 'name', value: 'toto' },
            { name: 'website', value: 'other' },
        ];
        let accessWithFields = { ...accessWithoutFields, fields };

        it('The access and the fields should be in the database', async () => {
            let accessWithoutFieldsId = (await Access.create(USER_ID, accessWithFields)).id;

            allAccesses = await Access.all(USER_ID);
            allFields = await AccessField.all(USER_ID);

            assert.strictEqual(allAccesses.length, 2);
            assert.ok(allAccesses.some(acc => checkObjectIsSubsetOf(accessWithFields, acc)));
            assert.ok(allAccesses.some(acc => checkObjectIsSubsetOf(accessWithoutFields, acc)));

            assert.strictEqual(allFields.length, 2);
            for (let field of allFields) {
                assert.ok(allFields.some(f => checkObjectIsSubsetOf(f, field)));
                assert.strictEqual(field.accessId, accessWithoutFieldsId);
            }
        });

        it('should not use a provided userId when creating a new entity', async () => {
            const rogueAccess = {
                ...accessWithoutFields,
                userId: 42,
            };
            await Access.create(USER_ID, rogueAccess);
            allAccesses = await Access.all(USER_ID);

            assert.strictEqual(allAccesses.length, 3);
            assert.ok(allAccesses.some(acc => checkObjectIsSubsetOf(accessWithoutFields, acc)));

            let answer = await Access.all(42);
            assert.strictEqual(answer.length, 0);
        });
    });

    describe('Access deletion', () => {
        before(async () => {
            await Access.destroyAll(USER_ID);
            await AccessField.destroyAll(USER_ID);
        });

        let fields = [
            { name: 'name', value: 'toto' },
            { name: 'website', value: 'other' },
        ];
        let accessWithFields = { ...accessWithoutFields, fields };

        let allAccesses, allFields, accessWithFieldsId;

        it('The access should be in the database', async () => {
            await Access.create(USER_ID, accessWithoutFields);
            accessWithFieldsId = (await Access.create(USER_ID, accessWithFields)).id;
            allAccesses = await Access.all(USER_ID);
            allFields = await AccessField.all(USER_ID);

            assert.strictEqual(allAccesses.length, 2);
            // assert.ok(checkObjectIsSubsetOf(accessWithFields, allAccesses[0]));
            // assert.ok(checkObjectIsSubsetOf(accessWithoutFields, allAccesses[1]));

            assert.strictEqual(allFields.length, 2);
            for (let field of allFields) {
                assert.ok(allFields.some(f => checkObjectIsSubsetOf(f, field)));
            }
        });

        it('The access should be deleted', async () => {
            await Access.destroy(USER_ID, accessWithFieldsId);

            allFields = await AccessField.all(USER_ID);
            assert.strictEqual(allFields.length, 0);

            allAccesses = await Access.all(USER_ID);
            assert.strictEqual(allAccesses.length, 1);
        });
    });
});
