import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t, notify } from '../../../helpers';

import DisplayIf from '../../ui/display-if';
import PasswordInput from '../../ui/password-input';
import TextInput from '../../ui/text-input';
import ValidatedTextInput from '../../ui/validated-text-input';
import FuzzyOrNativeSelect from '../../ui/fuzzy-or-native-select';

class CustomBankField extends React.Component {
    handleChange = event => {
        let { field } = this.props;

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
                window.alert('should not happen');
                return;
        }

        this.props.onChange(field.name, value);
    };

    render() {
        let { field, value } = this.props;

        let optional = typeof field.optional !== 'undefined' ? field.optional : false;
        let checkValidityClass = optional ? '' : 'check-validity';
        let placeholder = field.placeholderKey ? $t(field.placeholderKey) : '';

        let customFieldFormInput;
        switch (field.type) {
            case 'select':
                customFieldFormInput = (
                    <FuzzyOrNativeSelect
                        className={`form-element-block ${checkValidityClass}`}
                        id={field.name}
                        noResultsText={$t(`client.accountwizard.no_${field.name}_found`)}
                        onChange={this.handleChange}
                        options={field.values}
                        placeholder={$t('client.general.select')}
                        required={!optional}
                        value={value || field.default}
                    />
                );
                break;

            case 'text': {
                const InputField = optional ? TextInput : ValidatedTextInput;
                customFieldFormInput = (
                    <InputField
                        id={field.name}
                        onChange={this.handleChange}
                        placeholder={placeholder}
                        value={value}
                    />
                );
                break;
            }

            case 'password':
                customFieldFormInput = (
                    <PasswordInput
                        id={field.name}
                        onChange={this.handleChange}
                        defaultValue={value}
                        placeholder={placeholder}
                        className="block"
                    />
                );
                break;

            default:
                notify.error($t('client.settings.unknown_field_type'));
        }

        // The "cols-with-label" css class is active only within modals.
        return (
            <div className="cols-with-label">
                <label htmlFor={field.name}>
                    <span>{$t(`client.settings.${field.name}`)}</span>
                    <DisplayIf condition={optional}>
                        <span
                            className="label-info clickable tooltipped tooltipped-w
                                tooltipped-multiline"
                            aria-label={$t('client.settings.optional_field_desc')}>
                            {$t('client.settings.optional_field')}
                            <span className="fa fa-question-circle" />
                        </span>
                    </DisplayIf>
                </label>
                {customFieldFormInput}
            </div>
        );
    }
}

CustomBankField.propTypes /* remove-proptypes */ = {
    // The static custom field descriptor object.
    field: PropTypes.object,

    // The value of the field.
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    // A function to be called when the user changes the input. The function
    // has the following signature: function(name, value)
    onChange: PropTypes.func
};

export default CustomBankField;
