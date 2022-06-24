import React, { useCallback, useImperativeHandle, useRef } from 'react';

import { get } from '../../store';
import { displayLabel, translate as $t, useKresusState } from '../../helpers';

interface Props {
    // HTML identifier, to match with a label element.
    id?: string;

    // Initial value.
    initial?: number;

    // Should we include None in the list or not?
    includeNone?: boolean;

    // Called whenever the value has changed. Useful for sync forms with an
    // initial value; otherwise, using the ref value is more adequate.
    onChange?: (key: number) => void;
}

type Label = {
    key: number;
    label: string;
};

const AccountSelector = React.forwardRef<{ value: number }, Props>((props, ref) => {
    const labels = useKresusState(state => {
        const ret: Label[] = [];
        if (props.includeNone) {
            ret.push({
                key: -1,
                label: $t('client.account-select.none'),
            });
        }
        for (const accessId of get.accessIds(state)) {
            const accountIds = get.accountIdsByAccessId(state, accessId);
            const access = get.accessById(state, accessId);
            for (const accountId of accountIds) {
                const account = get.accountById(state, accountId);
                ret.push({
                    key: account.id,
                    label: `${displayLabel(access)} − ${displayLabel(account)}`,
                });
            }
        }
        return ret;
    });

    const { onChange: propsOnChange } = props;
    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            event.stopPropagation();
            if (propsOnChange) {
                propsOnChange(+event.target.value);
            }
        },
        [propsOnChange]
    );

    const internalRef = useRef<HTMLSelectElement>(null);

    // Emulate a select's ref current.value by adjusting its return type to
    // be a number.
    // TODO clean this up, and only allow the parent to control the value here.
    useImperativeHandle(ref, () => ({
        get value() {
            return +(internalRef.current as HTMLSelectElement).value;
        },
    }));

    const options = labels.map(pair => (
        <option key={pair.key} value={pair.key}>
            {pair.label}
        </option>
    ));

    return (
        <select
            ref={internalRef}
            id={props.id}
            className="form-element-block"
            defaultValue={props.initial}
            onChange={onChange}>
            {options}
        </select>
    );
});

AccountSelector.displayName = 'AccountSelector';

export default AccountSelector;
