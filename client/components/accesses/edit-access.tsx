import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useKresusDispatch, useKresusState } from '../../store';
import * as Backend from '../../store/backend';
import * as BanksStore from '../../store/banks';
import * as UiStore from '../../store/ui';
import { assert, translate as $t, notify, displayLabel } from '../../helpers';

import { BackLink, Form, Popconfirm, Switch, UncontrolledTextInput } from '../ui';

import DisplayIf from '../ui/display-if';
import CredentialsForm from './sync-form';

import URL from './urls';
import { useNotifyError, useSyncError, useRequiredParams } from '../../hooks';
import { Access, AccessCustomField, Bank, isManualAccess } from '../../models';

const SyncForm = (props: { access: Access; bankDesc: Bank }) => {
    const { access, bankDesc } = props;
    const accessId = access.id;

    const dispatch = useKresusDispatch();

    const onSyncAccounts = useSyncError(
        useCallback(async () => {
            await dispatch(BanksStore.runAccountsSync({ accessId: props.access.id })).unwrap();
        }, [dispatch, props.access.id])
    );

    const onSubmit = useSyncError(
        useCallback(
            async (customFieldsArray: AccessCustomField[], storeCredentials: boolean) => {
                await dispatch(
                    BanksStore.updateAndFetchAccess({
                        accessId,
                        customFields: customFieldsArray,
                        storeCredentials,
                    })
                ).unwrap();
                notify.success($t('client.editaccess.success'));
            },
            [accessId, dispatch]
        )
    );

    const onToggleExcludeFromPoll = useNotifyError(
        'client.general.update_fail',
        useCallback(async () => {
            const initial = access.excludeFromPoll;
            const newValue = !initial;
            await dispatch(
                BanksStore.updateAccess({
                    accessId: access.id,
                    newFields: { excludeFromPoll: newValue },
                    prevFields: { excludeFromPoll: initial },
                })
            ).unwrap();
        }, [access, dispatch])
    );

    return (
        <div className="form-center">
            <h3>{$t('client.editaccess.sync_title')}</h3>

            <DisplayIf condition={bankDesc.deprecated}>
                <p>{$t('client.editaccess.deprecated_access')}</p>
            </DisplayIf>

            <DisplayIf condition={!bankDesc.deprecated}>
                <p>
                    {$t('client.editaccess.this_access')}&nbsp;
                    <strong>
                        {access.enabled
                            ? $t('client.editaccess.enabled')
                            : $t('client.editaccess.disabled')}
                    </strong>
                    .
                </p>

                <DisplayIf condition={!access.enabled}>
                    <p>{$t('client.editaccess.fill_the_fields')}</p>
                </DisplayIf>

                <DisplayIf condition={access.enabled}>
                    <Form.Input
                        inline={true}
                        id="reload-accounts"
                        label={$t('client.settings.reload_accounts')}
                        help={$t('client.settings.reload_accounts_help')}>
                        <button type="button" className="btn primary" onClick={onSyncAccounts}>
                            {$t('client.settings.reload_accounts_go')}
                        </button>
                    </Form.Input>

                    <Form.Input
                        inline={true}
                        id="exclude-from-poll"
                        label={$t('client.editaccess.include_in_polls')}
                        help={$t('client.editaccess.include_in_polls_details')}>
                        <Switch
                            onChange={onToggleExcludeFromPoll}
                            ariaLabel={$t('client.editaccess.include_in_polls')}
                            checked={!access.excludeFromPoll}
                        />
                    </Form.Input>
                </DisplayIf>

                <h4>{$t('client.settings.connection_parameters')}</h4>

                <CredentialsForm
                    key={String(access.enabled)}
                    bankDesc={bankDesc}
                    accessCustomFields={access.customFields}
                    initialStoreCredentials={access.enabled}
                    onSubmit={onSubmit}
                />
            </DisplayIf>
        </div>
    );
};

const CustomLabelForm = (props: { access: Access }) => {
    const { access } = props;
    const dispatch = useKresusDispatch();
    const saveCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            async (customLabel: string | null) => {
                if (access.customLabel === customLabel) {
                    return;
                }
                await dispatch(
                    BanksStore.updateAccess({
                        accessId: access.id,
                        newFields: { customLabel },
                        prevFields: { customLabel: access.customLabel },
                    })
                ).unwrap();
            },
            [access, dispatch]
        )
    );
    return (
        <Form.Input
            id="custom-label-text"
            label={$t('client.settings.custom_label')}
            optional={true}>
            <UncontrolledTextInput onSubmit={saveCustomLabel} value={access.customLabel} />
        </Form.Input>
    );
};

const DangerZone = (props: { access: Access }) => {
    const dispatch = useKresusDispatch();
    const navigate = useNavigate();
    const accessId = props.access.id;
    const isDemoEnabled = useKresusState(state => UiStore.isDemoMode(state.ui));

    const onDisableAccess = useCallback(async () => {
        await dispatch(BanksStore.disableAccess(accessId)).unwrap();
    }, [dispatch, accessId]);

    const onDeleteSession = useCallback(async () => {
        await Backend.deleteAccessSession(accessId);
        notify.success($t('client.editaccess.delete_session_success'));
    }, [accessId]);

    const onDeleteAccess = useNotifyError(
        'client.general.unexpected_error',
        useCallback(async () => {
            try {
                await dispatch(BanksStore.deleteAccess(props.access.id)).unwrap();
                notify.success($t('client.accesses.deletion_success'));
                navigate(URL.accessList);
            } catch (error) {
                notify.error($t('client.accesses.deletion_error', { error: error.message }));
            }
        }, [navigate, dispatch, props.access.id])
    );

    return (
        <Form center={true}>
            <h3>{$t('client.editaccess.danger_zone_title')}</h3>

            <Form.Toolbar align="left">
                <DisplayIf condition={props.access.enabled && !isManualAccess(props.access)}>
                    <Popconfirm
                        trigger={
                            <button type="button" className="btn danger">
                                {$t('client.editaccess.disable_access')}
                            </button>
                        }
                        onConfirm={onDisableAccess}>
                        <p>{$t('client.editaccess.disable_access_body')}</p>
                    </Popconfirm>

                    <Popconfirm
                        trigger={
                            <button type="button" className="btn danger">
                                {$t('client.editaccess.delete_session')}
                            </button>
                        }
                        onConfirm={onDeleteSession}>
                        <p>{$t('client.editaccess.delete_session_help')}</p>
                    </Popconfirm>
                </DisplayIf>

                <DisplayIf condition={!isDemoEnabled}>
                    <Popconfirm
                        trigger={
                            <button type="button" className="btn danger">
                                {$t('client.settings.delete_access_button')}
                            </button>
                        }
                        onConfirm={onDeleteAccess}>
                        <p>
                            {$t('client.settings.delete_access', {
                                name: displayLabel(props.access),
                            })}
                        </p>
                    </Popconfirm>
                </DisplayIf>
            </Form.Toolbar>
        </Form>
    );
};

export default () => {
    const { accessId: accessIdStr } = useRequiredParams<{ accessId: string }>();
    const accessId = Number.parseInt(accessIdStr, 10);

    const access = useKresusState(state => {
        if (!BanksStore.accessExists(state.banks, accessId)) {
            return null;
        }
        return BanksStore.accessById(state.banks, accessId);
    });
    const bankDesc = useKresusState(state => {
        if (access === null) return null;
        return BanksStore.bankByUuid(state.banks, access.vendorId);
    });

    if (access === null) {
        return null;
    }
    assert(bankDesc !== null, 'bank descriptor must be set at this point');

    return (
        <>
            <Form center={true}>
                <BackLink to={URL.accessList}>{$t('client.accesses.back_to_access_list')}</BackLink>
                <h2>
                    {$t('client.accesses.edit_bank_form_title')}: {displayLabel(access)}
                </h2>
            </Form>

            <Form center={true}>
                <CustomLabelForm access={access} />
                <Form.Input id="original-label" label={$t('client.general.original_label')}>
                    <div>{access.label}</div>
                </Form.Input>
            </Form>

            <DisplayIf condition={!isManualAccess(access)}>
                <hr />
                <SyncForm access={access} bankDesc={bankDesc} />
            </DisplayIf>

            <hr />

            <DangerZone access={access} />
        </>
    );
};
