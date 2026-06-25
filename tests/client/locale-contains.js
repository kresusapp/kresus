import assert from 'node:assert';

import { setupTranslator } from '../../shared/helpers';
import { testing } from '../../client/components/reports';

const { localeContains } = testing;

describe('shared helpers', () => {
    describe('localeContains', () => {
        setupTranslator('fr');

        it('should return true if the values are equal', () => {
            assert.strictEqual(localeContains('Lorem ipsum', 'Lorem ipsum'), true);
            assert.strictEqual(localeContains('était', 'etait'), true);
        });

        it('should return true if the first string contains the second', () => {
            assert.strictEqual(localeContains('Un ensemble de mots', 'ensemble'), true);
            assert.strictEqual(localeContains('Ensemble de mots', 'ensemble'), true);
            assert.strictEqual(localeContains('Un ensemble de mots', 'de'), true);
            assert.strictEqual(localeContains('Un ensemble de mots', 'mots'), true);
            assert.strictEqual(localeContains('Il était un petit navire', 'etait'), true);
            assert.strictEqual(localeContains('des mots accentues', 'accentués'), true);
            assert.strictEqual(localeContains('je vois une voiture', 'voiture'), true);
            assert.strictEqual(localeContains('des délices', 'delices'), true);
        });

        it('should return false if the first string does not contain the second', () => {
            assert.strictEqual(localeContains('Lorem ipsum', 'amet'), false);
            assert.strictEqual(localeContains('Il était un petit navire', 'une'), false);
            assert.strictEqual(localeContains('le café des délices', 'debices'), false);
        });
    });
});
