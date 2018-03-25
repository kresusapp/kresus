import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, formatDate } from '../../helpers';

import Modal from '../ui/modal';

const OperationLine = props => {
    let title, more;
    if (props.customLabel) {
        title = props.customLabel;
        more = `${props.title} (${props.rawLabel})`;
    } else {
        title = props.title;
        more = props.rawLabel;
    }

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
    modalId = () => {
        return `${this.key()}-modal`;
    };

    handleMerge = () => {
        this.props.merge(this.props.toKeep, this.props.toRemove);
    };

    handleOpenModal = () => {
        $(`#${this.modalId()}`).modal('show');
    };

    render() {
        let { toKeep, toRemove, toKeepCategory, toRemoveCategory } = this.props;

        let modalFooter = (
            <div>
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    {$t('client.general.cancel')}
                </button>
                <button
                    type="button"
                    className="btn btn-danger"
                    data-dismiss="modal"
                    onClick={this.handleMerge}>
                    {$t('client.similarity.merge')}
                </button>
            </div>
        );

        return (
            <div key={this.key()} className="duplicate">
                <Modal
                    modalId={this.modalId()}
                    modalTitle={$t('client.similarity.confirm_title')}
                    modalBody={$t('client.similarity.confirm')}
                    modalFooter={modalFooter}
                    onDelete={this.handleMerge}
                />

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

                    <button className="btn btn-primary" onClick={this.handleOpenModal}>
                        <span className="fa fa-compress" aria-hidden="true" />
                        <span className="merge-title">{$t('client.similarity.merge')}</span>
                    </button>
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
