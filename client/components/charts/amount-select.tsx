import React, { useCallback } from 'react';
import { translate as $t } from '../../helpers';

const AmountKindSelect = (props: {
    id?: string;

    // An initial value.
    defaultValue: string; // TODO could be 'all' | 'positive' | 'negative';

    // A callback called whenever one of the inputs change.
    onChange: (val: string) => void;
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
            id={props.id}
            className="form-element-block"
            defaultValue={props.defaultValue}
            onChange={onChange}>
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
