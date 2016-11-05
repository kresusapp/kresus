import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../../store';
import { assert, translate as $t } from '../../../helpers';

import CustomBankField from './custom-bank-field';

class NewBankForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expanded: this.props.expanded
        };

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleToggleExpand = this.handleToggleExpand.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.refComponent = this.refComponent.bind(this);
    }

    refComponent(label) {
        return function(node) {
            this[label] = node;
        }.bind(this);
    }

    selectedBank() {
        return this.props.banks[this.props.defaultBankIndex];
    }

    handleReset() {
        this.props.onReset();
        this.form.reset();
        this.search.value = '';
    }

    handleToggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        }, this.props.onReset());
    }

    handleChangeBank() {
        let uuid = this.bank.value;
        for (let i = 0; i < this.props.banks.length; i++) {
            if (this.props.banks[i].uuid === uuid) {
                return this.props.onChangeBank(i);
            }
        }
        assert(false, "unreachable: the bank didn't exist?");
    }

    handleSubmit(e) {
        e.preventDefault();

        let uuid = this.bank.value;

        let login = this.id.value.trim();
        let password = this.password.value.trim();

        let selectedBank = this.selectedBank();

        let { customFields } = selectedBank;
        if (customFields.length) {
            customFields = customFields.map((field, index) =>
                this[`customField${index}${selectedBank.uuid}`].getValue()
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

        let maybeCustomFields = null;
        let selectedBank;
        if (this.props.banks.length > 0) {
            selectedBank = this.selectedBank();
            if (selectedBank.customFields.length > 0) {
                maybeCustomFields = selectedBank.customFields.map((field, index) => {
                    let defaultValue;
                    if (field.name === 'website' && this.search.value.length > 0) {
                        let search = this.search.value.toLowerCase();

                        let val = field.values.find(value => {
                            return value.label.toLowerCase().indexOf(search) >= 0;
                        });
                        if (typeof val !== 'undefined') {
                            defaultValue = val.value;
                        }
                    }
                    return (
                        <CustomBankField
                          ref={ this.refComponent(`customField${index}${selectedBank.uuid}`) }
                          params={ field }
                          key={ `customField${index}${selectedBank.uuid}` }
                          default={ defaultValue }
                        />
                    );
                });
            } else {
                maybeCustomFields = <div/>;
            }
        } else {
            maybeCustomFields = (
                <div className="alert alert-warning">
                    { $t('client.settings.no_bank') }
                </div>
            );
        }

        let form = (
            <div className="panel-body transition-expand">
                <div>
                    <label htmlFor="search">
                        { $t('client.settings.find_bank') }
                    </label>
                    <input ref={ this.refComponent('search') }
                      className="form-control" type="text"
                      id="search" onChange={ this.props.onChangeSearch }
                    />
                </div>
                <form ref={ this.refComponent('form') } onSubmit={ this.handleSubmit } >
                    <div className="form-group">
                        <label htmlFor="bank">
                            { $t('client.settings.bank') }
                        </label>
                        <select className="form-control" id="bank" ref={ this.refComponent('bank') }
                          onChange={ this.handleChangeBank }
                          value={
                              typeof selectedBank !== 'undefined' ? selectedBank.uuid : ''
                          }>
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
                                  ref={ this.refComponent('id') }
                                />
                            </div>

                            <div className="col-sm-6">
                                <label htmlFor="password">
                                    { $t('client.settings.password') }
                                </label>
                                <input type="password" className="form-control" id="password"
                                  ref={ this.refComponent('password') }
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
                          disabled={ this.props.banks.length === 0 }
                        />
                    </div>
                </form>
            </div>
        );

        return this.renderHeader(form);
    }
}

NewBankForm.propTypes = {
    // List of banks
    banks: React.PropTypes.array.isRequired,

    // Tells wether the form should be expanded or not
    expanded: React.PropTypes.bool.isRequired,

    // Creation form callback
    createAccess: React.PropTypes.func.isRequired,

    // Handler for search field change
    onChangeSearch: React.PropTypes.func.isRequired,

    // Handler for search field change
    onChangeBank: React.PropTypes.func.isRequired,

    // Handler to reset search
    onReset: React.PropTypes.func.isRequired,

    // Default selected index for bank select
    defaultBankIndex: React.PropTypes.number.isRequired
};

class IntelligentNewBankForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            search: '',
            defaultBankIndex: 0
        };
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleChangeBank = this.handleChangeBank.bind(this);
    }

    handleChangeSearch(e) {
        this.setState({ search: e.target.value, defaultBankIndex: 0 });
    }

    handleReset() {
        this.setState({ search: '', defaultBankIndex: 0 });
    }

    handleChangeBank(index) {
        this.setState({ defaultBankIndex: index });
    }

    render() {
        let banks;
        if (this.state.search.length) {
            let search = this.state.search.toLowerCase();
            banks = this.props.banks.filter(bank => {
                let found = bank.name.toLowerCase().indexOf(search) >= 0;
                let foundInWebsite = false;
                if (bank.customFields.length > 0) {
                    let website = bank.customFields.find(field => field.name === 'website');
                    if (typeof website !== 'undefined') {
                        foundInWebsite = website.values
                                         .some(val => {
                                             return val.label.toLowerCase().indexOf(search) >= 0;
                                         });
                    }
                }
                return found || foundInWebsite;
            });
        } else {
            banks = this.props.banks;
        }

        return (
            <NewBankForm
              banks={ banks }
              onChangeSearch={ this.handleChangeSearch }
              expanded={ this.props.expanded }
              onReset={ this.handleReset }
              createAccess={ this.props.createAccess }
              defaultBankIndex={ this.state.defaultBankIndex }
              onChangeBank={ this.handleChangeBank }
            />
        );
    }
}

IntelligentNewBankForm.propTypes = {
    // List of banks
    banks: React.PropTypes.array.isRequired,

    // Tells wether the form should be expanded or not
    expanded: React.PropTypes.bool.isRequired,

    // Creation form callback
    createAccess: React.PropTypes.func.isRequired
};

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
})(IntelligentNewBankForm);

export default Export;
