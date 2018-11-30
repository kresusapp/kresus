import should from 'should';

import { cleanData } from '../server/controllers/v1/all';
import DefaultSettings from '../shared/default-settings';

describe('Ensure settings without default values are removed when exporting data', () => {
    const UNKNOWN_SETTING = 'unknown-setting';
    const KNOWN_SETTING = 'locale';
    let world = {
        settings: [
            {
                name: UNKNOWN_SETTING,
                value: 'weird value',
                id: '1'
            },
            {
                name: KNOWN_SETTING,
                value: 'en',
                id: '2'
            }
        ]
    };
    let all = cleanData(world);
    it('The unknown setting should be removed from the list', () => {
        DefaultSettings.has(UNKNOWN_SETTING).should.equal(false);
        all.settings.some(s => s.name === UNKNOWN_SETTING).should.equal(false);
    });
    it('The known setting should be kept in the list', () => {
        DefaultSettings.has(KNOWN_SETTING).should.equal(true);
        all.settings.some(s => s.name === KNOWN_SETTING).should.equal(true);
    });
});
