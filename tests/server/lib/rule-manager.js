import Rule from '../../../server/lib/rule-manager.js';
import should from 'should';

describe('rule-manager', function() {
    describe('promise format', function() {
        it('promise should not be an empty object', function() {
            (() => new Rule({})).should.throw();
        });
        it('promise should use a definite predicate. $test is not a valid predicate', function() {
            (() => new Rule({ test: { $test: 0 } })).should.throw();
        });
    });

    describe('contains ($ct)', function() {
        let promise =new Rule( { test: { $ct: 'bla' } });
        it("'blo' does not contain 'bla'", function() {
            let object = { test: 'blo' };
            promise.run(object).should.equal(false);
        });
        it("'blabla' contains 'bla'", function() {
            let object = { test: 'blabla' };
            promise.run(object).should.equal(true);
        });
        it("object does not have 'test' property. object.test does not contain 'bla'", function() {
            let object = { tes: 'blabla' };
            promise.run(object).should.equal(false);
        });
    });

    describe('equals ($eq)', function() {
        let promise = new Rule({ test: { $eq: 'bla' } });
        it("'blo' does not equal 'bla'", function() {
            let object = { test: 'blo' };
            promise.run(object).should.equal(false);
        });
        it("'blabla' does not equal 'bla'", function() {
            let object = { test: 'blabla' };
            promise.run(object).should.equal(false);
        });
        it("'bla' equals 'bla'", function() {
            let object = { test: 'bla' };
            promise.run(object).should.equal(true);
        });
        it("object does not have 'test' property. object.test does not contain 'bla'", function() {
            let object = { tes: 'blabla' };
            promise.run(object).should.equal(false);
        });
        let promise2 = new Rule({ test: { $eq: '3' } });
        it("ruler should detect 3 and '3' being equal", function() {
            let object = { test: 3 };
            promise2.run(object).should.equal(true);
        });
        let promise3 = new Rule({ test: { $eq: '3.5' } });
        it("ruler should detect 3.5 and '3.5' being equal", function() {
            let object = { test: 3.5 };
            promise3.run(object).should.equal(true);
        });
        let promise4 = new Rule({ test: { $eq: 3.5 } });
        it("ruler should detect '3.5' and 3.5 being equal", function() {
            let object = { test: '3.5' };
            promise4.run(object).should.equal(true);
        });
    });

    describe('greater than ($gt)', function() {
        let promise = new Rule({ test: { $gt: 3 } });
        it("2 is not greater than 3", function() {
            let object = { test: 2 };
            promise.run(object).should.equal(false);
        });

        it("4 is greater than 3", function() {
            let object = { test: 4 };
            promise.run(object).should.equal(true);
        });

        it("'4' is greater than 3", function() {
            let object = { test: '4' };
            promise.run(object).should.equal(true);
        });

        it("'3' is not greater than 3", function() {
            let object = { test: '3' };
            promise.run(object).should.equal(false);
        });

        it("'nope' is not greater than 3 and should throw", function() {
            let object = { test: 'nope' };
            (()=> promise.run(object)).should.throw();
        });
    });

    describe('greater than or equal ($gte)', function() {
        let promise = new Rule({ test: { $gte: 3 } });
        it("2 is not greater or equal than 3", function() {
            let object = { test: 2 };
            promise.run(object).should.equal(false);
        });

        it("4 is greater or equal than 3", function() {
            let object = { test: 4 };
            promise.run(object).should.equal(true);
        });

        it("'4' is greater or equal than 3", function() {
            let object = { test: '4' };
            promise.run(object).should.equal(true);
        });

        it("'3' is greater or equal than 3", function() {
            let object = { test: '3' };
            promise.run(object).should.equal(true);
        });

        it("'nope' is not greater or equal than 3 and should throw", function() {
            let object = { test: 'nope' };
            (() => promise.run(object)).should.throw();
        });
    });
    
    describe('lower than ($lt)', function() {
        let promise = new Rule({ test: { $lt: 3 } });
        it("2 is lower than 3", function() {
            let object = { test: 2 };
            promise.run(object).should.equal(true);
        });

        it("4 is not lower than 3", function() {
            let object = { test: 4 };
            promise.run(object).should.equal(false);
        });

        it("'2' is lower than 3", function() {
            let object = { test: '2' };
            promise.run(object).should.equal(true);
        });

        it("'3' is not lower than 3", function() {
            let object = { test: '3' };
            promise.run(object).should.equal(false);
        });

        it("'nope' is not lower than 3 and should throw", function() {
            let object = { test: 'nope' };
            (() => promise.run(object)).should.throw();
        });
    });

    describe('lower than or equal ($lt)', function() {
        let promise = new Rule({ test: { $lte: 3 } });
        it("2 is lower or equal than 3", function() {
            let object = { test: 2 };
            promise.run(object).should.equal(true);
        });

        it("4 is not lower or equal than 3", function() {
            let object = { test: 4 };
            promise.run(object).should.equal(false);
        });

        it("'2' is lower or equal than 3", function() {
            let object = { test: '2' };
            promise.run(object).should.equal(true);
        });

        it("'3' is lower or equal than 3", function() {
            let object = { test: '3' };
            promise.run(object).should.equal(true);
        });

        it("'nope' is not greater or equal than 3 and should throw", function() {
            let object = { test: 'nope' };
            (() => promise.run(object)).should.throw();
        });
    });
});
