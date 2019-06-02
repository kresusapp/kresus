import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';
import { translate as $t, formatDate, displayLabel } from '../../helpers';

import { MODAL_SLUG } from './confirm-merge';

const ConfirmMergeButton = connect(
    null,
    (dispatch, props) => {
        return {
            handleOpenModal() {
                let { toKeep, toRemove } = props;
                actions.showModal(dispatch, MODAL_SLUG, { toKeep, toRemove });
            }
        };
    }
)(props => {
    return (
        <button className="btn primary" onClick={props.handleOpenModal}>
            <span className="fa fa-compress" aria-hidden="true" />
            <span className="merge-title">{$t('client.similarity.merge')}</span>
        </button>
    );
});

ConfirmMergeButton.propTypes = {
    // The operation object to keep.
    toKeep: PropTypes.object.isRequired,

    // The operation object to be removed.
    toRemove: PropTypes.object.isRequired
};

const OperationLine = props => {
    let label = displayLabel(props);
    let more = props.customLabel ? `${props.label} (${props.rawLabel})` : props.rawLabel;

    return (
        <div className="duplicate-operation">
            <div>
                <h3>
                    <span
                        className="tooltipped tooltipped-ne tooltipped-multiline"
                        aria-label={more}>
                        <span className="fa fa-question-circle clickable" />
                    </span>
                    <span>{label}</span>
                </h3>
                <p>
                    {formatDate.toShortString(props.date)}
                    &nbsp; ({$t('client.similarity.imported_on')}{' '}
                    {formatDate.toLongString(props.importDate)})
                </p>
            </div>
            <div className="duplicate-details">
                <p>
                    <span className="label">{$t('client.similarity.category')}</span>
                    {props.categoryLabel}
                </p>
                <p>
                    <span className="label">{$t('client.similarity.type')}</span>
                    {$t(`client.${props.type}`)}
                </p>
                <p>{props.deletionInfo}</p>
            </div>
        </div>
    );
};

const DuplicateItem = props => {
    let { toKeep, toRemove, toKeepCategory, toRemoveCategory } = props;
    let key = `dpair-${props.toKeep.id}-${props.toRemove.id}`;

    return (
        <div key={key} className="duplicate">
            <OperationLine
                label={toKeep.label}
                customLabel={toKeep.customLabel}
                rawLabel={toKeep.rawLabel}
                date={toKeep.date}
                importDate={toKeep.importDate}
                categoryLabel={toKeepCategory.label}
                type={toKeep.type}
                deletionInfo={$t('client.similarity.will_be_kept')}
            />

            <OperationLine
                label={toRemove.label}
                customLabel={toRemove.customLabel}
                rawLabel={toRemove.rawLabel}
                date={toRemove.date}
                importDate={toRemove.importDate}
                categoryLabel={toRemoveCategory.label}
                type={toRemove.type}
                deletionInfo={$t('client.similarity.will_be_removed')}
            />

            <div className="toolbar">
                <span>
                    {$t('client.similarity.amount')}&nbsp;
                    {props.formatCurrency(toKeep.amount)}
                </span>

                <ConfirmMergeButton toKeep={toKeep} toRemove={toRemove} />
            </div>
        </div>
    );
};

const Export = connect((state, ownProps) => {
    let { toKeep, toRemove } = ownProps;

    // The operation to keep should usually be the one that's the most
    // recent.
    if (+toRemove.importDate > +toKeep.importDate) {
        [toRemove, toKeep] = [toKeep, toRemove];
    }

    let toKeepCategory = get.categoryById(state, toKeep.categoryId);
    let toRemoveCategory = get.categoryById(state, toRemove.categoryId);

    return {
        toKeep,
        toRemove,
        toKeepCategory,
        toRemoveCategory
    };
})(DuplicateItem);

export default Export;
