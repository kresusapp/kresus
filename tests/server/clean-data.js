import should from 'should';

import { cleanData } from '../../server/controllers/v1/helpers';
import DefaultSettings from '../../shared/default-settings';

describe('Ensure settings without default values are removed when exporting data', () => {
    const UNKNOWN_SETTING = 'unknown-setting';
    const KNOWN_SETTING = 'locale';
    const GHOST_SETTING = 'weboob-version';
    let world = {
        settings: [
            {
                key: UNKNOWN_SETTING,
                value: 'weird value',
                id: '1'
            },
            {
                key: KNOWN_SETTING,
                value: 'en',
                id: '2'
            },
            {
                key: GHOST_SETTING,
                value: '1.3'
            }
        ]
    };
    let all = cleanData(world);
    it('The unknown setting should be removed from the list', () => {
        DefaultSettings.has(UNKNOWN_SETTING).should.equal(false);
        all.settings.some(s => s.key === UNKNOWN_SETTING).should.equal(false);
    });
    it('The known setting should be kept in the list', () => {
        DefaultSettings.has(KNOWN_SETTING).should.equal(true);
        all.settings.some(s => s.key === KNOWN_SETTING).should.equal(true);
    });
    it('The ghost setting should be removed from the list', () => {
        DefaultSettings.has(GHOST_SETTING).should.equal(true);
        all.settings.some(s => s.key === GHOST_SETTING).should.equal(false);
    });
});
