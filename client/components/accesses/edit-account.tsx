import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import URL from './urls';
import {
    assert,
    translate as $t,
    displayLabel,
    useKresusState,
    notify,
    formatDate,
} from '../../helpers';
import { BackLink, Form, Popconfirm, Switch, UncontrolledTextInput } from '../ui';
import { get, actions } from '../../store';
import { useDispatch } from 'react-redux';
import { Account } from '../../models';
import { useNotifyError, useSyncError } from '../../hooks';
import DisplayIf from '../ui/display-if';

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
                await actions.updateAccount(
                    dispatch,
                    account.id,
                    { customLabel },
                    { customLabel: account.customLabel }
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
            () => actions.resyncBalance(dispatch, props.accountId),
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

export default () => {
    const dispatch = useDispatch();
    const history = useHistory();

    const { accountId: accountIdStr } = useParams<{ accountId: string }>();
    const accountId = Number.parseInt(accountIdStr, 10);

    const account = useKresusState(state => {
        if (!get.accountExists(state, accountId)) {
            return null;
        }
        return get.accountById(state, accountId);
    });
    const access = useKresusState(state => {
        if (account === null) {
            return null;
        }
        return get.accessById(state, account.accessId);
    });
    const isDemoEnabled = useKresusState(state => get.isDemoMode(state));

    const onDeleteAccount = useCallback(async () => {
        assert(account !== null, 'account must be set at this point');
        try {
            await actions.deleteAccount(dispatch, account.id);
            notify.success($t('client.accesses.account_deletion_success'));
            history.push(URL.accessList);
        } catch (error) {
            notify.error($t('client.category.account_deletion_error', { error: error.message }));
        }
    }, [history, dispatch, account]);

    const updateAccount = useCallback(
        (update: any, previousAttributes: any) => {
            assert(account !== null, 'account must be set at this point');
            return actions.updateAccount(dispatch, account.id, update, previousAttributes);
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

    if (account === null) {
        // Zombie!
        return null;
    }

    assert(access !== null, 'access must be defined at this point');

    const maybeIban = account.iban ? (
        <Form.Input id="iban" label={$t('client.settings.iban_title')}>
            <div>{formatIBAN(account.iban)}</div>
        </Form.Input>
    ) : null;

    return (
        <>
            <Form center={true}>
                <BackLink to={URL.accessList}>{$t('client.accesses.back_to_access_list')}</BackLink>
                <h2>
                    {$t('client.accesses.edit_account_form_title')}: {displayLabel(account)}
                </h2>

                <CustomLabelForm account={account} />

                <Form.Input id="original-label" label={$t('client.general.original_label')}>
                    <div>{account.label}</div>
                </Form.Input>

                <Form.Input id="last-sync" label={$t('client.transactions.last_sync_full')}>
                    <div>{formatDate.toLongString(account.lastCheckDate)}</div>
                </Form.Input>

                {maybeIban}

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

                <Form.Toolbar align="left">
                    <DisplayIf
                        condition={!!access && access.enabled && !access.isBankVendorDeprecated}>
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
