import { useCallback, useContext } from 'react';
import { translate as $t, displayLabel, formatDate } from '../../helpers';
import { useGenericError } from '../../hooks';
import type { Transaction } from '../../models';
import { useKresusDispatch, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import * as CategoriesStore from '../../store/categories';
import * as DuplicatesStore from '../../store/duplicates';
import { Popconfirm } from '../ui';
import { Navigate } from 'react-router';

import URL from '../../urls';
import { DriverContext } from '../drivers';

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
        <div className="duplicate-transaction">
            <div>
                <h3>
                    {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: required by tooltipped */}
                    <span
                        className="tooltipped tooltipped-ne tooltipped-multiline"
                        aria-label={more}
                    >
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
    toKeep: Transaction;
    toRemove: Transaction;
    // When set, the pair is one the user chose to ignore: it can only be un-ignored.
    ignored?: boolean;
}) => {
    let { toKeep, toRemove } = props;
    const { ignored = false } = props;

    // The transaction to keep should usually be the one that's the most
    // recent.
    if (+toRemove.importDate > +toKeep.importDate) {
        [toRemove, toKeep] = [toKeep, toRemove];
    }

    const toKeepCategory = useKresusState(state =>
        CategoriesStore.fromId(state.categories, toKeep.categoryId)
    );
    const toRemoveCategory = useKresusState(state =>
        CategoriesStore.fromId(state.categories, toRemove.categoryId)
    );

    const driver = useContext(DriverContext);
    const dispatch = useKresusDispatch();
    const mergeTransactionsCb = useCallback(async () => {
        try {
            await dispatch(BanksStore.mergeTransactions({ toKeep, toRemove })).unwrap();
        } catch (err) {
            // TODO report properly
            window.alert(err);
        }
    }, [dispatch, toKeep, toRemove]);

    const ignoreCb = useGenericError(
        useCallback(async () => {
            await dispatch(
                DuplicatesStore.ignoreDuplicate({
                    accountId: toKeep.accountId,
                    transactionId: toKeep.id,
                    otherTransactionId: toRemove.id,
                })
            ).unwrap();
        }, [dispatch, toKeep, toRemove])
    );

    const unignoreCb = useGenericError(
        useCallback(async () => {
            await dispatch(
                DuplicatesStore.unignoreDuplicate({
                    accountId: toKeep.accountId,
                    transactionId: toKeep.id,
                    otherTransactionId: toRemove.id,
                })
            ).unwrap();
        }, [dispatch, toKeep, toRemove])
    );

    const key = `dpair-${toKeep.id}-${toRemove.id}`;

    if (toKeepCategory === null || toRemoveCategory === null) {
        return <Navigate to={URL.duplicates.url(driver)} />;
    }

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
                deletionInfo={ignored ? '' : $t('client.similarity.will_be_kept')}
            />

            <TransactionLine
                label={toRemove.label}
                customLabel={toRemove.customLabel}
                rawLabel={toKeep.rawLabel}
                date={toRemove.date}
                importDate={toRemove.importDate}
                categoryLabel={toRemoveCategory.label}
                type={toRemove.type}
                deletionInfo={ignored ? '' : $t('client.similarity.will_be_removed')}
            />

            <div className="toolbar">
                <span>
                    {$t('client.similarity.amount')}&nbsp;
                    {props.formatCurrency(toKeep.amount)}
                </span>

                {ignored ? (
                    <button type="button" className="btn primary" onClick={unignoreCb}>
                        <span className="fa fa-eye" aria-hidden="true" />
                        <span>{$t('client.similarity.unignore')}</span>
                    </button>
                ) : (
                    <>
                        <button type="button" className="btn" onClick={ignoreCb}>
                            <span className="fa fa-eye-slash" aria-hidden="true" />
                            <span>{$t('client.similarity.ignore')}</span>
                        </button>

                        <Popconfirm
                            trigger={
                                <button type="button" className="btn primary">
                                    <span className="fa fa-compress" aria-hidden="true" />
                                    <span className="merge-title">
                                        {$t('client.similarity.merge')}
                                    </span>
                                </button>
                            }
                            onConfirm={mergeTransactionsCb}
                            confirmText={$t('client.similarity.merge')}
                            confirmClass="warning"
                        >
                            <p>{$t('client.similarity.confirm')}</p>
                        </Popconfirm>
                    </>
                )}
            </div>
        </div>
    );
};

DuplicatePair.displayName = 'DuplicatePair';

export default DuplicatePair;
