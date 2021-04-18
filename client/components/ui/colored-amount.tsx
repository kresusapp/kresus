import React from 'react';

import './colored-amount.css';

const ColoredAmount = (props: {
    // The amount to be displayed.
    amount: number;

    // A function to format the amount according to currency rules.
    formatCurrency: (val: number) => string;
}) => {
    const { amount, formatCurrency } = props;

    // Ensure 0.00 and -0.00 are displayed the same.
    const colorClass = amount < 0 && Math.abs(amount) >= 0.001 ? 'negative' : 'positive';
    return <span className={`colored-amount ${colorClass}`}>{formatCurrency(amount)}</span>;
};

ColoredAmount.displayName = 'ColoredAmount';

export default ColoredAmount;
