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
        <button className="btn btn-primary" onClick={props.handleOpenModal}>
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
    let title = displayLabel(props);
    let more = props.customLabel ? `${props.title} (${props.rawLabel})` : props.rawLabel;

    return (
        <div className="duplicate-operation">
            <div>
                <h3>
                    <span
                        className="fa fa-question-circle clickable"
                        aria-hidden="true"
                        title={more}
                    />
                    <span>{title}</span>
                </h3>
                <p>
                    {formatDate.toShortString(props.date)}
                    &nbsp; ({$t('client.similarity.imported_on')}{' '}
                    {formatDate.toLongString(props.dateImport)})
                </p>
            </div>
            <div className="duplicate-details">
                <p>
                    <span className="label">{$t('client.similarity.category')}</span>
                    {props.categoryTitle}
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

class DuplicateItem extends React.Component {
    key = () => {
        return `dpair-${this.props.toKeep.id}-${this.props.toRemove.id}`;
    };

    render() {
        let { toKeep, toRemove, toKeepCategory, toRemoveCategory } = this.props;

        return (
            <div key={this.key()} className="duplicate">
                <OperationLine
                    title={toKeep.title}
                    customLabel={toKeep.customLabel}
                    rawLabel={toKeep.raw}
                    date={toKeep.date}
                    dateImport={toKeep.dateImport}
                    categoryTitle={toKeepCategory.title}
                    type={toKeep.type}
                    deletionInfo={$t('client.similarity.will_be_kept')}
                />

                <OperationLine
                    title={toRemove.title}
                    customLabel={toRemove.customLabel}
                    rawLabel={toRemove.raw}
                    date={toRemove.date}
                    dateImport={toRemove.dateImport}
                    categoryTitle={toRemoveCategory.title}
                    type={toRemove.type}
                    deletionInfo={$t('client.similarity.will_be_removed')}
                />

                <div className="toolbar">
                    <span>
                        {$t('client.similarity.amount')}&nbsp;
                        {this.props.formatCurrency(toKeep.amount)}
                    </span>

                    <ConfirmMergeButton toKeep={toKeep} toRemove={toRemove} />
                </div>
            </div>
        );
    }
}

const Export = connect(
    (state, ownProps) => {
        let { toKeep, toRemove } = ownProps;

        // The operation to keep should usually be the one that's the most
        // recent.
        if (+toRemove.dateImport > +toKeep.dateImport) {
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
    },
    dispatch => {
        return {
            merge: (toKeep, toRemove) => {
                actions.mergeOperations(dispatch, toKeep, toRemove);
            }
        };
    }
)(DuplicateItem);

export default Export;
