import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t, formatDate } from '../../helpers';
import { actions } from '../../store';

const Export = connect(null, (dispatch, ownProps) => {
    return {
        handleSync: () => {
            actions.runOperationsSync(dispatch, ownProps.account.bankAccess);
        }
    };
})(props => (
    <div key="sync-button" className="panel-options">
        <div className="last-sync">
            <span className="option-legend">
                {$t('client.operations.last_sync')}
                &nbsp;
                {formatDate.fromNow(props.account.lastChecked)}
            </span>
            <span onClick={props.handleSync} className="option-legend fa fa-refresh" />
        </div>
    </div>
));

Export.propTypes /* remove-proptypes */ = {
    // Account to be resynced
    account: PropTypes.object.isRequired
};

export default Export;
