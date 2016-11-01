import React from 'react';
import { connect } from 'react-redux';

import { assertHas, translate as $t } from '../../helpers';
import { actions } from '../../store';

export default connect(null, dispatch => {
    return {
        handleSync: () => {
            actions.runSync(dispatch);
        }
    };
})(props => {
    assertHas(props, 'account');

    return (
        <div
          key="sync-button"
          className="panel-options">
            <div className="last-sync">
                <span className="option-legend">
                    { $t('client.operations.last_sync') }
                    &nbsp;
                    { new Date(props.account.lastChecked).toLocaleString() }
                </span>
                <a
                  href="#"
                  onClick={ props.handleSync }>
                    <span className="option-legend fa fa-refresh" />
                </a>
            </div>
        </div>
    );
});
