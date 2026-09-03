import { useCallback } from 'react';
import { assertNotNull, currency, translate as $t, notify } from '../../helpers';
import { useGenericError } from '../../hooks';
import type { Transaction } from '../../models';
import { useKresusDispatch, useKresusState } from '../../store';
import * as BanksStore from '../../store/banks';
import AmountInput from '../ui/amount-input';

interface Props {
    // The transaction from which to get the amount.
    transaction: Transaction;
}

const AmountComponent = (props: Props) => {
    const dispatch = useKresusDispatch();
    const setAmount = useGenericError(
        useCallback(
            async (amount: number) => {
                await dispatch(
                    BanksStore.setTransactionAmount({
                        transaction: props.transaction,
                        amount,
                    })
                ).unwrap();

                notify.success($t('client.transactions.amount_update_success'));
            },
            [dispatch, props]
        )
    );

    const account = useKresusState(state => {
        return props.transaction !== null
            ? BanksStore.accountById(state.banks, props.transaction.accountId)
            : null;
    });

    assertNotNull(account);

    const currencyFormatter = currency.makeFormat(account.currency);

    if (props.transaction.createdByUser) {
        return (
            <AmountInput
                defaultValue={props.transaction.amount}
                signId={`transaction-amount-${props.transaction.id}`}
                onInput={setAmount}
                currencySymbol={account.currencySymbol}
            />
        );
    }

    return <span>{currencyFormatter(props.transaction.amount)}</span>;
};

AmountComponent.displayName = 'AmountComponent';

export default AmountComponent;
