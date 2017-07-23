import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';
import { assert, translate as $t } from '../../helpers';

import PasswordInput from '../ui/password-input';

import CustomBankField from '../settings/bank-accesses/custom-bank-field';
import FoldablePanel from '../ui/foldable-panel';

class NewBankForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedBankIndex: 0,
        };

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);

        this.bankSelector = null;
        this.loginInput = null;
        this.passwordInput = null;
        this.customFieldsInputs = new Map();
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
            // TODO: Reset custom fields
            //assert(false, "unreachable: the bank didn't exist?");
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        let uuid = this.bankSelector.value;
        let login = this.loginInput.value.trim();
        let password = this.passwordInput.getValue();

        let selectedBank = this.selectedBank();

        let { customFields } = selectedBank;
        if (customFields.length) {
            customFields = customFields.map((field, index) =>
                this.customFieldsInputs.get(`${index}${selectedBank.uuid}`).getValue()
            );
        }

        if (!login.length || !password.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        this.props.createAccess(uuid, login, password, customFields);
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

        this.customFieldsInputs.clear();
        let maybeCustomFields = null;
        if (selectedBank.customFields.length > 0) {
            maybeCustomFields = selectedBank.customFields.map((field, index) => {
                let key = `${index}${selectedBank.uuid}`;
                let refCustomField = input => {
                    this.customFieldsInputs.set(key, input);
                };

                return (
                    <CustomBankField
                      ref={ refCustomField }
                      params={ field }
                      key={ key }
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

        return (
            <form
                style={{"margin-top": "1em"}}
                onReset={ this.handleReset }
                onSubmit={ this.handleSubmit }>
                <div className="form-group">
                    <label htmlFor="bank" style={{"margin-right": "1em"}}>
                        { $t('client.initsettings.bank') }
                    </label>
                    <input
                        className="form-control"
                        list="bank_list"
                        type="text"
                        id="bank"
                        style={{"width": "75%", "display": "inline-block"}}
                        onChange={ this.handleChangeBank }
                        defaultValue={ selectedBank.name }
                    />
                    <datalist id="bank_list" ref={ refBankSelector }>
                        { options }
                    </datalist>
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
                                id="password"
                            />
                        </div>
                    </div>
                </div>

                { maybeCustomFields }

                <div className="form-group">
                    <div className="row">
                        <div className="col-sm-12">
                            <input type="checkbox" className="form-control" id="defaultCategories" style={{"display": "inline-block", "width": "auto", "vertical-align": "middle", "margin-right": "1em"}}/>
                            <label htmlFor="defaultCategories">
                                Add a default set of categories to get started quickly
                            </label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <input type="checkbox" className="form-control" id="defaultAlerts" style={{"display": "inline-block", "width": "auto", "vertical-align": "middle", "margin-right": "1em"}}/>
                            <label htmlFor="defaultAlerts">
                                Add a default set of alerts to help following your accounts status
                            </label>
                        </div>
                    </div>
                </div>

                <FoldablePanel
                    initiallyExpanded={false}
                    title="Advanced options"
                    top={ true }>
                </FoldablePanel>

                <div className="btn-toolbar pull-right">
                    <input
                        type="submit"
                        className="btn btn-default"
                        value="Take me to my Kresus!"
                        style={{ "background": "#0073bd", "color": "white", "text-shadow": "initial", "border": "none" }}
                    />

                    <span className="btn" style={{ "cursor": "initial" }}>or</span>

                    <input
                        className="btn btn-primary"
                        value="Get me to demo mode!"
                        style={{ "background": "#00a850", "color": "white", "text-shadow": "initial", "border": "none" }}
                    />
                </div>
            </form>
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
