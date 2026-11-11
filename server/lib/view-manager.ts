import View from '../models/entities/views';
import { ModelEvent, modelEvents } from '../models/events';

// Keeps the views automatically created in sync with the accounts.

let isSetUp = false;

export function setupViewManager(): void {
    if (isSetUp) {
        return;
    }
    isSetUp = true;

    modelEvents
        // Creates the associated view upon account creation.
        .on(ModelEvent.AccountCreated, async (manager, { account }) => {
            await View.create(
                account.userId,
                {
                    label: account.customLabel || account.label,
                    accounts: [
                        {
                            accountId: account.id,
                        },
                    ],
                },

                // Use the manager provided to retrieve the repository of the current transaction:
                // the account created will only be committed after the event (on Postgres at least,
                // which uses connection pools).
                manager.getRepository(View)
            );
        })

        // Renames the associated views after an account renaming.
        .on(ModelEvent.AccountUpdated, async (_manager, { account }) => {
            const newLabel = account.customLabel || account.label;
            const allViews = await View.all(account.userId);
            for (const view of allViews) {
                if (view.accounts.length === 1 && view.accounts[0].accountId === account.id) {
                    await View.update(view.userId, view.id, { label: newLabel });
                }
            }
        })

        // Deletes the views left without accounts after some accounts were deleted. We don't know
        // which accounts (nor which user), so this is done for all the views of all the users.
        .on(ModelEvent.AccountsDeleted, async () => {
            await View.destroyViewsWithoutAccounts();
        })

        // Same after some accesses were deleted, since the database cascade deletes their
        // accounts without emitting any accounts event.
        .on(ModelEvent.AccessesDeleted, async () => {
            await View.destroyViewsWithoutAccounts();
        });
}
