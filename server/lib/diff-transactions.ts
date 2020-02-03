import moment from 'moment';
import { UNKNOWN_OPERATION_TYPE } from '../helpers';

import makeDiff from './diff-list';
import { Transactions } from '../models';

function isPerfectMatch(known: Transactions, provided: Transactions): boolean {
    const oldRawLabel = known.rawLabel.replace(/ /g, '').toLowerCase();
    const oldMoment = moment(known.date);
    const newRawLabel = provided.rawLabel.replace(/ /g, '').toLowerCase();
    const newMoment = moment(provided.date);

    return (
        Math.abs(known.amount - provided.amount) < 0.001 &&
        oldRawLabel === newRawLabel &&
        oldMoment.isSame(newMoment) &&
        (known.type === UNKNOWN_OPERATION_TYPE ||
            provided.type === UNKNOWN_OPERATION_TYPE ||
            known.type === provided.type)
    );
}

const HEURISTICS = {
    SAME_DATE: 5,
    SAME_AMOUNT: 5,
    SAME_LABEL: 5,
    SAME_TYPE: 1
};

const MAX_DATE_DIFFERENCE = 2;

const MIN_SIMILARITY = HEURISTICS.SAME_DATE + HEURISTICS.SAME_AMOUNT + 1;

function computePairScore(known: Transactions, provided: Transactions): number {
    const knownMoment = moment(known.date);
    const providedMoment = moment(provided.date);
    const diffDate = Math.abs(knownMoment.diff(providedMoment, 'days'));
    let dateScore = 0;
    if (diffDate === 0) {
        dateScore = HEURISTICS.SAME_DATE;
    } else if (diffDate <= MAX_DATE_DIFFERENCE) {
        dateScore = HEURISTICS.SAME_DATE / (1 + diffDate);
    }

    const diffAmount = Math.abs(known.amount - provided.amount);
    const amountScore = diffAmount < 0.001 ? HEURISTICS.SAME_AMOUNT : 0;

    let typeScore = 0;
    if (provided.type === UNKNOWN_OPERATION_TYPE) {
        typeScore = HEURISTICS.SAME_TYPE / 2;
    } else if (known.type === provided.type) {
        typeScore = HEURISTICS.SAME_TYPE;
    }

    const oldRawLabel = provided.rawLabel.replace(/ /g, '').toLowerCase();
    const newRawLabel = known.rawLabel.replace(/ /g, '').toLowerCase();
    const labelScore = oldRawLabel === newRawLabel ? HEURISTICS.SAME_LABEL : 0;
    return amountScore + dateScore + typeScore + labelScore;
}

const diffTransactions = makeDiff<Transactions>(isPerfectMatch, computePairScore, MIN_SIMILARITY);
export default diffTransactions;
