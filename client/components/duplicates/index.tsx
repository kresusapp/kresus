import React, { useCallback, useContext } from 'react';

import { translate as $t } from '../../helpers';
import { DUPLICATE_THRESHOLD } from '../../../shared/settings';

import { useKresusDispatch, useKresusState, GlobalState } from '../../store';
import * as SettingsStore from '../../store/settings';
import * as BanksStore from '../../store/banks';
import * as DuplicatesStore from '../../store/duplicates';

import DefaultParameters from './default-params';

import Pair from './item';
import { DriverContext } from '../drivers';

import './duplicates.css';
import { useGenericError } from '../../hooks';

import DiscoveryMessage from '../ui/discovery-message';
import MergeAll from './merge-all';

export function findRedundantPairs(state: GlobalState, accountId: number) {
    const accountDuplicates = DuplicatesStore.byAccountId(state.duplicates, accountId);
    return accountDuplicates.flatMap(item => {
        return item.duplicates.map(dup => [
            BanksStore.transactionById(state.banks, dup[0]),
            BanksStore.transactionById(state.banks, dup[1]),
        ]);
    });
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

    const duplicateThreshold = useKresusState(state =>
        parseFloat(SettingsStore.get(state.settings, DUPLICATE_THRESHOLD))
    );

    // Show the "more"/"fewer" button if there's a value after/before in the thresholds
    // suite.
    const allowMore = duplicateThreshold <= THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 2];
    const allowFewer = duplicateThreshold >= THRESHOLDS_SUITE[1];

    const pairsByAccount = useKresusState(state => {
        const mapping = new Map<string, ReturnType<typeof findRedundantPairs>>();
        const accounts = driver.getAccounts(state);
        accounts.forEach(account => {
            const accPairs = findRedundantPairs(state, account.id);
            if (accPairs.length) {
                mapping.set(account.customLabel || account.label, accPairs);
            }
        });
        return mapping;
    });

    const formatCurrency = useKresusState(state => driver.getCurrencyFormatter(state));

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

    const duplicateThresholdInDays = duplicateThreshold / 24;

    let sim;
    if (pairsByAccount.size === 0) {
        sim = <div>{$t('client.similarity.nothing_found')}</div>;
    } else {
        sim = [];
        let currentAccountLabel = '';
        for (const [accountLabel, pairs] of pairsByAccount) {
            // If there are several accounts, display the account's label before the duplicates.
            if (pairsByAccount.size > 1 && accountLabel !== currentAccountLabel) {
                sim.push(<h3>{accountLabel}</h3>);
            }

            sim.push(
                ...pairs.map(p => {
                    const key = p[0].id.toString() + p[1].id.toString();
                    return (
                        <Pair
                            key={key}
                            toKeep={p[0]}
                            toRemove={p[1]}
                            formatCurrency={formatCurrency}
                        />
                    );
                })
            );

            currentAccountLabel = accountLabel;
        }
    }

    return (
        <React.Fragment>
            <p className="form-toolbar right">
                <DefaultParameters />
                <MergeAll pairs={Array.from(pairsByAccount.values()).flat()} />
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
                            {duplicateThresholdInDays}
                            &nbsp;{$t('client.similarity.days')}
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
