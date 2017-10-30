import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import PasswordInput from '../ui/password-input';

import CustomBankField from '../settings/bank-accesses/custom-bank-field';

class NewInitForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedBankIndex: -1,
            defaultAlertsEnabled: this.props.emailEnabled,
            password: null,
            login: null,
            emailRecipient: null
        };

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleChangeLogin = this.handleChangeLogin.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleChangeDefaultAlerts = this.handleChangeDefaultAlerts.bind(this);
        this.handleChangeEmail = this.handleChangeEmail.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.form = null;
        this.bankSelector = null;
        this.DefaultCategoriesCheckbox = null;

        this.formCustomFields = new Map();
    }

    selectedBank() {
        if (this.state.selectedBankIndex > -1) {
            return this.props.banks[this.state.selectedBankIndex];
        }
        return null;
    }

    handleChangeBank(selectedValue) {
        let selectedBankIndex = -1;
        if (selectedValue) {
            let uuid = selectedValue.value;
            selectedBankIndex = this.props.banks.findIndex(bank => bank.uuid === uuid);
        }

        this.setState({ selectedBankIndex });
    }

    handleChangeDefaultAlerts(event) {
        this.setState({
            defaultAlertsEnabled: event.target.checked
        });
    }

    handleChangeLogin(event) {
        this.setState({
            login: event.target.value
        });
    }

    handleChangePassword(event) {
        this.setState({
            password: event.target.value
        });
    }

    handleChangeEmail(event) {
        this.setState({
            emailRecipient: event.target.value
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        let uuid = this.bankSelector.value;

        let staticCustomFields = this.selectedBank().customFields;

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

        this.props.createAccess(uuid, this.state.login, this.state.password, customFields);

        // Reset the form and internal memories.
        this.form.reset();
        this.setState({
            password: null
        });
        this.formCustomFields.clear();
    }

    render() {
        let options = this.props.banks.map(bank => ({
            value: bank.uuid,
            label: bank.name
        }));

        let selectedBankDescr = this.selectedBank();

        const handleCustomFieldChange = (name, value) => {
            this.formCustomFields.set(name, value);
        };

        let maybeCustomFields = null;
        if (selectedBankDescr && selectedBankDescr.customFields.length > 0) {
            maybeCustomFields = selectedBankDescr.customFields.map(field => {
                return (
                    <CustomBankField
                        onChange={handleCustomFieldChange}
                        name={field.name}
                        bank={selectedBankDescr.uuid}
                        key={`${selectedBankDescr.uuid}-${field.name}`}
                    />
                );
            });
        }

        let refBankSelector = element => {
            this.bankSelector = element;
        };
        let refDefaultCategoriesCheckbox = element => {
            this.DefaultCategoriesCheckbox = element;
        };
        let refForm = element => {
            this.form = element;
        };

        let maybeDisabledSubmit = false;
        if (
            this.selectedBank() === null ||
            !this.state.login ||
            !this.state.password ||
            (this.state.defaultAlertsEnabled && !this.state.emailRecipient)
        ) {
            maybeDisabledSubmit = true;
        }

        let maybeAlerts = null;
        if (this.props.emailEnabled) {
            let maybeEmailSendTo = null;
            if (this.state.defaultAlertsEnabled) {
                maybeEmailSendTo = (
                    <div>
                        <label htmlFor="email">{$t('client.settings.emails.send_to')}</label>
                        <input
                            type="text"
                            className="form-control"
                            id="email"
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
                        {maybeEmailSendTo}
                    </div>
                </div>
            );
        }

        return (
            <div>
                <header>
                    <h1>{$t('client.accountwizard.letsgo')}</h1>
                </header>
                <form className="initform" ref={refForm} onSubmit={this.handleSubmit}>
                    <div className="form-group">
                        <div className="row">
                            <div className="col-sm-3">
                                <label htmlFor="bank">{$t('client.accountwizard.bank')}</label>
                            </div>
                            <div className="col-sm-9">
                                <Select
                                    id="bank"
                                    className="bankSelect"
                                    ref={refBankSelector}
                                    onChange={this.handleChangeBank}
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
                        <div className="row">
                            <div className="col-sm-12">
                                <input
                                    type="checkbox"
                                    id="default-categories"
                                    defaultChecked="true"
                                    ref={refDefaultCategoriesCheckbox}
                                />{' '}
                                <label htmlFor="default-categories">
                                    {$t('client.accountwizard.default_categories')}
                                </label>
                                <p>
                                    <small>
                                        {$t('client.accountwizard.default_categories_desc')}
                                    </small>
                                </p>
                            </div>
                        </div>
                        {maybeAlerts}
                    </div>

                    <div className="btn-toolbar pull-right">
                        <input
                            type="submit"
                            className="btn btn-primary"
                            value={$t('client.settings.add_bank_button')}
                            disabled={maybeDisabledSubmit}
                        />
                    </div>
                </form>
            </div>
        );
    }
}

NewInitForm.propTypes /* remove-proptypes */ = {
    // An array of banks.
    banks: PropTypes.array.isRequired,

    // A function to create the access with the credentials.
    createAccess: PropTypes.func.isRequired
};

const Export = connect(
    state => {
        return {
            banks: get.banks(state),
            emailEnabled: get.boolSetting(state, 'emails-enabled')
        };
    },
    dispatch => {
        return {
            createAccess: (uuid, login, password, fields) => {
                actions.createAccess(dispatch, uuid, login, password, fields);
            }
        };
    }
)(NewInitForm);

export default Export;
