import React, { useCallback } from 'react';
import { translate as $t } from '../../helpers';

const PeriodSelect = (props: {
    // Initial value.
    defaultValue: string; // TODO could be 'all' | 'current-month' |
    // 'last-month' | '3-months' | '6-months' | 'current-year' | 'last-year';

    // Callback getting the id of the selected option whenever it changes.
    onChange: (val: string) => void;

    // DOM element identifier.
    id?: string;
}) => {
    const propsOnChange = props.onChange;
    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            propsOnChange(event.target.value);
        },
        [propsOnChange]
    );
    return (
        <select
            className="form-element-block"
            defaultValue={props.defaultValue}
            onChange={onChange}
            id={props.id}>
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
            <option key="current-year" value="current-year">
                {$t('client.charts.current_year')}
            </option>
            <option key="last-year" value="last-year">
                {$t('client.charts.last_year')}
            </option>
        </select>
    );
};

PeriodSelect.displayName = 'PeriodSelect';

export default PeriodSelect;
