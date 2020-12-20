import React, { useCallback, useImperativeHandle, useRef } from 'react';
import { connect } from 'react-redux';

import { get, GlobalState } from '../../store';
import { displayLabel, translate as $t } from '../../helpers';

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

export default connect(
    (state: GlobalState, props: Props) => {
        const labels: Label[] = [];
        if (props.includeNone) {
            labels.push({
                key: -1,
                label: $t('client.account-select.none'),
            });
        }
        for (const accessId of get.accessIds(state)) {
            const accountIds = get.accountIdsByAccessId(state, accessId);
            const access = get.accessById(state, accessId);
            for (const accountId of accountIds) {
                const account = get.accountById(state, accountId);
                labels.push({
                    key: account.id,
                    label: `${displayLabel(access)} − ${displayLabel(account)}`,
                });
            }
        }
        return {
            labels,
        };
    },
    null,
    null,
    { forwardRef: true }
)(
    React.forwardRef<{ value: number }, Props & { labels: Label[] }>((props, ref) => {
        const { onChange: parentOnChange } = props;

        const onChange = useCallback(
            event => {
                event.stopPropagation();
                if (parentOnChange) {
                    parentOnChange(+event.target.value);
                }
            },
            [parentOnChange]
        );

        const internalRef = useRef<HTMLSelectElement>(null);

        // Emulate a select's ref current.value by adjusting its return type to
        // be a number.
        useImperativeHandle(ref, () => ({
            get value() {
                return +(internalRef.current as HTMLSelectElement).value;
            },
        }));

        const options = props.labels.map(pair => (
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
    })
);
