import React, { useCallback, useState } from 'react';

import { assert, assertDefined, translate as $t } from '../../helpers';
import { AccessCustomField, Bank, CustomFieldDescriptor } from '../../models';
import {
    CustomFieldMap,
    areCustomFieldsValid,
    customFieldsContainCredentials,
    bankCustomFieldsMapBuilder,
} from './new-access-form';

import CustomBankField from './custom-bank-field';
import DisplayIf from '../ui/display-if';
import { Form, Switch } from '../ui';

export interface CredentialsFormProps {
    bankDesc: Bank;
    accessCustomFields: AccessCustomField[];
    initialStoreCredentials: boolean;
    showStoreCredentials?: boolean;
    onSubmit: (customFieldsArray: AccessCustomField[], storeCredentials: boolean) => void;
}

const CredentialsForm = (props: CredentialsFormProps) => {
    const {
        bankDesc,
        accessCustomFields,
        initialStoreCredentials,
        showStoreCredentials = true,
        onSubmit,
    } = props;

    const [storeCredentials, setStoreCredentials] = useState(initialStoreCredentials);

    const [customFields, setCustomFields] = useState<CustomFieldMap>(() => {
        const fields: CustomFieldMap = bankCustomFieldsMapBuilder(bankDesc) || {};
        for (const field of accessCustomFields) {
            fields[field.name] = field.value;
        }

        return fields;
    });

    const onChangeCustomField = useCallback(
        (name: string, value: string | null) => {
            assert(
                typeof customFields[name] !== 'undefined',
                'all custom fields must have an initial value'
            );
            setCustomFields({ ...customFields, [name]: value });
        },
        [customFields]
    );
    const noCredentials = bankDesc ? bankDesc.noCredentials : false;
    const isFormValid =
        areCustomFieldsValid(bankDesc, customFields) &&
        (noCredentials || customFieldsContainCredentials(customFields));

    const handleSubmit = useCallback(() => {
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

        if (!noCredentials) {
            assert(
                customFieldsArray.some(f => f.name === 'login' && !!f.value),
                'login must be set'
            );
            assert(
                customFieldsArray.some(f => f.name === 'password' && !!f.value),
                'password must be set'
            );
        }

        onSubmit(customFieldsArray, storeCredentials);
    }, [onSubmit, storeCredentials, bankDesc, customFields, noCredentials]);

    return (
        <Form center={true} onSubmit={handleSubmit} className="sub-form">
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

            <DisplayIf condition={!noCredentials && showStoreCredentials}>
                <Form.Input
                    inline={true}
                    id="store-credentials"
                    label={$t('client.accountwizard.store_credentials')}
                    help={$t('client.accountwizard.store_credentials_desc')}>
                    <Switch
                        ariaLabel={$t('client.accountwizard.store_credentials')}
                        checked={storeCredentials}
                        onChange={setStoreCredentials}
                    />
                </Form.Input>
            </DisplayIf>

            <button type="submit" className="btn primary" disabled={!isFormValid}>
                {$t('client.general.save')}
            </button>
        </Form>
    );
};

export default CredentialsForm;
