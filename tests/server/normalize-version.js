import assert from 'node:assert';

import { normalizeVersion } from '../../server/helpers';

describe('normalizeVersion', () => {
    it('0 should become 0.0.0', () => {
        assert.strictEqual(normalizeVersion(0), '0.0.0');
    });
    it('0.1 should become 0.1.0', () => {
        assert.strictEqual(normalizeVersion(0.1), '0.1.0');
    });
    it('1 should become 1.0.0', () => {
        assert.strictEqual(normalizeVersion('1'), '1.0.0');
    });
    it('1.1.1.1 should become 1.1.1', () => {
        assert.strictEqual(normalizeVersion('1.1.1.1'), '1.1.1');
    });
    it('1.1.1 should be unchanged', () => {
        assert.strictEqual(normalizeVersion('1.1.1'), '1.1.1');
    });
    it('0.h should become 0.0.0', () => {
        assert.strictEqual(normalizeVersion('0.h'), '0.0.0');
    });
    it('1.2.4-beta.0 should be unchanged', () => {
        assert.strictEqual(normalizeVersion('1.2.4-beta.0'), '1.2.4-beta.0');
    });
    it('1.2.4-beta should be unchanged', () => {
        assert.strictEqual(normalizeVersion('1.2.4-beta'), '1.2.4-beta');
    });
});
