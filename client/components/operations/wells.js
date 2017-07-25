import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { translate as $t,
         wellsColors,
         formatDate } from '../../helpers';

import { get } from '../../store';

import AmountWell from './amount-well';

const { BALANCE, RECEIVED, SPENT, SAVED } = wellsColors;

function computeTotal(state, operations, filterFunction, initial = 0) {
    let sum = get.sumOperationsFromIds(state,
                                   get.filterOperations(state, operations, filterFunction),
                                   initial);
    return Math.round(100 * sum) / 100;
}

const Wells = props => {
    return (
        <div className="operation-wells">
            <AmountWell
              backgroundColor={ BALANCE }
              icon="balance-scale"
              title={ $t('client.operations.current_balance') }
              subtitle={ props.lastCheckDate }
              content={ props.balance }
            />

            <AmountWell
              backgroundColor={ RECEIVED }
              icon="arrow-down"
              title={ $t('client.operations.received') }
              subtitle={ props.filteredSub }
              content={ props.earningsSum }
            />

            <AmountWell
              backgroundColor={ SPENT }
              icon="arrow-up"
              title={ $t('client.operations.spent') }
              subtitle={ props.filteredSub }
              content={ props.spendingsSum }
            />

            <AmountWell
              backgroundColor={ SAVED }
              icon="database"
              title={ $t('client.operations.saved') }
              subtitle={ props.filteredSub }
              content={ props.savingSum }
            />
        </div>
    );

};

const Export = connect((state, props) => {
    const { account } = props;
    const filteredOperations = get.filteredOperationsByAccountId(state, account.id);
    const currentMonthOperations = get.currentMonthOperations(state, account.id);
    const hasSearchFields = get.hasSearchFields(state);

    // Operations to be considered to compute the wells sums.
    let wellOperations;

    // Subtitle of earnings, spendings and saving wells.
    let filteredSub;

    if (hasSearchFields) {
        wellOperations = filteredOperations;
        filteredSub = $t('client.amount_well.current_search');
    } else {
        wellOperations = currentMonthOperations;
        filteredSub = $t('client.amount_well.this_month');
    }

    const { formatCurrency } = account;

    // Sum to be displayed in the earnings well.
    const earningsSum = computeTotal(state, wellOperations, x => x.amount > 0, 0);

    // Sum to be displayed in the spendings well.
    const spendingsSum = computeTotal(state, wellOperations, x => x.amount < 0, 0);

    // Sum to be displayed in the savings well.
    const savingSum = earningsSum + spendingsSum;

    // Balance of the current account.
    const balance = get.balanceByAccountId(state, props.account.id);

    // Date of the last sync.
    let asOf = $t('client.operations.as_of');
    let lastCheckedDate = formatDate.toShortString(props.account.lastChecked);
    let lastCheckDate = `${asOf} ${lastCheckedDate}`;

    return {
        filteredSub,
        earningsSum: formatCurrency(earningsSum),
        spendingsSum: formatCurrency(spendingsSum),
        savingSum: formatCurrency(savingSum),
        balance: formatCurrency(balance),
        lastCheckDate
    };
})(Wells);

Export.propTypes = {
    account: PropTypes.object.isRequired
};

export default Export;
