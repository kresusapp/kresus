import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { get, actions } from '../../../store';
import { translate as $t } from '../../../helpers';

import PasswordInput from '../../ui/password-input';

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
            emailRecipient: props.emailRecipient
        };
        this.state = Object.assign({}, this.initialState);

        this.form = null;
        this.formCustomFields = new Map();
    }

    selectedBank() {
        if (this.state.selectedBankIndex > -1) {
            return this.props.banks[this.state.selectedBankIndex];
        }
        return null;
    }

    handleChangeBank = selectedValue => {
        let selectedBankIndex = -1;
        if (selectedValue) {
            let uuid = selectedValue.value;
            selectedBankIndex = this.props.banks.findIndex(bank => bank.uuid === uuid);
        }

        this.setState({ selectedBankIndex });
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
        // TODO: This should be moved in the state for consistency.
        this.formCustomFields.set(name, value);
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
                if (field.type === 'select' && !this.formCustomFields.has(field.name)) {
                    let value = field.default ? field.default : field.values[0].value;
                    return {
                        name: field.name,
                        value
                    };
                }
                return {
                    name: field.name,
                    value: this.formCustomFields.get(field.name)
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
        this.formCustomFields.clear();
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
                return (
                    <CustomBankField
                        onChange={this.handleCustomFieldChange}
                        name={field.name}
                        bank={selectedBankDescr.uuid}
                        key={`${selectedBankDescr.uuid}-${field.name}`}
                    />
                );
            });
        }

        let isDisabledSubmit = false;
        if (
            this.selectedBank() === null ||
            !this.state.login ||
            !this.state.password ||
            (this.state.defaultAlertsEnabled && !this.state.emailRecipient)
        ) {
            isDisabledSubmit = true;
        }

        let maybeCategories = null;
        if (this.props.isOnboarding) {
            maybeCategories = (
                <div className="row">
                    <div className="col-sm-12">
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
                </div>
            );
        }

        let maybeAlerts = null;
        if (this.props.emailEnabled) {
            let maybeEmailField = null;
            if (this.state.defaultAlertsEnabled) {
                maybeEmailField = (
                    <div>
                        <label htmlFor="email">{$t('client.settings.emails.send_to')}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="email"
                            placeholder="me@example.com"
                            value={this.state.emailRecipient}
                            onChange={this.handleChangeEmail}
                        />
                    </div>
                );
            }
            maybeAlerts = (
                <div className="row">
                    <div className="col-sm-12">
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
                        {maybeEmailField}
                    </div>
                </div>
            );
        }

        return (
            <form className="initform" ref={this.refForm} onSubmit={this.handleSubmit}>
                <div className="form-group has-overflow">
                    <div className="row">
                        <div className="col-sm-3">
                            <label htmlFor="bank">{$t('client.accountwizard.bank')}</label>
                        </div>
                        <div className="col-sm-9">
                            <Select
                                id="bank"
                                className="bankSelect"
                                onChange={this.handleChangeBank}
                                placeholder={$t('client.general.select')}
                                clearValueText={$t('client.search.clear')}
                                value={selectedBankDescr && selectedBankDescr.uuid}
                                options={options}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-6">
                            <label htmlFor="id">{$t('client.settings.login')}</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="123456789"
                                id="id"
                                onChange={this.handleChangeLogin}
                            />
                        </div>

                        <div className="col-sm-6">
                            <label htmlFor="password">{$t('client.settings.password')}</label>
                            <PasswordInput onChange={this.handleChangePassword} id="password" />
                        </div>
                    </div>
                </div>

                {maybeCustomFields}

                <div className="form-group">
                    {maybeCategories}
                    {maybeAlerts}
                </div>

                <div className="btn-toolbar pull-right">
                    <input
                        type="submit"
                        className="btn btn-primary"
                        value={$t('client.settings.add_bank_button')}
                        disabled={isDisabledSubmit}
                    />
                </div>
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
