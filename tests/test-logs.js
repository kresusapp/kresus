import should from 'should';

import { obfuscateKeywords } from '../server/controllers/v1/logs.js';

describe('logs', function() {
    describe("sensitive keywords in a string", () => {
        it('should be obfuscated', () => {
            obfuscateKeywords(
                "text with really sensitive keywords",
                new Set(["sensitive", "really"])
            ).should.equal("text with ***lly ******ive keywords");

            obfuscateKeywords(
                "text with weir|d spe/cial ch?ars &and accênts keywords",
                new Set(["weir|d", "spe/cial", "ch?ars", "&and", "accênts"])
            ).should.equal("text with ***r|d *****ial ***ars *and ****nts keywords");
        });
    });
});
