import React, { useCallback, useState } from 'react';

import { translate as $t } from '../../helpers';

const CustomLabelInput = (props: {
    // Optional DOM id for the component.
    id?: string;

    // The item from which to get the label.
    item: { customLabel: string | null };

    // A function to set the custom label when modified.
    setCustomLabel: (label: string) => void;

    // A function that returns the displayed label.
    getLabel: () => string;

    // A CSS class to apply to the input.
    inputClassName?: string;

    // Force the display of the input even on small screens
    forceEditMode?: boolean;

    // Whether to display the label if there is no custom label.
    displayLabelIfNoCustom?: boolean;
}) => {
    const [value, setValue] = useState<string | null>(null);
    const { item, getLabel, setCustomLabel } = props;

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
        },
        [setValue]
    );

    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        // Set the caret at the end of the text.
        const end = (event.target.value || '').length;
        event.target.selectionStart = end;
        event.target.selectionEnd = end;
    }, []);

    const handleKeyUp = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            const { target } = event;
            if (event.key === 'Enter') {
                (target as HTMLInputElement).blur();
            } else if (event.key === 'Escape') {
                setValue(null);
                (target as HTMLInputElement).blur();
            }
        },
        [setValue]
    );

    const handleBlur = useCallback(() => {
        if (value === null) {
            return;
        }

        let label = value.trim();

        // If the custom label is equal to the label, remove the custom label.
        if (label === getLabel()) {
            label = '';
        }

        const { customLabel } = item;
        if (label !== customLabel && (label || customLabel)) {
            setCustomLabel(label);
        }

        setValue(null);
    }, [value, getLabel, item, setCustomLabel, setValue]);

    const displayLabelIfNoCustom = props.displayLabelIfNoCustom || true;

    const getCustomLabel = useCallback(() => {
        const { customLabel } = item;
        if (customLabel === null || !customLabel.trim().length) {
            return '';
        }
        return customLabel;
    }, [item]);

    const getDefaultValue = useCallback(() => {
        let label = getCustomLabel();
        if (!label && displayLabelIfNoCustom) {
            label = getLabel();
        }
        return label;
    }, [getCustomLabel, getLabel, displayLabelIfNoCustom]);

    const label = value !== null ? value : getDefaultValue();
    const forceEditMode = props.forceEditMode ? 'force-edit-mode' : '';
    let inputClassName = 'form-element-block';

    if (props.inputClassName) {
        inputClassName += ` ${props.inputClassName}`;
    }

    return (
        <div className={`label-component-container ${forceEditMode}`}>
            <span>{label}</span>
            <input
                id={props.id}
                className={inputClassName}
                type="text"
                value={label}
                onChange={handleChange}
                onFocus={handleFocus}
                onKeyUp={handleKeyUp}
                onBlur={handleBlur}
                placeholder={$t('client.general.add_custom_label')}
            />
        </div>
    );
};

CustomLabelInput.displayName = 'CustomLabelInput';

export default CustomLabelInput;
