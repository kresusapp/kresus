import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import { Popconfirm } from '../ui';

export default connect(
    state => {
        return {
            isDemoMode: get.isDemoMode(state),
        };
    },
    dispatch => {
        return {
            handleDisable() {
                actions.disableDemoMode(dispatch);
            },
        };
    }
)(props => {
    if (!props.isDemoMode) {
        return null;
    }

    return (
        <Popconfirm
            trigger={
                <button type="reset" className="btn warning disable-demo-mode">
                    {$t('client.demo.disable')}
                </button>
            }
            onConfirm={props.handleDisable}
            confirmText={$t('client.demo.disable')}
            confirmClass="warning">
            <h3>{$t('client.demo.title')}</h3>
            <p>{$t('client.demo.disable_warning')}</p>
        </Popconfirm>
    );
});
