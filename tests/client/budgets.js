import should from 'should';

import { testing } from '../../client/components/budget/item';

const { getBars } = testing;

function checkHasBar(bars, name, expectedWidth, expectedClass) {
    bars.has(name).should.equal(true);
    const bar = bars.get(name);
    bar.width.should.equal(expectedWidth);

    if (expectedClass) {
        bar.classes.should.equal(expectedClass);
    }
}

describe('budgets', () => {
    const WARNING_THRESHOLD_PERCENT = 75;

    describe('when the threshold is 0', () => {
        it('should return an empty bar', () => {
            const bars = getBars(0, 10, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            checkHasBar(bars, 'empty', 100);
        });
    });

    describe('when the threshold is above 0', () => {
        it('and amount is below the threshold and below the warning', () => {
            const bars = getBars(100, 50, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            checkHasBar(bars, 'successRange', 50, 'stacked-progress-part-danger');
        });

        it('amount is below the threshold and over the warning', () => {
            const bars = getBars(100, 80, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            checkHasBar(bars, 'successRange', 80, 'stacked-progress-part-warning');
        });

        it('and amount equals the threshold', () => {
            const bars = getBars(100, 100, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            checkHasBar(bars, 'successRange', 100, 'stacked-progress-part-success');
        });

        it('and amount is over the threshold', () => {
            const bars = getBars(100, 120, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            checkHasBar(bars, 'successRange', 100, 'stacked-progress-part-success');
        });
    });

    describe('when the threshold is below 0', () => {
        it('and amount is below the threshold and below the warning', () => {
            const bars = getBars(-100, -50, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            checkHasBar(bars, 'successRange', 50, 'stacked-progress-part-success');
        });

        it('and amount is below the threshold and over the warning', () => {
            const bars = getBars(-100, -80, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(2);
            checkHasBar(
                bars,
                'successRange',
                WARNING_THRESHOLD_PERCENT,
                'stacked-progress-part-success'
            );
            checkHasBar(
                bars,
                'warningRange',
                80 - WARNING_THRESHOLD_PERCENT,
                'stacked-progress-part-warning'
            );
        });

        it('and amount equals the threshold', () => {
            const bars = getBars(-100, -100, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(2);
            checkHasBar(
                bars,
                'successRange',
                WARNING_THRESHOLD_PERCENT,
                'stacked-progress-part-success'
            );
            checkHasBar(
                bars,
                'warningRange',
                100 - WARNING_THRESHOLD_PERCENT,
                'stacked-progress-part-warning'
            );
        });

        it('and amount is over the threshold', () => {
            const bars = getBars(-100, -120, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(3);
            checkHasBar(
                bars,
                'successRange',
                WARNING_THRESHOLD_PERCENT * (100 / 120),
                'stacked-progress-part-success'
            );
            checkHasBar(
                bars,
                'warningRange',
                (100 - WARNING_THRESHOLD_PERCENT) * (100 / 120),
                'stacked-progress-part-warning progressive'
            );
            checkHasBar(
                bars,
                'dangerRange',
                (120 - 100) / (120 / 100),
                'stacked-progress-part-danger'
            );
        });
    });
});
