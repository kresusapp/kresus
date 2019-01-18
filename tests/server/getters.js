import should from 'should';
import semver from 'semver';

import {
    MIN_WEBOOB_VERSION,
    normalizeVersion,
    checkWeboobMinimalVersion
} from '../../server/helpers';

describe('server getters', () => {
    describe("'isWeboobInstalled'", () => {
        describe('should return false when', () => {
            it("'weboob-version' < MIN_WEBOOB_VERSION", () => {
                let version = '0.0.1';
                checkWeboobMinimalVersion(version).should.equal(false);
            });

            it("'weboob-version' === 0.h", () => {
                let version = '0.h';
                checkWeboobMinimalVersion(version).should.equal(false);
            });
        });

        describe('should return true when', () => {
            it("'weboob-version' === MIN_WEBOOB_VERSION", () => {
                let version = MIN_WEBOOB_VERSION;
                checkWeboobMinimalVersion(version).should.equal(true);
            });

            it("'weboob-version' > MIN_WEBOOB_VERSION", () => {
                let version = semver.inc(normalizeVersion(MIN_WEBOOB_VERSION), 'minor');
                checkWeboobMinimalVersion(version).should.equal(true);
            });
        });
    });
});
