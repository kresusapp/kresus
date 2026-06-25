import assert from 'node:assert';

import semver from 'semver';

import { MIN_WOOB_VERSION, normalizeVersion, checkMinimalWoobVersion } from '../../server/helpers';

describe('server getters', () => {
    describe("'isWoobInstalled'", () => {
        describe('should return false when', () => {
            it("'woob-version' < MIN_WOOB_VERSION", () => {
                let version = '0.0.1';
                assert.strictEqual(checkMinimalWoobVersion(version), false);
            });

            it("'woob-version' === 0.h", () => {
                let version = '0.h';
                assert.strictEqual(checkMinimalWoobVersion(version), false);
            });
        });

        describe('should return true when', () => {
            it("'woob-version' === MIN_WOOB_VERSION", () => {
                let version = MIN_WOOB_VERSION;
                assert.strictEqual(checkMinimalWoobVersion(version), true);
            });

            it("'woob-version' > MIN_WOOB_VERSION", () => {
                let version = semver.inc(normalizeVersion(MIN_WOOB_VERSION), 'minor');
                assert.strictEqual(checkMinimalWoobVersion(version), true);
            });
        });
    });
});
