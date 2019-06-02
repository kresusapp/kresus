import moment from 'moment';
import { UNKNOWN_OPERATION_TYPE } from '../helpers';

import makeDiff from './diff-list';

function isPerfectMatch(known, provided) {
    let oldRawLabel = known.rawLabel.replace(/ /g, '').toLowerCase();
    let oldMoment = moment(known.date);
    let newRawLabel = provided.rawLabel.replace(/ /g, '').toLowerCase();
    let newMoment = moment(provided.date);

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

function computePairScore(known, provided) {
    let knownMoment = moment(known.date);
    let providedMoment = moment(provided.date);
    let diffDate = Math.abs(knownMoment.diff(providedMoment, 'days'));
    let dateScore = 0;
    if (diffDate === 0) {
        dateScore = HEURISTICS.SAME_DATE;
    } else if (diffDate <= MAX_DATE_DIFFERENCE) {
        dateScore = HEURISTICS.SAME_DATE / (1 + diffDate);
    }

    let diffAmount = Math.abs(known.amount - provided.amount);
    let amountScore = diffAmount < 0.001 ? HEURISTICS.SAME_AMOUNT : 0;

    let typeScore = 0;
    if (provided.type === UNKNOWN_OPERATION_TYPE) {
        typeScore = HEURISTICS.SAME_TYPE / 2;
    } else if (known.type === provided.type) {
        typeScore = HEURISTICS.SAME_TYPE;
    }

    let oldRawLabel = provided.rawLabel.replace(/ /g, '').toLowerCase();
    let newRawLabel = known.rawLabel.replace(/ /g, '').toLowerCase();
    let labelScore = oldRawLabel === newRawLabel ? HEURISTICS.SAME_LABEL : 0;
    return amountScore + dateScore + typeScore + labelScore;
}

const diffOperations = makeDiff(isPerfectMatch, computePairScore, MIN_SIMILARITY);
export default diffOperations;
