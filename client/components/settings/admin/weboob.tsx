import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t, UNKNOWN_WEBOOB_VERSION, notify, useKresusState } from '../../../helpers';
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
import { useGenericError, useNotifyError } from '../../../hooks';

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

const WeboobParameters = () => {
    const version = useKresusState(state => get.weboobVersion(state));

    const fetchThreshold = useKresusState(state => get.setting(state, WEBOOB_FETCH_THRESHOLD));
    const autoMergeAccounts = useKresusState(state =>
        get.boolSetting(state, WEBOOB_AUTO_MERGE_ACCOUNTS)
    );
    const autoUpdate = useKresusState(state => get.boolSetting(state, WEBOOB_AUTO_UPDATE));
    const enableDebug = useKresusState(state => get.boolSetting(state, WEBOOB_ENABLE_DEBUG));

    const dispatch = useDispatch();

    const setAutoMergeAccounts = useGenericError(
        useCallback(
            (checked: boolean) => {
                return actions.setBoolSetting(dispatch, WEBOOB_AUTO_MERGE_ACCOUNTS, checked);
            },
            [dispatch]
        )
    );
    const setAutoUpdate = useGenericError(
        useCallback(
            (checked: boolean) => {
                return actions.setBoolSetting(dispatch, WEBOOB_AUTO_UPDATE, checked);
            },
            [dispatch]
        )
    );
    const setDebug = useGenericError(
        useCallback(
            (checked: boolean) => {
                return actions.setBoolSetting(dispatch, WEBOOB_ENABLE_DEBUG, checked);
            },
            [dispatch]
        )
    );
    const onChangeFetchThreshold = useGenericError(
        useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                return actions.setSetting(dispatch, WEBOOB_FETCH_THRESHOLD, e.target.value);
            },
            [dispatch]
        )
    );

    const fetchWeboobVersion = useCallback(async () => {
        try {
            await actions.fetchWeboobVersion(dispatch);
        } catch (error) {
            if ((error as any).code === Errors.WEBOOB_NOT_INSTALLED) {
                notify.error($t('client.sync.weboob_not_installed'));
            } else {
                genericErrorHandler(error);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        void fetchWeboobVersion();
        return () => {
            // We want to assure the spinner will be displayed every time before a
            // fetch.
            actions.resetWeboobVersion(dispatch);
        };
    }, [dispatch, fetchWeboobVersion]);

    let weboobVersion;
    if (version !== UNKNOWN_WEBOOB_VERSION) {
        weboobVersion = version;
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
                    onChange={setAutoMergeAccounts}
                    ariaLabel={$t('client.settings.weboob_auto_merge_accounts')}
                    checked={autoMergeAccounts}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                id="auto-update-weboob"
                label={$t('client.settings.weboob_auto_update')}
                help={$t('client.settings.weboob_auto_update_desc')}>
                <Switch
                    onChange={setAutoUpdate}
                    ariaLabel={$t('client.settings.weboob_auto_update')}
                    checked={autoUpdate}
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
                    onChange={setDebug}
                    ariaLabel={$t('client.settings.weboob_enable_debug')}
                    checked={enableDebug}
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
                    defaultValue={fetchThreshold}
                    onChange={onChangeFetchThreshold}
                />
            </Form.Input>
        </Form>
    );
};

WeboobParameters.displayName = 'WeboobParameters';

export default WeboobParameters;
