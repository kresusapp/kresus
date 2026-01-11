import assert from 'node:assert';

import { testing } from '../../client/components/duplicates';

const { computePrevNextThreshold } = testing;

describe('computePrevNextThreshold', () => {
    it('should return edge thresholds for edge inputs', () => {
        let threshold = 0;
        let [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24);
        assert.strictEqual(next, 48);

        threshold = 23;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24);
        assert.strictEqual(next, 48);

        threshold = 24 * 14;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24 * 7);
        assert.strictEqual(next, 24 * 14);

        threshold = 24 * 15;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24 * 14);
        assert.strictEqual(next, 24 * 14);
    });

    it('should return previous/next for precise in-between inputs', () => {
        let threshold = 24;
        let [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24);
        assert.strictEqual(next, 48);

        threshold = 48;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24);
        assert.strictEqual(next, 72);

        threshold = 72;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 48);
        assert.strictEqual(next, 96);
    });

    it('should return closest previous/next for imprecise in-between inputs', () => {
        let threshold = 25;
        let [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24);
        assert.strictEqual(next, 48);

        threshold = 47;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 24);
        assert.strictEqual(next, 48);

        threshold = 69;
        [prev, next] = computePrevNextThreshold(threshold);
        assert.strictEqual(prev, 48);
        assert.strictEqual(next, 72);
    });
});
