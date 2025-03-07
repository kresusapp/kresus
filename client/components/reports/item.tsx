import React, { useCallback, useContext, useRef, useImperativeHandle } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { displayLabel, formatDate, NONE_CATEGORY_ID, notify, translate as $t } from '../../helpers';
import { useKresusDispatch, useKresusState } from '../../store';
import * as CategoriesStore from '../../store/categories';
import * as BanksStore from '../../store/banks';
import TransactionUrls from '../transactions/urls';

import { DriverContext } from '../drivers';
import LabelComponent from './label';
import DisplayIf, { IfMobile, IfNotMobile } from '../ui/display-if';
import TransactionTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';

import { useTableRowSwipeDetection } from '../ui/use-swipe';

const BudgetIcon = (props: { budgetDate: Date | null; date: Date }) => {
    if (props.budgetDate === null || +props.budgetDate === +props.date) {
        return null;
    }
    let budgetIcon, budgetTitle;
    if (+props.budgetDate < +props.date) {
        budgetIcon = 'fa-calendar-minus-o';
        budgetTitle = $t('client.transactions.previous_month_budget');
    } else {
        budgetIcon = 'fa-calendar-plus-o';
        budgetTitle = $t('client.transactions.following_month_budget');
    }
    return <i className={`transaction-assigned-to-budget fa ${budgetIcon}`} title={budgetTitle} />;
};

interface TransactionItemProps {
    // The transaction's unique identifier this item is representing.
    transactionId: number;

    inBulkEditMode: boolean;

    // Is this transaction checked for bulk edit.
    bulkEditStatus: boolean;

    // A method to compute the currency.
    formatCurrency: (val: number) => string;

    toggleBulkItem: (transactionId: number) => void;
}

interface TransactionRef extends HTMLTableRowElement {
    openDetailsView: () => void;
    delete: () => void;
}

export const TransactionItem = React.forwardRef<TransactionRef, TransactionItemProps>(
    (props, ref) => {
        const innerDomRef = useRef<any>();
        const driver = useContext(DriverContext);
        const history = useHistory();
        const dispatch = useKresusDispatch();

        const transaction = useKresusState(state => {
            // Detect zombie child.
            return BanksStore.transactionExists(state.banks, props.transactionId)
                ? BanksStore.transactionById(state.banks, props.transactionId)
                : null;
        });

        const formatCurrency = useKresusState(state => driver.getCurrencyFormatter(state));

        // Expose some methods related to the transactions.
        useImperativeHandle(
            ref,
            () => {
                return Object.assign(innerDomRef.current, {
                    openDetailsView() {
                        if (!transaction) {
                            return;
                        }

                        history.push(TransactionUrls.details.url(driver, transaction.id));
                    },

                    async delete() {
                        if (!transaction) {
                            return;
                        }

                        const confirmMessage = $t('client.transactions.are_you_sure', {
                            label: displayLabel(transaction),
                            amount: formatCurrency(transaction.amount),
                            date: formatDate.toDayString(transaction.date),
                        });

                        if (window.confirm(confirmMessage)) {
                            try {
                                await dispatch(
                                    BanksStore.deleteTransaction(transaction.id)
                                ).unwrap();
                                notify.success($t('client.transactions.deletion_success'));
                            } catch (error) {
                                notify.error($t('client.transactions.deletion_error'));
                            }
                        }
                    },
                });
            },
            [dispatch, transaction, history, driver, formatCurrency]
        );

        const categoryColor = useKresusState(state => {
            if (!transaction || transaction.categoryId === NONE_CATEGORY_ID) {
                return null;
            }
            return CategoriesStore.fromId(state.categories, transaction.categoryId).color;
        });

        const isFromManualAccess = useKresusState(state => {
            if (!transaction) {
                return false;
            }

            return BanksStore.isAccountFromManualAccess(state.banks, transaction.accountId);
        });

        const { toggleBulkItem, transactionId } = props;
        const handleToggleBulkEdit = useCallback(() => {
            toggleBulkItem(transactionId);
        }, [toggleBulkItem, transactionId]);

        if (!transaction) {
            return null;
        }

        const rowClasses = [];
        if (transaction.amount > 0) {
            rowClasses.push('income');
        }

        if (
            !isFromManualAccess &&
            (transaction.createdByUser || transaction.isRecurrentTransaction)
        ) {
            rowClasses.push('user-generated');
        }

        return (
            <tr ref={innerDomRef} className={rowClasses.join(' ')}>
                <IfMobile>
                    <td className="swipeable-action swipeable-action-left">
                        <span>{$t('client.general.details')}</span>
                        <span className="fa fa-eye" />
                    </td>
                </IfMobile>
                <IfNotMobile>
                    <td className="details-button">
                        <DisplayIf condition={!props.inBulkEditMode}>
                            <Link
                                to={TransactionUrls.details.url(driver, transaction.id)}
                                title={$t('client.transactions.show_details')}>
                                <span className="fa fa-plus-square" />
                            </Link>
                        </DisplayIf>
                        <DisplayIf condition={props.inBulkEditMode}>
                            <input
                                onChange={handleToggleBulkEdit}
                                checked={props.bulkEditStatus}
                                type="checkbox"
                            />
                        </DisplayIf>
                    </td>
                </IfNotMobile>
                <td className="date">
                    <span>{formatDate.toShortDayMonthString(transaction.date)}</span>
                    <IfNotMobile>
                        <BudgetIcon budgetDate={transaction.budgetDate} date={transaction.date} />
                    </IfNotMobile>
                </td>
                <IfNotMobile>
                    <td className="type">
                        <TransactionTypeSelect
                            transactionId={transaction.id}
                            value={transaction.type}
                            className="light"
                        />
                    </td>
                </IfNotMobile>

                <td>
                    <LabelComponent item={transaction} inputClassName="light" />
                </td>
                <td className="amount">{props.formatCurrency(transaction.amount)}</td>
                <td className="category">
                    <IfNotMobile>
                        <CategorySelect
                            transactionId={transaction.id}
                            value={transaction.categoryId}
                            className="light"
                        />
                    </IfNotMobile>
                    <span
                        className="categoryColor"
                        style={{ backgroundColor: categoryColor || '' }}
                    />
                </td>

                <IfMobile>
                    <td className="swipeable-action swipeable-action-right">
                        <span className="fa fa-trash" />
                        <span>{$t('client.general.delete')}</span>
                    </td>
                </IfMobile>
            </tr>
        );
    }
);

export const SwipeableTransactionItem = (props: TransactionItemProps) => {
    let ref: React.RefObject<TransactionRef> | null = null;

    const openTransactionDetails = useCallback(async () => {
        if (!ref || !ref.current) {
            return;
        }

        ref.current.openDetailsView();
    }, [ref]);

    const deleteTransaction = useCallback(async () => {
        if (!ref || !ref.current) {
            return;
        }

        await ref.current.delete();
    }, [ref]);

    ref = useTableRowSwipeDetection<TransactionRef>(
        deleteTransaction,
        openTransactionDetails,
        '.label-component-container'
    );

    return <TransactionItem ref={ref} {...props} />;
};
