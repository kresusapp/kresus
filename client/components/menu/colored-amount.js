import React from 'react';
import PropTypes from 'prop-types';

const ColoredAmount = props => {
    let { amount, formatCurrency } = props;

    // Ensure 0.00 and -0.00 are displayed the same.
    amount = Math.abs(amount) < 0.001 ? 0 : amount;
    let colorClass = amount < 0 ? 'negative' : 'positive';
    return <span className={`amount ${colorClass}`}>{formatCurrency(amount)}</span>;
};

ColoredAmount.propTypes = {
    // The amount to be displayed.
    amount: PropTypes.number.isRequired,

    // A function to format the amount according to currency rules.
    formatCurrency: PropTypes.func.isRequired
};

export default ColoredAmount;
