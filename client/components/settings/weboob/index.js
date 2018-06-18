import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import BoolSetting from '../../ui/bool-setting';

class WeboobParameters extends React.PureComponent {
    constructor(props) {
        super(props);

        this.handleToggleAutoMergeAccounts = this.handleToggleAutoMergeAccounts.bind(this);
        this.handleToggleAutoUpdate = this.handleToggleAutoUpdate.bind(this);
        this.handleToggleEnableDebug = this.handleToggleEnableDebug.bind(this);
    }

    handleToggleAutoMergeAccounts(e) {
        this.props.setBoolSetting('weboob-auto-merge-accounts', e.target.checked);
    }

    handleToggleAutoUpdate(e) {
        this.props.setBoolSetting('weboob-auto-update', e.target.checked);
    }

    handleToggleEnableDebug(e) {
        this.props.setBoolSetting('weboob-enable-debug', e.target.checked);
    }

    componentDidMount() {
        this.props.fetchWeboobVersion();
    }

    componentWillUnmount() {
        // We want to assure the spinner will be displayed every time before a
        // fetch.
        this.props.resetWeboobVersion();
    }

    render() {
        let weboobVersion;
        if (this.props.version !== null) {
            weboobVersion = this.props.version;
        } else {
            weboobVersion = <i className="fa fa-spinner" />;
        }

        return (
            <form className="top-panel">
                <p className="alert alert-info">
                    <span className="fa fa-question-circle pull-left" />
                    {$t('client.settings.weboob_description')}
                </p>

                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        {$t('client.settings.weboob_version')}
                    </label>
                    <label className="col-xs-8 text-info">{weboobVersion}</label>
                </div>

                <BoolSetting
                    label={$t('client.settings.weboob_enable_debug')}
                    checked={this.props.checked('weboob-enable-debug')}
                    onChange={this.handleToggleEnableDebug}
                />

                <BoolSetting
                    label={$t('client.settings.weboob_auto_merge_accounts')}
                    checked={this.props.checked('weboob-auto-merge-accounts')}
                    onChange={this.handleToggleAutoMergeAccounts}
                />

                <BoolSetting
                    label={$t('client.settings.weboob_auto_update')}
                    checked={this.props.checked('weboob-auto-update')}
                    onChange={this.handleToggleAutoUpdate}
                />

                <div className="form-group clearfix">
                    <label htmlFor="updateWeboob" className="col-xs-4 control-label">
                        {$t('client.settings.update_weboob')}
                    </label>
                    <div className="col-xs-8">
                        <button
                            id="updateWeboob"
                            type="button"
                            className="btn btn-primary"
                            onClick={this.props.handleUpdateWeboob}
                            disabled={this.props.updatingWeboob}>
                            {$t('client.settings.go_update_weboob')}
                        </button>
                        <span className="help-block">
                            {$t('client.settings.update_weboob_help')}
                        </span>
                    </div>
                </div>
            </form>
        );
    }
}

const stateToProps = state => {
    return {
        updatingWeboob: get.isWeboobUpdating(state),
        version: get.weboobVersion(state),
        checked: key => get.boolSetting(state, key)
    };
};

const dispatchToProps = dispatch => {
    return {
        handleUpdateWeboob() {
            actions.updateWeboob(dispatch);
        },
        fetchWeboobVersion() {
            actions.fetchWeboobVersion(dispatch);
        },
        resetWeboobVersion() {
            actions.resetWeboobVersion(dispatch);
        },
        setBoolSetting(key, value) {
            actions.setBoolSetting(dispatch, key, value);
        }
    };
};

const Export = connect(
    stateToProps,
    dispatchToProps
)(WeboobParameters);

export default Export;
