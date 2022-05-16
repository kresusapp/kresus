import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, formatDate, displayLabel, useKresusState } from '../../helpers';
import { Popconfirm } from '../ui';
import { Operation } from '../../models';

const TransactionLine = (props: {
    label: string;
    customLabel: string | null;
    rawLabel: string;
    date: Date;
    importDate: Date;
    categoryLabel: string;
    type: string;
    deletionInfo: string;
}) => {
    const label = displayLabel(props);
    const more = props.customLabel ? `${props.label} (${props.rawLabel})` : props.rawLabel;

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

const DuplicatePair = (props: {
    formatCurrency: (val: number) => string;
    toKeep: Operation;
    toRemove: Operation;
}) => {
    let { toKeep, toRemove } = props;

    // The operation to keep should usually be the one that's the most
    // recent.
    if (+toRemove.importDate > +toKeep.importDate) {
        [toRemove, toKeep] = [toKeep, toRemove];
    }

    const toKeepCategory = useKresusState(state => get.categoryById(state, toKeep.categoryId));
    const toRemoveCategory = useKresusState(state => get.categoryById(state, toRemove.categoryId));

    const dispatch = useDispatch();
    const mergeOperations = useCallback(async () => {
        try {
            await actions.mergeOperations(dispatch, toKeep, toRemove);
        } catch (err) {
            // TODO report properly
            window.alert(err);
        }
    }, [dispatch, toKeep, toRemove]);

    const key = `dpair-${toKeep.id}-${toRemove.id}`;

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
};

DuplicatePair.displayName = 'DuplicatePair';

export default DuplicatePair;
