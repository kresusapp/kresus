import React, { useCallback, useImperativeHandle, useRef } from 'react';

import { useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import { displayLabel, translate as $t } from '../../helpers';
import { Account } from '../../models';

interface AccountSelectorProps {
    // A list of accounts
    accounts: Account[];

    // HTML identifier, to match with a label element.
    id?: string;

    // Initial value.
    initial?: number;

    // Should we include None in the list or not?
    includeNone?: boolean;

    // Should we display the access label as well?
    hideAccessLabel?: boolean;

    // Called whenever the value has changed. Useful for sync forms with an
    // initial value; otherwise, using the ref value is more adequate.
    onChange?: (key: number) => void;
}

interface AnyAccountSelectorProps extends Omit<AccountSelectorProps, 'accounts'> {
    // An Access id, which will limit accounts to the related access, if provided.
    accessId?: number;

    // Exclude some accounts ids
    exclude?: number[];
}

type Label = {
    key: number;
    label: string;
};

export const AccountSelector = React.forwardRef<{ value: number }, AccountSelectorProps>(
    (props, ref) => {
        const labels = useKresusState(state => {
            const ret: Label[] = [];
            if (props.includeNone) {
                ret.push({
                    key: -1,
                    label: $t('client.account-select.none'),
                });
            }

            for (const account of props.accounts) {
                const access = BanksStore.accessById(state.banks, account.accessId);
                const prefix = !props.hideAccessLabel ? `${displayLabel(access)} − ` : '';

                ret.push({
                    key: account.id,
                    label: `${prefix}${displayLabel(account)}`,
                });
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
    }
);

AccountSelector.displayName = 'AccountSelector';

const AnyAccountSelector = React.forwardRef<{ value: number }, AnyAccountSelectorProps>(
    (props, ref) => {
        const hideAccessPrefix = typeof props.accessId === 'number';

        const accounts = useKresusState(state => {
            const accessIds =
                typeof props.accessId === 'number'
                    ? [props.accessId]
                    : BanksStore.getAccessIds(state.banks);

            const accountsIds = accessIds
                .map(accessId => {
                    return BanksStore.accountIdsByAccessId(state.banks, accessId);
                })
                .flat();

            return accountsIds
                .filter(accountId => {
                    if (props.exclude && props.exclude.includes(accountId)) {
                        return false;
                    }

                    return true;
                })
                .map(accountId => {
                    return BanksStore.accountById(state.banks, accountId);
                });
        });

        return (
            <AccountSelector
                ref={ref}
                id={props.id}
                initial={props.initial}
                includeNone={props.includeNone}
                onChange={props.onChange}
                accounts={accounts}
                hideAccessLabel={hideAccessPrefix}
            />
        );
    }
);

AnyAccountSelector.displayName = 'AnyAccountSelector';

export default AnyAccountSelector;
