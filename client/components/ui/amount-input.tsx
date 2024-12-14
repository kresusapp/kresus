import React, { forwardRef, useCallback, useImperativeHandle, useState } from 'react';

import { translate as $t } from '../../helpers';
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

const computeValue = (val: number | null, neg: boolean) => {
    if (val === null) {
        return val;
    }
    return neg ? -val : val;
};

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

    // Default value of the input.
    defaultValue?: number | null;

    // Whether the amount can be signed (true) or has to be non-negative (false).
    togglable?: boolean;

    // Whether the amount input, when it has no default value,
    // should be negative or positive by default.
    // Ex: the transaction creation modal should by default show a negative amount input
    // instead of relying on the user to toggle the polarity (most transactions are negative).
    preferNegativePolarity?: boolean;

    // Extra class names to pass to the input.
    className?: string;

    // A symbol to display for the currency.
    currencySymbol?: string;

    // Whether the input should have the autofocus attribute.
    autoFocus?: boolean;
}

const AmountInput = forwardRef<AmountInputRef, AmountInputProps>((props, ref) => {
    const togglable = typeof props.togglable !== 'undefined' ? props.togglable : true;
    const initiallyNegative =
        typeof props.defaultValue === 'number'
            ? props.defaultValue < 0
            : props.preferNegativePolarity === true;

    // Always use the absolute value, as the negative state handles the polarity.
    const defaultValue =
        typeof props.defaultValue === 'number' && !Number.isNaN(props.defaultValue)
            ? Math.abs(props.defaultValue)
            : null;

    const [numberComponents, setNumberComponents] = useState({
        value: defaultValue,
        isNegative: initiallyNegative,
        afterPeriod: '',
    });

    const { onChange: propsOnChange, onInput: propsOnInput } = props;

    // Handles onKey=enter. Note that handleInput() will be called by the resulting
    // onBlur event.
    const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    }, []);

    const handleInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const {
                isNegative: newIsNegative,
                value: newValue,
                afterPeriod: newAfterPeriod,
            } = extractValueFromText(e.target.value, numberComponents.isNegative, togglable);

            setNumberComponents({
                value: newValue,
                isNegative: newIsNegative,
                afterPeriod: newAfterPeriod,
            });

            if (typeof propsOnInput === 'function') {
                propsOnInput(computeValue(newValue, newIsNegative));
            }
        },
        [numberComponents.isNegative, setNumberComponents, togglable, propsOnInput]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const {
                isNegative: newIsNegative,
                value: newValue,
                afterPeriod: newAfterPeriod,
            } = extractValueFromText(e.target.value, numberComponents.isNegative, togglable);

            setNumberComponents({
                value: newValue,
                isNegative: newIsNegative,
                afterPeriod: newAfterPeriod,
            });

            if (typeof propsOnChange === 'function') {
                propsOnChange(computeValue(newValue, newIsNegative));
            }
        },
        [numberComponents.isNegative, setNumberComponents, togglable, propsOnChange]
    );

    const clickToggleSign = useCallback(() => {
        if (togglable) {
            setNumberComponents({
                value: numberComponents.value,
                isNegative: !numberComponents.isNegative,
                afterPeriod: numberComponents.afterPeriod,
            });
            const computedValue = computeValue(
                numberComponents.value,
                !numberComponents.isNegative
            );

            if (typeof propsOnInput === 'function') {
                propsOnInput(computedValue);
            }

            if (typeof propsOnChange === 'function') {
                propsOnChange(computedValue);
            }
        }
    }, [numberComponents, setNumberComponents, propsOnInput, propsOnChange, togglable]);

    useImperativeHandle(ref, () => ({
        clear() {
            setNumberComponents({ value: NaN, isNegative: initiallyNegative, afterPeriod: '' });
        },

        reset() {
            setNumberComponents({
                value: defaultValue,
                isNegative: initiallyNegative,
                afterPeriod: '',
            });
        },
    }));

    let maybeTitle, clickableClass;
    if (togglable) {
        maybeTitle = $t('client.ui.toggle_sign');
        clickableClass = 'clickable';
    } else {
        clickableClass = 'not-clickable';
    }

    let displayValue =
        Number.isNaN(numberComponents.value) || numberComponents.value === null
            ? ''
            : `${numberComponents.value}`;

    // Add the period and what is after, if it exists.
    if (numberComponents.afterPeriod) {
        if (numberComponents.value !== null) {
            // Truncate the value.
            displayValue = `${~~numberComponents.value}`;
        }
        displayValue += numberComponents.afterPeriod;
    }

    const signLabel = numberComponents.isNegative ? 'minus' : 'plus';
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
                inputMode="numeric"
                className={inputClassName}
                onChange={handleChange}
                aria-describedby={props.signId}
                value={displayValue}
                onBlur={handleInput}
                onKeyUp={handleKeyUp}
                id={props.id}
                required={props.checkValidity}
                autoFocus={props.autoFocus || false}
            />

            <DisplayIf condition={!!props.currencySymbol}>
                <span>{props.currencySymbol}</span>
            </DisplayIf>
        </div>
    );
});

AmountInput.displayName = 'AmountInput';

export default AmountInput;
