import React, { useCallback } from 'react';

import { translate as $t, notify, noValueFoundMessage } from '../../helpers';

import { Form } from '../ui';
import PasswordInput from '../ui/password-input';
import TextInput from '../ui/text-input';
import ValidatedTextInput from '../ui/validated-text-input';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';
import { CustomFieldDescriptor } from '../../models';

const CustomBankField = (props: {
    // The static custom field descriptor object.
    field: CustomFieldDescriptor;

    // The current value of the field.
    value: string | null;

    // A function to be called when the user changes the input.
    onChange: (name: string, value: string) => void;
}) => {
    const handleChange = useCallback(
        event => {
            const field = props.field;

            let value;
            switch (field.type) {
                case 'select':
                    if (event !== null) {
                        value = event;
                    } else {
                        // Set the default value when no value has been selected.
                        value = field.default ? field.default : field.values[0].value;
                    }
                    break;

                case 'text':
                case 'password':
                    // Set to a string value or null if empty.
                    value = event;
                    break;

                default:
                    window.alert('should not happen: unknown bank field type');
                    return;
            }

            props.onChange(field.name, value);
        },
        [props]
    );

    const { field, value } = props;

    const optional = !!field.optional;
    const checkValidityClass = optional ? '' : 'check-validity';

    let customFieldFormInput;
    switch (field.type) {
        case 'select':
            customFieldFormInput = (
                <FuzzyOrNativeSelect
                    className={`form-element-block ${checkValidityClass}`}
                    id={field.name}
                    noOptionsMessage={noValueFoundMessage}
                    onChange={handleChange}
                    options={field.values}
                    placeholder={$t('client.general.select')}
                    required={!optional}
                    value={value || field.default}
                />
            );
            break;

        case 'text': {
            const InputField = optional ? TextInput : ValidatedTextInput;
            const placeholder = field.placeholderKey ? $t(field.placeholderKey) : '';
            customFieldFormInput = (
                <InputField
                    id={field.name}
                    onChange={handleChange}
                    placeholder={placeholder}
                    initialValue={value}
                />
            );
            break;
        }

        case 'password': {
            const placeholder = field.placeholderKey ? $t(field.placeholderKey) : '';
            customFieldFormInput = (
                <PasswordInput
                    id={field.name}
                    onChange={handleChange}
                    defaultValue={value}
                    placeholder={placeholder}
                    className="block"
                />
            );
            break;
        }

        default: {
            notify.error($t('client.settings.unknown_field_type'));
            return null;
        }
    }

    return (
        <Form.Input id={field.name} optional={optional} label={$t(`client.settings.${field.name}`)}>
            {customFieldFormInput}
        </Form.Input>
    );
};

CustomBankField.displayName = 'CustomBankField';

export default CustomBankField;
