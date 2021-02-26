import React, { useCallback, useState } from 'react';

import { actions, get } from '../../store';
import { assert, translate as $t, useKresusState } from '../../helpers';

import {
    DEFAULT_CHART_DISPLAY_TYPE,
    DEFAULT_CHART_FREQUENCY,
    DEFAULT_CHART_PERIOD,
    DEFAULT_CHART_TYPE,
} from '../../../shared/settings';

import FrequencySelect from './frequency-select';
import { Form, Popform } from '../ui';
import { useDispatch } from 'react-redux';
import PeriodSelect from './period-select';
import AmountKindSelect from './amount-select';

const DefaultParams = () => {
    const initialAmountKind = useKresusState(state => get.setting(state, DEFAULT_CHART_TYPE));
    const initialDisplayType = useKresusState(state =>
        get.setting(state, DEFAULT_CHART_DISPLAY_TYPE)
    );
    const initialPeriod = useKresusState(state => get.setting(state, DEFAULT_CHART_PERIOD));
    const initialFrequency = useKresusState(state => get.setting(state, DEFAULT_CHART_FREQUENCY));

    const dispatch = useDispatch();

    const [amountKind, setAmountKind] = useState(initialAmountKind);
    const [displayType, setDisplayType] = useState(initialDisplayType);
    const [period, setPeriod] = useState(initialPeriod);

    assert(initialFrequency === 'monthly' || initialFrequency === 'yearly', 'only possible values');
    const [frequency, setFrequency] = useState<'monthly' | 'yearly'>(initialFrequency);

    const handleSubmit = useCallback(async () => {
        if (amountKind !== initialAmountKind) {
            await actions.setSetting(dispatch, DEFAULT_CHART_TYPE, amountKind);
        }
        if (displayType !== initialDisplayType) {
            await actions.setSetting(dispatch, DEFAULT_CHART_DISPLAY_TYPE, displayType);
        }
        if (period !== initialPeriod) {
            await actions.setSetting(dispatch, DEFAULT_CHART_PERIOD, period);
        }
        if (frequency !== initialFrequency) {
            await actions.setSetting(dispatch, DEFAULT_CHART_FREQUENCY, frequency);
        }
    }, [
        amountKind,
        initialAmountKind,
        displayType,
        initialDisplayType,
        period,
        initialPeriod,
        frequency,
        initialFrequency,
        dispatch,
    ]);

    const handleDisplayTypeChange = useCallback(
        event => {
            setDisplayType(event.target.value);
        },
        [setDisplayType]
    );

    return (
        <Popform
            small={false}
            trigger={
                <button className="btn">
                    <span>{$t('client.general.default_parameters')}</span>
                </button>
            }
            confirmClass="success"
            onConfirm={handleSubmit}>
            <Form.Input id="default-display-type" label={$t('client.charts.default_display')}>
                <select onChange={handleDisplayTypeChange} defaultValue={displayType}>
                    <option value="all">{$t('client.charts.by_category')}</option>
                    <option value="balance">{$t('client.charts.balance')}</option>
                    <option value="earnings">{$t('client.charts.differences_all')}</option>
                </select>
            </Form.Input>

            <h4>{$t('client.charts.category_chart')}</h4>

            <Form.Input id="default-params" label={$t('client.charts.default_amount_type')}>
                <AmountKindSelect defaultValue={amountKind} onChange={setAmountKind} />
            </Form.Input>

            <Form.Input id="default-chart-period" label={$t('client.charts.default_period')}>
                <PeriodSelect defaultValue={period} onChange={setPeriod} />
            </Form.Input>

            <h4>{$t('client.charts.in_out_chart')}</h4>

            <Form.Input id="default-chart-frequency" label={$t('client.charts.default_frequency')}>
                <FrequencySelect value={frequency} onChange={setFrequency} />
            </Form.Input>
        </Popform>
    );
};

DefaultParams.displayName = 'ChartsDefaultParams';

export default DefaultParams;
