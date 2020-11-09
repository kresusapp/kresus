import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { wrapSyncError } from '../../errors';
import { translate as $t, displayLabel, wrapNotifyError } from '../../helpers';
import { get, actions } from '../../store';

import AccountItem from './account';
import Label from '../ui/label';
import DisplayIf from '../ui/display-if';

import URL from '../../urls';

import { Popconfirm } from '../ui';

export default connect(
    (state, props) => {
        return {
            access: get.accessById(state, props.accessId),
            isDemoEnabled: get.isDemoMode(state),
        };
    },
    (dispatch, props) => {
        return {
            handleSyncAccounts: wrapSyncError(() =>
                actions.runAccountsSync(dispatch, props.accessId)
            ),
            handleDeleteAccess: () => actions.deleteAccess(dispatch, props.accessId),
            handleDisableAccess: () => actions.disableAccess(dispatch, props.accessId),

            setAccessCustomLabel: wrapNotifyError('client.general.update_fail')(
                async (oldCustomLabel, customLabel) => {
                    await actions.updateAccess(
                        dispatch,
                        props.accessId,
                        { customLabel },
                        { customLabel: oldCustomLabel }
                    );
                }
            ),
        };
    },
    (stateToProps, dispatchToProp) => {
        let { setAccessCustomLabel, ...rest } = dispatchToProp;
        return {
            ...stateToProps,
            ...rest,
            getLabel() {
                return stateToProps.access.label;
            },
            setAccessCustomLabel(customLabel) {
                return setAccessCustomLabel(stateToProps.access.customLabel, customLabel);
            },
        };
    }
)(props => {
    let { access } = props;
    let accounts = access.accountIds.map(id => {
        let enabled = access.enabled && !access.isBankVendorDeprecated;
        return <AccountItem key={id} accountId={id} enabled={enabled} />;
    });

    return (
        <div key={`bank-access-item-${access.id}`}>
            <table className="no-vertical-border no-hover bank-accounts-list">
                <caption>
                    <div>
                        <DisplayIf condition={!access.isBankVendorDeprecated}>
                            <div className={`icon icon-${access.vendorId}`} />
                        </DisplayIf>
                        <h3>
                            <Label
                                item={access}
                                setCustomLabel={props.setAccessCustomLabel}
                                getLabel={props.getLabel}
                                inputClassName={access.enabled ? 'bold' : 'light italic'}
                            />
                        </h3>
                        <div className="actions">
                            <DisplayIf condition={!access.isBankVendorDeprecated}>
                                <button
                                    type="button"
                                    className="fa fa-refresh"
                                    aria-label="Reload accounts"
                                    onClick={props.handleSyncAccounts}
                                    title={$t('client.settings.reload_accounts_button')}
                                />

                                <Link
                                    className="fa fa-pencil"
                                    to={URL.accesses.url('edit', access.id)}
                                />
                            </DisplayIf>

                            <DisplayIf condition={!props.isDemoEnabled}>
                                <Popconfirm
                                    trigger={
                                        <button
                                            className="fa fa-times-circle popover-button"
                                            aria-label="remove access"
                                            title={$t('client.settings.delete_access_button')}
                                        />
                                    }
                                    onConfirm={props.handleDeleteAccess}>
                                    <h4>{$t('client.confirmdeletemodal.title')}</h4>
                                    <p>
                                        {$t('client.settings.erase_access', {
                                            name: displayLabel(props.access),
                                        })}
                                    </p>
                                </Popconfirm>
                            </DisplayIf>
                        </div>
                    </div>
                </caption>
                <tbody>{accounts}</tbody>
            </table>
        </div>
    );
});
