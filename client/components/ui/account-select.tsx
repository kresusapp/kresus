import React, { useCallback, useImperativeHandle, useRef } from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { displayLabel, translate as $t } from '../../helpers';

interface Props {
    // An Access id, which will limit accounts to the related access, if provided.
    accessId?: number;

    // HTML identifier, to match with a label element.
    id?: string;

    // Exclude some accounts ids
    exclude?: number[];

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

        const accessIds =
            typeof props.accessId === 'number'
                ? [props.accessId]
                : BanksStore.getAccessIds(state.banks);
        for (const accessId of accessIds) {
            const accountIds = BanksStore.accountIdsByAccessId(state.banks, accessId);
            const access = BanksStore.accessById(state.banks, accessId);
            const prefix = typeof props.accessId !== 'number' ? `${displayLabel(access)} − ` : '';
            for (const accountId of accountIds) {
                if (props.exclude && props.exclude.includes(accountId)) {
                    continue;
                }

                const account = BanksStore.accountById(state.banks, accountId);
                ret.push({
                    key: account.id,
                    label: `${prefix}${displayLabel(account)}`,
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
