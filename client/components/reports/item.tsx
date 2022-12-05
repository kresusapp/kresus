import React, { useCallback, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';

import { formatDate, NONE_CATEGORY_ID, translate as $t, useKresusState } from '../../helpers';
import { get } from '../../store';
import TransactionUrls from '../transactions/urls';

import { ViewContext } from '../drivers';
import LabelComponent from './label';
import DisplayIf, { IfNotMobile } from '../ui/display-if';
import OperationTypeSelect from './editable-type-select';
import CategorySelect from './editable-category-select';

import useLongPress from '../ui/use-longpress';

const BudgetIcon = (props: { budgetDate: Date | null; date: Date }) => {
    if (props.budgetDate === null || +props.budgetDate === +props.date) {
        return null;
    }
    let budgetIcon, budgetTitle;
    if (+props.budgetDate < +props.date) {
        budgetIcon = 'fa-calendar-minus-o';
        budgetTitle = $t('client.operations.previous_month_budget');
    } else {
        budgetIcon = 'fa-calendar-plus-o';
        budgetTitle = $t('client.operations.following_month_budget');
    }
    return <i className={`operation-assigned-to-budget fa ${budgetIcon}`} title={budgetTitle} />;
};

interface OperationItemProps {
    // The operation's unique identifier this item is representing.
    operationId: number;

    inBulkEditMode: boolean;

    // Is this operation checked for bulk edit.
    bulkEditStatus: boolean;

    // A method to compute the currency.
    formatCurrency: (val: number) => string;

    toggleBulkItem: (transactionId: number) => void;
}

// As the Operation component is meant to be passed to the withLongPress HOC,
// it has to be non functional.
export const OperationItem = React.forwardRef<HTMLTableRowElement, OperationItemProps>(
    (props, ref) => {
        const view = useContext(ViewContext);

        // TODO rename
        const transaction = useKresusState(state => get.operationById(state, props.operationId));
        const categoryColor = useKresusState(state => {
            if (transaction.categoryId === NONE_CATEGORY_ID) {
                return null;
            }
            return get.categoryById(state, transaction.categoryId).color;
        });

        const { toggleBulkItem, operationId } = props;
        const handleToggleBulkEdit = useCallback(() => {
            toggleBulkItem(operationId);
        }, [toggleBulkItem, operationId]);

        const rowClassName = transaction.amount > 0 ? 'income' : '';

        let maybeBorder;
        if (categoryColor) {
            maybeBorder = { borderRight: `5px solid ${categoryColor}` };
        }

        return (
            <tr ref={ref} style={maybeBorder} className={rowClassName}>
                <IfNotMobile>
                    <td className="details-button">
                        <DisplayIf condition={!props.inBulkEditMode}>
                            <Link
                                to={TransactionUrls.details.url(view.driver, transaction.id)}
                                title={$t('client.operations.show_details')}>
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
                        <OperationTypeSelect
                            operationId={transaction.id}
                            value={transaction.type}
                            className="light"
                        />
                    </td>
                </IfNotMobile>

                <td>
                    <LabelComponent item={transaction} inputClassName="light" />
                </td>
                <td className="amount">{props.formatCurrency(transaction.amount)}</td>
                <IfNotMobile>
                    <td className="category">
                        <CategorySelect
                            operationId={transaction.id}
                            value={transaction.categoryId}
                            className="light"
                        />
                    </td>
                </IfNotMobile>
            </tr>
        );
    }
);

export const PressableOperationItem = (props: OperationItemProps) => {
    const { operationId } = props;
    const history = useHistory();

    const { driver } = useContext(ViewContext);

    const onLongPress = useCallback(
        () => history.push(TransactionUrls.details.url(driver, operationId)),
        [history, operationId, driver]
    );

    const ref = useLongPress<HTMLTableRowElement>(onLongPress);

    return <OperationItem ref={ref} {...props} />;
};
