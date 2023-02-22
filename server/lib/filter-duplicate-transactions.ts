import moment from 'moment';

import { amountAndLabelAndDateMatch } from './diff-transactions';
import { Transaction } from '../models';
import { UNKNOWN_TRANSACTION_TYPE, DEFERRED_CARD_TYPE, TRANSACTION_CARD_TYPE } from '../helpers';

/*
    This function tries to be smarter in detecting which of the provided
    transactions can safely be used to update the known transaction.
    when a pair of duplicate candidates transaction is detected, the known transaction
    can safely be updated if:
    - the known and provided transactions have all fields equal but the type
    AND one of the below conditions is verified:
    - the known transaction type is unknown and the provided one has a definite type
    - the transaction type has switched from DEFERRED_CARD_TYPE to TRANSACTION_CARD_TYPE,
      and the current date is after the transaction debitDate, as a deferred transaction
      can only become a "normal" transaction once its debit date is passed (a deferred transaction
      is by definition a transaction which debit date is in the future).
*/
export default function filterDuplicateTransactions(
    duplicates: [Transaction, Partial<Transaction>][]
): {
    toCreate: Partial<Transaction>[];
    toUpdate: {
        known: Transaction;
        update: Partial<Transaction>;
    }[];
} {
    const toCreate: Partial<Transaction>[] = [];
    const toUpdate: { known: Transaction; update: Partial<Transaction> }[] = [];

    const today = new Date();

    for (const [known, provided] of duplicates) {
        // We ignore transactions which differ from more than just the type.
        if (!amountAndLabelAndDateMatch(known, provided)) {
            toCreate.push(provided);
            continue;
        }

        // If the type in the database is unknown, set it to the provided one.
        if (known.type === UNKNOWN_TRANSACTION_TYPE && provided.type !== UNKNOWN_TRANSACTION_TYPE) {
            toUpdate.push({ known, update: { type: provided.type } });
            continue;
        }

        // The transaction type which was "deferred_card", is now "card", and the debitDate is now
        // in the past (ie. the change of type is legitimate), update the transaction.
        if (
            known.debitDate &&
            known.type === DEFERRED_CARD_TYPE.name &&
            provided.type === TRANSACTION_CARD_TYPE.name &&
            moment(known.debitDate).isSameOrBefore(today, 'day')
        ) {
            toUpdate.push({ known, update: { type: TRANSACTION_CARD_TYPE.name } });
            continue;
        }

        // If the known type was set by the user, consider the provided and the
        // known transactions are the same. We ignore the pair.
        if (known.isUserDefinedType) {
            continue;
        }

        // If the provided type is unknown but everything else matches (we already
        // checked that amount, date and label match), do not create it.
        if (known.type !== UNKNOWN_TRANSACTION_TYPE && provided.type === UNKNOWN_TRANSACTION_TYPE) {
            continue;
        }

        toCreate.push(provided);
    }

    return {
        toUpdate,
        toCreate,
    };
}
