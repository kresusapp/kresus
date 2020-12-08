import React, { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { get, actions } from '../../store';
import { assert, translate as $t, notify, displayLabel } from '../../helpers';

import { BackLink, Form, Popconfirm } from '../ui';
import TextInput from '../ui/text-input';
import ValidableInputText from '../ui/validated-text-input';
import PasswordInput from '../ui/password-input';
import DisplayIf from '../ui/display-if';

import CustomBankField from './custom-bank-field';
import { areCustomFieldsValid } from './new-access-form';
import URL from './urls';
import { useNotifyError, useSyncError } from '../../hooks';

interface CustomField {
    name: string;
    value: string;
}

type CustomFieldMap = { [name: string]: string };

export default () => {
    const history = useHistory();

    const { accessId: accessIdStr } = useParams<{accessId: string }>();
    const accessId = Number.parseInt(accessIdStr, 10);

    const dispatch = useDispatch();
    const access = useSelector(state => get.accessById(state, accessId));
    const bankDesc = useSelector(state => get.bankByUuid(state, access.vendorId));

    const [customFields, setCustomFields] = useState<CustomFieldMap>(() => {
        const fields = {};
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

    const [login, setLogin] = useState(access.login);
    const [password, setPassword] = useState<string | null>(null);
    const [customLabel, setCustomLabel] = useState(access.customLabel);

    const isFormValid = !!login && !!password && areCustomFieldsValid(bankDesc, customFields);

    const onDisableAccess = useCallback(async () => {
        await actions.disableAccess(dispatch, accessId);
        history.push(URL.list);
    }, [dispatch, accessId, history]);

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

    const setAccessCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(async () => {
            await actions.updateAccess(
                dispatch,
                access.id,
                { customLabel },
                { customLabel: access.customLabel }
            );
        }, [access, customLabel, dispatch])
    );

    const onSubmit = useCallback(async () => {
        assert(isFormValid);

        const customFieldsArray: CustomField[] = bankDesc.customFields.map((field: CustomField) => {
            assert(
                typeof customFields[field.name] !== 'undefined',
                'custom fields should all be set'
            );
            return {
                name: field.name,
                value: customFields[field.name],
            };
        });

        if ((await updateAndFetchAccess(customFieldsArray)) && (await setAccessCustomLabel())) {
            history.push(URL.list);
        }
    }, [isFormValid, bankDesc, customFields, history, updateAndFetchAccess, setAccessCustomLabel]);

    return (
        <Form center={true} onSubmit={onSubmit}>
            <BackLink to={URL.list}>{$t('client.accesses.back_to_access_list')}</BackLink>

            <h3>
                {$t('client.accesses.edit_bank_form_title')}: {displayLabel(access)}
            </h3>

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
                <Popconfirm
                    trigger={
                        <button type="button" className="btn danger">
                            {$t('client.editaccess.disable_access')}
                        </button>
                    }
                    onConfirm={onDisableAccess}>
                    <h4>{$t('client.disableaccessmodal.title')}</h4>
                    <p>{$t('client.disableaccessmodal.body')}</p>
                </Popconfirm>
                <hr />
            </DisplayIf>

            <Form.Input
                id="custom-label-text"
                label={$t('client.settings.custom_label')}
                optional={true}>
                <TextInput onChange={setCustomLabel} value={customLabel} />
            </Form.Input>

            <Form.Input id="login-text" label={$t('client.settings.login')}>
                <ValidableInputText placeholder="123456789" onChange={setLogin} value={login} />
            </Form.Input>

            <Form.Input id="password-text" label={$t('client.settings.password')}>
                <PasswordInput onChange={setPassword} className="block" autoFocus={true} />
            </Form.Input>

            <DisplayIf condition={!!bankDesc && bankDesc.customFields.length > 0}>
                {bankDesc.customFields.map((field: CustomField, index: number) => (
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
