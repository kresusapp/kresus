import assert from 'node:assert';

import { AccessField, Access } from '../../server/models';

import { checkObjectIsSubsetOf } from '../helpers';

describe('Access model API', () => {
    let accessWithMinimalFields = {
        vendorId: 'gnagnagna',
        fields: [
            { name: 'login', value: 'login' },
            { name: 'password', value: 'password' },
        ],
    };

    let accessWithAdditionalFields = {
        vendorId: accessWithMinimalFields.vendorId,
        fields: [
            ...accessWithMinimalFields.fields,
            { name: 'name', value: 'toto' },
            { name: 'website', value: 'other' },
        ],
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
            await Access.create(USER_ID, accessWithMinimalFields);
            allAccesses = await Access.all(USER_ID);

            assert.strictEqual(allAccesses.length, 1);
            assert.ok(checkObjectIsSubsetOf(accessWithMinimalFields, allAccesses[0]));

            allFields = await AccessField.all(USER_ID);
            assert.strictEqual(allFields.length, accessWithMinimalFields.fields.length);
        });

        it('The access and the fields should be in the database', async () => {
            await Access.create(USER_ID, accessWithAdditionalFields);

            allAccesses = await Access.all(USER_ID);
            allFields = await AccessField.all(USER_ID);

            assert.strictEqual(allAccesses.length, 2);
            assert.ok(
                allAccesses.some(acc => checkObjectIsSubsetOf(accessWithAdditionalFields, acc))
            );
            assert.ok(allAccesses.some(acc => checkObjectIsSubsetOf(accessWithMinimalFields, acc)));

            assert.strictEqual(
                allFields.length,
                accessWithMinimalFields.fields.length + accessWithAdditionalFields.fields.length
            );

            assert.ok(
                accessWithAdditionalFields.fields.every(f =>
                    allFields.some(af => checkObjectIsSubsetOf(f, af))
                )
            );
        });

        it('should not use a provided userId when creating a new entity', async () => {
            const rogueAccess = {
                ...accessWithMinimalFields,
                userId: 42,
            };
            await Access.create(USER_ID, rogueAccess);
            allAccesses = await Access.all(USER_ID);

            assert.strictEqual(allAccesses.length, 3);
            assert.ok(allAccesses.some(acc => checkObjectIsSubsetOf(accessWithMinimalFields, acc)));

            let answer = await Access.all(42);
            assert.strictEqual(answer.length, 0);
        });
    });

    describe('Access deletion', () => {
        before(async () => {
            await Access.destroyAll(USER_ID);
            await AccessField.destroyAll(USER_ID);
        });

        let allAccesses, allFields, accessWithAdditionalFieldsId;

        it('The access should be in the database', async () => {
            await Access.create(USER_ID, accessWithMinimalFields);
            accessWithAdditionalFieldsId = (
                await Access.create(USER_ID, accessWithAdditionalFields)
            ).id;
            allAccesses = await Access.all(USER_ID);
            allFields = await AccessField.all(USER_ID);

            assert.strictEqual(allAccesses.length, 2);
            assert.ok(allAccesses.some(acc => checkObjectIsSubsetOf(accessWithMinimalFields, acc)));
            assert.ok(
                allAccesses.some(acc => checkObjectIsSubsetOf(accessWithAdditionalFields, acc))
            );

            assert.strictEqual(
                allFields.length,
                accessWithAdditionalFields.fields.length + accessWithMinimalFields.fields.length
            );
            assert.ok(
                accessWithAdditionalFields.fields.every(f =>
                    allFields.some(af => checkObjectIsSubsetOf(af, f))
                )
            );
        });

        it('The access should be deleted', async () => {
            await Access.destroy(USER_ID, accessWithAdditionalFieldsId);

            allFields = await AccessField.all(USER_ID);
            assert.strictEqual(allFields.length, accessWithMinimalFields.fields.length);

            allAccesses = await Access.all(USER_ID);
            assert.strictEqual(allAccesses.length, 1);
        });
    });
});
