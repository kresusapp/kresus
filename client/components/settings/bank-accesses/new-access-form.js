import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../../store';
import { assert, translate as $t } from '../../../helpers';

import PasswordInput from '../../ui/password-input';
import FuzzyOrNativeSelect from '../../ui/fuzzy-or-native-select';
import ValidableInputText from '../../ui/validated-text-input';
import DisplayIf from '../../ui/display-if';
import TextInput from '../../ui/text-input';

import CustomBankField from './custom-bank-field';

function noBankFoundMessage() {
    return $t('client.accountwizard.no_bank_found');
}

export const renderCustomFields = (bankDesc, customFieldValues, handleChange) => {
    if (!bankDesc || !bankDesc.customFields.length) {
        return null;
    }
    return bankDesc.customFields.map((field, index) => (
        <CustomBankField
            key={index}
            onChange={handleChange}
            field={field}
            value={customFieldValues[field.name]}
        />
    ));
};

export const areCustomFieldsValid = (bankDesc, customFieldValues) => {
    if (!bankDesc.customFields) {
        return true;
    }
    for (let fieldDesc of bankDesc.customFields) {
        if (!fieldDesc.optional && customFieldValues[fieldDesc.name] === null) {
            return false;
        }
    }
    return true;
};

class NewAccessForm extends React.Component {
    refForm = React.createRef();

    constructor(props) {
        super(props);

        let isEmailValid = !!props.emailRecipient; // We assume the previous email was valid.

        this.state = this.initialState = {
            // Form fields.
            bankDesc: null,
            login: null,
            password: null,
            createDefaultAlerts: false,
            createDefaultCategories: props.isOnboarding,
            emailRecipient: props.emailRecipient,
            customLabel: null,
            customFields: null,

            // Validity fields.
            isEmailValid
        };
    }

    handleChangeBank = uuid => {
        let bankDesc = null;
        let customFields = null;

        if (uuid !== null) {
            bankDesc = this.props.banks.find(bank => bank.uuid === uuid);
            assert(
                typeof bankDesc !== 'undefined',
                "didn't find bank corresponding to selected uuid"
            );

            if (bankDesc.customFields.length) {
                // Set initial custom fields values.
                customFields = {};

                for (let field of bankDesc.customFields) {
                    let { name } = field;

                    if (field.optional) {
                        // Optional fields don't need to be pre-set.
                        customFields[name] = null;
                        continue;
                    }

                    if (typeof field.default !== 'undefined') {
                        // An explicit default value is defined: use it.
                        customFields[name] = field.default;
                        continue;
                    }

                    if (field.type === 'select') {
                        // Select the first value by default.
                        customFields[name] = field.values[0].value;
                        continue;
                    }

                    // Otherwise it's a text/password field.
                    customFields[name] = null;
                }
            }
        }

        this.setState({ bankDesc, customFields });
    };

    isFormValid = () => {
        if (!this.state.bankDesc || !this.state.login || !this.state.password) {
            return false;
        }
        if (this.state.createDefaultAlerts && !this.state.isEmailValid) {
            return false;
        }
        return areCustomFieldsValid(this.state.bankDesc, this.state.customFields);
    };

    handleChangeLogin = login => {
        this.setState({ login });
    };
    handleChangePassword = password => {
        this.setState({ password });
    };
    handleCheckCreateDefaultAlerts = event => {
        this.setState({ createDefaultAlerts: event.target.checked });
    };
    handleCheckCreateDefaultCategories = event => {
        this.setState({ createDefaultCategories: event.target.checked });
    };
    handleChangeCustomLabel = customLabel => {
        this.setState({ customLabel });
    };
    handleChangeEmail = event => {
        this.setState({
            emailRecipient: event.target.value,
            isEmailValid: event.target.validity.valid
        });
    };

    handleChangeCustomField = (name, value) => {
        assert(
            typeof this.state.customFields[name] !== 'undefined',
            'all custom fields must have an initial value'
        );
        // Make sure to create a copy to trigger a re-render.
        let customFields = Object.assign({}, this.state.customFields, { [name]: value });
        this.setState({
            customFields
        });
    };

    handleSubmit = async event => {
        event.preventDefault();

        assert(this.isFormValid());

        const { bankDesc, customLabel, createDefaultAlerts } = this.state;

        let customFields = bankDesc.customFields
            .map(field => {
                let value = this.state.customFields[field.name];
                assert(value || field.optional, 'null value for a required custom field');
                return {
                    name: field.name,
                    value
                };
            })
            // Filter out optional values not set to any value, to not increase
            // database load.
            .filter(field => field.value !== null);

        if (createDefaultAlerts && this.state.emailRecipient) {
            this.props.saveEmail(this.state.emailRecipient);
        }

        try {
            // Create access.
            await this.props.createAccess(
                bankDesc.uuid,
                this.state.login,
                this.state.password,
                customFields,
                customLabel,
                createDefaultAlerts
            );

            // Create default categories if requested.
            if (this.state.createDefaultCategories) {
                this.props.createDefaultCategories();
            }

            // Reset the form and internal memories.
            this.refForm.current.reset();
            this.setState(this.initialState);
            this.props.togglePanel();
        } catch (err) {
            // Nothing to do! The error is handled somewhere else.
        }
    };

    render() {
        let bankOptions = this.props.banks.map(bank => ({
            value: bank.uuid,
            label: bank.name
        }));

        let { bankDesc } = this.state;

        return (
            <form className="new-bank-form" ref={this.refForm} onSubmit={this.handleSubmit}>
                <div className="bank">
                    <label htmlFor="bank">{$t('client.accountwizard.bank')}</label>
                    <FuzzyOrNativeSelect
                        className="form-element-block"
                        clearable={true}
                        id="bank"
                        noOptionsMessage={noBankFoundMessage}
                        onChange={this.handleChangeBank}
                        options={bankOptions}
                        placeholder={$t('client.general.select')}
                        required={true}
                        value={(bankDesc && bankDesc.uuid) || ''}
                    />
                </div>

                <div>
                    <label htmlFor="custom_label">{$t('client.settings.custom_label')}</label>
                    <TextInput id="custom_label" onChange={this.handleChangeCustomLabel} />
                </div>

                <div className="credentials">
                    <div>
                        <label htmlFor="login">{$t('client.settings.login')}</label>
                        <ValidableInputText
                            className="form-element-block"
                            placeholder="123456789"
                            id="login"
                            onChange={this.handleChangeLogin}
                        />
                    </div>

                    <div>
                        <label htmlFor="password">{$t('client.settings.password')}</label>
                        <PasswordInput
                            onChange={this.handleChangePassword}
                            id="password"
                            className="block"
                        />
                    </div>
                </div>

                {renderCustomFields(
                    bankDesc,
                    this.state.customFields,
                    this.handleChangeCustomField
                )}

                <DisplayIf condition={this.props.isOnboarding}>
                    <div>
                        <input
                            type="checkbox"
                            id="default-categories"
                            checked={this.state.createDefaultCategories}
                            onChange={this.handleCheckCreateDefaultCategories}
                        />
                        <label htmlFor="default-categories">
                            {$t('client.accountwizard.default_categories')}
                        </label>
                        <p>
                            <small>{$t('client.accountwizard.default_categories_desc')}</small>
                        </p>
                    </div>
                </DisplayIf>

                <DisplayIf condition={this.props.emailEnabled}>
                    <div>
                        <input
                            type="checkbox"
                            id="default-alerts"
                            defaultChecked={this.state.createDefaultAlerts}
                            onChange={this.handleCheckCreateDefaultAlerts}
                        />
                        <label htmlFor="default-alerts">
                            {$t('client.accountwizard.default_alerts')}
                        </label>
                        <p>
                            <small>{$t('client.accountwizard.default_alerts_desc')}</small>
                        </p>
                    </div>

                    <DisplayIf condition={this.state.createDefaultAlerts}>
                        <div className="alert-email">
                            <label htmlFor="email">{$t('client.settings.emails.send_to')}</label>
                            <input
                                type="email"
                                className="form-element-block check-validity"
                                id="email"
                                placeholder="me@example.com"
                                value={this.state.emailRecipient}
                                onChange={this.handleChangeEmail}
                                required={true}
                            />
                        </div>
                    </DisplayIf>
                </DisplayIf>

                <p className="buttons-toolbar">
                    <input
                        type="submit"
                        className="btn primary"
                        value={$t('client.settings.add_bank_button')}
                        disabled={!this.isFormValid()}
                    />
                </p>
            </form>
        );
    }
}

NewAccessForm.propTypes /* remove-proptypes */ = {
    // Whether this form is displayed for onboarding or not (settings section).
    isOnboarding: PropTypes.bool
};

NewAccessForm.defaultProps = {
    isOnboarding: false
};

const Export = connect(
    state => {
        return {
            banks: get.activeBanks(state),
            emailEnabled: get.boolSetting(state, 'emails-enabled'),
            emailRecipient: get.setting(state, 'email-recipient'),
            categories: get.categories(state)
        };
    },
    dispatch => {
        return {
            createAccess: (uuid, login, password, fields, customLabel, createDefaultAlerts) => {
                return actions.createAccess(
                    dispatch,
                    uuid,
                    login,
                    password,
                    fields,
                    customLabel,
                    createDefaultAlerts
                );
            },
            saveEmail: email => actions.setSetting(dispatch, 'email-recipient', email),
            createDefaultCategories: () => actions.createDefaultCategories(dispatch)
        };
    }
)(NewAccessForm);

export default Export;
