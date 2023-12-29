import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t, UNKNOWN_WOOB_VERSION, notify, useKresusState } from '../../../helpers';
import {
    PROVIDER_AUTO_RETRY,
    WOOB_AUTO_MERGE_ACCOUNTS,
    WOOB_AUTO_UPDATE,
    WOOB_ENABLE_DEBUG,
    WOOB_FETCH_THRESHOLD,
} from '../../../../shared/settings';
import { WOOB_VERSION } from '../../../../shared/instance';

import * as backend from '../../../store/backend';
import * as SettingsStore from '../../../store/settings';
import * as InstanceStore from '../../../store/instance';

import { Form, Switch, LoadingButton } from '../../ui';
import ExternalLink from '../../ui/external-link';
import Errors, { genericErrorHandler } from '../../../errors';
import { useGenericError, useNotifyError } from '../../../hooks';

const UpdateButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const safeOnClick = useNotifyError(
        'client.settings.update_woob_error',
        useCallback(async () => {
            await backend.updateWoob();
            notify.success($t('client.settings.update_woob_success'));
        }, [])
    );

    const onClick = useCallback(async () => {
        setIsLoading(true);
        await safeOnClick();
        setIsLoading(false);
    }, [setIsLoading, safeOnClick]);

    return (
        <LoadingButton
            label={$t('client.settings.go_update_woob')}
            onClick={onClick}
            className="primary"
            isLoading={isLoading}
        />
    );
};

const WoobParameters = () => {
    const version = useKresusState(state => InstanceStore.get(state.instance, WOOB_VERSION));

    const fetchThreshold = useKresusState(state =>
        SettingsStore.get(state.settings, WOOB_FETCH_THRESHOLD)
    );
    const autoMergeAccounts = useKresusState(state =>
        SettingsStore.getBool(state.settings, WOOB_AUTO_MERGE_ACCOUNTS)
    );
    const autoUpdate = useKresusState(state =>
        SettingsStore.getBool(state.settings, WOOB_AUTO_UPDATE)
    );
    const enableDebug = useKresusState(state =>
        SettingsStore.getBool(state.settings, WOOB_ENABLE_DEBUG)
    );
    const autoRetry = useKresusState(state =>
        SettingsStore.getBool(state.settings, PROVIDER_AUTO_RETRY)
    );

    const dispatch = useDispatch();

    const setAutoMergeAccounts = useGenericError(
        useCallback(
            (checked: boolean) => {
                return dispatch(SettingsStore.setBool(WOOB_AUTO_MERGE_ACCOUNTS, checked));
            },
            [dispatch]
        )
    );
    const setAutoUpdate = useGenericError(
        useCallback(
            (checked: boolean) => {
                return dispatch(SettingsStore.setBool(WOOB_AUTO_UPDATE, checked));
            },
            [dispatch]
        )
    );
    const setDebug = useGenericError(
        useCallback(
            (checked: boolean) => {
                return dispatch(SettingsStore.setBool(WOOB_ENABLE_DEBUG, checked));
            },
            [dispatch]
        )
    );
    const setAutoRetry = useGenericError(
        useCallback(
            (checked: boolean) => {
                return dispatch(SettingsStore.setBool(PROVIDER_AUTO_RETRY, checked));
            },
            [dispatch]
        )
    );
    const onChangeFetchThreshold = useGenericError(
        useCallback(
            (checked: boolean) => {
                return dispatch(SettingsStore.set(WOOB_FETCH_THRESHOLD, checked ? '0' : '1'));
            },
            [dispatch]
        )
    );

    const fetchWoobVersion = useCallback(async () => {
        try {
            await dispatch(InstanceStore.fetchWoobVersion());
        } catch (error) {
            if ((error as any).code === Errors.WOOB_NOT_INSTALLED) {
                notify.error($t('client.sync.woob_not_installed'));
            } else {
                genericErrorHandler(error);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        void fetchWoobVersion();
        return () => {
            // We want to assure the spinner will be displayed every time before a
            // fetch.
            dispatch(InstanceStore.resetWoobVersion());
        };
    }, [dispatch, fetchWoobVersion]);

    let woobVersion;
    if (version !== UNKNOWN_WOOB_VERSION) {
        woobVersion = version;
    } else {
        woobVersion = <i className="fa fa-spinner" />;
    }

    return (
        <Form center={true}>
            <p className="alerts info">
                <span className="fa fa-question-circle" />
                {$t('client.settings.woob_description')}
                &nbsp;
                {$t('client.settings.woob_version')}
                &nbsp;
                <strong>{woobVersion}</strong>.
            </p>

            <Form.Input
                inline={true}
                id="auto-merge-accounts"
                label={$t('client.settings.woob_auto_merge_accounts')}
                help={$t('client.settings.woob_auto_merge_accounts_desc')}>
                <Switch
                    onChange={setAutoMergeAccounts}
                    ariaLabel={$t('client.settings.woob_auto_merge_accounts')}
                    checked={autoMergeAccounts}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                id="auto-update-woob"
                label={$t('client.settings.woob_auto_update')}
                help={$t('client.settings.woob_auto_update_desc')}>
                <Switch
                    onChange={setAutoUpdate}
                    ariaLabel={$t('client.settings.woob_auto_update')}
                    checked={autoUpdate}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                id="auto-retry"
                label={$t('client.settings.provider_auto_retry')}
                help={$t('client.settings.provider_auto_retry_desc')}>
                <Switch
                    onChange={setAutoRetry}
                    ariaLabel={$t('client.settings.provider_auto_retry')}
                    checked={autoRetry}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                id="update-woob"
                label={$t('client.settings.update_woob')}
                help={$t('client.settings.update_woob_help')}>
                <UpdateButton />
            </Form.Input>

            <Form.Input
                inline={true}
                id="enable-woob-debug"
                label={$t('client.settings.woob_enable_debug')}
                help={$t('client.settings.woob_enable_debug_desc')}>
                <Switch
                    onChange={setDebug}
                    ariaLabel={$t('client.settings.woob_enable_debug')}
                    checked={enableDebug}
                />
            </Form.Input>

            <Form.Input
                inline={true}
                id="fetch-threshold"
                label={$t('client.settings.woob_fetch_threshold')}
                help={
                    <>
                        {$t('client.settings.woob_fetch_threshold_desc')}{' '}
                        <ExternalLink href={$t('client.settings.woob_fetch_threshold_link')}>
                            {$t('client.settings.read_more')}
                        </ExternalLink>
                    </>
                }>
                <Switch
                    onChange={onChangeFetchThreshold}
                    ariaLabel={$t('client.settings.woob_fetch_threshold')}
                    checked={fetchThreshold === '0'}
                />
            </Form.Input>
        </Form>
    );
};

WoobParameters.displayName = 'WoobParameters';

export default WoobParameters;
