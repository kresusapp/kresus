import {store, Actions, State} from '../store';
import {has, assert, translate as $t} from '../helpers';
import Errors from '../errors';

import CustomBankField from './CustomBankField';

export default class NewBankForm extends React.Component {

    constructor(props) {
        has(props, 'expanded');
        super(props);
        this.state = {
            expanded: this.props.expanded,
            hasCustomFields: false,
            customFields: []
        };
    }

    toggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    domBank() {
        return this.refs.bank.getDOMNode();
    }
    domId() {
        return this.refs.id.getDOMNode();
    }
    domPassword() {
        return this.refs.password.getDOMNode();
    }

    onChangedBank() {
        let uuid = this.domBank().value;
        let found = store.getStaticBanks().filter(b => (b.uuid == uuid));

        assert(found.length == 1, 'selected bank doesnt exist');
        let bank = found[0];

        if (typeof bank.customFields !== 'undefined') {
            this.setState({
                hasCustomFields: true,
                customFields: bank.customFields
            });
        } else {
            this.setState({
                hasCustomFields: false,
                customFields: []
            });
        }
    }

    onSubmit() {
        let bank = this.domBank().value;
        let id = this.domId().value.trim();
        let pwd = this.domPassword().value.trim();
        let customFields;

        if (this.state.hasCustomFields) {
            customFields = this.state.customFields.map((field, index) =>
                this.refs["customField" + index].getValue()
            );
        }

        if (!id.length || !pwd.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        store.once(State.sync, this._afterSync.bind(this));
        Actions.CreateBank(bank, id, pwd, this.state.hasCustomFields ? customFields : undefined);
    }

    _afterSync(err) {
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
                alert($t('client.sync.invalid_parameters', {content: err.content}));
                break;
            case Errors.EXPIRED_PASSWORD:
                alert($t('client.sync.expired_password'));
                break;
            case Errors.UNKNOWN_MODULE:
                alert($t('client.sync.unknown_module'));
                break;
            default:
                alert($t('client.sync.unknown_error', {content: err.content}));
                break;
        }
    }

    onKeyUp(e) {
        if (e.keyCode == 13) {
            this.onSubmit();
        }
    }

    render() {
        let maybeForm = <div className="transition-expand"/>;

        if (this.state.expanded) {
            let options = store.getStaticBanks().map(bank =>
                <option key={bank.id} value={bank.uuid}>{bank.name}</option>
            );

            let maybeCustomFields = [];
            if (this.state.hasCustomFields) {
                maybeCustomFields = this.state.customFields.map((field, index) =>
                    <CustomBankField ref={"customField" + index} params={field} />
                );
            } else {
                maybeCustomFields = <div/>;
            }

            maybeForm = <div className="panel-body transition-expand">
                <div className="form-group">
                    <label htmlFor="bank">
                        {$t('client.settings.bank')}
                    </label>
                    <select className="form-control" id="bank" ref="bank" onChange={this.onChangedBank.bind(this)}>
                        {options}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="id">
                        {$t('client.settings.login')}
                    </label>
                    <input type="text" className="form-control" id="id" ref="id"
                      onKeyUp={this.onKeyUp.bind(this)} />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        {$t('client.settings.password')}
                    </label>
                    <input type="password" className="form-control" id="password" ref="password"
                      onKeyUp={this.onKeyUp.bind(this)} />
                </div>

                {maybeCustomFields}

                <input type="submit"
                  className="btn btn-save pull-right"
                  onClick={this.onSubmit.bind(this)}
                  value={$t('client.settings.submit')} />
            </div>;
        }

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title">
                    {$t('client.settings.new_bank_form_title')}
                </h3>

                <div className="panel-options">
                    <span className={"option-legend fa fa-" + (this.state.expanded ? "minus" : "plus") + "-circle"} aria-label="add"
                        onClick={this.toggleExpand.bind(this)}
                        title={$t("client.settings.add_bank_button")}>
                    </span>
                </div>

                {maybeForm}
            </div>
        </div>
        );
    }
}
