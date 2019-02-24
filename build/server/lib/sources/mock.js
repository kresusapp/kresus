"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchOperations = exports.fetchAccounts = exports.SOURCE_NAME = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _helpers = require("../../helpers");

var _staticData = require("../../models/static-data");

var _errors = _interopRequireDefault(require("../../shared/errors.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

let log = (0, _helpers.makeLogger)('sources/mock'); // Maximum time needed to generate new operations.

const MAX_GENERATION_TIME = 2000; // Probability of generating a random error in fetchOperations (in %).

const PROBABILITY_RANDOM_ERROR = 10; // Helpers.

let rand = (low, high) => low + (Math.random() * (high - low) | 0);

let randInt = (low, high) => rand(low, high) | 0;

let randomArray = arr => arr[randInt(0, arr.length)];

let randomType = () => randInt(0, 10); // Generates a map of the accounts belonging to the given access.


let hashAccount = access => {
  let login = access.login;
  let uuid = access.bank;
  let hash = uuid.charCodeAt(0) + login + uuid.charCodeAt(3) + uuid.charCodeAt(uuid.length - 1);
  let map = {
    main: `${hash}1`,
    second: `${hash}2`,
    third: `${hash}3`
  };

  if (randInt(0, 100) > 80) {
    map.fourth = `${hash}4`;
  }

  return map;
};

const SOURCE_NAME = 'mock';
exports.SOURCE_NAME = SOURCE_NAME;

const fetchAccounts =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* ({
    access
  }) {
    let _hashAccount = hashAccount(access),
        main = _hashAccount.main,
        second = _hashAccount.second,
        third = _hashAccount.third,
        fourth = _hashAccount.fourth;

    let values = [{
      accountNumber: main,
      title: 'Compte chèque',
      balance: Math.random() * 150,
      iban: 'FR235711131719',
      currency: 'EUR',
      type: (0, _staticData.accountTypeNameToId)('account-type.checking')
    }, {
      accountNumber: second,
      title: 'Livret A',
      balance: '500',
      currency: 'USD',
      type: (0, _staticData.accountTypeNameToId)('account-type.savings')
    }, {
      accountNumber: third,
      title: 'Plan Epargne Logement',
      balance: '0',
      type: (0, _staticData.accountTypeNameToId)('account-type.savings')
    }];

    if (fourth) {
      values.push({
        accountNumber: fourth,
        title: 'Assurance vie',
        balance: '1000',
        type: (0, _staticData.accountTypeNameToId)('account-type.life_insurance')
      });
    }

    return values;
  });

  return function fetchAccounts(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.fetchAccounts = fetchAccounts;
let randomLabels = [['Café Moxka', 'Petit expresso rapido Café Moxka'], ['MerBnB', 'Paiement en ligne MerBNB'], ['Tabac Debourg', 'Bureau de tabac SARL Clopi Cloppa'], ['Rapide PSC', 'Paiement sans contact Rapide'], ['MacDollars PSC', 'Paiement sans contact Macdollars'], ['FNAK', 'FNAK CB blabla'], ['CB Sefaurat', 'Achat de parfum chez Sefaurat'], ['Polyprix CB', 'Courses chez Polyprix'], ['Croisement CB', 'Courses chez Croisement'], ['PRLV UJC', 'PRLV UJC'], ['CB Spotifaille', 'CB Spotifaille London'], ['Antiquaire', 'Antiquaire'], ['Le Perroquet Bourré', 'Le Perroquet Bourré SARL'], ['Le Vol de Nuit', 'Bar Le Vol De Nuit SARL'], ['Impots fonciers', `Prelevement impots fonciers numero reference
    47839743892 client 43278437289`], ['ESPA Carte Hassan Cehef', 'Paiement carte Hassan Cehef'], ['Indirect Energie', 'ESPA Indirect Energie SARL'], ['', 'VIR Mr Jean Claude Dusse'], ['Nuage Douillet', 'ESPA Abonnement Nuage Douillet'], ['Glagla Frigidaire', 'CB GLAGLA FRIGIDAIRE'], ['Digiticable', 'ESPA Digiticable'], ['NOGO Sport', 'CB NOGO Sport'], ['FramaHard', 'ESPA Don FramaHard'], ['Sergent Tchoutchou', 'CB online Sergent Tchoutchou'], ['RAeTP', 'CB Raleurs Ambulants et Traficoteurs Patentés']];
let randomLabelsPositive = [['VIR Nuage Douillet', 'VIR Nuage Douillet REFERENCE Salaire'], ['Impots', 'Remboursement impots en votre faveur'], ['', 'VIR Pots de vin et magouilles pas claires'], ['Case départ', 'Passage par la case depart'], ['Assurancetourix', 'Remboursement frais médicaux pour plâtre généralisé']];

let generateDate = (lowDay, highDay, lowMonth, highMonth) => (0, _moment.default)().month(rand(lowMonth, highMonth)).date(rand(lowDay, highDay)).format('YYYY-MM-DDT00:00:00.000[Z]');

let generateOne = account => {
  let n = rand(0, 100);
  let now = (0, _moment.default)();
  let type = randomType(); // with a 2% rate, generate a special operation to test duplicates
  // (happening on 4th of current month).

  if (n < 2) {
    return {
      account,
      amount: '-300',
      title: 'Loyer',
      raw: 'Loyer habitation',
      date: generateDate(4, 4, now.month(), now.month()),
      type
    };
  } // Note: now.month starts from 0.


  let date = generateDate(1, Math.min(now.date(), 28), 0, now.month() + 1);

  if (n < 15) {
    let _randomArray = randomArray(randomLabelsPositive),
        _randomArray2 = _slicedToArray(_randomArray, 2),
        title = _randomArray2[0],
        raw = _randomArray2[1];

    let amount = (rand(100, 800) + rand(0, 100) / 100).toString();
    return {
      account,
      amount,
      title,
      raw,
      date,
      type
    };
  }

  let _randomArray3 = randomArray(randomLabels),
      _randomArray4 = _slicedToArray(_randomArray3, 2),
      title = _randomArray4[0],
      raw = _randomArray4[1];

  let amount = (-rand(0, 60) + rand(0, 100) / 100).toString();
  return {
    account,
    amount,
    title,
    raw,
    date,
    type,
    binary: null
  };
};

let generateRandomError = () => {
  let errorTable = [];

  var _arr2 = Object.keys(_errors.default);

  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    let error = _arr2[_i2];
    errorTable.push(_errors.default[error]);
  }

  return errorTable[randInt(0, errorTable.length - 1)];
};

let selectRandomAccount = access => {
  let n = rand(0, 100);
  let accounts = hashAccount(access);

  if (n < 90) {
    return accounts.main;
  }

  if (n < 95) {
    return accounts.second;
  }

  return accounts.third;
};

let generate = access => {
  let operations = [];
  let i = 5;

  while (i--) {
    operations.push(generateOne(selectRandomAccount(access)));
  }

  while (rand(0, 100) > 70 && i < 3) {
    operations.push(generateOne(selectRandomAccount(access)));
    i++;
  } // Generate exact same operations imported at the same time
  // These operations shall not be considered as duplicates.


  if (rand(0, 100) > 85 && operations.length) {
    log.info('Generate a similar but non-duplicate operation.');
    operations.push(operations[0]);
  } // Generate always the same operation, so that it is considered
  // as a duplicate.


  if (rand(0, 100) > 70) {
    log.info('Generate a possibly duplicate operation.');
    let duplicateOperation = {
      title: 'This is a duplicate operation',
      amount: '13.37',
      raw: 'This is a duplicate operation',
      account: hashAccount(access).main
    }; // The date is one day off, so it is considered a duplicate by the client.

    let date = (0, _moment.default)(new Date('05/04/2020'));

    if (rand(0, 100) <= 50) {
      date = date.add(1, 'days');
    }

    duplicateOperation.date = date.format('YYYY-MM-DDT00:00:00.000[Z]');
    operations.push(duplicateOperation);
  } // Sometimes generate a very old operation, probably older than the oldest one.


  if (rand(0, 100) > 90) {
    log.info('Generate a very old transaction to trigger balance resync.');
    let op = {
      title: 'Ye Olde Transaction',
      raw: 'Ye Olde Transaction - for #413 testing',
      amount: '42.12',
      account: hashAccount(access).main,
      date: new Date('01/01/2000')
    };
    operations.push(op);
  }

  log.info(`Generated ${operations.length} fake operations:`);
  let accountMap = new Map();

  for (var _i3 = 0; _i3 < operations.length; _i3++) {
    let op = operations[_i3];
    let prev = accountMap.has(op.account) ? accountMap.get(op.account) : [0, 0];
    accountMap.set(op.account, [prev[0] + 1, prev[1] + +op.amount]);
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = accountMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let _step$value = _slicedToArray(_step.value, 2),
          account = _step$value[0],
          _step$value$ = _slicedToArray(_step$value[1], 2),
          num = _step$value$[0],
          amount = _step$value$[1];

      log.info(`- ${num} new operations (${amount}) for account ${account}.`);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return operations;
};

const fetchOperations = ({
  access
}) => {
  return new Promise((accept, reject) => {
    setTimeout(() => {
      if (rand(0, 100) <= PROBABILITY_RANDOM_ERROR) {
        let errorCode = generateRandomError();
        let error = new _helpers.KError(`New random error: ${errorCode}`, 500, errorCode);
        reject(error);
        return;
      }

      accept(generate(access));
    }, Math.random() * MAX_GENERATION_TIME);
  });
};

exports.fetchOperations = fetchOperations;