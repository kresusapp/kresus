import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions, get } from '../../store';

import {
    translate as $t,
    NONE_CATEGORY_ID,
    UNKNOWN_OPERATION_TYPE,
    displayLabel,
    notify,
    useKresusState,
} from '../../helpers';

import CategorySelect from './category-select';
import TypeSelect from './type-select';

import { registerModal } from '../ui/modal';
import CancelAndSubmit from '../ui/modal/cancel-and-submit-buttons';
import ModalContent from '../ui/modal/content';

import AmountInput from '../ui/amount-input';
import DisplayIf from '../ui/display-if';
import ValidatedDatePicker from '../ui/validated-date-picker';
import ValidatedTextInput from '../ui/validated-text-input';

export const ADD_OPERATION_MODAL_SLUG = 'add-operation';

const AddOperationModal = () => {
    const accountId = useKresusState(state => get.modal(state).state) as number;
    const account = useKresusState(state => get.accountById(state, accountId));

    const dispatch = useDispatch();

    const createTransaction = useCallback(
        async operation => {
            try {
                await actions.createOperation(dispatch, operation);
                actions.hideModal(dispatch);
            } catch (err) {
                notify.error(err.message);
            }
        },
        [dispatch]
    );

    const [date, setDate] = useState<Date | undefined>();
    const [label, setLabel] = useState<string | null>(null);
    const [amount, setAmount] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState<number | undefined>(NONE_CATEGORY_ID);
    const [type, setType] = useState<string>(UNKNOWN_OPERATION_TYPE);

    const handleSetCategoryId = useCallback(
        (newVal: number | null) => {
            // Normalize null into undefined.
            setCategoryId(newVal === null ? undefined : newVal);
        },
        [setCategoryId]
    );

    const handleSubmit = useCallback(
        async event => {
            event.preventDefault();
            const operation = {
                date,
                label,
                amount,
                categoryId,
                type,
                accountId: account.id,
            };
            await createTransaction(operation);
        },
        [date, label, amount, categoryId, type, account, createTransaction]
    );

    const submitIsEnabled = () => {
        return date && label && label.trim().length && amount && !Number.isNaN(amount);
    };

    const accountLabel = displayLabel(account);
    const title = $t('client.addoperationmodal.add_operation', {
        account: accountLabel,
    });

    const body = (
        <React.Fragment>
            <p>
                {$t('client.addoperationmodal.description', {
                    account: accountLabel,
                })}
            </p>

            <DisplayIf condition={account.vendorId !== 'manual'}>
                <p className="alerts warning">{$t('client.addoperationmodal.warning')}</p>
            </DisplayIf>

            <form id={ADD_OPERATION_MODAL_SLUG} onSubmit={handleSubmit}>
                <div className="cols-with-label">
                    <label htmlFor={`date${account.id}`}>
                        {$t('client.addoperationmodal.date')}
                    </label>
                    <ValidatedDatePicker
                        id={`date${account.id}`}
                        onSelect={setDate}
                        value={date}
                        className="block"
                    />
                </div>

                <div className="cols-with-label">
                    <label htmlFor={`type${account.id}`}>
                        {$t('client.addoperationmodal.type')}
                    </label>
                    <TypeSelect onChange={setType} value={type} id={`type${account.id}`} />
                </div>

                <div className="cols-with-label">
                    <label htmlFor={`label${account.id}`}>
                        {$t('client.addoperationmodal.label')}
                    </label>
                    <ValidatedTextInput id={`label${account.id}`} onChange={setLabel} />
                </div>

                <div className="cols-with-label">
                    <label htmlFor={`amount${account.id}`}>
                        {$t('client.addoperationmodal.amount')}
                    </label>
                    <AmountInput
                        id={`amount${account.id}`}
                        signId={`sign${account.id}`}
                        onChange={setAmount}
                        checkValidity={true}
                        className="block"
                    />
                </div>

                <div className="cols-with-label">
                    <label htmlFor={`category${account.id}`}>
                        {$t('client.addoperationmodal.category')}
                    </label>
                    <CategorySelect
                        id={`category${account.id}`}
                        onChange={handleSetCategoryId}
                        value={categoryId}
                    />
                </div>
            </form>
        </React.Fragment>
    );

    // work aruond typescript
    const CancelAndSubmit2 = CancelAndSubmit as any;
    const footer = (
        <CancelAndSubmit2
            submitLabel={$t('client.addoperationmodal.submit')}
            isSubmitDisabled={!submitIsEnabled()}
            formId={ADD_OPERATION_MODAL_SLUG}
        />
    );

    // work aruond typescript
    const ModalContent2 = ModalContent as any;
    return <ModalContent2 title={title} body={body} footer={footer} />;
};

registerModal(ADD_OPERATION_MODAL_SLUG, () => <AddOperationModal />);
