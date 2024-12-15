import React, { useCallback, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { useKresusDispatch, useKresusState } from '../../store';
import * as Backend from '../../store/backend';
import * as BanksStore from '../../store/banks';
import * as UiStore from '../../store/ui';
import {
    assert,
    translate as $t,
    notify,
    displayLabel,
    assertNotNull,
    assertDefined,
} from '../../helpers';

import {
    BackLink,
    Form,
    Popconfirm,
    Switch,
    UncontrolledTextInput,
    ValidatedTextInput,
} from '../ui';
import PasswordInput from '../ui/password-input';
import DisplayIf from '../ui/display-if';

import CustomBankField from './custom-bank-field';
import { areCustomFieldsValid, CustomFieldMap } from './new-access-form';
import URL from './urls';
import { useNotifyError, useSyncError } from '../../hooks';
import {
    Access,
    AccessCustomField,
    Bank,
    CustomFieldDescriptor,
    isManualAccess,
} from '../../models';

const SyncForm = (props: { access: Access; bankDesc: Bank }) => {
    const { access, bankDesc } = props;
    const accessId = access.id;

    const dispatch = useKresusDispatch();

    const [customFields, setCustomFields] = useState<CustomFieldMap>(() => {
        const fields: CustomFieldMap = {};
        for (const fieldDesc of bankDesc.customFields) {
            const maybeField = access.customFields.find(field => field.name === fieldDesc.name);
            let value;
            if (!maybeField || typeof maybeField.value === 'undefined') {
                // We could in theory assert here, but if a new custom
                // field is added by Woob and the user hasn't updated it,
                // they'll see an error that doesn't prevent anything from
                // working correctly and might be hard to understand, so
                // don't do it.
                value = null;
            } else {
                value = maybeField.value;
            }
            fields[fieldDesc.name] = value;
        }
        return fields;
    });

    const [login, setLogin] = useState<string | null>(access.login);
    const [password, setPassword] = useState<string | null>(null);

    const isFormValid = !!login && !!password && areCustomFieldsValid(bankDesc, customFields);

    const onSyncAccounts = useSyncError(
        useCallback(async () => {
            await dispatch(BanksStore.runAccountsSync({ accessId: props.access.id })).unwrap();
        }, [dispatch, props.access.id])
    );

    const onChangeCustomField = useCallback(
        (name: string, value: string | null) => {
            assert(
                typeof customFields[name] !== 'undefined',
                'all custom fields must have an initial value'
            );
            // Make sure to create a copy to trigger a re-render.
            const changedCustomFields = { ...customFields, [name]: value };
            setCustomFields(changedCustomFields);
        },
        [customFields, setCustomFields]
    );

    const updateAndFetchAccessCb = useCallback(
        (customFieldsArray: AccessCustomField[]) => {
            assertNotNull(login);
            assertNotNull(password);
            return dispatch(
                BanksStore.updateAndFetchAccess({
                    accessId,
                    login,
                    password,
                    customFields: customFieldsArray,
                })
            );
        },
        [login, password, accessId, dispatch]
    );

    const onSubmit = useSyncError(
        useCallback(async () => {
            assert(isFormValid, 'form should be valid');

            const customFieldsArray: AccessCustomField[] = bankDesc.customFields.map(
                (field: CustomFieldDescriptor) => {
                    assertDefined(customFields[field.name], 'custom fields should all be set');
                    return {
                        name: field.name,
                        type: field.type,
                        value: customFields[field.name],
                    };
                }
            );

            await updateAndFetchAccessCb(customFieldsArray);
            notify.success($t('client.editaccess.success'));
        }, [isFormValid, bankDesc, customFields, updateAndFetchAccessCb])
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
        <Form center={true} onSubmit={onSubmit}>
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

                    <h4>{$t('client.settings.connection_parameters')}</h4>
                </DisplayIf>

                <Form.Input id="login-text" label={$t('client.settings.login')}>
                    <ValidatedTextInput
                        placeholder="123456789"
                        onChange={setLogin}
                        initialValue={login}
                    />
                </Form.Input>

                <Form.Input id="password-text" label={$t('client.settings.password')}>
                    <PasswordInput onChange={setPassword} className="block" autoFocus={true} />
                </Form.Input>

                <DisplayIf condition={!!bankDesc && bankDesc.customFields.length > 0}>
                    {bankDesc.customFields.map((field: CustomFieldDescriptor, index: number) => (
                        <CustomBankField
                            key={index}
                            onChange={onChangeCustomField}
                            field={field}
                            value={customFields[field.name]}
                        />
                    ))}
                </DisplayIf>

                <button type="submit" className="btn primary" disabled={!isFormValid}>
                    {$t('client.general.save')}
                </button>
            </DisplayIf>
        </Form>
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
    const history = useHistory();
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
                history.push(URL.accessList);
            } catch (error) {
                notify.error($t('client.accesses.deletion_error', { error: error.message }));
            }
        }, [history, dispatch, props.access.id])
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

const Labels = (props: { access: Access }) => {
    return (
        <Form center={true}>
            <CustomLabelForm access={props.access} />
            <Form.Input id="original-label" label={$t('client.general.original_label')}>
                <div>{props.access.label}</div>
            </Form.Input>
        </Form>
    );
};

export default () => {
    const { accessId: accessIdStr } = useParams<{ accessId: string }>();
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

    let forms: JSX.Element;
    if (access.enabled) {
        // Display the custom label field, then the sync fields, then the
        // danger zone.
        forms = (
            <>
                <Labels access={access} />
                <DisplayIf condition={!isManualAccess(access)}>
                    <hr />
                    <SyncForm access={access} bankDesc={bankDesc} />
                </DisplayIf>
                <hr />
                <DangerZone access={access} />
            </>
        );
    } else {
        // Display the sync fields, then the custom label field, then the
        // danger zone.
        forms = (
            <>
                <SyncForm access={access} bankDesc={bankDesc} />
                <hr />
                <Labels access={access} />
                <hr />
                <DangerZone access={access} />
            </>
        );
    }

    return (
        <>
            <Form center={true}>
                <BackLink to={URL.accessList}>{$t('client.accesses.back_to_access_list')}</BackLink>
                <h2>
                    {$t('client.accesses.edit_bank_form_title')}: {displayLabel(access)}
                </h2>
            </Form>

            {forms}
        </>
    );
};
