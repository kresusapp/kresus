import should from 'should';
import semver from 'semver';

import { get } from '../client/store';
import { MIN_WEBOOB_VERSION, normalizeVersion  } from '../client/helpers';

function makeState(installed, version) {
    return {
        settings: {
            map: {
                'weboob-installed': `${installed}`,
                'weboob-version': version
            }
        }
    };
}

describe('isWeboobInstalled', () => {
    describe('should return false when', () => {
        it("'weboob-installed' set to false", () => {
            let state = makeState(false, undefined);
            get.isWeboobInstalled(state).should.equal(false);
        });

        it("'weboob-installed' set to true and 'weboob-version' < MIN_WEBOOB_VERSION", () => {
            let state = makeState(true, '0.0.1');
            get.isWeboobInstalled(state).should.equal(false);
        });

        it("'weboob-installed' set to true and 'weboob-version' === 0.h", () => {
            let state = makeState(true, '0.h');
            get.isWeboobInstalled(state).should.equal(false);
        });
    });

    describe('should return true when', () => {
        it("'weboob-installed' set to true and 'weboob-version' === MIN_WEBOOB_VERSION", () => {
            let state = makeState(true, MIN_WEBOOB_VERSION);
            get.isWeboobInstalled(state).should.equal(true);
        });

        it("'weboob-installed' set to true and 'weboob-version' > MIN_WEBOOB_VERSION", () => {
            let state = makeState(true, semver.inc(normalizeVersion(MIN_WEBOOB_VERSION), 'minor'));
            get.isWeboobInstalled(state).should.equal(true);
        });
    });
})
