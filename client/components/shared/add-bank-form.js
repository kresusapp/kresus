import React from 'react';

import { store, Actions, State } from '../../store';
import { has, assert, translate as $t } from '../../helpers';
import Errors, { genericErrorHandler } from '../../errors';

import CustomBankField from './custom-bank-field';

export default class NewBankForm extends React.Component {

    constructor(props) {
        has(props, 'expanded');
        super(props);

        let state = this.getStateForBank(store.getStaticBanks()[0]);
        state.expanded = this.props.expanded;
        this.state = state;

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleToggleExpand = this.handleToggleExpand.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.afterSync = this.afterSync.bind(this);
    }

    handleToggleExpand() {
        let state = this.getStateForBank(store.getStaticBanks()[0]);
        state.expanded = !this.state.expanded;
        this.setState(state);
    }

    domBank() {
        return this.refs.bank;
    }
    domId() {
        return this.refs.id;
    }
    domPassword() {
        return this.refs.password;
    }

    getStateForBank(bank) {
        assert(typeof bank !== 'undefined', 'There should be at least one bank in the list');
        return {
            bankUuid: bank.uuid,
            customFields: bank.customFields || []
        };
    }

    handleChangeBank() {
        let uuid = this.domBank().value;
        let found = store.getStaticBanks().filter(b => (b.uuid === uuid));
        assert(found.length === 1, 'selected bank doesnt exist');
        let bank = found[0];
        this.setState(this.getStateForBank(bank));
        this.domBank().focus();
    }

    handleSubmit(e) {
        e.preventDefault();

        let bank = this.domBank().value;
        let id = this.domId().value.trim();
        let pwd = this.domPassword().value.trim();

        let customFields;
        if (this.state.customFields.length) {
            customFields = this.state.customFields.map((field, index) =>
                this.refs[`customField${index}${this.state.bankUuid}`].getValue()
            );
        }

        if (!id.length || !pwd.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        store.once(State.sync, this.afterSync);
        Actions.createBank(bank, id, pwd, customFields);
    }

    afterSync(err) {
        if (!err) {
            this.setState({
                expanded: false
            });
            return;
        }

        switch (err.code) {
            case Errors.INVALID_PASSWORD:
                alert($t('client.sync.first_time_wrong_password'));
                this.domPassword().value = '';
                this.domPassword().select();
                break;
            case Errors.INVALID_PARAMETERS:
                alert($t('client.sync.invalid_parameters', { content: err.content || '?' }));
                break;
            case Errors.EXPIRED_PASSWORD:
                alert($t('client.sync.expired_password'));
                break;
            case Errors.UNKNOWN_MODULE:
                alert($t('client.sync.unknown_module'));
                break;
            default:
                genericErrorHandler(err);
                break;
        }
    }

    handleReset() {
        this.setState(this.getStateForBank(store.getStaticBanks()[0]));
        this.refs.form.reset();
    }

    render() {
        let maybeForm = <div className="transition-expand"/>;

        if (this.state.expanded) {
            let options = store.getStaticBanks().map(bank =>
                <option key={ bank.id } value={ bank.uuid }>
                    { bank.name }
                </option>
            );

            let maybeCustomFields = [];
            if (this.state.customFields.length > 0) {
                maybeCustomFields = this.state.customFields.map((field, index) =>
                    <CustomBankField
                      ref={ `customField${index}${this.state.bankUuid}` }
                      params={ field }
                      key={ `customField${index}${this.state.bankUuid}` }
                    />
                );
            } else {
                maybeCustomFields = <div/>;
            }

            maybeForm = (
                <div className="panel-body transition-expand">
                    <form ref="form" onSubmit={ this.handleSubmit } >
                        <div className="form-group">
                            <label htmlFor="bank">
                                { $t('client.settings.bank') }
                            </label>
                            <select className="form-control" id="bank" ref="bank"
                              onChange={ this.handleChangeBank }
                              defaultValue={ this.state.bankUuid }>
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
        }

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading clickable"
                  onClick={ this.handleToggleExpand }>
                    <h3 className="title panel-title">
                        { $t('client.settings.new_bank_form_title') }
                    </h3>

                    <div className="panel-options">
                        <span className={ `option-legend fa fa-${this.state.expanded ?
                          'minus' : 'plus'}-circle` }
                          aria-label="add"
                          title={ $t('client.settings.add_bank_button') }>
                        </span>
                    </div>
                </div>
                { maybeForm }
            </div>
        );
    }
}
