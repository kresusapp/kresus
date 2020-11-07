import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { wrapSyncError } from '../../errors';
import { translate as $t, formatDate } from '../../helpers';
import { actions, get } from '../../store';

const Export = connect(
    (state, props) => {
        let access = get.accessById(state, props.account.accessId);
        let canBeSynced = !get.bankByUuid(state, access.vendorId).deprecated && access.enabled;
        return {
            canBeSynced,
        };
    },
    (dispatch, ownProps) => {
        return {
            handleSync: wrapSyncError(() =>
                actions.runOperationsSync(dispatch, ownProps.account.accessId)
            ),
        };
    }
)(props => {
    let label = props.canBeSynced
        ? $t('client.operations.sync_now')
        : $t('client.operations.sync_disabled');
    return (
        <span className="tooltipped tooltipped-n" aria-label={label}>
            <button
                type="button"
                disabled={!props.canBeSynced}
                onClick={props.canBeSynced ? props.handleSync : null}
                className="btn">
                <span>
                    {$t('client.operations.last_sync')}
                    &nbsp;
                    {formatDate.fromNow(props.account.lastCheckDate).toLowerCase()}
                </span>
                <span className="fa fa-refresh" />
            </button>
        </span>
    );
});

Export.propTypes = {
    // Account to be resynced.
    account: PropTypes.object.isRequired,
};

export default Export;
