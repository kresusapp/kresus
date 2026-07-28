import { useCallback } from 'react';
import * as React from 'react';
import { translate as $t, assert } from '../../helpers';

export type AmountKindType = 'all' | 'positive' | 'negative';

const AmountKindSelect = (props: {
    id?: string;

    // An initial value.
    defaultValue: AmountKindType;

    // A callback called whenever one of the inputs change.
    onChange: (val: AmountKindType) => void;
}) => {
    const propsOnChange = props.onChange;
    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const val = event.target.value;
            assert(
                val === 'all' || val === 'positive' || val === 'negative',
                'unexpected value for an AmountKindType'
            );
            propsOnChange(val);
        },
        [propsOnChange]
    );

    return (
        <select
            id={props.id}
            className="form-element-block"
            defaultValue={props.defaultValue}
            onChange={onChange}
        >
            <option key="all" value="all">
                {$t('client.charts.incomes_and_expenses')}
            </option>
            <option key="positive" value="positive">
                {$t('client.charts.incomes')}
            </option>
            <option key="negative" value="negative">
                {$t('client.charts.expenses')}
            </option>
        </select>
    );
};

AmountKindSelect.displayName = 'AmountKindSelect';

export default AmountKindSelect;
