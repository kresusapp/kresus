import React, { useCallback } from 'react';
import { translate as $t } from '../../helpers';

export const ALL_CURRENCIES = '';

export default (props: {
    // Show we allow "ALL" or not in the selector?
    allowMultiple: boolean;

    // Current currency id.
    value: string;

    // All possible currencies.
    currencies: string[];

    onChange: (currency: string) => void;
}) => {
    const options = [];
    if (props.allowMultiple) {
        options.push(
            <option key={ALL_CURRENCIES} value={ALL_CURRENCIES}>
                {$t('client.charts.all_currencies')}
            </option>
        );
    }

    for (const currency of props.currencies) {
        options.push(
            <option key={currency} value={currency}>
                {currency}
            </option>
        );
    }

    const propsOnChange = props.onChange;
    const onChange = useCallback(
        e => {
            propsOnChange(e.target.value);
        },
        [propsOnChange]
    );

    return (
        <select className="form-element-block" onChange={onChange} value={props.value}>
            {options}
        </select>
    );
};
