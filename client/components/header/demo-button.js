import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import { Popconfirm } from '../ui';
import { wrapGenericError } from '../../errors';

export default connect(
    state => {
        return {
            isDemoMode: get.isDemoMode(state),
        };
    },
    dispatch => {
        return {
            handleDisable: wrapGenericError(() => actions.disableDemoMode(dispatch)),
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
            confirmClass="warning">
            <p>{$t('client.demo.disable_warning')}</p>
        </Popconfirm>
    );
});
