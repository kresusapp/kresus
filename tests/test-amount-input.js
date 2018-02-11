import should from 'should';
import { extractValueFromText } from '../client/components/ui/amount-input';

describe('amount inputs', function() {
    describe("when the value is wrapped in whitespaces", () => {
        it('should trim the real value', () => {
            let result = extractValueFromText(" 10,15 ", false, false);
            result.value.should.equal(10.15);
        });
    });

    describe("when the value is a float", () => {
        it("should transform commas into dots", () => {
            let result = extractValueFromText("10,15", false, false);
            result.value.should.equal(10.15);
        });

        it("should ignore anything behind a second dot", () => {
            let result = extractValueFromText("10.15.25", false, false);
            result.value.should.equal(10.15);
        });

        it('should return a decimal value', () => {
            let result = extractValueFromText("10.15", false, false);
            result.value.should.equal(10.15);
        });

        it('should return the decimal value correctly', () => {
            let result = extractValueFromText("10.05", false, false);
            result.value.should.equal(10.05);
            result.afterPeriod.should.equal("05");
        });
    });

    describe("when the value is prefixed by a minus sign", () => {
        it('should return a negative value if it is togglable', () => {
            let result = extractValueFromText("-10.25", false, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(true);
        });

        it('should return a positive value if it is not togglable', () => {
            let result = extractValueFromText("-10.25", false, false);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });
    });

    describe("when the value is prefixed by a plus sign", () => {
        it('should return a negative value if it is togglable', () => {
            let result = extractValueFromText("+10.25", false, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });

        it('should return a positive value if it was negative and is togglable', () => {
            let result = extractValueFromText("+10.25", true, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });

        it('should return a negative value if it was negative and is not togglable', () => {
            let result = extractValueFromText("+10.25", true, false);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(true);
        });
    });

    describe("when there is no minus or plus sign", () => {
        it('should return a positive value if it is was positive', () => {
            let result = extractValueFromText("10.25", false, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(false);
        });

        it('should return a negative value if it is was negative', () => {
            let result = extractValueFromText("10.25", true, true);
            result.value.should.equal(10.25);
            result.isNegative.should.equal(true);
        });
    });
});
