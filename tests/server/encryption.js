import should from 'should';

import { testing } from '../../server/controllers/all';

const { encryptData, decryptData } = testing;

describe('encryption', () => {
    it('should throw if no salt is provided', () => {
        (function noSalt() {
            process.kresus = {};
            encryptData({}, 'randomthing');
        }).should.throw();
    });

    it('should decrypt an object encrypted with the same passphrase', () => {
        process.kresus = {
            salt: 'randomsaltthing',
        };

        const passphrase = 'suchstrongsuchwow';
        const data = {
            categories: [
                {
                    title: 'category 1',
                },

                {
                    title: '🌱 category 2',
                },
            ],
        };
        const encryptedData = encryptData(data, passphrase);
        decryptData(encryptedData, passphrase).should.equal(JSON.stringify(data));
    });
});
