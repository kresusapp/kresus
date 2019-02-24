import should from 'should';

import { obfuscateKeywords, obfuscatePasswords } from '../../server/controllers/v1/helpers';

describe('logs', () => {
    describe('sensitive keywords in a string', () => {
        it('should be obfuscated', () => {
            obfuscateKeywords(
                'text with really sensitive keywords',
                new Set(['sensitive', 'really'])
            ).should.equal('text with ***lly ******ive keywords');

            obfuscateKeywords(
                'text with weir|d spe/cial ch?ars &and accênts keywords',
                new Set(['weir|d', 'spe/cial', 'ch?ars', '&and', 'accênts'])
            ).should.equal('text with ***r|d *****ial ***ars *and ****nts keywords');
        });

        it('all occurrences should be obfuscated', () => {
            obfuscateKeywords(
                'text with really really sensitive keywords',
                new Set(['really'])
            ).should.equal('text with ***lly ***lly sensitive keywords');
        });

        it('Empty set should not modify the string', () => {
            const string = 'String to be tested against an empty set';
            obfuscateKeywords(string, new Set([])).should.equal(string);
        });
    });

    describe('passwords in a string', () => {
        it('should be obfuscated and return always the same string', () => {
            obfuscatePasswords(
                'text with password1 and password2',
                new Set(['password1', 'password2'])
            ).should.equal('text with ******** and ********');
        });

        it('Empty set should not modify the string', () => {
            const string = 'String to be tested against an empty set';
            obfuscatePasswords(string, new Set([])).should.equal(string);
        });
    });
});
