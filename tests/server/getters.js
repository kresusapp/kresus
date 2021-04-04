import should from 'should';
import semver from 'semver';

import { MIN_WOOB_VERSION, normalizeVersion, checkMinimalWoobVersion } from '../../server/helpers';

describe('server getters', () => {
    describe("'isWoobInstalled'", () => {
        describe('should return false when', () => {
            it("'woob-version' < MIN_WOOB_VERSION", () => {
                let version = '0.0.1';
                checkMinimalWoobVersion(version).should.equal(false);
            });

            it("'woob-version' === 0.h", () => {
                let version = '0.h';
                checkMinimalWoobVersion(version).should.equal(false);
            });
        });

        describe('should return true when', () => {
            it("'woob-version' === MIN_WOOB_VERSION", () => {
                let version = MIN_WOOB_VERSION;
                checkMinimalWoobVersion(version).should.equal(true);
            });

            it("'woob-version' > MIN_WOOB_VERSION", () => {
                let version = semver.inc(normalizeVersion(MIN_WOOB_VERSION), 'minor');
                checkMinimalWoobVersion(version).should.equal(true);
            });
        });
    });
});
