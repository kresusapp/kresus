import Action from '../../../server/lib/action.js';
import should from 'should';

describe('Action', () => {
    describe('format', () => {
        it('should not be built with an empty object', () => {
            (() => new Action({})).should.throw();
        });
        it('should not accept unknown predicate', () => {
            (() => new Action({ test: { set: 'bla' } })).should.throw();
        });
        it('should not accept object with 2 or more properties', () => {
            (() => new Action({ test: { $set: 'bla' }, blo: { $set: 'bla' } })).should.throw();
        });
        it('should accept well formed object', () => {
            (() => new Action({ test: { $set: 'bla' } })).should.not.throw();
        });
    });
    describe('apply', () => {
        it('should apply action to object if it does not have the property, and action is $set', () => {
            let action = new Action({ test: { $set: 3}});
            let a = { };
            action.act(a).test.should.equal(3);
        });
        it('should apply action to object if it has the property, and action is $set', () => {
            let action = new Action({ test: { $set: 3}});
            let a = { test: 5 };
            action.act(a).test.should.equal(3);
        });
        it('should not apply action to object if it does not have the property, and action is $ape or apb', () => {
            let action = new Action({ test: { $ape: 3}});
            let action2= new Action({ test: { $apb: 3}});
            let a = { };
            (()=> action.act(a)).should.throw();
            (()=> action2.act(a)).should.throw();
        });
        it('should apply action to object if it has the property, and predicate is $ape or apb', () => {
            let action = new Action({ test: { $ape: 3}});
            let action2= new Action({ test: { $apb: 3}});
            let a = { test: "test"};
            action.act(a).test.should.equal("test3");
            action2.act(a).test.should.equal("3test3");
        });
    });
});
