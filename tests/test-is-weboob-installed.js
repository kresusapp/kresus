import should from 'should';

import { get } from '../client/store';
import { MIN_WEBOOB_VERSION } from '../client/helpers';
import { normalizeVersion } from '../client/helpers';
import semver from 'semver';

describe('isWeboobInstalled', () => {
    describe('should return false when', () => {
        it("'weboob-installed' set to false", () => {
            let state = { settings: { map : { 'weboob-installed': 'false' } } };
            get.isWeboobInstalled(state).should.equal(false);
        });
        it("'weboob-installed' set to true and 'weboob-version' < MIN_WEBOOB_VERSION", () => {
            let state = {
                settings: {
                    map : {
                            'weboob-installed': 'true',
                            'weboob-version': '1.0.0',
                        }
                    }
            };
            get.isWeboobInstalled(state).should.equal(false);
        });
        it("'weboob-installed' set to true and 'weboob-version' === 0.h", () => {
            let state = {
                settings: {
                    map : {
                            'weboob-installed': 'true',
                            'weboob-version': '0.h',
                        }
                    }
            };
            get.isWeboobInstalled(state).should.equal(false);
        });
    });
    describe('should return true when', () => {
        it("'weboob-installed' set to true and 'weboob-version' === MIN_WEBOOB_VERSION", () => {
            let state = {
                settings: {
                    map : {
                            'weboob-installed': 'true',
                            'weboob-version': MIN_WEBOOB_VERSION,
                        }
                    }
            };
            get.isWeboobInstalled(state).should.equal(true);
        });
        it("'weboob-installed' set to true and MIN_WEBOOB_VERSION <= 'weboob-version'", () => {
            let state = {
                settings: {
                    map : {
                            'weboob-installed': 'true',
                            'weboob-version': semver.inc(normalizeVersion(MIN_WEBOOB_VERSION), 'minor'),
                        }
                    }
            };
            get.isWeboobInstalled(state).should.equal(true);
        });
    });
})
