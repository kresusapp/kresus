import should from 'should';

import { testing } from '../../client/components/duplicates';

const { computePrevNextThreshold } = testing;

describe('computePrevNextThreshold', () => {
    it('should return edge thresholds for edge inputs', () => {
        let threshold = 0;
        let [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 23;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 24 * 14;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24 * 7);
        next.should.equal(24 * 14);

        threshold = 24 * 15;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24 * 14);
        next.should.equal(24 * 14);
    });

    it('should return previous/next for precise in-between inputs', () => {
        let threshold = 24;
        let [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 48;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(72);

        threshold = 72;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(48);
        next.should.equal(96);
    });

    it('should return closest previous/next for imprecise in-between inputs', () => {
        let threshold = 25;
        let [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 47;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 69;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(48);
        next.should.equal(72);
    });
});
