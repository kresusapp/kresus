import { Fragment, useCallback, useContext } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router';

import { translate as $t } from '../../helpers';
import { DUPLICATE_THRESHOLD } from '../../../shared/settings';
import { translate as $t } from '../../helpers';

import URL from '../../urls';
import { useKresusDispatch, useKresusState } from '../../store';
import * as SettingsStore from '../../store/settings';

import DefaultParameters from './default-params';

import { DriverContext } from '../drivers';
import DefaultParameters from './default-params';
import Pair from './item';

import './duplicates.css';
import { useGenericError } from '../../hooks';
import { LoadingMessage } from '../overlay/loading';
import DiscoveryMessage from '../ui/discovery-message';
import MergeAll from './merge-all';
import PairsList, { usePairsByAccount } from './pairs';
import IgnoredDuplicates from './ignored';

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

const DetectedDuplicates = () => {
    const driver = useContext(DriverContext);

    const duplicateThreshold = useKresusState(state =>
        parseFloat(SettingsStore.get(state.settings, DUPLICATE_THRESHOLD))
    );

    // Show the "more"/"fewer" button if there's a value after/before in the thresholds
    // suite.
    const allowMore = duplicateThreshold <= THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 2];
    const allowFewer = duplicateThreshold >= THRESHOLDS_SUITE[1];

    const pairsByAccount = usePairsByAccount(driver, false);

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

    return (
        <Fragment>
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

                <PairsList
                    pairsByAccount={pairsByAccount}
                    ignored={false}
                    emptyMessage={$t('client.similarity.nothing_found')}
                />

                <p className="duplicates-ignored-link">
                    <Link to={URL.duplicatesIgnored.url(driver)}>
                        {$t('client.similarity.show_ignored_duplicates')}
                    </Link>
                </p>
            </div>
        </Fragment>
    );
};

DetectedDuplicates.displayName = 'DetectedDuplicates';

const Duplicates = () => {
    const driver = useContext(DriverContext);

    return (
        <Routes>
            <Route path="/" element={<DetectedDuplicates />} />
            <Route path="ignored" element={<IgnoredDuplicates />} />
            <Route path="*" element={<Navigate to={URL.duplicates.url(driver)} replace={true} />} />
        </Routes>
    );
};

export default Duplicates;

export const testing = {
    computePrevNextThreshold,
};
