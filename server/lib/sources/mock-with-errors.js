import { KError } from '../../helpers';
import errors from '../../shared/errors.json';
import { rand, randInt, fetchAccounts as fetchAccounts_, generate } from './mock.js';

// Maximum time needed to generate new operations.
const MAX_GENERATION_TIME = 2000;

// Probability of generating a random error in fetchOperations (in %).
const PROBABILITY_RANDOM_ERROR = 10;

export const SOURCE_NAME = 'mock-with-errors';

let generateRandomError = () => {
    let errorTable = [];
    for (let error of Object.keys(errors)) {
        errorTable.push(errors[error]);
    }
    return errorTable[randInt(0, errorTable.length - 1)];
};

export const fetchAccounts = fetchAccounts_;

export const fetchOperations = ({ access }) => {
    return new Promise((accept, reject) => {
        setTimeout(() => {
            if (rand(0, 100) <= PROBABILITY_RANDOM_ERROR) {
                let errorCode = generateRandomError();
                let error = new KError(`New random error: ${errorCode}`, 500, errorCode);
                reject(error);
                return;
            }

            accept(generate(access, true));
        }, Math.random() * MAX_GENERATION_TIME);
    });
};
