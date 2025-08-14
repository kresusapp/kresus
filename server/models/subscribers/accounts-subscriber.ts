import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent } from 'typeorm';

import Account from '../entities/accounts';
import View from '../entities/views';

// eslint new-cap rule does not like decorators. See https://github.com/eslint/typescript-eslint-parser/issues/569
// eslint-disable-next-line new-cap
@EventSubscriber()
export class AccountsSubscriber implements EntitySubscriberInterface<Account> {
    listenTo() {
        return Account;
    }

    /* Creates associated views upon account creation */
    async afterInsert(event: InsertEvent<Account>) {
        const account = event.entity;

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
            event.manager.getRepository(View)
        );
    }

    /* Renames associated views after account renaming */
    async afterUpdate(event: UpdateEvent<Account>) {
        const account = event.entity;
        if (!account) {
            return;
        }

        // No need to pass the repository, as there will not be dependencies on newly created
        // entities & entities ids.

        const newLabel = account.customLabel || account.label;
        const allViews = await View.all(account.userId);
        for (const view of allViews) {
            if (view.accounts.length === 1 && view.accounts[0].accountId === account.id) {
                await View.update(view.userId, view.id, { label: newLabel });
            }
        }
    }
}
