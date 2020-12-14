import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { translate as $t, UNKNOWN_WEBOOB_VERSION, notify, wrapCatchError } from '../../../helpers';
import {
    WEBOOB_AUTO_MERGE_ACCOUNTS,
    WEBOOB_AUTO_UPDATE,
    WEBOOB_ENABLE_DEBUG,
    WEBOOB_FETCH_THRESHOLD,
} from '../../../../shared/settings';

import { get, actions } from '../../../store';

import { Form, Switch, LoadingButton } from '../../ui';
import ExternalLink from '../../ui/external-link';
import Errors, { genericErrorHandler } from '../../../errors';
import { useNotifyError } from '../../../hooks';

const wrapNotifyWeboobNotInstalled = wrapCatchError(error => {
    if (error.code === Errors.WEBOOB_NOT_INSTALLED) {
        notify.error($t('client.sync.weboob_not_installed'));
    } else {
        genericErrorHandler(error);
    }
});

const UpdateButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const safeOnClick = useNotifyError(
        'client.settings.update_weboob_error',
        useCallback(async () => {
            await actions.updateWeboob();
            notify.success($t('client.settings.update_weboob_success'));
        }, [])
    );

    const onClick = useCallback(async () => {
        setIsLoading(true);
        await safeOnClick();
        setIsLoading(false);
    }, [setIsLoading, safeOnClick]);

    return (
        <LoadingButton
            label={$t('client.settings.go_update_weboob')}
            onClick={onClick}
            className="primary"
            isLoading={isLoading}
        />
    );
};

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
            <Form center={true}>
                <p className="alerts info">
                    <span className="fa fa-question-circle" />
                    {$t('client.settings.weboob_description')}
                    &nbsp;
                    {$t('client.settings.weboob_version')}
                    &nbsp;
                    <strong>{weboobVersion}</strong>.
                </p>

                <Form.Input
                    inline={true}
                    id="auto-merge-accounts"
                    label={$t('client.settings.weboob_auto_merge_accounts')}
                    help={$t('client.settings.weboob_auto_merge_accounts_desc')}>
                    <Switch
                        onChange={this.handleToggleAutoMergeAccounts}
                        ariaLabel={$t('client.settings.weboob_auto_merge_accounts')}
                        checked={this.props.checked(WEBOOB_AUTO_MERGE_ACCOUNTS)}
                    />
                </Form.Input>

                <Form.Input
                    inline={true}
                    id="auto-update-weboob"
                    label={$t('client.settings.weboob_auto_update')}
                    help={$t('client.settings.weboob_auto_update_desc')}>
                    <Switch
                        onChange={this.handleToggleAutoUpdate}
                        ariaLabel={$t('client.settings.weboob_auto_update')}
                        checked={this.props.checked(WEBOOB_AUTO_UPDATE)}
                    />
                </Form.Input>

                <Form.Input
                    inline={true}
                    id="update-weboob"
                    label={$t('client.settings.update_weboob')}
                    help={$t('client.settings.update_weboob_help')}>
                    <UpdateButton />
                </Form.Input>

                <Form.Input
                    inline={true}
                    id="enable-weboob-debug"
                    label={$t('client.settings.weboob_enable_debug')}
                    help={$t('client.settings.weboob_enable_debug_desc')}>
                    <Switch
                        onChange={this.handleToggleEnableDebug}
                        ariaLabel={$t('client.settings.weboob_enable_debug')}
                        checked={this.props.checked(WEBOOB_ENABLE_DEBUG)}
                    />
                </Form.Input>

                <Form.Input
                    id="fetch-threshold"
                    label={$t('client.settings.weboob_fetch_threshold')}
                    help={
                        <>
                            {$t('client.settings.weboob_fetch_threshold_desc')}{' '}
                            <ExternalLink href={$t('client.settings.weboob_fetch_threshold_link')}>
                                {$t('client.settings.read_more')}
                            </ExternalLink>
                        </>
                    }>
                    <input
                        type="number"
                        step="1"
                        min="0"
                        defaultValue={this.props.fetchThreshold}
                        onChange={this.handleFetchThresholdChange}
                    />
                </Form.Input>
            </Form>
        );
    }
}

const stateToProps = state => {
    return {
        version: get.weboobVersion(state),
        checked: key => get.boolSetting(state, key),
        fetchThreshold: get.setting(state, WEBOOB_FETCH_THRESHOLD),
    };
};

const dispatchToProps = dispatch => {
    return {
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
