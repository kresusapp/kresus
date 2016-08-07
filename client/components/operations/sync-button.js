import React from 'react';
import { connect } from 'react-redux';

import { assertHas, translate as $t } from '../../helpers';
import { get, actions } from '../../store';

export default connect(state => {
    return {
        synchronizing: get.isSynchronizing(state)
    };
}, dispatch => {
    return {
        handleSync: () => {
            actions.runSync(dispatch);
        }
    };
})(props => {
    assertHas(props, 'account');

    let text = (
        props.synchronizing ?
            <div className="last-sync">
                <span className="option-legend">
                    { $t('client.operations.syncing') }
                </span>
                <span className="fa fa-refresh fa-spin"></span>
            </div> :
            <div className="last-sync">
                <span className="option-legend">
                    { $t('client.operations.last_sync') }
                    &nbsp;
                    { new Date(props.account.lastChecked).toLocaleString() }
                </span>
                <a href="#" onClick={ props.handleSync }>
                    <span className="option-legend fa fa-refresh"></span>
                </a>
            </div>
     );
    return (
        <div key="sync-button" className="panel-options">
            { text }
        </div>
    );
});
