import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import BoolSetting from '../../ui/bool-setting';

let WeboobParameters = props => {

    let handleToggleAutoMergeAccounts = e => {
        props.setBoolSetting('weboob-auto-merge-accounts', e.target.checked);
    };

    let handleToggleAutoUpdate = e => {
        props.setBoolSetting('weboob-auto-update', e.target.checked);
    };

    let handleToggleEnableDebug = e => {
        props.setBoolSetting('weboob-enable-debug', e.target.checked);
    };

    return (
        <div className="top-panel">
            <h3>{ $t('client.settings.weboob_title') }</h3>

            <p className="alert alert-info">
                <span className="fa fa-question-circle pull-left" />
                { $t('client.settings.weboob_description')}
            </p>

            <div className="form-group clearfix">
                <label className="col-xs-4 control-label">
                    { $t('client.settings.weboob_version') }
                </label>
                <label className="col-xs-8 text-info">
                    { props.weboobVersion }
                </label>
            </div>

            <BoolSetting
              label={ $t('client.settings.weboob_enable_debug') }
              checked={ props.checked('weboob-enable-debug') }
              onChange={ handleToggleEnableDebug }
            />

            <BoolSetting
              label={ $t('client.settings.weboob_auto_merge_accounts') }
              checked={ props.checked('weboob-auto-merge-accounts') }
              onChange={ handleToggleAutoMergeAccounts }
            />

            <BoolSetting
              label={ $t('client.settings.weboob_auto_update') }
              checked={ props.checked('weboob-auto-update') }
              onChange={ handleToggleAutoUpdate }
            />

            <div className="form-group clearfix">
                <label
                  htmlFor="updateWeboob"
                  className="col-xs-4 control-label">
                    { $t('client.settings.update_weboob') }
                </label>
                <div className="col-xs-8">
                    <button
                      id="updateWeboob"
                      type="button"
                      className="btn btn-primary"
                      onClick={ props.handleUpdateWeboob }
                      disabled={ props.updatingWeboob }>
                        { $t('client.settings.go_update_weboob') }
                    </button>
                    <span className="help-block">
                        { $t('client.settings.update_weboob_help') }
                    </span>
                </div>
            </div>
        </div>
    );
};

const stateToProps = state => {
    return {
        updatingWeboob: get.isWeboobUpdating(state),
        weboobVersion: get.setting(state, 'weboob-version'),
        checked: key => get.boolSetting(state, key)
    };
};

const dispatchToProps = dispatch => {
    return {
        handleUpdateWeboob() {
            actions.updateWeboob(dispatch);
        },
        setBoolSetting(key, value) {
            actions.setBoolSetting(dispatch, key, value);
        }
    };
};

const Export = connect(stateToProps, dispatchToProps)(WeboobParameters);

export default Export;
