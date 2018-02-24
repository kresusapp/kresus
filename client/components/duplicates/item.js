import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, formatDate } from '../../helpers';

export default connect(
    (state, ownProps) => {
        let categoryA = get.categoryById(state, ownProps.a.categoryId);
        let categoryB = get.categoryById(state, ownProps.b.categoryId);

        return {
            categoryA,
            categoryB
        };
    },
    dispatch => {
        return {
            merge: (toKeep, toRemove) => {
                actions.mergeOperations(dispatch, toKeep, toRemove);
            }
        };
    }
)(props => {
    function handleMerge(e) {
        let older, younger;
        if (+props.a.dateImport < +props.b.dateImport) {
            [older, younger] = [props.a, props.b];
        } else {
            [older, younger] = [props.b, props.a];
        }
        props.merge(younger, older);
        e.preventDefault();
    }

    let customLabelA = null;
    if (props.a.customLabel) {
        customLabelA = <span>({props.a.customLabel})</span>;
    }
    let customLabelB = null;
    if (props.b.customLabel) {
        customLabelB = <span>({props.b.customLabel})</span>;
    }

    return (
        <div key={`dpair-${props.a.id}-${props.b.id}`} className="duplicate">
            <div>
                <div>
                    <h3>
                        {props.a.title}&nbsp;{customLabelA}
                    </h3>
                    <p>
                        {formatDate.toShortString(props.a.date)}
                        &nbsp; ({$t('client.similarity.imported_on')}{' '}
                        {formatDate.toLongString(props.a.dateImport)})
                    </p>
                </div>
                <div className="details">
                    <p>
                        <span className="label">{$t('client.similarity.category')}:</span>
                        {props.categoryA.title}
                    </p>
                    <p>
                        <span className="label">{$t('client.similarity.type')}:</span>
                        {$t(`client.${props.a.type}`)}
                    </p>
                </div>
            </div>
            <hr />
            <div>
                <div>
                    <h3>
                        {props.b.title}&nbsp;{customLabelB}
                    </h3>
                    <p>
                        {formatDate.toShortString(props.b.date)}
                        &nbsp; ({$t('client.similarity.imported_on')}{' '}
                        {formatDate.toLongString(props.b.dateImport)})
                    </p>
                </div>
                <div className="details">
                    <p>
                        <span className="label">{$t('client.similarity.category')}:</span>
                        {props.categoryB.title}
                    </p>
                    <p>
                        <span className="label">{$t('client.similarity.type')}:</span>
                        {$t(`client.${props.b.type}`)}
                    </p>
                </div>
            </div>
            <button className="btn btn-primary" onClick={handleMerge}>
                <span className="fa fa-compress" aria-hidden="true" />
                <span>
                    {$t('client.similarity.amount')}: &nbsp;
                    {props.formatCurrency(props.a.amount)}
                </span>
                <span className="merge-title">
                    &nbsp;/&nbsp;
                    {$t('client.similarity.merge')}
                </span>
            </button>
        </div>
    );
});
