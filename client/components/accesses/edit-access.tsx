import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { get, actions, GlobalState } from '../../store';
import {
    assert,
    translate as $t,
    notify,
    displayLabel,
    assertNotNull,
    assertDefined,
} from '../../helpers';

import { BackLink, Form, Popconfirm, UncontrolledTextInput, ValidatedTextInput } from '../ui';
import PasswordInput from '../ui/password-input';
import DisplayIf from '../ui/display-if';

import CustomBankField from './custom-bank-field';
import { areCustomFieldsValid } from './new-access-form';
import URL from './urls';
import { useNotifyError, useSyncError } from '../../hooks';
import { Access, AccessCustomField, Bank, CustomFieldDescriptor } from '../../models';

type CustomFieldMap = { [name: string]: string | null };

const SyncForm = (props: { access: Access; bankDesc: Bank }) => {
    const { access, bankDesc } = props;
    const accessId = access.id;

    const dispatch = useDispatch();

    const [customFields, setCustomFields] = useState<CustomFieldMap>(() => {
        const fields: CustomFieldMap = {};
        for (const fieldDesc of bankDesc.customFields) {
            const maybeField = access.customFields.find(field => field.name === fieldDesc.name);
            let value;
            if (!maybeField || typeof maybeField.value === 'undefined') {
                // We could in theory assert here, but if a new custom
                // field is added by Weboob and the user hasn't updated it,
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

    const onChangeCustomField = useCallback(
        (name, value) => {
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

    const updateAndFetchAccess = useSyncError(
        useCallback(
            async customFieldsArray => {
                assertNotNull(login);
                assertNotNull(password);
                await actions.updateAndFetchAccess(
                    dispatch,
                    accessId,
                    login,
                    password,
                    customFieldsArray
                );
                notify.success($t('client.editaccess.success'));
            },
            [login, password, accessId, dispatch]
        )
    );

    const onSubmit = useCallback(async () => {
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

        await updateAndFetchAccess(customFieldsArray);
    }, [isFormValid, bankDesc, customFields, updateAndFetchAccess]);

    return (
        <Form center={true} onSubmit={onSubmit}>
            <h3>{$t('client.editaccess.sync_title')}</h3>

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
        </Form>
    );
};

const CustomLabelForm = (props: { access: Access }) => {
    const { access } = props;

    const dispatch = useDispatch();

    const saveCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            async (customLabel: string | null) => {
                if (access.customLabel === customLabel) {
                    return;
                }
                await actions.updateAccess(
                    dispatch,
                    access.id,
                    { customLabel },
                    { customLabel: access.customLabel }
                );
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
    const dispatch = useDispatch();
    const accessId = props.access.id;

    const onDisableAccess = useCallback(async () => {
        await actions.disableAccess(dispatch, accessId);
    }, [dispatch, accessId]);

    const onDeleteSession = useCallback(async () => {
        await actions.deleteAccessSession(accessId);
        notify.success($t('client.editaccess.delete_session_success'));
    }, [accessId]);

    return (
        <Form center={true}>
            <h3>{$t('client.editaccess.danger_zone_title')}</h3>

            <Form.Toolbar align="left">
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
            </Form.Toolbar>
        </Form>
    );
};

export default () => {
    const { accessId: accessIdStr } = useParams<{ accessId: string }>();
    const accessId = Number.parseInt(accessIdStr, 10);

    const access = useSelector<GlobalState, Access>(state => get.accessById(state, accessId));
    const bankDesc = useSelector<GlobalState, Bank>(state =>
        get.bankByUuid(state, access.vendorId)
    );

    let forms: JSX.Element;
    if (access.enabled) {
        // Display the custom label field, then the sync fields, then the
        // danger zone.
        forms = (
            <>
                <Form center={true}>
                    <CustomLabelForm access={access} />
                </Form>
                <hr />
                <SyncForm access={access} bankDesc={bankDesc} />
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
                <Form center={true}>
                    <CustomLabelForm access={access} />
                </Form>
            </>
        );
    }

    return (
        <>
            <Form center={true}>
                <BackLink to={URL.list}>{$t('client.accesses.back_to_access_list')}</BackLink>
                <h2>
                    {$t('client.accesses.edit_bank_form_title')}: {displayLabel(access)}
                </h2>
            </Form>

            {forms}
        </>
    );
};
