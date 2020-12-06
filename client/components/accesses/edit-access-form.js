import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { assert, translate as $t, notify, wrapNotifyError, displayLabel } from '../../helpers';
import { EMAILS_ENABLED } from '../../../shared/instance';
import { EMAIL_RECIPIENT } from '../../../shared/settings';
import URL from '../../urls';

import { BackLink, Form, Popconfirm } from '../ui';
import TextInput from '../ui/text-input';
import ValidableInputText from '../ui/validated-text-input';
import PasswordInput from '../ui/password-input';
import DisplayIf from '../ui/display-if';

import CustomBankField from './custom-bank-field';
import { areCustomFieldsValid } from './new-access-form';
import { wrapSyncError } from '../../errors';

export default connect(
    (state, props) => {
        let access = get.accessById(state, props.accessId);
        return {
            access,
            bankDesc: get.bankByUuid(state, access.vendorId),
            emailEnabled: get.boolInstanceProperty(state, EMAILS_ENABLED),
            emailRecipient: get.setting(state, EMAIL_RECIPIENT),
        };
    },

    (dispatch, props) => {
        return {
            updateAndFetchAccess: wrapSyncError(async (accessId, login, password, customFields) => {
                await actions.updateAndFetchAccess(
                    dispatch,
                    accessId,
                    login,
                    password,
                    customFields
                );
                notify.success($t('client.editaccess.success'));
                props.onSubmitSuccess();
            }),
            setAccessCustomLabel: wrapNotifyError('client.general.update_fail')(
                async (oldCustomLabel, customLabel) => {
                    await actions.updateAccess(
                        dispatch,
                        props.accessId,
                        { customLabel },
                        { customLabel: oldCustomLabel }
                    );
                }
            ),
            handleDisableAccess() {
                actions.disableAccess(dispatch, props.accessId);
                props.onSubmitSuccess();
            },
        };
    },

    (stateToProps, dispatchToProp) => {
        let { updateAndFetchAccess, setAccessCustomLabel, ...rest } = dispatchToProp;
        return {
            ...stateToProps,
            ...rest,
            async handleSave(login, password, customFields, customLabel) {
                await updateAndFetchAccess(stateToProps.access.id, login, password, customFields);
                await setAccessCustomLabel(stateToProps.access.customLabel, customLabel);
            },
        };
    }
)(props => {
    let initialCustomFields = {};
    for (let fieldDesc of props.bankDesc.customFields) {
        let maybeField = props.access.customFields.find(field => field.name === fieldDesc.name);

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
        initialCustomFields[fieldDesc.name] = value;
    }

    const bankDesc = props.bankDesc;
    const handleSave = props.handleSave;

    // TODO revisit how the initial value is computed
    const [customFields, setCustomFields] = useState(initialCustomFields);
    const [login, setLogin] = useState(props.access.login);
    const [password, setPassword] = useState(null);
    const [customlabel, setCustomLabel] = useState(props.access.customLabel);

    const handleChangeCustomField = useCallback(
        (name, value) => {
            assert(
                typeof customFields[name] !== 'undefined',
                'all custom fields must have an initial value'
            );
            // Make sure to create a copy to trigger a re-render.
            let changedCustomFields = { ...customFields, [name]: value };
            setCustomFields(changedCustomFields);
        },
        [customFields, setCustomFields]
    );

    const isFormValid = useCallback(() => {
        return !!login && !!password && areCustomFieldsValid(bankDesc, customFields);
    }, [login, password, bankDesc, customFields]);

    const handleSubmit = useCallback(async () => {
        assert(isFormValid());

        let localCustomFields = bankDesc.customFields.map(field => {
            assert(
                typeof customFields[field.name] !== 'undefined',
                'custom fields should all be set'
            );
            return {
                name: field.name,
                value: customFields[field.name],
            };
        });
        handleSave(login, password, localCustomFields, customlabel);
    }, [isFormValid, bankDesc, customFields, login, password, customlabel, handleSave]);

    const renderCustomFields = (customFieldValues, handleChange) => {
        if (!bankDesc || !bankDesc.customFields.length) {
            return null;
        }
        return bankDesc.customFields.map((field, index) => (
            <CustomBankField
                key={index}
                onChange={handleChange}
                field={field}
                value={customFieldValues[field.name]}
            />
        ));
    };

    return (
        <Form center={true} onSubmit={handleSubmit}>
            <BackLink to={URL.accesses.url()}>{$t('client.accesses.back_to_access_list')}</BackLink>

            <h3>
                {$t('client.accesses.edit_bank_form_title')}: {displayLabel(props.access)}
            </h3>

            <p>
                {$t('client.editaccess.this_access')}&nbsp;
                <strong>
                    {props.access.enabled
                        ? $t('client.editaccess.enabled')
                        : $t('client.editaccess.disabled')}
                </strong>
                .
            </p>
            <DisplayIf condition={!props.access.enabled}>
                <p>{$t('client.editaccess.fill_the_fields')}</p>
            </DisplayIf>
            <DisplayIf condition={props.access.enabled}>
                <Popconfirm
                    trigger={
                        <button type="button" className="btn danger">
                            {$t('client.editaccess.disable_access')}
                        </button>
                    }
                    onConfirm={props.handleDisableAccess}>
                    <h4>{$t('client.disableaccessmodal.title')}</h4>
                    <p>{$t('client.disableaccessmodal.body')}</p>
                </Popconfirm>
                <hr />
            </DisplayIf>

            <Form.Input
                id="custom-label-text"
                label={$t('client.settings.custom_label')}
                optional={true}>
                <TextInput onChange={setCustomLabel} value={customlabel} />
            </Form.Input>

            <Form.Input id="login-text" label={$t('client.settings.login')}>
                <ValidableInputText placeholder="123456789" onChange={setLogin} value={login} />
            </Form.Input>

            <Form.Input id="password-text" label={$t('client.settings.password')}>
                <PasswordInput onChange={setPassword} className="block" autoFocus={true} />
            </Form.Input>

            {renderCustomFields(customFields, handleChangeCustomField)}

            <button type="submit" className="btn primary" disabled={!isFormValid()}>
                {$t('client.general.save')}
            </button>
        </Form>
    );
});
