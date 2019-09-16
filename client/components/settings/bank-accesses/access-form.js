import React from 'react';

import CustomBankField from './custom-bank-field';

export default class AccessForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            password: null,
            login: null,
            customFields: null
        };
    }

    handleChangeLogin = login => {
        this.setState({ login });
    };

    handleChangePassword = event => {
        this.setState({
            password: event.target.value
        });
    };

    handleChangeCustomField = (name, value) => {
        let customFields = this.state.customFields ? { ...this.state.customFields } : {};
        // To allow to unset an optional field, we delete the field from the state.
        // Using the value `null` is not an option, as the customFields inputs are
        // controlled components: the allowed value for an empty input is either ''
        // or undefined.
        if (value === '') {
            delete customFields[name];
        } else {
            customFields[name] = value;
        }
        this.setState({ customFields });
    };

    shouldDisableSubmit = staticCustomFields => {
        if (!this.state.login || !this.state.password) {
            return true;
        }

        // No customfield for this bank, means fields are valid.
        if (!staticCustomFields.length) {
            return false;
        }

        for (let field of staticCustomFields) {
            // The field has a default value or is optional.
            if (typeof field.default !== 'undefined' || field.optional === true) {
                continue;
            }

            // No field is set.
            if (this.state.customFields === null) {
                return true;
            }

            // The field is either not set, or set to an empty value.
            if (!this.state.customFields[field.name]) {
                return true;
            }
        }

        return false;
    };

    renderCustomFields = staticCustomFields => {
        if (!staticCustomFields || !staticCustomFields.length) {
            return null;
        }

        let hasInitialValues = this.state.customFields !== null;

        return staticCustomFields.map((field, index) => {
            let initialValue = hasInitialValues ? this.state.customFields[field.name] : '';
            return (
                <CustomBankField
                    key={index}
                    onChange={this.handleChangeCustomField}
                    field={field}
                    value={initialValue}
                />
            );
        });
    };
}
