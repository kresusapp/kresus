import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, formatDate } from '../../helpers';
import { actions, get } from '../../store';

const Export = connect(
    (state, props) => {
        return {
            canBeSynced: get.accessByAccountId(state, props.account.id).enabled
        };
    },
    (dispatch, ownProps) => {
        return {
            handleSync: () => {
                actions.runOperationsSync(dispatch, ownProps.account.bankAccess);
            }
        };
    }
)(props => {
    let maybeRefresh = props.canBeSynced ? (
        <span onClick={props.handleSync} className="fa fa-refresh" />
    ) : null;

    return (
        <div className="actions">
            <span>
                {$t('client.operations.last_sync')}
                &nbsp;
                {formatDate.fromNow(props.account.lastChecked)}
            </span>
            {maybeRefresh}
        </div>
    );
});

Export.propTypes = {
    // Account to be resynced
    account: PropTypes.object.isRequired
};

export default Export;
