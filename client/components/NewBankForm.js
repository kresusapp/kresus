import {store, Actions, State} from '../store';
import {has, assert, translate as t} from '../Helpers';
import T from './Translated';

import Errors from '../errors';

export default class NewBankForm extends React.Component {

    constructor(props) {
        has(props, 'expanded');
        super(props);
        this.state = {
            expanded: this.props.expanded,
            hasWebsites: false,
            websites: []
        }
    }

    toggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    domBank() {
        return this.refs.bank.getDOMNode();
    }
    domWebsite() {
        return this.refs.website.getDOMNode();
    }
    domId() {
        return this.refs.id.getDOMNode();
    }
    domPassword() {
        return this.refs.password.getDOMNode();
    }

    onChangedBank() {
        var uuid = this.domBank().value;

        var found = store.getStaticBanks().filter(function(b) { return b.uuid == uuid });
        assert(found.length == 1, 'selected bank doesnt exist');
        var bank = found[0];

        if (typeof bank.websites !== 'undefined') {
            this.setState({
                hasWebsites: true,
                websites: bank.websites
            });
        } else {
            this.setState({
                hasWebsites: false,
                websites: []
            });
        }
    }

    onSubmit() {
        var bank = this.domBank().value;
        var id = this.domId().value.trim();
        var pwd = this.domPassword().value.trim();

        if (!id.length || !pwd.length) {
            alert(t('settings.missing_login_or_password') || 'Missing login or password');
            return;
        }

        store.once(State.sync, this._afterSync.bind(this));
        Actions.CreateBank(bank, id, pwd, this.state.hasWebsites ? this.domWebsite().value : undefined);
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
                alert(t('sync.first_time_wrong_password') || 'The password seems to be incorrect, please type it again.');
                this.domPassword().value = '';
                this.domPassword().select();
                break;
            case Errors.INVALID_PARAMETERS:
                alert(t('sync.invalid_parameters', {content: err.content}) || 'The format of one of your login or password might be incorrect: ' + err.content);
                break;
            case Errors.EXPIRED_PASSWORD:
                alert(t('sync.expired_password') || 'Your password has expired. Please change it on your bank website and update it in Kresus.');
                break;
            case Errors.UNKNOWN_MODULE:
                alert(t('sync.unknown_module') || 'Unknown bank module. Please try updating Weboob.');
                break;
            default:
                alert(t('sync.unknown_error', {content: err.content}) || 'Unknown error, please report: ' + err.content);
                break;
        }
    }

    onKeyUp(e) {
        if (e.keyCode == 13) {
            this.onSubmit();
        }
    }

    render() {
        var maybeForm = <div className="transition-expand"/>

        if (this.state.expanded) {
            var options = store.getStaticBanks().map((bank) =>
                <option key={bank.id} value={bank.uuid}>{bank.name}</option>
            );

            var maybeWebsites;
            if (this.state.hasWebsites) {
                var websitesOptions = this.state.websites.map((website) =>
                    <option key={website.hostname} value={website.hostname}>{website.label}</option>
                );
                maybeWebsites = <div className="form-group">
                    <label htmlFor="website"><T k='settings.website'>Website</T></label>
                    <select className="form-control" id="website" ref="website">
                        {websitesOptions}
                    </select>
                </div>;
            } else {
                maybeWebsites = <div/>;
            }

            maybeForm = <div className="panel-body transition-expand">
                <div className="form-group">
                    <label htmlFor="bank"><T k='settings.bank'>Bank</T></label>
                    <select className="form-control" id="bank" ref="bank" onChange={this.onChangedBank.bind(this)}>
                        {options}
                    </select>
                </div>

                {maybeWebsites}

                <div className="form-group">
                    <label htmlFor="id"><T k='settings.login'>Login</T></label>
                    <input type="text" className="form-control" id="id" placeholder="Enter here your bank identifier" ref="id"
                      onKeyUp={this.onKeyUp.bind(this)} />
                </div>

                <div className="form-group">
                    <label htmlFor="password"><T k='settings.password'>Password</T></label>
                    <input type="password" className="form-control" id="password" ref="password"
                      onKeyUp={this.onKeyUp.bind(this)} />
                </div>

                <input type="submit" className="btn btn-save pull-right" onClick={this.onSubmit.bind(this)} value={t('settings.submit') || 'Save'} />
            </div>;
        }

        return (
        <div className="top-panel panel panel-default">
            <div className="panel-heading">
                <h3 className="title panel-title"><T k='settings.new_bank_form_title'>Configure a new bank access</T>
                    <button type="button" className="btn btn-primary pull-right" aria-label="add"
                      onClick={this.toggleExpand.bind(this)}
                      title={t("settings.add_bank_button") || "Add a new bank access"}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                    </button>
                </h3>
                {maybeForm}
            </div>
        </div>
        );
    }
}

