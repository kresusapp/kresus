import React, { forwardRef, useCallback, useImperativeHandle, useState, useReducer } from 'react';

import { translate as $t } from '../../helpers';
import { useEffectUpdate } from '../../hooks';
import DisplayIf from './display-if';

function extractValueFromText(
    realValue: string | undefined,
    isCurrentlyNegative: boolean,
    allowToggleSign: boolean
) {
    let valueWithPeriod = realValue ? realValue.trim().replace(',', '.') : '';

    // Keep only the first period
    valueWithPeriod = valueWithPeriod.split('.').splice(0, 2).join('.');

    // Get the period and the zeroes at the end of the input.
    // When the user types "10.05" char by char, when the value is "10.0", it
    // will be transformed to 10, so we must remember what is after the decimal
    // separator so that the user can add "5" at the end to type "10.05".
    const match = valueWithPeriod.match(/\.\d*0*$/);
    const afterPeriod = match ? match[0] : '';

    let value = Number.parseFloat(valueWithPeriod);

    let isNegative = isCurrentlyNegative;
    if (allowToggleSign && typeof realValue === 'string') {
        if (realValue[0] === '+') {
            isNegative = false;
        } else if (realValue[0] === '-') {
            isNegative = true;
        }
    }

    if (!Number.isNaN(value) && Number.isFinite(value) && 1 / value !== -Infinity) {
        // Change the sign only in case the user set a negative value in the input
        if (allowToggleSign && Math.sign(value) === -1) {
            isNegative = true;
        }
        value = Math.abs(value);
    } else {
        value = NaN;
    }

    return {
        isNegative,
        value,
        afterPeriod,
    };
}

export const testing = {
    extractValueFromText,
};

export interface AmountInputRef {
    clear: () => void;
    reset: () => void;
}

interface AmountInputProps {
    // Input id.
    id?: string;

    // Function to handle change in the input.
    onChange?: (value: number | null) => void;

    // Function to handle the validation of the input by the user: on blur, on
    // hitting 'Enter' or when the sign has changed.
    onInput?: (value: number | null) => void;

    // Id for the sign span.
    signId: string;

    // Whether validity of the field value should be shown or not.
    checkValidity?: boolean;

    // Default sign of the input.
    initiallyNegative?: boolean;

    // Default value of the input, type string is necessary to set a default empty value.
    defaultValue?: number | null;

    // Whether the amount can be signed (true) or has to be non-negative (false).
    togglable?: boolean;

    // Extra class names to pass to the input.
    className?: string;

    // A symbol to display for the currency.
    currencySymbol?: string;
}

const AmountInput = forwardRef<AmountInputRef, AmountInputProps>((props, ref) => {
    const initiallyNegative =
        typeof props.initiallyNegative !== 'undefined' ? props.initiallyNegative : true;
    const togglable = typeof props.togglable !== 'undefined' ? props.togglable : true;
    const defaultValue = typeof props.defaultValue === 'number' ? props.defaultValue : null;

    const [isNegative, setIsNegative] = useState(initiallyNegative);
    const [isNegativeObserver, dispatchSetIsNegative] = useReducer((x: number) => x + 1, 0);

    const [value, setValue] = useState<number | null>(defaultValue);
    const [changeObserver, dispatchChange] = useReducer((x: number) => x + 1, 0);

    const [afterPeriod, setAfterPeriod] = useState('');

    const getValue = useCallback(() => {
        if (value === null) {
            return value;
        }
        return isNegative ? -value : value;
    }, [isNegative, value]);

    // Calls the parent listeners on onChange events.
    const { onChange: propsOnChange, onInput: propsOnInput } = props;
    const onChange = useCallback(() => {
        if (typeof propsOnChange === 'function') {
            propsOnChange(getValue());
        }
    }, [propsOnChange, getValue]);

    // Calls the parent listeners on onBlur/onKey=Enter events.
    const onInput = useCallback(() => {
        if (typeof propsOnInput === 'function') {
            propsOnInput(getValue());
        }
    }, [propsOnInput, getValue]);

    // Handles onKey=enter. Note that onInput() will be called by the resulting
    // onBlur event.
    const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    }, []);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const {
                isNegative: newIsNegative,
                value: newValue,
                afterPeriod: newAfterPeriod,
            } = extractValueFromText(e.target.value, isNegative, togglable);

            setIsNegative(newIsNegative);
            setValue(newValue);
            setAfterPeriod(newAfterPeriod);
            dispatchChange();
        },
        [isNegative, setIsNegative, setValue, setAfterPeriod, dispatchChange, togglable]
    );

    useEffectUpdate(() => {
        // Triggered after handleChange has completed.
        onChange();
    }, [changeObserver]);

    const clickToggleSign = useCallback(() => {
        if (togglable) {
            setIsNegative(!isNegative);
            // Trigger a deferred onChange+onInput when the value has changed.
            dispatchSetIsNegative();
        }
    }, [setIsNegative, dispatchSetIsNegative, togglable, isNegative]);

    useEffectUpdate(() => {
        // Triggered after clickToggleSign has completed.
        onChange();
        onInput();
    }, [isNegativeObserver]);

    useImperativeHandle(ref, () => ({
        clear() {
            setValue(NaN);
            setIsNegative(initiallyNegative);
            setAfterPeriod('');
        },

        reset() {
            setValue(defaultValue);
            setIsNegative(initiallyNegative);
            setAfterPeriod('');
        },
    }));

    let maybeTitle, clickableClass;
    if (togglable) {
        maybeTitle = $t('client.ui.toggle_sign');
        clickableClass = 'clickable';
    } else {
        clickableClass = 'not-clickable';
    }

    let displayValue = Number.isNaN(value) || value === null ? '' : `${value}`;

    // Add the period and what is after, if it exists.
    if (afterPeriod) {
        if (value !== null) {
            // Truncate the value.
            displayValue = `${~~value}`;
        }
        displayValue += afterPeriod;
    }

    const signLabel = isNegative ? 'minus' : 'plus';
    const className = props.className ? props.className : '';
    const inputClassName = props.checkValidity ? 'check-validity' : '';

    return (
        <div className={`input-with-addon ${className}`}>
            <button
                type="button"
                className={`btn ${clickableClass}`}
                disabled={!togglable}
                onClick={clickToggleSign}
                id={props.signId}
                title={maybeTitle}>
                <span className="screen-reader-text">{$t(`client.general.${signLabel}`)}</span>
                <i className={`fa fa-${signLabel}`} aria-hidden="true" />
            </button>

            <input
                type="text"
                className={inputClassName}
                onChange={handleChange}
                aria-describedby={props.signId}
                value={displayValue}
                onBlur={onInput}
                onKeyUp={handleKeyUp}
                id={props.id}
                required={props.checkValidity}
            />

            <DisplayIf condition={!!props.currencySymbol}>
                <span>{props.currencySymbol}</span>
            </DisplayIf>
        </div>
    );
});

AmountInput.displayName = 'AmountInput';

export default AmountInput;
