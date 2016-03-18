import React from 'react';

import { has, translate as $t } from '../../helpers';
import { store, Actions, State } from '../../store';

class BoolSetting extends React.Component {
    constructor(props) {
        has(props, 'label');
        has(props, 'setting');
        has(props, 'onChange');
        super(props);
    }

    render() {
        return (
            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    { this.props.label }
                </label>
                <div className="col-xs-8">
                    <input
                      type="checkbox"
                      defaultChecked={ store.getBoolSetting(this.props.setting) }
                      onChange={ this.props.onChange }
                    />
                </div>
            </div>
        );
    }
}

export default class WeboobParameters extends React.Component {

    constructor(props) {
        super(props);
        this.onUpdated = this.onUpdated.bind(this);
        this.handleFireUpdate = this.handleFireUpdate.bind(this);
        this.state = {
            isUpdatingWeboob: false
        };
    }

    componentDidMount() {
        store.on(State.weboob, this.onUpdated);
    }
    componentWillUnmount() {
        store.removeListener(State.weboob, this.onUpdated);
    }

    handleFireUpdate() {
        Actions.updateWeboob();
        this.setState({
            isUpdatingWeboob: true
        });
    }

    onUpdated() {
        this.setState({
            isUpdatingWeboob: false
        });
    }

    handleToggleAutoMergeAccounts(e) {
        let newValue = e.target.checked;
        Actions.changeBoolSetting('weboob-auto-merge-accounts', newValue);
    }

    handleToggleAutoUpdate(e) {
        let newValue = e.target.checked;
        Actions.changeBoolSetting('weboob-auto-update', newValue);
    }

    handleToggleEnableDebug(e) {
        let newValue = e.target.checked;
        Actions.changeBoolSetting('weboob-enable-debug', newValue);
    }

    render() {
        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">{ $t('client.settings.tab_weboob') }</h3>
                </div>

                <div className="panel-body">
                    <form>
                        <div className="form-group clearfix">
                            <label htmlFor="updateWeboob" className="col-xs-4 control-label">
                                { $t('client.settings.weboob_version') }
                            </label>
                            <label className="col-xs-8 text-info">
                                { store.getSetting('weboob-version') }
                            </label>
                        </div>

                        <BoolSetting
                          label={ $t('client.settings.weboob_enable_debug') }
                          setting="weboob-enable-debug"
                          onChange={ this.handleToggleEnableDebug }
                        />

                        <BoolSetting
                          label={ $t('client.settings.weboob_auto_merge_accounts') }
                          setting="weboob-auto-merge-accounts"
                          onChange={ this.handleToggleAutoMergeAccounts }
                        />

                        <BoolSetting
                          label={ $t('client.settings.weboob_auto_update') }
                          setting="weboob-auto-update"
                          onChange={ this.handleToggleAutoUpdate }
                        />

                        <div className="form-group clearfix">
                            <label htmlFor="updateWeboob" className="col-xs-4 control-label">
                                { $t('client.settings.update_weboob') }
                            </label>
                            <div className="col-xs-8">
                                <button
                                  id="updateWeboob"
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={ this.handleFireUpdate }
                                  disabled={ this.state.isUpdatingWeboob ? 'disabled' : false }>
                                    { $t('client.settings.go_update_weboob') }
                                </button>
                                <span className="help-block">
                                    { $t('client.settings.update_weboob_help') }
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
