import React from 'react';

import { translate as $t } from '../../helpers';

import SelectWithDefault from './select-with-default';

export default class OpCatChartPeriodSelect extends SelectWithDefault {

    constructor(props) {
        let options = [
            <option key="value" value="all">
                { $t('client.charts.all_periods') }
            </option>,
            <option key="current-month" value="current-month">
                { $t('client.charts.current_month') }
            </option>,
            <option key="last-month" value="last-month">
                { $t('client.charts.last_month') }
            </option>,
            <option key="3-months" value="3-months">
                { $t('client.charts.three_months') }
            </option>,
            <option key="6-months" value="6-months">
                { $t('client.charts.six_months') }
            </option>
        ];
        super(props, options);
    }

}
