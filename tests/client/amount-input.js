import should from 'should';
import { testing } from '../../client/components/ui/amount-input';

const { extractValueFromText } = testing;

describe('amount inputs', () => {
    describe('when the value is wrapped in whitespaces', () => {
        it('should trim the real value', () => {
            let result = extractValueFromText(' 10,15 ', false, false);
            result.value.should.equal(10.15);
        });
    });

    describe('when the value is a float', () => {
        it('should transform commas into dots', () => {
            let result = extractValueFromText('10,15', false, false);
            result.value.should.equal(10.15);
        });

        it('should ignore anything behind a second dot', () => {
            let result = extractValueFromText('10.15.25', false, false);
            result.value.should.equal(10.15);
        });

        it('should return a decimal value', () => {
            let result = extractValueFromText('10.5', false, false);
            result.value.should.equal(10.5);
        });

        it('should return the decimal value correctly', () => {
            let result = extractValueFromText('10.0', false, false);
            result.value.should.equal(10);
            result.afterPeriod.should.equal('.0');
        });

        it('should return the decimal value correctly', () => {
            let result = extractValueFromText('10.50', false, false);
            result.value.should.equal(10.5);
            result.afterPeriod.should.equal('.50');

            result = extractValueFromText('10.5050', false, false);
            result.value.should.equal(10.505);
            result.afterPeriod.should.equal('.5050');
        });

        it('should not truncate the the decimal value', () => {
            let result = extractValueFromText('0.002535', false, false);
            result.value.should.equal(0.002535);
        });
    });

    describe('when the value is prefixed by a minus sign', () => {
        it('should return a negative value if it is togglable', () => {
            let result = extractValueFromText('-10.25', false, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(true);
        });

        it('should return a positive value if it is not togglable', () => {
            let result = extractValueFromText('-10.25', false, false);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });
    });

    describe('when the value is prefixed by a plus sign', () => {
        it('should return a negative value if it is togglable', () => {
            let result = extractValueFromText('+10.25', false, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });

        it('should return a positive value if it was negative and is togglable', () => {
            let result = extractValueFromText('+10.25', true, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });

        it('should return a negative value if it was negative and is not togglable', () => {
            let result = extractValueFromText('+10.25', true, false);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(true);
        });
    });

    describe('when there is no minus or plus sign', () => {
        it('should return a positive value if it is was positive', () => {
            let result = extractValueFromText('10.25', false, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });

        it('should return a negative value if it is was negative', () => {
            let result = extractValueFromText('10.25', true, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(true);
        });
    });

    describe('when the value is invalid', () => {
        it('should return NaN', () => {
            let result = extractValueFromText('boyaaah', true, true);
            // eslint-disable-next-line new-cap
            result.value.should.be.NaN();

            result = extractValueFromText('', true, true);
            // eslint-disable-next-line new-cap
            result.value.should.be.NaN();
        });
    });
});
