import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

class WeboobParameters extends React.PureComponent {
    handleToggleAutoMergeAccounts = e => {
        this.props.setBoolSetting('weboob-auto-merge-accounts', e.target.checked);
    };

    handleToggleAutoUpdate = e => {
        this.props.setBoolSetting('weboob-auto-update', e.target.checked);
    };

    handleToggleEnableDebug = e => {
        this.props.setBoolSetting('weboob-enable-debug', e.target.checked);
    };

    handleFetchThresholdChange = e => {
        this.props.setFetchThreshold(e.target.value);
    };

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
            <form className="settings-form">
                <p className="alerts info">
                    <span className="fa fa-question-circle" />
                    {$t('client.settings.weboob_description')}
                </p>

                <p>
                    <label>{$t('client.settings.weboob_version')}</label>
                    <span>{weboobVersion}</span>
                </p>

                <p>
                    <label htmlFor="enableWeboobDebug">
                        {$t('client.settings.weboob_enable_debug')}
                    </label>

                    <input
                        id="enableWeboobDebug"
                        type="checkbox"
                        defaultChecked={this.props.checked('weboob-enable-debug')}
                        onChange={this.handleToggleEnableDebug}
                    />
                </p>

                <p>
                    <label htmlFor="autoMergeAccounts">
                        {$t('client.settings.weboob_auto_merge_accounts')}
                    </label>

                    <input
                        id="autoMergeAccounts"
                        type="checkbox"
                        defaultChecked={this.props.checked('weboob-auto-merge-accounts')}
                        onChange={this.handleToggleAutoMergeAccounts}
                    />
                </p>

                <p>
                    <label htmlFor="fetchThreshold">
                        {$t('client.settings.weboob_fetch_threshold')}
                    </label>

                    <input
                        id="fetchThreshold"
                        type="number"
                        step="1"
                        min="0"
                        defaultValue={this.props.fetchThreshold}
                        onChange={this.handleFetchThresholdChange}
                    />
                </p>

                <hr />

                <p>
                    <label htmlFor="autoWeboobUpdate">
                        {$t('client.settings.weboob_auto_update')}
                    </label>

                    <input
                        id="autoWeboobUpdate"
                        type="checkbox"
                        defaultChecked={this.props.checked('weboob-auto-update')}
                        onChange={this.handleToggleAutoUpdate}
                    />
                </p>

                <div className="wrap-on-mobile">
                    <label htmlFor="updateWeboob">{$t('client.settings.update_weboob')}</label>

                    <div>
                        <p className="button-desc">{$t('client.settings.update_weboob_help')}</p>
                        <button
                            id="updateWeboob"
                            type="button"
                            className="btn primary"
                            onClick={this.props.handleUpdateWeboob}
                            disabled={this.props.updatingWeboob}>
                            {$t('client.settings.go_update_weboob')}
                        </button>
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
        checked: key => get.boolSetting(state, key),
        fetchThreshold: get.setting(state, 'weboob-fetch-threshold')
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
        },
        setFetchThreshold(value) {
            actions.setSetting(dispatch, 'weboob-fetch-threshold', value);
        }
    };
};

const Export = connect(
    stateToProps,
    dispatchToProps
)(WeboobParameters);

export default Export;
