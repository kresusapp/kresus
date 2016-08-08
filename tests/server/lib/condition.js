import Condition from '../../../server/lib/condition.js';
import should from 'should';

describe('condition', function() {
    describe('format', function() {
        it('condition should not be an empty object', function() {
            (() => new Condition({})).should.throw();
        });
        it('condition should use a definite predicate. $test is not a valid predicate', function() {
            (() => new Condition({ test: { $test: 0 } })).should.throw();
        });
    });

    describe('contains ($ct)', function() {
        let condition =new Condition( { test: { $ct: 'bla' } });
        it("'blo' does not contain 'bla'", function() {
            let object = { test: 'blo' };
            condition.check(object).should.equal(false);
        });
        it("'blabla' contains 'bla'", function() {
            let object = { test: 'blabla' };
            condition.check(object).should.equal(true);
        });
        it("object does not have 'test' property. object.test does not contain 'bla'", function() {
            let object = { tes: 'blabla' };
            condition.check(object).should.equal(false);
        });
    });

    describe('equals ($eq)', function() {
        let condition = new Condition({ test: { $eq: 'bla' } });
        it("'blo' does not equal 'bla'", function() {
            let object = { test: 'blo' };
            condition.check(object).should.equal(false);
        });
        it("'blabla' does not equal 'bla'", function() {
            let object = { test: 'blabla' };
            condition.check(object).should.equal(false);
        });
        it("'bla' equals 'bla'", function() {
            let object = { test: 'bla' };
            condition.check(object).should.equal(true);
        });
        it("object does not have 'test' property. object.test does not contain 'bla'", function() {
            let object = { tes: 'blabla' };
            condition.check(object).should.equal(false);
        });
        let condition2 = new Condition({ test: { $eq: '3' } });
        it("Conditionr should detect 3 and '3' being equal", function() {
            let object = { test: 3 };
            condition2.check(object).should.equal(true);
        });
        let condition3 = new Condition({ test: { $eq: '3.5' } });
        it("Conditionr should detect 3.5 and '3.5' being equal", function() {
            let object = { test: 3.5 };
            condition3.check(object).should.equal(true);
        });
        let condition4 = new Condition({ test: { $eq: 3.5 } });
        it("Conditionr should detect '3.5' and 3.5 being equal", function() {
            let object = { test: '3.5' };
            condition4.check(object).should.equal(true);
        });
    });

    describe('greater than ($gt)', function() {
        let condition = new Condition({ test: { $gt: 3 } });
        it("2 is not greater than 3", function() {
            let object = { test: 2 };
            condition.check(object).should.equal(false);
        });

        it("4 is greater than 3", function() {
            let object = { test: 4 };
            condition.check(object).should.equal(true);
        });

        it("'4' is greater than 3", function() {
            let object = { test: '4' };
            condition.check(object).should.equal(true);
        });

        it("'3' is not greater than 3", function() {
            let object = { test: '3' };
            condition.check(object).should.equal(false);
        });

        it("'nope' is not greater than 3 and should throw", function() {
            let object = { test: 'nope' };
            (()=> condition.check(object)).should.throw();
        });
    });

    describe('greater than or equal ($gte)', function() {
        let condition = new Condition({ test: { $gte: 3 } });
        it("2 is not greater or equal than 3", function() {
            let object = { test: 2 };
            condition.check(object).should.equal(false);
        });

        it("4 is greater or equal than 3", function() {
            let object = { test: 4 };
            condition.check(object).should.equal(true);
        });

        it("'4' is greater or equal than 3", function() {
            let object = { test: '4' };
            condition.check(object).should.equal(true);
        });

        it("'3' is greater or equal than 3", function() {
            let object = { test: '3' };
            condition.check(object).should.equal(true);
        });

        it("'nope' is not greater or equal than 3 and should throw", function() {
            let object = { test: 'nope' };
            (() => condition.check(object)).should.throw();
        });
    });
    
    describe('lower than ($lt)', function() {
        let condition = new Condition({ test: { $lt: 3 } });
        it("2 is lower than 3", function() {
            let object = { test: 2 };
            condition.check(object).should.equal(true);
        });

        it("4 is not lower than 3", function() {
            let object = { test: 4 };
            condition.check(object).should.equal(false);
        });

        it("'2' is lower than 3", function() {
            let object = { test: '2' };
            condition.check(object).should.equal(true);
        });

        it("'3' is not lower than 3", function() {
            let object = { test: '3' };
            condition.check(object).should.equal(false);
        });

        it("'nope' is not lower than 3 and should throw", function() {
            let object = { test: 'nope' };
            (() => condition.check(object)).should.throw();
        });
    });

    describe('lower than or equal ($lt)', function() {
        let condition = new Condition({ test: { $lte: 3 } });
        it("2 is lower or equal than 3", function() {
            let object = { test: 2 };
            condition.check(object).should.equal(true);
        });

        it("4 is not lower or equal than 3", function() {
            let object = { test: 4 };
            condition.check(object).should.equal(false);
        });

        it("'2' is lower or equal than 3", function() {
            let object = { test: '2' };
            condition.check(object).should.equal(true);
        });

        it("'3' is lower or equal than 3", function() {
            let object = { test: '3' };
            condition.check(object).should.equal(true);
        });

        it("'nope' is not greater or equal than 3 and should throw", function() {
            let object = { test: 'nope' };
            (() => condition.check(object)).should.throw();
        });
    });

    describe('and ($and)', function() {
        let condition = new Condition( { $and: [ { test: { '$ct': 'bla'} }, { tutu: { '$gt' : 2} } ] });
        it("2 is lower than 3 and 'bla' contains 'bla' => return true" , function() {
            let object = { test: 'blabla', tutu: 3 };
            condition.check(object).should.equal(true);
        });
        it("2 is not lower than 3 and 'bla' contains 'bla' => return false" , function() {
            let object = { test: 'blabla', tutu: 2 };
            condition.check(object).should.equal(false);
        });
    });
    describe('or ($or)', function() {
        let condition = new Condition( { $or: [ { test: { '$ct': 'bla'} }, { tutu: { '$gt' : 2} } ] });
        it("2 is lower than 3 or 'bla' contains 'bla' => return true" , function() {
            let object = { test: 'blabla', tutu: 3 };
            condition.check(object).should.equal(true);
        });
        it("2 is not lower than 3 or 'bla' contains 'bla' => return true" , function() {
            let object = { test: 'blabla', tutu: 2 };
            condition.check(object).should.equal(true);
        });
        it("2 is not lower than 3 or 'blo' does not contain 'bla' => return false" , function() {
            let object = { test: 'blo', tutu: 2 };
            condition.check(object).should.equal(false);
        });
    });
    describe('or ($or)', function() {
        let condition = new Condition( { $or: [ { test: { '$ct': 'bla'} }, { tutu: { '$gt' : 2} } ] });
        it("2 is lower than 3 or 'bla' contains 'bla' => return true" , function() {
            let object = { test: 'blabla', tutu: 3 };
            condition.check(object).should.equal(true);
            console.log(`${condition.toString()}`);
        });
    })
});
