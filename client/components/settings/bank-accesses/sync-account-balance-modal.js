import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import SaveAndWarning from '../../ui/modal-cancel-and-warning-button';

const Title = connect(state => {
    let accountId = get.modal(state).state;
    let { title } = get.accountById(state, accountId);
    return {
        title
    };
})(props => {
    return <span>{$t('client.settings.resync_account.title', { title: props.title })}</span>;
});

const Body = () => (
    <div>
        {$t('client.settings.resync_account.make_sure')}
        <ul className="bullet">
            <li>{$t('client.settings.resync_account.sync_operations')}</li>
            <li>{$t('client.settings.resync_account.manage_duplicates')}</li>
            <li>{$t('client.settings.resync_account.add_operation')}</li>
            <li>{$t('client.settings.resync_account.delete_operation')}</li>
        </ul>
        {$t('client.settings.resync_account.are_you_sure')}
    </div>
);

const Footer = connect(
    state => {
        return {
            accountId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ accountId }, { dispatch }) => {
        return {
            handleClickWarning() {
                actions.resyncBalance(dispatch, accountId);
            },
            warningLabel: $t('client.settings.resync_account.submit')
        };
    }
)(SaveAndWarning);

export function syncAccountBalance() {
    return {
        title: <Title />,
        body: <Body />,
        footer: <Footer />
    };
}
