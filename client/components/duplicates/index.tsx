import React, { useCallback, useContext } from 'react';
import { createSelector } from '@reduxjs/toolkit';

import {
    assert,
    currency,
    debug as dbg,
    translate as $t,
    UNKNOWN_TRANSACTION_TYPE,
    NONE_CATEGORY_ID,
} from '../../helpers';
import {
    DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS,
    DUPLICATE_THRESHOLD,
} from '../../../shared/settings';

import { useKresusDispatch, useKresusState, reduxStore, GlobalState } from '../../store';
import * as SettingsStore from '../../store/settings';
import * as BanksStore from '../../store/banks';

import DefaultParameters from './default-params';

import Pair from './item';
import { DriverContext, isAccountDriver } from '../drivers';

import './duplicates.css';
import { useGenericError } from '../../hooks';

import DiscoveryMessage from '../ui/discovery-message';
import MergeAll from './merge-all';

function debug(text: string) {
    return dbg(`Similarity Component - ${text}`);
}

// Algorithm:
// The algorithm is split in two parts:
// - findRedundantPairsIdsNoFields, which only looks at the transactions' dates,
// which are considered immutable. Hence this function can be memoized.
// - findRedundantPairs, which calls the first part, and then applies
// additional filters on the transactions fields themselves. This will return a
// new array each time, but it should still be very fast, since the most costly
// part of the algorithm is memoized.
function findRedundantPairsIdsNoFields(transactionIds: number[], duplicateThresholdStr: string) {
    const before = Date.now();
    debug('Running findRedundantPairsIdsNoFields algorithm...');
    debug(`Input: ${transactionIds.length} transactions`);
    const similar = [];

    // duplicateThreshold is in hours
    const duplicateThreshold = Number.parseInt(duplicateThresholdStr, 10);
    const threshold = duplicateThreshold * 60 * 60 * 1000;
    debug(`Threshold: ${threshold}`);

    const state = reduxStore.getState();
    const transactions = transactionIds.map(id => BanksStore.transactionById(state.banks, id));

    // O(n log n)
    const sorted = transactions.slice().sort((a, b) => a.amount - b.amount);
    for (let i = 0; i < transactions.length; ++i) {
        const tr = sorted[i];
        let j = i + 1;
        while (j < transactions.length) {
            const next = sorted[j];
            if (next.amount !== tr.amount) {
                break;
            }

            // Two transactions are duplicates if they were not imported at the same date.
            const datediff = Math.abs(+tr.date - +next.date);
            if (datediff <= threshold && +tr.importDate !== +next.importDate) {
                similar.push([tr, next]);
            }

            j += 1;
        }
    }

    debug(`${similar.length} pairs of similar transactions found`);
    debug(`findRedundantPairsIdsNoFields took ${Date.now() - before}ms.`);

    // The duplicates are sorted from last imported to first imported
    similar.sort(
        (a, b) =>
            Math.max(+b[0].importDate, +b[1].importDate) -
            Math.max(+a[0].importDate, +a[1].importDate)
    );

    return similar.map(([trA, trB]) => [trA.id, trB.id]);
}

const findRedundantPairsIds = createSelector(
    (state: GlobalState, currentAccountId: number) =>
        BanksStore.transactionIdsByAccountId(state.banks, currentAccountId),
    (state: GlobalState) => SettingsStore.get(state.settings, DUPLICATE_THRESHOLD),
    (transactionIds: number[], threshold: string) =>
        findRedundantPairsIdsNoFields(transactionIds, threshold)
);

export function findRedundantPairs(state: GlobalState, currentAccountId: number) {
    let similar = findRedundantPairsIds(state, currentAccountId).map(([trId, nextId]) => [
        BanksStore.transactionById(state.banks, trId),
        BanksStore.transactionById(state.banks, nextId),
    ]);

    const ignoreDifferentCustomFields = SettingsStore.getBool(
        state.settings,
        DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS
    );

    if (ignoreDifferentCustomFields) {
        similar = similar.filter(([tr, next]) => {
            return (
                (!tr.customLabel || !next.customLabel || tr.customLabel === next.customLabel) &&
                // Two transactions with the same known type/category can be considered as duplicates.
                (tr.type === UNKNOWN_TRANSACTION_TYPE ||
                    next.type === UNKNOWN_TRANSACTION_TYPE ||
                    tr.type === next.type) &&
                (tr.categoryId === NONE_CATEGORY_ID ||
                    next.categoryId === NONE_CATEGORY_ID ||
                    tr.categoryId === next.categoryId)
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
    const driver = useContext(DriverContext);

    assert(isAccountDriver(driver), `${driver.type} view does not support duplicates management`);

    const account = useKresusState(state => driver.getAccounts(state)[0] || null);
    assert(account !== null, 'account must not be null');

    const formatCurrency = currency.makeFormat(account.currency);
    const duplicateThreshold = useKresusState(state =>
        parseFloat(SettingsStore.get(state.settings, DUPLICATE_THRESHOLD))
    );

    // Show the "more"/"fewer" button if there's a value after/before in the thresholds
    // suite.
    const allowMore = duplicateThreshold <= THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 2];
    const allowFewer = duplicateThreshold >= THRESHOLDS_SUITE[1];

    const pairs = useKresusState(state => findRedundantPairs(state, account.id));

    const dispatch = useKresusDispatch();

    const [prevThreshold, nextThreshold] = computePrevNextThreshold(duplicateThreshold);
    const setThreshold = useGenericError(
        useCallback(
            async (val: string) => {
                await dispatch(SettingsStore.set(DUPLICATE_THRESHOLD, val)).unwrap();
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
            return <Pair key={key} toKeep={p[0]} toRemove={p[1]} formatCurrency={formatCurrency} />;
        });
    }

    return (
        <React.Fragment>
            <p className="form-toolbar right">
                <DefaultParameters />
                <MergeAll pairs={pairs} />
            </p>

            <div>
                <p>{$t('client.similarity.threshold_desc')}</p>

                <div className="duplicates-explanation">
                    <label>{$t('client.similarity.threshold')}:</label>
                    <p className="buttons-group">
                        <button className="btn" onClick={fewer} disabled={!allowFewer}>
                            {$t('client.similarity.find_fewer')}
                        </button>
                        <span className="btn inner-text">
                            {duplicateThreshold}
                            &nbsp;{$t('client.similarity.hours')}
                        </span>
                        <button className="btn" onClick={more} disabled={!allowMore}>
                            {$t('client.similarity.find_more')}
                        </button>
                    </p>
                </div>

                <DiscoveryMessage message={$t('client.similarity.help')} />

                {sim}
            </div>
        </React.Fragment>
    );
};

export default Duplicates;

export const testing = {
    computePrevNextThreshold,
};
