import React, { useCallback, useState } from 'react';

import * as BanksStore from '../../../store/banks';
import * as ViewsStore from '../../../store/views';
import { useKresusDispatch, useKresusState } from '../../../store';
import { assert, translate as $t, noValueFoundMessage, displayLabel } from '../../../helpers';

import { BackLink, Form } from '../../ui';
import MultipleSelect from '../../ui/multiple-select';
import TextInput from '../../ui/text-input';
import { useGenericError } from '../../../hooks';
import { View } from '../../../models';

const NewViewForm = (props: {
    backUrl: string;
    backText: string;
    formTitle: string;
    view?: View;
    onSubmitSuccess?: () => void;
}) => {
    const dispatch = useKresusDispatch();

    const { view, onSubmitSuccess } = props;

    const [label, setLabel] = useState<string | null>(props.view ? props.view.label : '');
    const [accountsIds, setAccountsIds] = useState<number[]>(props.view ? props.view.accounts : []);

    const accountsOptions = useKresusState(state => {
        const ret = [];

        const accessIds = BanksStore.getAccessIds(state.banks);
        for (const accessId of accessIds) {
            const accountIds = BanksStore.accountIdsByAccessId(state.banks, accessId);
            const access = BanksStore.accessById(state.banks, accessId);
            for (const accountId of accountIds) {
                const account = BanksStore.accountById(state.banks, accountId);
                ret.push({
                    label: `${displayLabel(access)} / ${displayLabel(account)}`,
                    value: account.id,
                });
            }
        }
        return ret;
    });

    const handleAccountsListChange = useCallback(
        (newValue: (string | number)[]) => {
            setAccountsIds(newValue as number[]);
        },
        [setAccountsIds]
    );

    const isFormValid = useCallback(() => {
        if (!label) {
            return false;
        }

        if (accountsIds.length < 1) {
            return false;
        }

        return true;
    }, [label, accountsIds]);

    const handleSubmit = useGenericError(
        useCallback(async () => {
            assert(isFormValid(), 'form must be valid for submit');
            assert(
                typeof label === 'string',
                'label not a string while asserted so in `isFormValid`'
            );

            if (view) {
                await dispatch(
                    ViewsStore.update({
                        former: view,
                        view: {
                            label,
                            accounts: accountsIds,
                        },
                    })
                ).unwrap();
            } else {
                await dispatch(
                    ViewsStore.create({
                        label,
                        accounts: accountsIds,
                    })
                ).unwrap();
            }

            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        }, [dispatch, label, accountsIds, isFormValid, onSubmitSuccess, view])
    );

    return (
        <Form center={true} onSubmit={handleSubmit}>
            <BackLink to={props.backUrl}>{props.backText}</BackLink>

            <h3>{props.formTitle}</h3>

            <Form.Input
                id="custom-label-text"
                label={$t('client.settings.views.label')}
                optional={false}>
                <TextInput onChange={setLabel} initialValue={label || ''} required={true} />
            </Form.Input>

            <Form.Input id="view-combobox" label={$t('client.settings.views.accounts')}>
                <MultipleSelect
                    className="form-element-block"
                    noOptionsMessage={noValueFoundMessage}
                    onChange={handleAccountsListChange}
                    options={accountsOptions}
                    values={accountsIds}
                    placeholder={$t('client.general.select')}
                    required={true}
                />
            </Form.Input>

            <input
                type="submit"
                className="btn primary"
                value={$t('client.general.save')}
                disabled={!isFormValid()}
            />
        </Form>
    );
};

NewViewForm.displayName = 'NewViewForm';

export default NewViewForm;
