import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { get, actions } from '../../store';
import { assert, translate as $t, noValueFoundMessage, useKresusState } from '../../helpers';
import { EMAILS_ENABLED } from '../../../shared/instance';
import { EMAIL_RECIPIENT } from '../../../shared/settings';

import { BackLink, Switch, Form } from '../ui';
import PasswordInput from '../ui/password-input';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';
import ValidableInputText from '../ui/validated-text-input';
import DisplayIf from '../ui/display-if';
import TextInput from '../ui/text-input';

import CustomBankField from './custom-bank-field';
import { Bank, AccessCustomField } from '../../models';
import { useFirstSyncError } from '../../hooks';

export type CustomFieldMap = Record<string, string | null>;

export const renderCustomFields = (
    bankDesc: Bank | null,
    customFieldValues: CustomFieldMap | null,
    handleChange: (name: string, value: string | null) => void
) => {
    if (!bankDesc || !bankDesc.customFields.length) {
        return null;
    }
    assert(customFieldValues !== null, 'must have customFieldValues if bankDesc has custom fields');
    return bankDesc.customFields.map((field, index) => (
        <CustomBankField
            key={index}
            onChange={handleChange}
            field={field}
            value={customFieldValues[field.name]}
        />
    ));
};

export const areCustomFieldsValid = (bankDesc: Bank, customFieldValues: CustomFieldMap | null) => {
    if (!bankDesc.customFields.length) {
        return true;
    }
    assert(customFieldValues !== null, 'must have customFieldValues if bankDesc has custom fields');
    for (const fieldDesc of bankDesc.customFields) {
        if (!fieldDesc.optional && customFieldValues[fieldDesc.name] === null) {
            return false;
        }
    }
    return true;
};

const NewAccessForm = (props: {
    backUrl: string;
    backText: string;
    formTitle: string;
    isOnboarding?: boolean;
    forcedBankUuid?: string;
    onSubmitSuccess?: () => void;
}) => {
    const banks = useKresusState(state => get.activeBanks(state));
    const emailEnabled = useKresusState(state => get.boolInstanceProperty(state, EMAILS_ENABLED));
    const stateEmailRecipient = useKresusState(state => get.setting(state, EMAIL_RECIPIENT));

    const isOnboarding = props.isOnboarding || false;
    const forcedBank = props.forcedBankUuid
        ? banks.find(bank => bank.uuid === props.forcedBankUuid)
        : null;

    const bankCustomFieldsMapBuilder = (bankDesc: Bank): CustomFieldMap | null => {
        let newFields: CustomFieldMap | null = null;
        if (bankDesc.customFields.length) {
            // Set initial custom fields values.
            newFields = {};

            for (const field of bankDesc.customFields) {
                const { name } = field;

                if (field.optional) {
                    // Optional fields don't need to be pre-set.
                    newFields[name] = null;
                    continue;
                }

                if (field.type === 'select') {
                    if (typeof field.default !== 'undefined') {
                        // An explicit default value is defined: use it.
                        newFields[name] = field.default;
                        continue;
                    }

                    // Select the first value by default.
                    newFields[name] = field.values[0].value;
                    continue;
                }

                // Otherwise it's a text/password field.
                newFields[name] = null;
            }
        }

        return newFields;
    };

    const [bankDesc, setBankDesc] = useState<Bank | null>(forcedBank || null);
    const noCredentials = bankDesc ? bankDesc.noCredentials : false;
    const [login, setLogin] = useState<string | null>(noCredentials ? 'nocredentials' : null);
    const [password, setPassword] = useState<string | null>(noCredentials ? 'nocredentials' : null);
    const [mustCreateDefaultAlerts, setCreateDefaultAlerts] = useState(false);
    const [mustCreateDefaultCategories, setCreateDefaultCategories] = useState(isOnboarding);
    const [customLabel, setCustomLabel] = useState<string | null>(null);
    const [customFields, setCustomFields] = useState<CustomFieldMap | null>(
        forcedBank ? bankCustomFieldsMapBuilder(forcedBank) : null
    );

    const [isEmailValid, setIsEmailValid] = useState(!!stateEmailRecipient);
    const [emailRecipient, setEmailRecipient] = useState(stateEmailRecipient);

    const dispatch = useDispatch();
    const createAccess = useCallback(
        (arrayCustomFields: AccessCustomField[]) => {
            assert(bankDesc !== null, 'bank descriptor must be set');
            assert(login !== null, 'login must be set');
            assert(password !== null, 'password must be set');
            return actions.createAccess(
                dispatch,
                bankDesc.uuid,
                login,
                password,
                arrayCustomFields,
                customLabel,
                mustCreateDefaultAlerts
            );
        },
        [dispatch, bankDesc, login, password, customLabel, mustCreateDefaultAlerts]
    );

    const saveEmail = useCallback(
        () => actions.setSetting(dispatch, EMAIL_RECIPIENT, emailRecipient),
        [dispatch, emailRecipient]
    );

    const createDefaultCategories = useCallback(
        () => actions.createDefaultCategories(dispatch),
        [dispatch]
    );

    const handleChangeBank = useCallback(
        (uuid: string | null) => {
            let newBankDesc = null;
            let newFields: CustomFieldMap | null = null;

            if (uuid !== null) {
                newBankDesc = banks.find(bank => bank.uuid === uuid);
                assert(
                    typeof newBankDesc !== 'undefined',
                    "didn't find bank corresponding to selected uuid"
                );

                newFields = bankCustomFieldsMapBuilder(newBankDesc);
            }

            setBankDesc(newBankDesc);
            setCustomFields(newFields);
        },
        [banks, setBankDesc, setCustomFields]
    );

    const isFormValid = useCallback(() => {
        if (!bankDesc || !login || !password) {
            return false;
        }
        if (mustCreateDefaultAlerts && !isEmailValid) {
            return false;
        }
        return areCustomFieldsValid(bankDesc, customFields);
    }, [bankDesc, login, password, mustCreateDefaultAlerts, isEmailValid, customFields]);

    const handleChangeEmail = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setEmailRecipient(event.target.value);
            setIsEmailValid(event.target.validity.valid);
        },
        [setEmailRecipient, setIsEmailValid]
    );

    const handleChangeCustomField = useCallback(
        (name: string, value: string | null) => {
            assert(customFields !== null, 'custom fields must be preset to an object');
            assert(
                typeof customFields[name] !== 'undefined',
                'all custom fields must have an initial value'
            );
            // Make sure to create a copy to trigger a re-render.
            setCustomFields({
                ...customFields,
                [name]: value,
            });
        },
        [setCustomFields, customFields]
    );

    const { onSubmitSuccess } = props;
    const handleSubmit = useFirstSyncError(
        useCallback(async () => {
            assert(isFormValid(), 'form must be valid for submit');
            assert(bankDesc !== null, 'true because of the above');

            const arrayCustomFields = bankDesc.customFields
                .map(field => {
                    assert(
                        customFields !== null,
                        'handleChangeBank implies a custom fields object'
                    );
                    const value = customFields[field.name];
                    assert(
                        !!value || (typeof field.optional !== 'undefined' && field.optional),
                        'null value for a required custom field'
                    );
                    return {
                        name: field.name,
                        type: field.type,
                        value,
                    };
                })
                // Filter out optional values not set to any value, to not increase
                // database load.
                .filter(field => field.value !== null);

            if (mustCreateDefaultAlerts && emailRecipient) {
                await saveEmail();
            }

            // Create access.
            await createAccess(arrayCustomFields);

            // Create default categories if requested.
            if (mustCreateDefaultCategories) {
                await createDefaultCategories();
            }

            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        }, [
            bankDesc,
            createAccess,
            createDefaultCategories,
            customFields,
            emailRecipient,
            isFormValid,
            mustCreateDefaultAlerts,
            mustCreateDefaultCategories,
            onSubmitSuccess,
            saveEmail,
        ])
    ) as any as (...args: any[]) => Promise<void>;

    const bankOptions = banks.map(bank => ({
        value: bank.uuid,
        label: bank.name,
    }));

    return (
        <Form center={true} onSubmit={handleSubmit}>
            <BackLink to={props.backUrl}>{props.backText}</BackLink>

            <h3>{props.formTitle}</h3>

            <Form.Input
                id="bank-combobox"
                label={$t('client.accountwizard.bank')}
                hidden={!!forcedBank}>
                <FuzzyOrNativeSelect
                    className="form-element-block"
                    clearable={true}
                    noOptionsMessage={noValueFoundMessage}
                    onChange={handleChangeBank}
                    options={bankOptions}
                    placeholder={$t('client.general.select')}
                    required={true}
                    value={(bankDesc && bankDesc.uuid) || ''}
                />
            </Form.Input>

            <Form.Input
                id="custom-label-text"
                label={$t('client.settings.custom_label')}
                optional={true}>
                <TextInput onChange={setCustomLabel} />
            </Form.Input>

            <Form.Input id="login-text" label={$t('client.settings.login')} hidden={noCredentials}>
                <ValidableInputText
                    placeholder="123456789"
                    onChange={setLogin}
                    initialValue={login}
                />
            </Form.Input>

            <Form.Input
                id="password-text"
                label={$t('client.settings.password')}
                hidden={noCredentials}>
                <PasswordInput onChange={setPassword} className="block" defaultValue={password} />
            </Form.Input>

            {renderCustomFields(bankDesc, customFields, handleChangeCustomField)}

            <DisplayIf condition={isOnboarding}>
                <Form.Input
                    inline={true}
                    id="default-categories-switch"
                    label={$t('client.accountwizard.default_categories')}
                    help={$t('client.accountwizard.default_categories_desc')}>
                    <Switch
                        ariaLabel={$t('client.accountwizard.default_categories')}
                        checked={mustCreateDefaultCategories}
                        onChange={setCreateDefaultCategories}
                    />
                </Form.Input>
            </DisplayIf>

            <DisplayIf condition={emailEnabled}>
                <Form.Input
                    inline={true}
                    id="default-alerts"
                    label={$t('client.accountwizard.default_alerts')}
                    help={$t('client.accountwizard.default_alerts_desc')}>
                    <Switch
                        ariaLabel={$t('client.accountwizard.default_alerts')}
                        checked={mustCreateDefaultAlerts}
                        onChange={setCreateDefaultAlerts}
                    />
                </Form.Input>

                <DisplayIf condition={mustCreateDefaultAlerts}>
                    <Form.Input id="email" label={$t('client.settings.emails.send_to')}>
                        <input
                            type="email"
                            className="form-element-block check-validity"
                            id="email"
                            placeholder="me@example.com"
                            value={emailRecipient}
                            onChange={handleChangeEmail}
                            required={true}
                        />
                    </Form.Input>
                </DisplayIf>
            </DisplayIf>

            <input
                type="submit"
                className="btn primary"
                value={$t('client.accountwizard.add_bank_button')}
                disabled={!isFormValid()}
            />
        </Form>
    );
};

NewAccessForm.displayName = 'NewAccessForm';

export default NewAccessForm;
