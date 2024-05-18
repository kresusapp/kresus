import React, { useCallback, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import URL from './urls';
import {
    assert,
    translate as $t,
    displayLabel,
    useKresusState,
    notify,
    formatDate,
    copyContentToClipboard,
} from '../../helpers';
import {
    AmountInput,
    BackLink,
    Form,
    LoadingButton,
    Popconfirm,
    Switch,
    UncontrolledTextInput,
} from '../ui';
import * as UiStore from '../../store/ui';
import * as BanksStore from '../../store/banks';
import { useDispatch } from 'react-redux';
import { Access, Account } from '../../models';
import { useNotifyError, useSyncError } from '../../hooks';
import AccountSelector from '../ui/account-select';
import DisplayIf from '../ui/display-if';

import { mergeAccountInto } from '../../store/backend';

const formatIBAN = (iban: string) => {
    return iban.replace(/(.{4})(?!$)/g, '$1\xa0');
};

// TODO generalize with access' custom form? why not the generic composant
// though?
const CustomLabelForm = (props: { account: Account }) => {
    const { account } = props;
    const dispatch = useDispatch();
    const saveCustomLabel = useNotifyError(
        'client.general.update_fail',
        useCallback(
            async (customLabel: string | null) => {
                if (account.customLabel === customLabel) {
                    return;
                }
                await dispatch(
                    BanksStore.updateAccount(
                        account.id,
                        { customLabel },
                        { customLabel: account.customLabel }
                    )
                );
            },
            [account, dispatch]
        )
    );
    return (
        <Form.Input
            id="custom-label-text"
            label={$t('client.settings.custom_label')}
            optional={true}>
            <UncontrolledTextInput onSubmit={saveCustomLabel} value={account.customLabel} />
        </Form.Input>
    );
};

const SyncAccount = (props: { accountId: number }) => {
    const dispatch = useDispatch();
    const handleConfirm = useSyncError(
        useCallback(
            () => dispatch(BanksStore.resyncBalance(props.accountId)),
            [dispatch, props.accountId]
        )
    );
    return (
        <Popconfirm
            trigger={
                <button className="btn warning">
                    {$t('client.settings.resync_account_button')}
                </button>
            }
            onConfirm={handleConfirm}
            confirmClass="warning"
            confirmText={$t('client.settings.resync_account.submit')}>
            <p>{$t('client.settings.resync_account.make_sure')}</p>
            <ul className="bullet">
                <li>{$t('client.settings.resync_account.sync_transactions')}</li>
                <li>{$t('client.settings.resync_account.manage_duplicates')}</li>
                <li>{$t('client.settings.resync_account.add_transaction')}</li>
                <li>{$t('client.settings.resync_account.delete_transaction')}</li>
            </ul>
            <p>{$t('client.settings.resync_account.are_you_sure')}</p>
        </Popconfirm>
    );
};

const SetBalanceForm = (props: {
    access: Access;
    account: Account | null;
    updateAccount: (next: any, prev: any) => Promise<void>;
}) => {
    const { account, updateAccount } = props;

    const [balance, setBalance] = useState<number | null>(account?.balance || null);

    const onSubmit = useCallback(() => {
        assert(account !== null, 'account not null');
        return updateAccount({ balance }, { balance: account.balance });
    }, [balance, account, updateAccount]);

    // Only useful for accounts on a disabled access, or orphan accounts.
    if (account === null || (props.access.enabled && !account.isOrphan)) {
        return null;
    }

    return (
        <Form.Input
            id="balance"
            label={$t('client.settings.set_balance_title')}
            sub={
                <button onClick={onSubmit} className="btn small primary">
                    {$t('client.settings.set_balance_submit')}
                </button>
            }>
            <AmountInput onChange={setBalance} defaultValue={balance} signId="balance-sign" />
        </Form.Input>
    );
};

export default () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const { accountId: accountIdStr } = useParams<{ accountId: string }>();
    const accountId = Number.parseInt(accountIdStr, 10);

    const account = useKresusState(state => {
        if (!BanksStore.accountExists(state.banks, accountId)) {
            return null;
        }
        return BanksStore.accountById(state.banks, accountId);
    });
    const access = useKresusState(state => {
        if (account === null) {
            return null;
        }
        return BanksStore.accessById(state.banks, account.accessId);
    });
    const isDemoEnabled = useKresusState(state => UiStore.isDemoMode(state.ui));

    const [mergeTargetAccountId, setMergeTargetAccountId] = useState(-1);

    const [isMergingAccounts, setIsMergingAccounts] = useState(false);

    const onDeleteAccount = useCallback(async () => {
        assert(account !== null, 'account must be set at this point');
        try {
            await dispatch(BanksStore.deleteAccount(account.id));
            notify.success($t('client.accesses.account_deletion_success'));
            history.push(URL.accessList);
        } catch (error) {
            notify.error($t('client.category.account_deletion_error', { error: error.message }));
        }
    }, [history, dispatch, account]);

    const updateAccount = useCallback(
        (update: any, previousAttributes: any) => {
            assert(account !== null, 'account must be set at this point');
            return dispatch(BanksStore.updateAccount(account.id, update, previousAttributes));
        },
        [dispatch, account]
    );

    const onToggleExcludeFromBalance = useCallback(() => {
        assert(account !== null, 'account not null');
        return updateAccount(
            { excludeFromBalance: !account.excludeFromBalance },
            { excludeFromBalance: account.excludeFromBalance }
        );
    }, [updateAccount, account]);

    const handleCopy = useCallback(() => {
        if (!refIban.current) {
            return;
        }

        if (copyContentToClipboard(refIban.current)) {
            notify.success(
                $t('client.general.copied_to_clipboard', {
                    name: $t('client.settings.iban_title'),
                })
            );
        }
    }, []);

    const refIban = useRef<HTMLSpanElement>(null);

    const handleMergeTargetChange = useCallback(setMergeTargetAccountId, [setMergeTargetAccountId]);

    const handleMergeValidate = useCallback(async () => {
        try {
            setIsMergingAccounts(true);
            await mergeAccountInto(mergeTargetAccountId, accountId);
        } catch (err) {
            setIsMergingAccounts(false);
            notify.error($t('client.general.unexpected_error', { error: err.message }));

            return;
        }

        setIsMergingAccounts(false);
        notify.success($t('client.editaccess.merge_accounts_success'));

        // Set the right URL now that the account was erased.
        window.location.replace(window.location.href.replace(/#.*$/, '#'));

        // Everything (accounts, transactions, etc.) changed, we might as well reload the page
        // instead of editing the state.
        window.location.reload();
    }, [accountId, mergeTargetAccountId]);

    if (account === null) {
        // Zombie!
        return null;
    }

    assert(access !== null, 'access must be defined at this point');

    const maybeIban = account.iban ? (
        <Form.Input id="iban" label={$t('client.settings.iban_title')}>
            <div>
                <span ref={refIban}>{formatIBAN(account.iban)}</span>
                <button title={$t('client.general.copy')} onClick={handleCopy} className="btn">
                    <span className="fa fa-copy" />
                </button>
            </div>
        </Form.Input>
    ) : null;

    return (
        <>
            <Form center={true} className="account-edition">
                <BackLink to={URL.accessList}>{$t('client.accesses.back_to_access_list')}</BackLink>
                <h2>
                    {$t('client.accesses.edit_account_form_title')}: {displayLabel(account)}
                </h2>

                <CustomLabelForm account={account} />

                <Form.Input id="original-label" label={$t('client.general.original_label')}>
                    <div>{account.label}</div>
                </Form.Input>

                <DisplayIf condition={!access.isManual()}>
                    <Form.Input
                        id="last-sync"
                        label={$t('client.transactions.last_sync_full')}
                        help={account.isOrphan ? $t('client.accesses.orphan_account') : undefined}>
                        <div>{formatDate.toLongString(account.lastCheckDate)}</div>
                    </Form.Input>
                </DisplayIf>

                {maybeIban}

                <SetBalanceForm access={access} account={account} updateAccount={updateAccount} />

                <Form.Input
                    inline={true}
                    id="exclude-from-balance"
                    label={$t('client.settings.include_in_balance')}>
                    <Switch
                        onChange={onToggleExcludeFromBalance}
                        ariaLabel={$t('client.settings.include_in_balance')}
                        checked={!account.excludeFromBalance}
                    />
                </Form.Input>

                <hr />

                <h3>{$t('client.editaccess.danger_zone_title')}</h3>

                <h4>{$t('client.editaccess.merge_accounts')}</h4>

                <p className="alerts info">{$t('client.editaccess.merge_accounts_desc')}</p>

                <Form.Input
                    inline={true}
                    id="merge-into-account"
                    label={$t('client.editaccess.merge_accounts_label')}>
                    <div>
                        <AccountSelector
                            accessId={account.accessId}
                            exclude={[accountId]}
                            includeNone={true}
                            onChange={handleMergeTargetChange}
                            initial={mergeTargetAccountId}
                        />
                        <Popconfirm
                            confirmClass="warning"
                            trigger={
                                <LoadingButton
                                    className="warning"
                                    isLoading={isMergingAccounts}
                                    disabled={mergeTargetAccountId === -1}
                                    label={$t('client.general.save')}
                                />
                            }
                            onConfirm={handleMergeValidate}>
                            <p>{$t('client.editaccess.merge_accounts_confirm')}</p>
                        </Popconfirm>
                    </div>
                </Form.Input>

                <hr />

                <Form.Toolbar align="left">
                    <DisplayIf
                        condition={
                            !access.isManual() && access.enabled && !access.isBankVendorDeprecated
                        }>
                        <SyncAccount accountId={account.id} />
                    </DisplayIf>

                    <DisplayIf condition={!isDemoEnabled}>
                        <Popconfirm
                            trigger={
                                <button className="btn danger">
                                    {$t('client.settings.delete_account_button')}
                                </button>
                            }
                            onConfirm={onDeleteAccount}>
                            <p>{$t('client.settings.erase_account', { label: account.label })}</p>
                        </Popconfirm>
                    </DisplayIf>
                </Form.Toolbar>
            </Form>
        </>
    );
};
