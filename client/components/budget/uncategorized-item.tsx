import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { actions } from '../../store';

import { NONE_CATEGORY_ID, translate as $t } from '../../helpers';

interface UncategorizedTransactionsItemProps {
    amount: number;
    currentAccountId: number;
    showOperations: (categoryId: number) => void;
    showSearchDetails: () => void;
}

const UncategorizedTransactionsItem = (props: UncategorizedTransactionsItemProps) => {
    function handleViewOperations() {
        props.showOperations(NONE_CATEGORY_ID);
        props.showSearchDetails();
    }

    return (
        <tr>
            <td className="category-name">{$t('client.budget.uncategorized')}</td>
            <td className="category-amount align-center">{props.amount}</td>
            <td className="category-threshold align-right">-</td>
            <td className="category-diff amount">-</td>
            <td className="category-button">
                <Link to={`/reports/${props.currentAccountId}`} onClick={handleViewOperations}>
                    <i
                        className="btn info fa fa-search"
                        title={$t('client.budget.see_operations')}
                    />
                </Link>
            </td>
        </tr>
    );
};

const Export = connect(null, dispatch => ({
    showSearchDetails: () => actions.toggleSearchDetails(dispatch, true),
}))(UncategorizedTransactionsItem);
export default Export;
