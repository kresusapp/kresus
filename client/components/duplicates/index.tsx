import React, { useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

import {
    assert,
    debug as dbg,
    translate as $t,
    UNKNOWN_OPERATION_TYPE,
    NONE_CATEGORY_ID,
    useKresusState,
} from '../../helpers';
import {
    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
    DUPLICATE_THRESHOLD,
} from '../../../shared/settings';
import { actions, get, GlobalState, reduxStore } from '../../store';

import DefaultParameters from './default-params';

import Pair from './item';
import { ViewContext, DriverType } from '../drivers';

import './duplicates.css';
import { useGenericError } from '../../hooks';

function debug(text: string) {
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
function findRedundantPairsIdsNoFields(operationIds: number[], duplicateThresholdStr: string) {
    const before = Date.now();
    debug('Running findRedundantPairsIdsNoFields algorithm...');
    debug(`Input: ${operationIds.length} operations`);
    const similar = [];

    // duplicateThreshold is in hours
    const duplicateThreshold = Number.parseInt(duplicateThresholdStr, 10);
    const threshold = duplicateThreshold * 60 * 60 * 1000;
    debug(`Threshold: ${threshold}`);

    const state = reduxStore.getState();
    const operations = operationIds.map(id => get.operationById(state, id));

    // O(n log n)
    const sorted = operations.slice().sort((a, b) => a.amount - b.amount);
    for (let i = 0; i < operations.length; ++i) {
        const op = sorted[i];
        let j = i + 1;
        while (j < operations.length) {
            const next = sorted[j];
            if (next.amount !== op.amount) {
                break;
            }

            // Two operations are duplicates if they were not imported at the same date.
            const datediff = Math.abs(+op.date - +next.date);
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
            Math.max(+b[0].importDate, +b[1].importDate) -
            Math.max(+a[0].importDate, +a[1].importDate)
    );

    return similar.map(([opA, opB]) => [opA.id, opB.id]);
}

const findRedundantPairsIds = createSelector(
    (state: GlobalState, currentAccountId: number) =>
        get.operationIdsByAccountId(state, currentAccountId),
    state => get.setting(state, DUPLICATE_THRESHOLD),
    (operationIds, threshold) => findRedundantPairsIdsNoFields(operationIds, threshold)
);

export function findRedundantPairs(state: GlobalState, currentAccountId: number) {
    let similar = findRedundantPairsIds(state, currentAccountId).map(([opId, nextId]) => [
        get.operationById(state, opId),
        get.operationById(state, nextId),
    ]);

    const ignoreDifferentCustomFields = get.boolSetting(
        state,
        DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS
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

function computePrevNextThreshold(current: number) {
    const previousValues = THRESHOLDS_SUITE.filter(v => v < current);
    const previousThreshold = previousValues.length
        ? previousValues[previousValues.length - 1]
        : THRESHOLDS_SUITE[0];

    const nextValues = THRESHOLDS_SUITE.filter(v => v > Math.max(current, previousThreshold));
    const nextThreshold = nextValues.length
        ? nextValues[0]
        : THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 1];

    return [previousThreshold, nextThreshold];
}

const Duplicates = () => {
    const view = useContext(ViewContext);

    assert(
        view.driver.type === DriverType.Account,
        `${view.driver.type} view does not support duplicates management`
    );

    const account = view.account;
    assert(account !== null, 'account must not be null');

    const formatCurrency = account.formatCurrency;
    const duplicateThreshold = useKresusState(state =>
        parseFloat(get.setting(state, DUPLICATE_THRESHOLD))
    );

    // Show the "more"/"fewer" button if there's a value after/before in the thresholds
    // suite.
    const allowMore = duplicateThreshold <= THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 2];
    const allowFewer = duplicateThreshold >= THRESHOLDS_SUITE[1];

    const pairs = useKresusState(state => findRedundantPairs(state, account.id));
    const accountBalance = account.balance;

    const dispatch = useDispatch();

    const [prevThreshold, nextThreshold] = computePrevNextThreshold(duplicateThreshold);
    const setThreshold = useGenericError(
        useCallback(
            (val: string) => {
                return actions.setSetting(dispatch, DUPLICATE_THRESHOLD, val);
            },
            [dispatch]
        )
    );
    const fewer = useCallback(() => {
        return setThreshold(prevThreshold.toString());
    }, [setThreshold, prevThreshold]);
    const more = useCallback(() => {
        return setThreshold(nextThreshold.toString());
    }, [setThreshold, nextThreshold]);

    let sim;
    if (pairs.length === 0) {
        sim = <div>{$t('client.similarity.nothing_found')}</div>;
    } else {
        sim = pairs.map(p => {
            const key = p[0].id.toString() + p[1].id.toString();
            return (
                <Pair
                    key={key}
                    toKeep={p[0]}
                    toRemove={p[1]}
                    formatCurrency={formatCurrency}
                    accountBalance={accountBalance}
                />
            );
        });
    }

    return (
        <React.Fragment>
            <p className="right-align">
                <DefaultParameters />
            </p>

            <div>
                <div className="duplicates-explanation">
                    <p>
                        {$t('client.similarity.threshold_1')}&nbsp;
                        <strong>
                            {duplicateThreshold}
                            &nbsp;{$t('client.similarity.hours')}
                        </strong>
                        . {$t('client.similarity.threshold_2')}.
                    </p>
                    <p className="buttons-group">
                        <button className="btn" onClick={fewer} disabled={!allowFewer}>
                            {$t('client.similarity.find_fewer')}
                        </button>
                        <button className="btn" onClick={more} disabled={!allowMore}>
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
};

export default Duplicates;

export const testing = {
    computePrevNextThreshold,
};
