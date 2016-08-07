import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../../store';
import { assertHas, assert, translate as $t } from '../../../helpers';

import CustomBankField from './custom-bank-field';

class NewBankForm extends React.Component {
    constructor(props) {
        assertHas(props, 'expanded');
        super(props);

        this.state = {
            selectedBankIndex: 0,
            expanded: this.props.expanded
        };

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleToggleExpand = this.handleToggleExpand.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    domBank() {
        return this.refs.bank;
    }
    domPassword() {
        return this.refs.password;
    }
    selectedBank() {
        return this.props.banks[this.state.selectedBankIndex];
    }

    handleReset() {
        this.setState({
            selectedBankIndex: 0
        });
        this.refs.form.reset();
    }

    handleToggleExpand() {
        this.setState({
            selectedBankIndex: 0,
            expanded: !this.state.expanded
        });
    }

    handleChangeBank() {
        let uuid = this.domBank().value;
        for (let i = 0; i < this.props.banks.length; i++) {
            if (this.props.banks[i].uuid === uuid) {
                this.setState({ selectedBankIndex: i });
                return;
            }
        }
        assert(false, "unreachable: the bank didn't exist?");
    }

    handleSubmit(e) {
        e.preventDefault();

        let uuid = this.domBank().value;

        let login = this.refs.id.value.trim();
        let password = this.domPassword().value.trim();

        let selectedBank = this.selectedBank();

        let { customFields } = selectedBank;
        if (customFields.length) {
            customFields = customFields.map((field, index) =>
                this.refs[`customField${index}${selectedBank.uuid}`].getValue()
            );
        }

        if (!login.length || !password.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        this.props.createAccess(uuid, login, password, customFields);
    }

    renderHeader(body) {
        let expanded = this.state.expanded;

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading clickable"
                  onClick={ this.handleToggleExpand }>
                    <h3 className="title panel-title">
                        { $t('client.settings.new_bank_form_title') }
                    </h3>

                    <div className="panel-options">
                        <span className={ `option-legend fa fa-${expanded ?
                          'minus' : 'plus'}-circle` }
                          aria-label="add"
                          title={ $t('client.settings.add_bank_button') }>
                        </span>
                    </div>
                </div>
                { body }
            </div>
        );
    }

    render() {
        let expanded = this.state.expanded;
        if (!expanded) {
            return this.renderHeader(<div className="transition-expand"/>);
        }

        let options = this.props.banks.map(bank =>
            <option key={ bank.id } value={ bank.uuid }>
                { bank.name }
            </option>
        );

        let selectedBank = this.selectedBank();

        let maybeCustomFields = null;
        if (selectedBank.customFields.length > 0) {
            maybeCustomFields = selectedBank.customFields.map((field, index) =>
                <CustomBankField
                  ref={ `customField${index}${selectedBank.uuid}` }
                  params={ field }
                  key={ `customField${index}${selectedBank.uuid}` }
                />
            );
        } else {
            maybeCustomFields = <div/>;
        }

        let form = (
            <div className="panel-body transition-expand">
                <form ref="form" onSubmit={ this.handleSubmit } >
                    <div className="form-group">
                        <label htmlFor="bank">
                            { $t('client.settings.bank') }
                        </label>
                        <select className="form-control" id="bank" ref="bank"
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
                                <input type="text" className="form-control" id="id"
                                  ref="id"
                                />
                            </div>

                            <div className="col-sm-6">
                                <label htmlFor="password">
                                    { $t('client.settings.password') }
                                </label>
                                <input type="password" className="form-control" id="password"
                                  ref="password"
                                />
                            </div>
                        </div>
                    </div>

                    { maybeCustomFields }

                    <div className="btn-toolbar pull-right">
                        <button type="reset"
                          className="btn btn-default"
                          onClick={ this.handleReset }>
                            { $t('client.settings.reset') }
                        </button>

                        <input type="submit"
                          className="btn btn-primary"
                          value={ $t('client.settings.submit') }
                        />
                    </div>
                </form>
            </div>
        );

        return this.renderHeader(form);
    }
}

let Export = connect(state => {
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
