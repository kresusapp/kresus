import should from 'should';
import { getBars } from '../client/components/budget/item';

describe('budgets', function() {
    const WARNING_THRESHOLD_PERCENT = 75;
    describe("when the threshold is 0", () => {
        it('should return an empty bar', () => {
            const bars = getBars(0, 10, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            bars.has('empty').should.equal(true);
            bars.get('empty').width.should.equal(100);
        });
    });

    describe("when the threshold is above 0", () => {
        it('and amount is below the threshold and below the warning', () => {
            const bars = getBars(100, 50, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            bars.has('beforeWarning').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(50);
            beforeWarningBar.classes.should.equal('progress-bar-danger');
        });

        it('amount is below the threshold and over the warning', () => {
            const bars = getBars(100, 80, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            bars.has('beforeWarning').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(80);
            beforeWarningBar.classes.should.equal('progress-bar-warning');
        });

        it('and amount equals the threshold', () => {
            const bars = getBars(100, 100, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            bars.has('beforeWarning').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(100);
            beforeWarningBar.classes.should.equal('progress-bar-success');
        });

        it('and amount is over the threshold', () => {
            const bars = getBars(100, 120, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            bars.has('beforeWarning').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(100);
            beforeWarningBar.classes.should.equal('progress-bar-success');
        });
    });

    describe("when the threshold is below 0", () => {
        it('and amount is below the threshold and below the warning', () => {
            const bars = getBars(-100, -50, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(1);
            bars.has('beforeWarning').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(50);
            beforeWarningBar.classes.should.equal('progress-bar-success');
        });

        it('and amount is below the threshold and over the warning', () => {
            const bars = getBars(-100, -80, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(2);
            bars.has('beforeWarning').should.equal(true);
            bars.has('beforeDanger').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(WARNING_THRESHOLD_PERCENT);
            beforeWarningBar.classes.should.equal('progress-bar-success');
            const beforeDangerBar = bars.get('beforeDanger');
            beforeDangerBar.width.should.equal(80 - WARNING_THRESHOLD_PERCENT);
            beforeDangerBar.classes.should.equal('progress-bar-warning');
        });

        it('and amount equals the threshold', () => {
            const bars = getBars(-100, -100, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(2);
            bars.has('beforeWarning').should.equal(true);
            bars.has('beforeDanger').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(WARNING_THRESHOLD_PERCENT);
            beforeWarningBar.classes.should.equal('progress-bar-success');
            const beforeDangerBar = bars.get('beforeDanger');
            beforeDangerBar.width.should.equal(100 - WARNING_THRESHOLD_PERCENT);
            beforeDangerBar.classes.should.equal('progress-bar-warning');
        });

        it('and amount is over the threshold', () => {
            const bars = getBars(-100, -120, WARNING_THRESHOLD_PERCENT);
            bars.size.should.equal(3);
            bars.has('beforeWarning').should.equal(true);
            bars.has('beforeDanger').should.equal(true);
            bars.has('afterDanger').should.equal(true);
            const beforeWarningBar = bars.get('beforeWarning');
            beforeWarningBar.width.should.equal(WARNING_THRESHOLD_PERCENT * (100 / 120));
            beforeWarningBar.classes.should.equal('progress-bar-success');
            const beforeDangerBar = bars.get('beforeDanger');
            beforeDangerBar.width.should.equal((100 - WARNING_THRESHOLD_PERCENT) * (100 / 120));
            beforeDangerBar.classes.should.equal('progress-bar-warning progressive');
            const afterDangerBar = bars.get('afterDanger');
            afterDangerBar.width.should.equal((120 - 100) / (120 / 100));
            afterDangerBar.classes.should.equal('progress-bar-danger');
        });
    });
});
