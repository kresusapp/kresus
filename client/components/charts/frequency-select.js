import React from 'react';
import PropTypes from 'prop-types';
import { translate as $t } from '../../helpers';

const FrequencySelect = props => {
    let onChange = event => {
        props.onChange(event.target.value);
    };

    return (
        <select
            className="form-element-block"
            value={props.value}
            onChange={onChange}
            id={props.htmlId}>
            <option key="monthly" value="monthly">
                {$t('client.charts.monthly')}
            </option>
            <option key="yearly" value="yearly">
                {$t('client.charts.yearly')}
            </option>
        </select>
    );
};

FrequencySelect.propTypes = {
    // Initial value.
    value: PropTypes.oneOf(['monthly', 'yearly']),

    // Callback getting the id of the selected option whenever it changes.
    onChange: PropTypes.func.isRequired,

    // Label id.
    htmlId: PropTypes.string.isRequired,
};

export default FrequencySelect;
