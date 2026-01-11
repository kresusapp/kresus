import assert from 'node:assert';

import { capitalize } from '../../client/helpers';

describe('client helpers', () => {
    describe('capitalize', () => {
        it('should set the first letter of a sentence in uppercase', () => {
            assert.strictEqual(capitalize('april'), 'April');
            assert.strictEqual(capitalize('élément'), 'Élément');
        });

        it('should not alter other letters or following words', () => {
            assert.strictEqual(capitalize('april month'), 'April month');
            assert.strictEqual(capitalize('APRIL'), 'APRIL');
            assert.strictEqual(capitalize('aPrIL'), 'APrIL');
        });

        it('should return an empty string if provided an empty or invalid text', () => {
            assert.strictEqual(capitalize(''), '');
            assert.strictEqual(capitalize(null), '');
            assert.strictEqual(capitalize({}), '');
            assert.strictEqual(capitalize(), '');
        });
    });
});
