import React, { useCallback, useMemo } from 'react';

import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';

import { assert, translate as $t, useKresusState } from '../../helpers';
import { get } from '../../store';

function noTypeFound(): string {
    return $t('client.transactions.no_type_found');
}

interface Props {
    // DOM id for the select element.
    id?: string;

    // The selected type id.
    value: string;

    // A callback to be called when the select value changes.
    onChange: (newValue: string) => void;

    // A CSS class to apply to the select.
    className?: string;
}

const TypeSelect = (props: Props) => {
    let className = 'form-element-block';
    if (props.className) {
        className += ` ${props.className}`;
    }

    const types = useKresusState(state => get.types(state));
    // TODO require that the parent provides the options instead! it ought to
    // be computed only once for the entire program.
    const options = useMemo(() => {
        return types.map(type => ({
            value: type.name,
            label: $t(`client.${type.name}`),
        }));
    }, [types]);

    const propsOnChange = props.onChange;
    const onChange = useCallback(
        (newVal: string | null) => {
            assert(newVal !== null, "type can't be null");
            propsOnChange(newVal);
        },
        [propsOnChange]
    );

    return (
        <FuzzyOrNativeSelect
            id={props.id}
            value={props.value}
            onChange={onChange}
            clearable={false}
            className={className}
            noOptionsMessage={noTypeFound}
            options={options}
        />
    );
};

TypeSelect.displayName = 'TypeSelect';

export default TypeSelect;
