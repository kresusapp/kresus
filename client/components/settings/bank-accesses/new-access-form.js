import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../../store';
import { assert, translate as $t } from '../../../helpers';

import PasswordInput from '../../ui/password-input';
import FuzzyOrNativeSelect from '../../ui/fuzzy-or-native-select';
import ValidableInputText from '../../ui/validated-text-input';
import DisplayIf from '../../ui/display-if';

import AccessForm from './access-form';

function noBankFoundMessage() {
    return $t('client.accountwizard.no_bank_found');
}

class NewAccessForm extends AccessForm {
    form = null;

    constructor(props) {
        super(props);

        let validEmail = !!props.emailRecipient; // We assume the previous email was valid.

        this.initialState = {
            selectedBankIndex: -1,
            defaultAlertsEnabled: props.emailEnabled && validEmail,
            defaultCategoriesEnabled: props.isOnboarding,
            emailRecipient: props.emailRecipient,
            login: null,
            password: null,
            customFields: null,
            validEmail,
            customLabel: null
        };

        this.state = Object.assign(this.state, this.initialState);
    }

    selectedBank() {
        if (this.state.selectedBankIndex > -1) {
            return this.props.banks[this.state.selectedBankIndex];
        }
        return null;
    }

    handleChangeBank = selectedValue => {
        let selectedBankIndex = -1;
        if (selectedValue !== null) {
            let uuid = selectedValue;
            selectedBankIndex = this.props.banks.findIndex(bank => bank.uuid === uuid);
        }
        this.setState({ selectedBankIndex, customFields: null });
    };

    handleChangeDefaultAlerts = event => {
        this.setState({
            defaultAlertsEnabled: event.target.checked
        });
    };

    handleChangeDefaultCategories = event => {
        this.setState({
            defaultCategoriesEnabled: event.target.checked
        });
    };

    handleChangeEmail = event => {
        this.setState({
            emailRecipient: event.target.value,
            validEmail: event.target.validity.valid
        });
    };

    handleChangeLabel = event => {
        this.setState({ customLabel: event.target.value });
    };

    refForm = element => {
        this.form = element;
    };

    handleSubmit = event => {
        event.preventDefault();

        let selectedBank = this.selectedBank();
        assert(selectedBank !== null, 'should have selected a bank');
        assert(this.state.login.length, "validation ensures login isn't empty");
        assert(this.state.password.length, "validation ensures password isn't empty");

        let staticCustomFields = selectedBank.customFields;

        let customFields = [];
        if (staticCustomFields.length) {
            customFields = staticCustomFields
                .map(field => {
                    let value = null;

                    // Fill the field, if the user did not change the select value.
                    if (
                        field.type === 'select' &&
                        (!this.state.customFields ||
                            typeof this.state.customFields[field.name] === 'undefined')
                    ) {
                        value = field.default ? field.default : field.values[0].value;
                    } else if (this.state.customFields) {
                        value = this.state.customFields[field.name];
                    }

                    return {
                        name: field.name,
                        value
                    };
                })
                .filter(field => field.value !== null);
        }

        assert(
            !customFields.some(f => typeof f.value === 'undefined'),
            'validation ensures all custom fields are set'
        );

        const createDefaultAlerts = this.state.defaultAlertsEnabled;
        if (createDefaultAlerts && this.state.emailRecipient) {
            this.props.saveEmail(this.state.emailRecipient);
        }

        let customLabel = (this.state.customLabel && this.state.customLabel.trim()) || null;

        // Create access
        this.props.createAccess(
            selectedBank.uuid,
            this.state.login,
            this.state.password,
            customFields,
            customLabel,
            createDefaultAlerts
        );

        // Handle default categories
        if (this.state.defaultCategoriesEnabled) {
            this.props.createDefaultCategories();
        }

        // Reset the form and internal memories.
        this.form.reset();
        this.setState(this.initialState);
    };

    render() {
        let options = this.props.banks.map(bank => ({
            value: bank.uuid,
            label: bank.name
        }));

        let selectedBankDesc = this.selectedBank();
        let maybeCustomFields = selectedBankDesc
            ? this.renderCustomFields(selectedBankDesc.customFields)
            : null;

        let isDisabledSubmit = false;
        if (
            !selectedBankDesc ||
            this.shouldDisableSubmit(selectedBankDesc.customFields) ||
            (this.state.defaultAlertsEnabled && !this.state.validEmail)
        ) {
            isDisabledSubmit = true;
        }

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
                        options={options}
                        placeholder={$t('client.general.select')}
                        required={true}
                        value={(selectedBankDesc && selectedBankDesc.uuid) || ''}
                    />
                </div>
                <div>
                    <label htmlFor="custom_label">{$t('client.settings.custom_label')}</label>
                    <input
                        type="text"
                        id="custom_label"
                        className="form-element-block"
                        onChange={this.handleChangeLabel}
                    />
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

                {maybeCustomFields}

                <DisplayIf condition={this.props.isOnboarding}>
                    <div>
                        <input
                            type="checkbox"
                            id="default-categories"
                            checked={this.state.defaultCategoriesEnabled}
                            onChange={this.handleChangeDefaultCategories}
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
                            defaultChecked={this.state.defaultAlertsEnabled}
                            onChange={this.handleChangeDefaultAlerts}
                        />
                        <label htmlFor="default-alerts">
                            {$t('client.accountwizard.default_alerts')}
                        </label>
                        <p>
                            <small>{$t('client.accountwizard.default_alerts_desc')}</small>
                        </p>
                    </div>
                    <DisplayIf condition={this.state.defaultAlertsEnabled}>
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
                        disabled={isDisabledSubmit}
                    />
                </p>
            </form>
        );
    }
}

NewAccessForm.propTypes /* remove-proptypes */ = {
    // Whether this form is displayed for onboarding or not (settings section)
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
                actions.createAccess(
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
