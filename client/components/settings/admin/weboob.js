import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_WEBOOB_VERSION, notify, wrapCatchError } from '../../../helpers';
import {
    WEBOOB_AUTO_MERGE_ACCOUNTS,
    WEBOOB_AUTO_UPDATE,
    WEBOOB_ENABLE_DEBUG,
    WEBOOB_FETCH_THRESHOLD,
} from '../../../../shared/settings';

import { get, actions } from '../../../store';

import { FormRow, Switch } from '../../ui';
import ExternalLink from '../../ui/external-link';
import Errors, { genericErrorHandler } from '../../../errors';

const wrapNotifyWeboobNotInstalled = wrapCatchError(error => {
    if (error.code === Errors.WEBOOB_NOT_INSTALLED) {
        notify.error($t('client.sync.weboob_not_installed'));
    } else {
        genericErrorHandler(error);
    }
});

class WeboobParameters extends React.PureComponent {
    handleToggleAutoMergeAccounts = checked => {
        this.props.setBoolSetting(WEBOOB_AUTO_MERGE_ACCOUNTS, checked);
    };

    handleToggleAutoUpdate = checked => {
        this.props.setBoolSetting(WEBOOB_AUTO_UPDATE, checked);
    };

    handleToggleEnableDebug = checked => {
        this.props.setBoolSetting(WEBOOB_ENABLE_DEBUG, checked);
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
        if (this.props.version !== UNKNOWN_WEBOOB_VERSION) {
            weboobVersion = this.props.version;
        } else {
            weboobVersion = <i className="fa fa-spinner" />;
        }

        return (
            <form>
                <p className="alerts info">
                    <span className="fa fa-question-circle" />
                    {$t('client.settings.weboob_description')}
                    &nbsp;
                    {$t('client.settings.weboob_version')}
                    &nbsp;
                    <strong>{weboobVersion}</strong>.
                </p>

                <FormRow
                    inline={true}
                    inputId="auto-merge-accounts"
                    label={$t('client.settings.weboob_auto_merge_accounts')}
                    input={
                        <Switch
                            onChange={this.handleToggleAutoMergeAccounts}
                            ariaLabel={$t('client.settings.weboob_auto_merge_accounts')}
                            checked={this.props.checked(WEBOOB_AUTO_MERGE_ACCOUNTS)}
                        />
                    }
                    help={$t('client.settings.weboob_auto_merge_accounts_desc')}
                />

                <FormRow
                    inline={true}
                    inputId="auto-update-weboob"
                    label={$t('client.settings.weboob_auto_update')}
                    input={
                        <Switch
                            onChange={this.handleToggleAutoUpdate}
                            ariaLabel={$t('client.settings.weboob_auto_update')}
                            checked={this.props.checked(WEBOOB_AUTO_UPDATE)}
                        />
                    }
                    help={$t('client.settings.weboob_auto_update_desc')}
                />

                <FormRow
                    inline={true}
                    inputId="update-weboob"
                    label={$t('client.settings.update_weboob')}
                    input={
                        <button
                            id="updateWeboob"
                            type="button"
                            className="btn primary"
                            onClick={this.props.handleUpdateWeboob}
                            disabled={this.props.updatingWeboob}>
                            {$t('client.settings.go_update_weboob')}
                        </button>
                    }
                    help={$t('client.settings.update_weboob_help')}
                />

                <FormRow
                    inline={true}
                    inputId="enable-weboob-debug"
                    label={$t('client.settings.weboob_enable_debug')}
                    input={
                        <Switch
                            onChange={this.handleToggleEnableDebug}
                            ariaLabel={$t('client.settings.weboob_enable_debug')}
                            checked={this.props.checked(WEBOOB_ENABLE_DEBUG)}
                        />
                    }
                    help={$t('client.settings.weboob_enable_debug_desc')}
                />

                <FormRow
                    inputId="fetch-threshold"
                    label={$t('client.settings.weboob_fetch_threshold')}
                    input={
                        <input
                            type="number"
                            step="1"
                            min="0"
                            defaultValue={this.props.fetchThreshold}
                            onChange={this.handleFetchThresholdChange}
                        />
                    }
                    help={
                        <>
                            {$t('client.settings.weboob_fetch_threshold_desc')}{' '}
                            <ExternalLink href={$t('client.settings.weboob_fetch_threshold_link')}>
                                {$t('client.settings.read_more')}
                            </ExternalLink>
                        </>
                    }
                />
            </form>
        );
    }
}

const stateToProps = state => {
    return {
        updatingWeboob: get.isWeboobUpdating(state),
        version: get.weboobVersion(state),
        checked: key => get.boolSetting(state, key),
        fetchThreshold: get.setting(state, WEBOOB_FETCH_THRESHOLD),
    };
};

const dispatchToProps = dispatch => {
    return {
        async handleUpdateWeboob() {
            try {
                await actions.updateWeboob(dispatch);
                notify.success($t('client.settings.update_weboob_success'));
            } catch (err) {
                if (err && typeof err.message === 'string') {
                    notify.error($t('client.settings.update_weboob_error', { error: err.message }));
                }
            }
        },
        fetchWeboobVersion: wrapNotifyWeboobNotInstalled(() =>
            actions.fetchWeboobVersion(dispatch)
        ),
        resetWeboobVersion() {
            actions.resetWeboobVersion(dispatch);
        },
        setBoolSetting(key, value) {
            actions.setBoolSetting(dispatch, key, value);
        },
        setFetchThreshold(value) {
            actions.setSetting(dispatch, WEBOOB_FETCH_THRESHOLD, value);
        },
    };
};

const Export = connect(stateToProps, dispatchToProps)(WeboobParameters);

export default Export;
