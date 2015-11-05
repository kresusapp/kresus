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
            hasCustomFields: false,
            customFields: []
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
    domCustomFields() {
        return this.state.customFields.map((field, index) =>
            this.refs["customField" + index].getDOMNode()
        );
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
            customFields = this.domCustomFields().map(node => ({
                name: node.getAttribute("name"),
                value: (node.getAttribute("type") === "number") ? parseInt(node.value, 10) : node.value
            }));
        }

        if (!id.length || !pwd.length) {
            alert(t('settings.missing_login_or_password') || 'Missing login or password');
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
        let maybeForm = <div className="transition-expand"/>;

        if (this.state.expanded) {
            let options = store.getStaticBanks().map(bank =>
                <option key={bank.id} value={bank.uuid}>{bank.name}</option>
            );

            let maybeCustomFields = [];
            if (this.state.hasCustomFields) {

                maybeCustomFields = this.state.customFields.map(function(field, index) {
                    let customFieldFormInput;
                    let customFieldFormInputId = "customField" + index;

                    switch (field.type) {
                        case "select":
                            let customFieldOptions = field.values.map(opt =>
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            );
                            customFieldFormInput = <select name={field.name} className="form-control" id={customFieldFormInputId} ref={customFieldFormInputId}>
                                {customFieldOptions}
                            </select>;
                            break;

                        case "text":
                        case "number":
                        case "password":
                            customFieldFormInput = <input name={field.name} type={field.type} className="form-control" id={customFieldFormInputId} ref={customFieldFormInputId} placeholder={t(field.placeholderKey) || field.placeholder} />;
                            break;

                        default:
                            alert(t('settings.unknown_field_type') || 'unknown field type');
                    }

                    return <div className="form-group">
                        <label htmlFor={customFieldFormInputId}><T k={field.labelKey}>{field.label}</T></label>
                        {customFieldFormInput}
                    </div>;
                });
            } else {
                maybeCustomFields = <div/>;
            }

            maybeForm = <div className="panel-body transition-expand">
                <div className="form-group">
                    <label htmlFor="bank"><T k='settings.bank'>Bank</T></label>
                    <select className="form-control" id="bank" ref="bank" onChange={this.onChangedBank.bind(this)}>
                        {options}
                    </select>
                </div>

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

                {maybeCustomFields}

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
                        <span className={"glyphicon glyphicon-" + (this.state.expanded ? "minus" : "plus")} aria-hidden="true"></span>
                    </button>
                </h3>
                {maybeForm}
            </div>
        </div>
        );
    }
}
