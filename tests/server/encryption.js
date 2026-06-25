import assert from 'node:assert';

import { testing } from '../../server/controllers/all';

const { encryptData, decryptData } = testing;

describe('encryption', () => {
    it('should throw if no salt is provided', () => {
        assert.throws(() => {
            process.kresus = {};
            encryptData({}, 'randomthing');
        });
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
        assert.strictEqual(decryptData(encryptedData, passphrase), JSON.stringify(data));
    });
});
