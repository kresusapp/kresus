import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../../store';
import { assert, translate as $t } from '../../../helpers';

import PasswordInput from '../../ui/password-input';
import FoldablePanel from '../../ui/foldable-panel';

import CustomBankField from './custom-bank-field';

class NewBankForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedBankIndex: 0,
        };

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);

        this.form = null;
        this.bankSelector = null;
        this.loginInput = null;
        this.passwordInput = null;

        this.password = '';
        this.customFields = new Map();
    }

    selectedBank() {
        return this.props.banks[this.state.selectedBankIndex];
    }

    handleReset(event) {
        this.setState({
            selectedBankIndex: 0
        });
        event.target.reset();
    }

    handleChangeBank(event) {
        let uuid = event.target.value;
        let selectedBankIndex = this.props.banks.findIndex(bank => bank.uuid === uuid);

        if (selectedBankIndex !== -1) {
            this.setState({ selectedBankIndex });
        } else {
            assert(false, "unreachable: the bank didn't exist?");
        }
    }

    handleChangePassword(value) {
        this.password = value;
    }

    handleSubmit(event) {
        event.preventDefault();

        let uuid = this.bankSelector.value;
        let login = this.loginInput.value.trim();

        let selectedBank = this.selectedBank();

        let customFields;
        if (selectedBank.customFields.length) {
            customFields = selectedBank.customFields.map(field => {

                // Fill the field, if the user did not change the select value
                if (!this.customFields.has(field.name) && field.type === 'select') {
                    return {
                        name: field.name,
                        value: field.default
                    };
                }
                return {
                    name: field.name,
                    value: this.customFields.get(field.name)
                };
            });

            // Ensure all custom fields are set
            if (customFields.some(f => typeof f.value !== 'undefined')) {
                alert($t('client.editaccessmodal.customFields_not_empty'));
                return;
            }
        }

        if (!login.length || !this.password.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        this.props.createAccess(uuid, login, this.password, customFields);

        // Reset the form and internal memories.
        this.form.reset();
        this.password = '';
        this.customFields.clear();
    }
    render() {

        let options = this.props.banks.map(bank => (
            <option
              key={ bank.id }
              value={ bank.uuid }>
                { bank.name }
            </option>
        ));

        let selectedBank = this.selectedBank();

        const handleCustomFieldChange = (name, value) => {
            this.customFields.set(name, value);
        };

        let maybeCustomFields = null;
        if (selectedBank.customFields.length > 0) {
            maybeCustomFields = selectedBank.customFields.map(field => {
                return (
                    <CustomBankField
                      onChange={ handleCustomFieldChange }
                      name={ field.name }
                      bank={ selectedBank.uuid }
                      key={ `${selectedBank.uuid}-${field.name}` }
                    />
                );
            });
        }

        let refBankSelector = element => {
            this.bankSelector = element;
        };
        let refLoginInput = element => {
            this.loginInput = element;
        };
        let refPasswordInput = element => {
            this.passwordInput = element;
        };

        let refForm = element => {
            this.form = element;
        };

        return (
            <FoldablePanel
              initiallyExpanded={ this.props.expanded }
              title={ $t('client.settings.new_bank_form_title') }
              iconTitle={ $t('client.settings.add_bank_button') }
              top={ true }>
                <form
                  ref={ refForm }
                  onReset={ this.handleReset }
                  onSubmit={ this.handleSubmit }>
                    <div className="form-group">
                        <label htmlFor="bank">
                            { $t('client.settings.bank') }
                        </label>
                        <select
                          className="form-control"
                          id="bank"
                          ref={ refBankSelector }
                          onChange={ this.handleChangeBank }
                          defaultValue={ selectedBank.uuid }>
                            { options }
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="row">
                            <div className="col-sm-6">
                                <label htmlFor="id">
                                    { $t('client.settings.login') }
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="id"
                                  ref={ refLoginInput }
                                />
                            </div>

                            <div className="col-sm-6">
                                <label htmlFor="password">
                                    { $t('client.settings.password') }
                                </label>
                                <PasswordInput
                                  ref={ refPasswordInput }
                                  onChange={ this.handleChangePassword }
                                  id="password"
                                />
                            </div>
                        </div>
                    </div>

                    { maybeCustomFields }

                    <div className="btn-toolbar pull-right">
                        <input
                          type="reset"
                          className="btn btn-default"
                          value={ $t('client.settings.reset') }
                        />

                        <input
                          type="submit"
                          className="btn btn-primary"
                          value={ $t('client.settings.submit') }
                        />
                    </div>
                </form>
            </FoldablePanel>
        );
    }
}

NewBankForm.propTypes = {
    // Whether the form is expanded or not.
    expanded: PropTypes.bool.isRequired,

    // An array of banks.
    banks: PropTypes.array.isRequired,

    // A function to create the access with the credentials.
    createAccess: PropTypes.func.isRequired
};

const Export = connect(state => {
    return {
        banks: get.banks(state)
    };
}, dispatch => {
    return {
        createAccess: (uuid, login, password, fields) => {
            actions.createAccess(dispatch, uuid, login, password, fields);
        }
    };
})(NewBankForm);

export default Export;
