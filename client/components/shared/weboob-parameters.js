import React from 'react';
import { connect } from 'react-redux';

import { assert, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import BoolSetting from './bool-setting';

let WeboobParameters = props => {

    let handleToggleAutoMergeAccounts = e => {
        props.setBoolSetting('weboob-auto-merge-accounts', e.target.checked);
    }

    let handleToggleAutoUpdate = e => {
        props.setBoolSetting('weboob-auto-update', e.target.checked);
    }

    let handleToggleEnableDebug = e => {
        props.setBoolSetting('weboob-enable-debug', e.target.checked);
    }

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
                            { props.weboobVersion }
                        </label>
                    </div>

                    <BoolSetting
                      label={ $t('client.settings.weboob_enable_debug') }
                      checked={ props.checked("weboob-enable-debug") }
                      onChange={ handleToggleEnableDebug }
                    />

                    <BoolSetting
                      label={ $t('client.settings.weboob_auto_merge_accounts') }
                      checked={ props.checked("weboob-auto-merge-accounts") }
                      onChange={ handleToggleAutoMergeAccounts }
                    />

                    <BoolSetting
                      label={ $t('client.settings.weboob_auto_update') }
                      checked={ props.checked("weboob-auto-update") }
                      onChange={ handleToggleAutoUpdate }
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
                              onClick={ props.updateWeboob }
                              disabled={ props.updatingWeboob ? 'disabled' : false }>
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

const stateToProps = state => {
    return {
        updatingWeboob: state.settings.updatingWeboob,
        weboobVersion: state.settings.weboob_version,
        checked: key => state.settings.map[key] === 'true'
    };
};

const dispatchToProps = dispatch => {
    return {
        updateWeboob() {
            Actions.updateWeboob();
        },
        setBoolSetting(key, value) {
            Actions.changeBoolSetting(key, value);
        }
    };
};

const Export = connect(stateToProps, dispatchToProps)(WeboobParameters);

export default Export;
