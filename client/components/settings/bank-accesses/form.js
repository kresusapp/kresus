import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../../store';
import { translate as $t } from '../../../helpers';

import PasswordInput from '../../ui/password-input';
import FuzzyOrNativeSelect from '../../ui/fuzzy-or-native-select';

import CustomBankField from './custom-bank-field';

class InitForm extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            selectedBankIndex: -1,
            defaultAlertsEnabled: props.emailEnabled,
            defaultCategoriesEnabled: props.isOnboarding,
            password: null,
            login: null,
            emailRecipient: props.emailRecipient,
            customFields: null
        };
        this.state = Object.assign({}, this.initialState);
    }

    form = null;

    selectedBank() {
        if (this.state.selectedBankIndex > -1) {
            return this.props.banks[this.state.selectedBankIndex];
        }
        return '';
    }

    handleChangeBank = selectedValue => {
        let selectedBankIndex = -1;
        if (selectedValue) {
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

    handleChangeLogin = event => {
        this.setState({
            login: event.target.value
        });
    };

    handleChangePassword = event => {
        this.setState({
            password: event.target.value
        });
    };

    handleCustomFieldChange = (name, value) => {
        this.setState({ customFields: { [name]: value } });
    };

    handleChangeDefaultCategories = event => {
        this.setState({
            defaultCategoriesEnabled: event.target.checked
        });
    };

    handleChangeEmail = event => {
        this.setState({
            emailRecipient: event.target.value
        });
    };

    refForm = element => {
        this.form = element;
    };

    handleSubmit = event => {
        event.preventDefault();

        let selectedBank = this.selectedBank();
        let staticCustomFields = selectedBank.customFields;

        let customFields = [];
        if (staticCustomFields.length) {
            customFields = staticCustomFields.map(field => {
                // Fill the field, if the user did not change the select value.
                if (
                    field.type === 'select' &&
                    (!this.state.customFields ||
                        typeof this.state.customFields[field.name] === 'undefined')
                ) {
                    let value = field.default ? field.default : field.values[0].value;
                    return {
                        name: field.name,
                        value
                    };
                }
                return {
                    name: field.name,
                    value: this.state.customFields[field.name]
                };
            });
        }

        if (!this.state.login.length || !this.state.password.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        // Ensure all custom fields are set
        if (customFields.some(f => typeof f.value === 'undefined')) {
            alert($t('client.editaccessmodal.customFields_not_empty'));
            return;
        }

        const createDefaultAlerts = this.state.defaultAlertsEnabled;
        // Save email address if required
        if (createDefaultAlerts && this.state.emailRecipient) {
            this.props.saveEmail(this.state.emailRecipient);
        }

        // Create access
        this.props.createAccess(
            selectedBank.uuid,
            this.state.login,
            this.state.password,
            customFields,
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

        let selectedBankDescr = this.selectedBank();

        let maybeCustomFields = null;
        if (selectedBankDescr && selectedBankDescr.customFields.length > 0) {
            maybeCustomFields = selectedBankDescr.customFields.map(field => {
                let { name } = field;
                let initialValue = (this.state.customFields && this.state.customFields[name]) || '';
                return (
                    <CustomBankField
                        onChange={this.handleCustomFieldChange}
                        name={name}
                        value={initialValue}
                        bank={selectedBankDescr.uuid}
                        key={`${selectedBankDescr.uuid}-${name}`}
                    />
                );
            });
        }

        let isDisabledSubmit = false;
        if (
            this.selectedBank() === '' ||
            !this.state.login ||
            !this.state.password ||
            (this.state.defaultAlertsEnabled && !this.state.emailRecipient)
        ) {
            isDisabledSubmit = true;
        }

        let maybeCategories = null;
        if (this.props.isOnboarding) {
            maybeCategories = (
                <div>
                    <input
                        type="checkbox"
                        id="default-categories"
                        checked={this.state.defaultCategoriesEnabled}
                        onChange={this.handleChangeDefaultCategories}
                    />{' '}
                    <label htmlFor="default-categories">
                        {$t('client.accountwizard.default_categories')}
                    </label>
                    <p>
                        <small>{$t('client.accountwizard.default_categories_desc')}</small>
                    </p>
                </div>
            );
        }

        let maybeAlerts = null;
        if (this.props.emailEnabled) {
            let maybeEmailField = null;
            if (this.state.defaultAlertsEnabled) {
                maybeEmailField = (
                    <div className="alert-email">
                        <label htmlFor="email">{$t('client.settings.emails.send_to')}</label>
                        <input
                            type="email"
                            className="form-element-block"
                            id="email"
                            placeholder="me@example.com"
                            value={this.state.emailRecipient}
                            onChange={this.handleChangeEmail}
                        />
                    </div>
                );
            }
            maybeAlerts = (
                <React.Fragment>
                    <div>
                        <input
                            type="checkbox"
                            id="default-alerts"
                            defaultChecked="true"
                            onChange={this.handleChangeDefaultAlerts}
                        />{' '}
                        <label htmlFor="default-alerts">
                            {$t('client.accountwizard.default_alerts')}
                        </label>
                        <p>
                            <small>{$t('client.accountwizard.default_alerts_desc')}</small>
                        </p>
                    </div>
                    {maybeEmailField}
                </React.Fragment>
            );
        }

        return (
            <form className="initform" ref={this.refForm} onSubmit={this.handleSubmit}>
                <div className="bank">
                    <label htmlFor="bank">{$t('client.accountwizard.bank')}</label>
                    <FuzzyOrNativeSelect
                        id="bank"
                        className="bankSelect form-element-block"
                        onChange={this.handleChangeBank}
                        placeholder={$t('client.general.select')}
                        clearValueText={$t('client.search.clear')}
                        clearable={true}
                        value={selectedBankDescr && selectedBankDescr.uuid}
                        options={options}
                        matchProp="label"
                        noResultsText={$t('client.accountwizard.no_bank_found')}
                    />
                </div>

                <div className="credentials">
                    <div>
                        <label htmlFor="id">{$t('client.settings.login')}</label>
                        <input
                            type="text"
                            className="form-element-block"
                            placeholder="123456789"
                            id="id"
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
                {maybeCategories}
                {maybeAlerts}

                <p className="buttons-toolbar">
                    <input
                        type="submit"
                        className="kbtn primary"
                        value={$t('client.settings.add_bank_button')}
                        disabled={isDisabledSubmit}
                    />
                </p>
            </form>
        );
    }
}

InitForm.propTypes /* remove-proptypes */ = {
    // Whether this form is displayed for onboarding or not (settings section)
    isOnboarding: PropTypes.bool
};

InitForm.defaultProps = {
    isOnboarding: false
};

const Export = connect(
    state => {
        return {
            banks: get.banks(state),
            emailEnabled: get.boolSetting(state, 'emails-enabled'),
            emailRecipient: get.setting(state, 'email-recipient'),
            categories: get.categories(state)
        };
    },
    dispatch => {
        return {
            createAccess: (uuid, login, password, fields, createDefaultAlerts) => {
                actions.createAccess(dispatch, uuid, login, password, fields, createDefaultAlerts);
            },
            saveEmail: email => actions.setSetting(dispatch, 'email-recipient', email),
            createDefaultCategories: () => actions.createDefaultCategories(dispatch)
        };
    }
)(InitForm);

export default Export;
