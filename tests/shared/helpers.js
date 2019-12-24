import should from 'should';

import { setupTranslator, localeContains } from '../../shared/helpers';

describe('shared helpers', () => {
    describe('localeContains', () => {
        setupTranslator('fr');

        it('should return true if the values are equal', () => {
            localeContains('Lorem ipsum', 'Lorem ipsum').should.equal(true);
            localeContains('Il était une fois', 'Il etait une fois').should.equal(true);
        });

        it('should return true if the first string contains the second', () => {
            localeContains('Un ensemble de mots', 'ensemble').should.equal(true);
            localeContains('Ensemble de mots', 'ensemble').should.equal(true);
            localeContains('Un ensemble de mots', 'de mots').should.equal(true);
            localeContains('Il était un petit navire', 'etait un').should.equal(true);
            localeContains('des mots accentues', 'accentués').should.equal(true);
            localeContains('je vois une voiture', 'voiture').should.equal(true);
            localeContains('des délices', 'delices').should.equal(true);
        });

        it('should return false if the first string does not contain the second', () => {
            localeContains('Lorem ipsum', 'Doloret sit amet').should.equal(false);
            localeContains('Il était un petit navire', 'était une').should.equal(false);
        });
    });
});
