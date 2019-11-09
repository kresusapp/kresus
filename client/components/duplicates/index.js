import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
    debug as dbg,
    translate as $t,
    UNKNOWN_OPERATION_TYPE,
    NONE_CATEGORY_ID
} from '../../helpers';
import { actions, get, rx } from '../../store';
import URL from '../../urls';

import Pair from './item';
import { MODAL_SLUG } from './default-params-modal';

const OpenModaleButton = connect(
    null,
    dispatch => {
        return {
            handleOpenModal() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => {
    return (
        <button className="btn default-params" onClick={props.handleOpenModal}>
            <span className="fa fa-cog" />
            <span>{$t('client.general.default_parameters')}</span>
        </button>
    );
});

function debug(text) {
    return dbg(`Similarity Component - ${text}`);
}

// Algorithm:
// The algorithm is split in two parts:
// - findRedundantPairsIdsNoFields, which only looks at the operations' dates,
// which are considered immutable. Hence this function can be memoized.
// - findRedundantPairs, which calls the first part, and then applies
// additional filters on the operations fields themselves. This will return a
// new array each time, but it should still be very fast, since the most costly
// part of the algorithm is memoized.
function findRedundantPairsIdsNoFields(operationIds, duplicateThreshold) {
    let before = Date.now();
    debug('Running findRedundantPairsIdsNoFields algorithm...');
    debug(`Input: ${operationIds.length} operations`);
    let similar = [];

    // duplicateThreshold is in hours
    let threshold = duplicateThreshold * 60 * 60 * 1000;
    debug(`Threshold: ${threshold}`);

    let state = rx.getState();
    let operations = operationIds.map(id => get.operationById(state, id));

    // O(n log n)
    let sorted = operations.slice().sort((a, b) => a.amount - b.amount);
    for (let i = 0; i < operations.length; ++i) {
        let op = sorted[i];
        let j = i + 1;
        while (j < operations.length) {
            let next = sorted[j];
            if (next.amount !== op.amount) {
                break;
            }

            // Two operations are duplicates if they were not imported at the same date.
            let datediff = Math.abs(+op.date - +next.date);
            if (datediff <= threshold && +op.importDate !== +next.importDate) {
                similar.push([op, next]);
            }

            j += 1;
        }
    }

    debug(`${similar.length} pairs of similar operations found`);
    debug(`findRedundantPairsIdsNoFields took ${Date.now() - before}ms.`);

    // The duplicates are sorted from last imported to first imported
    similar.sort(
        (a, b) =>
            Math.max(b[0].importDate, b[1].importDate) - Math.max(a[0].importDate, a[1].importDate)
    );

    return similar.map(([opA, opB]) => [opA.id, opB.id]);
}

const findRedundantPairsIds = createSelector(
    (state, currentAccountId) => get.operationIdsByAccountId(state, currentAccountId),
    state => get.setting(state, 'duplicate-threshold'),
    (operationIds, threshold) => findRedundantPairsIdsNoFields(operationIds, threshold)
);

export function findRedundantPairs(state, currentAccountId) {
    let similar = findRedundantPairsIds(state, currentAccountId).map(([opId, nextId]) => [
        get.operationById(state, opId),
        get.operationById(state, nextId)
    ]);

    let ignoreDifferentCustomFields = get.boolSetting(
        state,
        'duplicate-ignore-different-custom-fields'
    );

    if (ignoreDifferentCustomFields) {
        similar = similar.filter(([op, next]) => {
            return (
                (!op.customLabel || !next.customLabel || op.customLabel === next.customLabel) &&
                // Two operations with the same known type/category can be considered as duplicates.
                (op.type === UNKNOWN_OPERATION_TYPE ||
                    next.type === UNKNOWN_OPERATION_TYPE ||
                    op.type === next.type) &&
                (op.categoryId === NONE_CATEGORY_ID ||
                    next.categoryId === NONE_CATEGORY_ID ||
                    op.categoryId === next.categoryId)
            );
        });
    }

    return similar;
}

const THRESHOLDS_SUITE = [24, 24 * 2, 24 * 3, 24 * 4, 24 * 7, 24 * 14];
const NUM_THRESHOLDS_SUITE = THRESHOLDS_SUITE.length;

function computePrevNextThreshold(current) {
    let previousValues = THRESHOLDS_SUITE.filter(v => v < current);
    let previousThreshold = previousValues.length
        ? previousValues[previousValues.length - 1]
        : THRESHOLDS_SUITE[0];

    let nextValues = THRESHOLDS_SUITE.filter(v => v > Math.max(current, previousThreshold));
    let nextThreshold = nextValues.length
        ? nextValues[0]
        : THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 1];

    return [previousThreshold, nextThreshold];
}

export default connect(
    (state, props) => {
        let currentAccountId = URL.duplicates.accountId(props.match);

        let formatCurrency = get.accountById(state, currentAccountId).formatCurrency;
        let duplicateThreshold = parseFloat(get.setting(state, 'duplicate-threshold'));

        // Show the "more"/"fewer" button if there's a value after/before in the thresholds suite.
        let allowMore = duplicateThreshold <= THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 2];
        let allowFewer = duplicateThreshold >= THRESHOLDS_SUITE[1];

        let [prevThreshold, nextThreshold] = computePrevNextThreshold(duplicateThreshold);

        let pairs = findRedundantPairs(state, currentAccountId);
        return {
            pairs,
            formatCurrency,
            allowMore,
            allowFewer,
            duplicateThreshold,
            prevThreshold,
            nextThreshold
        };
    },
    dispatch => {
        return {
            setThreshold(val) {
                actions.setSetting(dispatch, 'duplicate-threshold', val);
            }
        };
    }
)(props => {
    let pairs = props.pairs;

    let sim;
    if (pairs.length === 0) {
        sim = <div>{$t('client.similarity.nothing_found')}</div>;
    } else {
        sim = pairs.map(p => {
            let key = p[0].id.toString() + p[1].id.toString();
            return (
                <Pair
                    key={key}
                    toKeep={p[0]}
                    toRemove={p[1]}
                    formatCurrency={props.formatCurrency}
                />
            );
        });
    }

    function fewer() {
        props.setThreshold(props.prevThreshold.toString());
    }
    function more() {
        props.setThreshold(props.nextThreshold.toString());
    }

    return (
        <React.Fragment>
            <p className="right-align">
                <OpenModaleButton />
            </p>

            <div>
                <div className="duplicates-explanation">
                    <p>
                        {$t('client.similarity.threshold_1')}&nbsp;
                        <strong>
                            {props.duplicateThreshold}
                            &nbsp;{$t('client.similarity.hours')}
                        </strong>
                        . {$t('client.similarity.threshold_2')}.
                    </p>
                    <p className="buttons-group">
                        <button className="btn" onClick={fewer} disabled={!props.allowFewer}>
                            {$t('client.similarity.find_fewer')}
                        </button>
                        <button className="btn" onClick={more} disabled={!props.allowMore}>
                            {$t('client.similarity.find_more')}
                        </button>
                    </p>
                </div>
                <p className="alerts info">
                    <span className="fa fa-question-circle" />
                    {$t('client.similarity.help')}
                </p>
                {sim}
            </div>
        </React.Fragment>
    );
});

export const testing = {
    computePrevNextThreshold
};
