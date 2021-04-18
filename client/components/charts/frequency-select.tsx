import React, { useCallback } from 'react';
import { translate as $t } from '../../helpers';

const FrequencySelect = (props: {
    // Initial value.
    value: 'monthly' | 'yearly';

    // Callback getting the id of the selected option whenever it changes.
    onChange: (val: 'monthly' | 'yearly') => void;

    // Label id.
    id?: string;
}) => {
    const propsOnChange = props.onChange;
    const onChange = useCallback(
        event => {
            propsOnChange(event.target.value);
        },
        [propsOnChange]
    );

    return (
        <select
            className="form-element-block"
            value={props.value}
            onChange={onChange}
            id={props.id}>
            <option key="monthly" value="monthly">
                {$t('client.charts.monthly')}
            </option>
            <option key="yearly" value="yearly">
                {$t('client.charts.yearly')}
            </option>
        </select>
    );
};

FrequencySelect.displayName = 'FrequencySelect';

export default FrequencySelect;
