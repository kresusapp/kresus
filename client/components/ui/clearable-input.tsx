import React, {
    useCallback,
    useReducer,
    useState,
    ChangeEvent,
    forwardRef,
    useImperativeHandle,
} from 'react';

import { translate as $t } from '../../helpers';
import { useEffectUpdate } from '../../hooks';

interface ClearableInputMethods {
    clear: () => void;
}

interface ClearableInputProps {
    // Type
    type?: string;

    // Initial value.
    value?: string;

    // An id to link the input to a label for instance.
    id?: string;

    // Placeholder
    placeholder?: string;

    // onChange function called with the value.
    onChange?: (val: string) => void;

    // className to customize component style
    className?: string;
}

const ClearableInput = forwardRef<ClearableInputMethods, ClearableInputProps>((props, ref) => {
    const [value, setValue] = useState(props.value || '');
    const [valueObserver, dispatchValueChange] = useReducer((x: number) => x + 1, 0);

    const onChange = useCallback(
        (newValue: string) => {
            setValue(newValue);
            dispatchValueChange();
        },
        [setValue, dispatchValueChange]
    );

    const { onChange: propsOnChange } = props;
    useEffectUpdate(() => {
        if (typeof propsOnChange === 'function') {
            propsOnChange(value.trim());
        }
    }, [valueObserver, propsOnChange, value]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange]
    );

    const handleClear = useCallback(() => {
        onChange('');
    }, [onChange]);

    useImperativeHandle(
        ref,
        () => ({
            clear() {
                setValue('');
            },
        }),
        [setValue]
    );

    let { className = '' } = props;
    className += ' input-with-addon clearable-input';
    return (
        <div className={className}>
            <input
                type={props.type || 'text'}
                id={props.id}
                onChange={handleChange}
                value={value}
                placeholder={props.placeholder || ''}
            />
            <button
                type="button"
                className="btn"
                onClick={handleClear}
                title={$t('client.search.clear')}>
                <span className="screen-reader-text">X</span>
                <i className="fa fa-times" aria-hidden="true" />
            </button>
        </div>
    );
});

ClearableInput.displayName = 'ClearableInput';

export default ClearableInput;
