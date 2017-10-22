import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

const OpCatChartPeriodSelect = props => {
    return (
        <select
            className="form-control"
            defaultValue={props.defaultValue}
            onChange={props.onChange}
            id={props.htmlId}>
            <option key="value" value="all">
                {$t('client.charts.all_periods')}
            </option>
            <option key="current-month" value="current-month">
                {$t('client.charts.current_month')}
            </option>
            <option key="last-month" value="last-month">
                {$t('client.charts.last_month')}
            </option>
            <option key="3-months" value="3-months">
                {$t('client.charts.three_months')}
            </option>
            <option key="6-months" value="6-months">
                {$t('client.charts.six_months')}
            </option>
        </select>
    );
};

OpCatChartPeriodSelect.propTypes = {
    // Initial value.
    defaultValue: PropTypes.string.isRequired,

    // Callback getting the id of the selected option whenever it changes.
    onChange: PropTypes.func.isRequired,

    // CSS unique id.
    htmlId: PropTypes.string.isRequired
};

export default OpCatChartPeriodSelect;
