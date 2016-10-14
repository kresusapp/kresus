import React from 'react';
import { connect } from 'react-redux';

import { get } from '../../store';
import { debug as dbg, translate as $t, UNKNOWN_OPERATION_TYPE } from '../../helpers';
import Pair from './item';

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
            if (next.amount !== op.amount)
                break;

            // Two operations are duplicates if they were not imported at the same date.
            let datediff = Math.abs(+op.date - +next.date);
            if (datediff <= threshold && +op.dateImport !== +next.dateImport) {
                // Two operations with the same known type can be considered as duplicates.
                if (op.type === UNKNOWN_OPERATION_TYPE ||
                    next.type === UNKNOWN_OPERATION_TYPE ||
                    op.type === next.type) {
                    similar.push([op, next]);
                }
            }

            j += 1;
        }
    }

    debug(`${similar.length} pairs of similar operations found`);
    debug(`findRedundantPairs took ${Date.now() - before}ms.`);
    // The duplicates are sorted from last imported to first imported
    similar.sort((a, b) =>
        Math.max(b[0].dateImport, b[1].dateImport) -
        Math.max(a[0].dateImport, a[1].dateImport)
    );
    return similar;
}

export default connect(state => {
    let duplicateThreshold = get.setting(state, 'duplicateThreshold');
    let currentOperations = get.currentOperations(state);

    let formatCurrency = get.currentAccount(state).formatCurrency;

    let pairs = findRedundantPairs(currentOperations, duplicateThreshold);
    return {
        pairs,
        formatCurrency
    };
})(props => {
    let pairs = props.pairs;

    let sim;
    if (pairs.length === 0) {
        sim = <div>{ $t('client.similarity.nothing_found') }</div>;
    } else {
        sim = pairs.map(p => {
            let key = p[0].id.toString() + p[1].id.toString();
            return (
                <Pair
                  key={ key }
                  a={ p[0] }
                  b={ p[1] }
                  formatCurrency={ props.formatCurrency }
                />
            );
        });
    }

    function onClickFewer() {
        alert('fewer');
    }
    function onClickMore() {
        alert('more');
    }

    return (
        <div key="duplicates-list">
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.similarity.title') }
                    </h3>
                </div>
                <div className="panel-body">
                    <div className="alert alert-info">
                        <span className="glyphicon glyphicon-exclamation-sign"></span>&nbsp;
                        { $t('client.similarity.help') }
                    </div>
                    <div className="row">
                        <button className="col-xs-6" onClick={ onClickFewer }>
                            { $t('client.similarity.find_fewer') }
                        </button>
                        <button className="col-xs-6" onClick={ onClickMore }>
                            { $t('client.similarity.find_more') }
                        </button>
                    </div>
                    { sim }
                </div>
            </div>
        </div>
    );
});
