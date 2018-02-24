import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { debug as dbg, translate as $t, UNKNOWN_OPERATION_TYPE } from '../../helpers';
import Pair from './item';
import DefaultParamsModal from './default-params-modal';

function debug(text) {
    return dbg(`Similarity Component - ${text}`);
}

// Algorithm
function findRedundantPairs(operations, duplicateThreshold) {
    let before = Date.now();
    debug('Running findRedundantPairs algorithm...');
    debug(`Input: ${operations.length} operations`);
    let similar = [];

    // duplicateThreshold is in hours
    let threshold = duplicateThreshold * 60 * 60 * 1000;
    debug(`Threshold: ${threshold}`);

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
            if (datediff <= threshold && +op.dateImport !== +next.dateImport) {
                // Two operations with the same known type can be considered as duplicates.
                if (
                    op.type === UNKNOWN_OPERATION_TYPE ||
                    next.type === UNKNOWN_OPERATION_TYPE ||
                    op.type === next.type
                ) {
                    similar.push([op, next]);
                }
            }

            j += 1;
        }
    }

    debug(`${similar.length} pairs of similar operations found`);
    debug(`findRedundantPairs took ${Date.now() - before}ms.`);
    // The duplicates are sorted from last imported to first imported
    similar.sort(
        (a, b) =>
            Math.max(b[0].dateImport, b[1].dateImport) - Math.max(a[0].dateImport, a[1].dateImport)
    );
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
        let { currentAccountId } = props.match.params;
        let currentOperations = get.operationsByAccountIds(state, currentAccountId);
        let formatCurrency = get.accountById(state, currentAccountId).formatCurrency;

        let duplicateThreshold = parseFloat(get.setting(state, 'duplicateThreshold'));

        // Show the "more"/"fewer" button if there's a value after/before in the thresholds suite.
        let allowMore = duplicateThreshold <= THRESHOLDS_SUITE[NUM_THRESHOLDS_SUITE - 2];
        let allowFewer = duplicateThreshold >= THRESHOLDS_SUITE[1];

        let [prevThreshold, nextThreshold] = computePrevNextThreshold(duplicateThreshold);

        let pairs = findRedundantPairs(currentOperations, duplicateThreshold);
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
                actions.setSetting(dispatch, 'duplicateThreshold', val);
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
        <div>
            <p className="clearfix">
                <button
                    className="btn btn-default pull-right"
                    data-toggle="modal"
                    data-target="#defaultParams">
                    <span className="fa fa-cog" />
                    {$t('client.general.default_parameters')}
                </button>
            </p>

            <DefaultParamsModal modalId="defaultParams" />

            <div>
                <div className="duplicates-explanation">
                    <p>
                        {$t('client.similarity.threshold_1')}&nbsp;
                        <strong>
                            {props.duplicateThreshold}
                            &nbsp;{$t('client.similarity.hours')}
                        </strong>. {$t('client.similarity.threshold_2')}.
                    </p>
                    <p className="btn-group">
                        <button
                            className="btn btn-default"
                            onClick={fewer}
                            disabled={!props.allowFewer}>
                            {$t('client.similarity.find_fewer')}
                        </button>
                        <button
                            className="btn btn-default"
                            onClick={more}
                            disabled={!props.allowMore}>
                            {$t('client.similarity.find_more')}
                        </button>
                    </p>
                </div>
                <div className="alert alert-info clearfix">
                    <span className="fa fa-question-circle pull-left" />
                    {$t('client.similarity.help')}
                </div>
                {sim}
            </div>
        </div>
    );
});

// ******************************** TEST **************************************

export function testComputePrevNextThreshold(it) {
    it('should return edge thresholds for edge inputs', () => {
        let threshold = 0;
        let [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 23;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 24 * 14;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24 * 7);
        next.should.equal(24 * 14);

        threshold = 24 * 15;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24 * 14);
        next.should.equal(24 * 14);
    });

    it('should return previous/next for precise in-between inputs', () => {
        let threshold = 24;
        let [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 48;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(72);

        threshold = 72;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(48);
        next.should.equal(96);
    });

    it('should return closest previous/next for imprecise in-between inputs', () => {
        let threshold = 25;
        let [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 47;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(24);
        next.should.equal(48);

        threshold = 69;
        [prev, next] = computePrevNextThreshold(threshold);
        prev.should.equal(48);
        next.should.equal(72);
    });
}
