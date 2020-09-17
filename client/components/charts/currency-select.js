import React from 'react';
import { translate as $t } from '../../helpers';

export const ALL_CURRENCIES = '';

// Props:
// - allowMultiple (bool): allow "ALL" in the selector.
// - value (string): current currency id.
// - currencies ([string]): all the possible currencies.
// - onChange: function(currency)
export default props => {
    let options = [];
    if (props.allowMultiple) {
        options.push(
            <option key={ALL_CURRENCIES} value={ALL_CURRENCIES}>
                {$t('client.charts.all_currencies')}
            </option>
        );
    }

    for (let currency of props.currencies) {
        options.push(
            <option key={currency} value={currency}>
                {currency}
            </option>
        );
    }

    let onChange = e => {
        props.onChange(e.target.value);
    };

    return (
        <select className="form-element-block" onChange={onChange} value={props.value}>
            {options}
        </select>
    );
};
