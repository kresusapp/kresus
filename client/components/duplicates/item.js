import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, formatDate, displayLabel } from '../../helpers';
import { Popconfirm } from '../ui';

const TransactionLine = props => {
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

export default connect(
    (state, ownProps) => {
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
            toRemoveCategory,
            balanceAfterMerge: ownProps.accountBalance - toRemove.amount,
        };
    },
    dispatch => {
        return {
            async mergeOperations(toKeep, toRemove) {
                try {
                    await actions.mergeOperations(dispatch, toKeep, toRemove);
                } catch (err) {
                    // TODO report properly
                    window.alert(err);
                }
            },
        };
    }
)(props => {
    let { toKeep, toRemove, toKeepCategory, toRemoveCategory } = props;
    let mergeOperations = async () => {
        await props.mergeOperations(toKeep, toRemove);
    };
    let key = `dpair-${props.toKeep.id}-${props.toRemove.id}`;

    return (
        <div key={key} className="duplicate">
            <TransactionLine
                label={toKeep.label}
                customLabel={toKeep.customLabel}
                rawLabel={toKeep.rawLabel}
                date={toKeep.date}
                importDate={toKeep.importDate}
                categoryLabel={toKeepCategory.label}
                type={toKeep.type}
                deletionInfo={$t('client.similarity.will_be_kept')}
            />

            <TransactionLine
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
                <span className="future-account-balance">
                    {$t('client.similarity.balance_after_merge')}&nbsp;
                    {props.formatCurrency(props.balanceAfterMerge)}
                </span>
                <span>
                    {$t('client.similarity.amount')}&nbsp;
                    {props.formatCurrency(toKeep.amount)}
                </span>

                <Popconfirm
                    trigger={
                        <button className="btn primary">
                            <span className="fa fa-compress" aria-hidden="true" />
                            <span className="merge-title">{$t('client.similarity.merge')}</span>
                        </button>
                    }
                    onConfirm={mergeOperations}
                    confirmText={$t('client.similarity.merge')}
                    confirmClass="warning">
                    <p>{$t('client.similarity.confirm')}</p>
                </Popconfirm>
            </div>
        </div>
    );
});
