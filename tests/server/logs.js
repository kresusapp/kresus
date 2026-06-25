import assert from 'node:assert';

import {
    obfuscateKeywords,
    obfuscatePasswords,
    obfuscateEmails,
} from '../../server/controllers/helpers';

describe('logs', () => {
    describe('sensitive keywords in a string', () => {
        it('should be obfuscated', () => {
            assert.strictEqual(
                obfuscateKeywords(
                    'text with really sensitive keywords',
                    new Set(['sensitive', 'really'])
                ),
                'text with ***lly ******ive keywords'
            );

            assert.strictEqual(
                obfuscateKeywords(
                    'text with weir|d spe/cial ch?ars &and accênts keywords',
                    new Set(['weir|d', 'spe/cial', 'ch?ars', '&and', 'accênts'])
                ),
                'text with ***r|d *****ial ***ars *and ****nts keywords'
            );
        });

        it('all occurrences should be obfuscated', () => {
            assert.strictEqual(
                obfuscateKeywords(
                    'text with really really sensitive keywords',
                    new Set(['really'])
                ),
                'text with ***lly ***lly sensitive keywords'
            );
        });

        it('Empty set should not modify the string', () => {
            const string = 'String to be tested against an empty set';
            assert.strictEqual(obfuscateKeywords(string, new Set([])), string);
        });
    });

    describe('passwords in a string', () => {
        it('should be obfuscated and return always the same string', () => {
            assert.strictEqual(
                obfuscatePasswords(
                    'text with password1 and password2',
                    new Set(['password1', 'password2'])
                ),
                'text with ******** and ********'
            );
        });

        it('Empty set should not modify the string', () => {
            const string = 'String to be tested against an empty set';
            assert.strictEqual(obfuscatePasswords(string, new Set([])), string);
        });
    });

    describe('emails in a string', () => {
        it('should be obfuscated', () => {
            assert.strictEqual(
                obfuscateEmails('text with name@domain.co as email'),
                'text with *******@****.*** as email'
            );

            assert.strictEqual(
                obfuscateEmails('text with name.surname@domain.co as email'),
                'text with *******@****.*** as email'
            );

            assert.strictEqual(
                obfuscateEmails('text with name.surname+thing@domain.com as email'),
                'text with *******@****.*** as email'
            );
        });

        it('all occurrences should be obfuscated', () => {
            assert.strictEqual(
                obfuscateEmails(
                    'text with several emails: name@domain.co name.surname@domain.co name.surname+thing@domain.com.'
                ),
                'text with several emails: *******@****.*** *******@****.*** *******@****.***.'
            );
        });
    });
});
