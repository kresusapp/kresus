import path from 'path';
import should from 'should';

import { KError } from '../server/helpers';

import { callWeboob } from '../server/lib/sources/weboob';
import prepareProcessKresus from '../server/apply-config';
import Operation from '../server/models/operation';

let error = null;
let success = null;

function callWeboobBefore(command, access) {
    return () => {
        error = null;
        success = null;
        return callWeboob(command, access).then(m => {
            success = m;
        }).catch(e => {
            error = e;
        });
    };
}

const WEBOOB_DIR = path.join(process.cwd(), 'weboob');

function checkError(httpCode, errCode) {
    it('shall return nothing', () => {
        should.not.exist(success);
    });

    it('shall raise an instanceof KError', ()=> {
        should.exist(error);
        error.should.instanceof(KError);
    });
    it('statusCode shall be defined', ()=> {
        should.exist(error.statusCode);
    });

    it(`statusCode shall be ${httpCode}`, ()=> {
        error.statusCode.should.equal(httpCode);
    });

    it('shortMessage shall be defined',()=> {
        should.exist(error.errCode);
    });

    it(`errCode shall be ${errCode}`,()=> {
        error.errCode.should.equal(errCode);
    });
}

function makeDefectSituation(command) {
    // Command shall be operations or accounts
    describe(`call "${command}" command with unknown module`, ()=>{
        before(callWeboobBefore(command, { bank: 'unknown', login: 'login', password: 'password'}));

        checkError(500, 'UNKNOWN_WEBOOB_MODULE');
    });

    describe(`call "${command}" command with inconsistant JSON customFields`, ()=>{
        before(callWeboobBefore(command, { bank: 'fakeweboobbank', customFields: "p", login: 'login', password:'password' }));

        checkError(500, 'INTERNAL_ERROR');
    });

    describe(`call "${command}" command without password`, ()=>{
        before(callWeboobBefore(command, { bank: 'fakeweboobbank', login: 'login', password: '' }));
        // Note :current implementation of main.py will detect a parameter is missing
        // and raise 'INTERNAL_ERROR' instead of 'NO_PASSWORD'
        checkError(500, 'INTERNAL_ERROR');
    });

    describe(`call "${command}" command without login`, ()=>{
        before(callWeboobBefore(command, { bank: 'fakeweboobbank', password: 'password', login: '' }));
        // Note :current implementation of main.py will detect a parameter is missing
        // and raise 'INTERNAL_ERROR' instead of 'INVALID_PARAMETERS'
        checkError(500, 'INTERNAL_ERROR');
    });

    describe(`call "${command}" command with invalid passord`, ()=> {
        before(callWeboobBefore(command, { bank: 'fakeweboobbank', password: 'invalidpassword', login: 'login' }));

        checkError(401, 'INVALID_PASSWORD');
    });

    describe(`call "${command}" command with expired password`, ()=> {
        before(callWeboobBefore(command, { bank: 'fakeweboobbank', password: 'expiredpassword', login: 'login' }));

        checkError(403, 'EXPIRED_PASSWORD');
    });

    describe(`call "${command}" command, the website requires a user action`, ()=> {
        before(callWeboobBefore(command, { bank: 'fakeweboobbank', password: 'actionneeded', login: 'login' }));

        checkError(403, 'ACTION_NEEDED');
    });
}

describe('Defect situation', () => {
    describe('call test with weboob not installed', () => {
        before(callWeboobBefore('test'));

        checkError(500,  'WEBOOB_NOT_INSTALLED');
    });

    describe('call an unknown command', () => {
        before(() => {
            prepareProcessKresus(true, { weboob: { srcdir: WEBOOB_DIR } });
            return callWeboobBefore('unknown-command')();
        });

        checkError(500,  'INTERNAL_ERROR');
    });
    
    makeDefectSituation('operations');

    makeDefectSituation('accounts');
    
});

describe('Normal uses', ()=> {
    describe('call test', ()=> {
        before(callWeboobBefore('test'));

        it('shall not raise', ()=> {
            should.not.exist(error);
        });
        it('shall return nothing', ()=> {
            should.not.exist(success);
        });
    });

    describe('call version', ()=> {
        before(callWeboobBefore('version'));

        it('shall not raise', ()=> {
            should.not.exist(error);
        });

        it('shall return a non empty string', ()=> {
            should.exist(success);
            success.should.instanceof(String);
            success.length.should.be.aboveOrEqual(1);
        });
    });

    describe('call operations', ()=> {
        before(callWeboobBefore('operations', { bank: 'fakeweboobbank', login: 'login', password: 'noerror' }));

        it('shall not raise', ()=> {
            should.not.exist(error);
        });

        it('shall return an array', ()=> {
            should.exist(success);
            success.should.instanceof(Array);
        });

        it('all elements of the array shall be shaped as Operations', ()=> {
            for (let element of success) {
                element.should.have.keys('date', 'amount', 'title', 'type', 'account');
            }
        });
    });

    describe('call accounts', ()=> {
        before(callWeboobBefore('accounts', { bank: 'fakeweboobbank', login: 'login', password: 'noerror' }));

        it('shall not raise', ()=> {
            should.not.exist(error);
        });

        it('shall return an array', ()=> {
            should.exist(success);
            success.should.instanceof(Array);
        });

        it('all elements of the array shall be shaped as Accounts', ()=> {
            for (let element of success) {
                element.should.have.keys('accountNumber', 'title', 'currency', 'balance');
            }
        });
    });
});
