"use strict";
// This provider serves as an example provider, used for the demo purposes, and
// to show how to implement a new bank provider.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._ = exports.fetchOperations = exports.fetchAccounts = exports.SOURCE_NAME = void 0;
const moment_1 = __importDefault(require("moment"));
const helpers_1 = require("../helpers");
const account_types_1 = require("../lib/account-types");
const log = helpers_1.makeLogger('providers/demo');
// Helpers.
const rand = (low, high) => low + ((Math.random() * (high - low)) | 0);
const randInt = (low, high) => rand(low, high) | 0;
const randomArray = (arr) => arr[randInt(0, arr.length)];
const randomType = () => randInt(0, 10);
// Generates a map of the accounts belonging to the given access.
const hashAccount = (access) => {
    const login = access.login;
    const uuid = access.vendorId;
    const hash = uuid.charCodeAt(0) + login + uuid.charCodeAt(3) + uuid.charCodeAt(uuid.length - 1);
    const map = {
        main: `${hash}1`,
        second: `${hash}2`,
        third: `${hash}3`,
    };
    if (randInt(0, 100) > 80) {
        map.fourth = `${hash}4`;
    }
    return map;
};
exports.SOURCE_NAME = 'demo';
exports.fetchAccounts = async ({ access, }) => {
    const { main, second, third, fourth } = hashAccount(access);
    const values = [
        {
            vendorAccountId: main,
            label: 'Compte chèque',
            balance: String(Math.random() * 150),
            iban: 'FR235711131719',
            currency: 'EUR',
            type: account_types_1.accountTypeNameToId('account-type.checking'),
        },
        {
            vendorAccountId: second,
            label: 'Livret A',
            balance: '500',
            currency: 'USD',
            type: account_types_1.accountTypeNameToId('account-type.savings'),
        },
        {
            vendorAccountId: third,
            label: 'Plan Epargne Logement',
            balance: '0',
            type: account_types_1.accountTypeNameToId('account-type.savings'),
        },
    ];
    if (fourth) {
        values.push({
            vendorAccountId: fourth,
            label: 'Assurance vie',
            balance: '1000',
            type: account_types_1.accountTypeNameToId('account-type.life_insurance'),
        });
    }
    return { kind: 'values', values };
};
const randomLabels = [
    ['Café Moxka', 'Petit expresso rapido Café Moxka'],
    ['MerBnB', 'Paiement en ligne MerBNB'],
    ['Tabac Debourg', 'Bureau de tabac SARL Clopi Cloppa'],
    ['Rapide PSC', 'Paiement sans contact Rapide'],
    ['MacDollars PSC', 'Paiement sans contact Macdollars'],
    ['FNAK', 'FNAK CB blabla'],
    ['CB Sefaurat', 'Achat de parfum chez Sefaurat'],
    ['Polyprix CB', 'Courses chez Polyprix'],
    ['Croisement CB', 'Courses chez Croisement'],
    ['PRLV UJC', 'PRLV UJC'],
    ['CB Spotifaille', 'CB Spotifaille London'],
    ['Antiquaire', 'Antiquaire'],
    ['Le Perroquet Bourré', 'Le Perroquet Bourré SARL'],
    ['Le Vol de Nuit', 'Bar Le Vol De Nuit SARL'],
    [
        'Impots fonciers',
        `Prelevement impots fonciers numero reference
    47839743892 client 43278437289`,
    ],
    ['ESPA Carte Hassan Cehef', 'Paiement carte Hassan Cehef'],
    ['Indirect Energie', 'ESPA Indirect Energie SARL'],
    ['', 'VIR Mr Jean Claude Dusse'],
    ['Nuage Douillet', 'ESPA Abonnement Nuage Douillet'],
    ['Glagla Frigidaire', 'CB GLAGLA FRIGIDAIRE'],
    ['Digiticable', 'ESPA Digiticable'],
    ['NOGO Sport', 'CB NOGO Sport'],
    ['FramaHard', 'ESPA Don FramaHard'],
    ['Sergent Tchoutchou', 'CB online Sergent Tchoutchou'],
    ['RAeTP', 'CB Raleurs Ambulants et Traficoteurs Patentés'],
];
const randomLabelsPositive = [
    ['VIR Nuage Douillet', 'VIR Nuage Douillet REFERENCE Salaire'],
    ['Impots', 'Remboursement impots en votre faveur'],
    ['', 'VIR Pots de vin et magouilles pas claires'],
    ['Case départ', 'Passage par la case depart'],
    ['Assurancetourix', 'Remboursement frais médicaux pour plâtre généralisé'],
];
const generateDate = (lowDay, highDay, lowMonth, highMonth) => {
    const date = new Date();
    date.setMonth(rand(lowMonth, highMonth));
    date.setDate(rand(lowDay, highDay));
    return date;
};
const generateOne = (account) => {
    const n = rand(0, 100);
    const now = new Date();
    const type = randomType();
    // with a 2% rate, generate a special transaction to test duplicates
    // (happening on 4th of current month).
    if (n < 2) {
        return {
            account,
            amount: '-300',
            label: 'Loyer',
            rawLabel: 'Loyer habitation',
            date: generateDate(4, 4, now.getMonth(), now.getMonth()),
            type,
        };
    }
    // Note: now.getMonth starts from 0.
    const date = generateDate(1, Math.min(now.getDate(), 28), 0, now.getMonth() + 1);
    if (n < 15) {
        const [label, rawLabel] = randomArray(randomLabelsPositive);
        const amount = (rand(100, 800) + rand(0, 100) / 100).toString();
        return {
            account,
            amount,
            label,
            rawLabel,
            date,
            type,
        };
    }
    const [label, rawLabel] = randomArray(randomLabels);
    const amount = (-rand(0, 60) + rand(0, 100) / 100).toString();
    return {
        account,
        amount,
        label,
        rawLabel,
        date,
        type,
    };
};
const selectRandomAccount = (access) => {
    const n = rand(0, 100);
    const accounts = hashAccount(access);
    if (n < 90) {
        return accounts.main;
    }
    if (n < 95) {
        return accounts.second;
    }
    return accounts.third;
};
const generate = (access) => {
    const transactions = [];
    let i = 5;
    while (i--) {
        transactions.push(generateOne(selectRandomAccount(access)));
    }
    while (rand(0, 100) > 70 && i < 3) {
        transactions.push(generateOne(selectRandomAccount(access)));
        i++;
    }
    // Generate exact same transactions imported at the same time. These
    // transactions shall not be considered as duplicates.
    if (rand(0, 100) > 85 && transactions.length) {
        log.info('Generate a similar but non-duplicate transaction.');
        transactions.push(transactions[0]);
    }
    // Generate always the same transaction, so that it is considered as a
    // duplicate.
    if (rand(0, 100) > 70) {
        log.info('Generate a possibly duplicate transaction.');
        // The date is one day off, so it is considered a duplicate by the client.
        let date = moment_1.default(new Date('05/04/2020'));
        if (rand(0, 100) <= 50) {
            date = date.add(1, 'days');
        }
        const duplicateTransaction = {
            label: 'This is a duplicate transaction',
            amount: '13.37',
            rawLabel: 'This is a duplicate transaction',
            account: hashAccount(access).main,
            date: date.toDate(),
        };
        transactions.push(duplicateTransaction);
    }
    // Sometimes generate a very old transaction, probably older than the oldest
    // one.
    if (rand(0, 100) > 90) {
        log.info('Generate a very old transaction to trigger balance resync.');
        const op = {
            label: 'Ye Olde Transaction',
            rawLabel: 'Ye Olde Transaction - for #413 testing',
            amount: '42.12',
            account: hashAccount(access).main,
            date: new Date('01/01/2000'),
        };
        transactions.push(op);
    }
    log.info(`Generated ${transactions.length} fake transactions:`);
    const accountMap = new Map();
    for (const op of transactions) {
        const prev = accountMap.has(op.account) ? accountMap.get(op.account) : [0, 0];
        accountMap.set(op.account, [prev[0] + 1, prev[1] + +op.amount]);
    }
    for (const [account, [num, amount]] of accountMap) {
        log.info(`- ${num} new transactions (${amount}) for account ${account}.`);
    }
    return transactions;
};
exports.fetchOperations = ({ access, }) => {
    return Promise.resolve({ kind: 'values', values: generate(access) });
};
exports._ = {
    SOURCE_NAME: exports.SOURCE_NAME,
    fetchAccounts: exports.fetchAccounts,
    fetchOperations: exports.fetchOperations,
};
