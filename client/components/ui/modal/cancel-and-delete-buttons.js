import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const CancelAndDelete = connect(
    null,
    (dispatch, props) => {
        // If the prop 'onCancel' is provided, it overrides the default.
        return {
            handleCancel() {
                if (typeof props.onCancel === 'function') {
                    props.onCancel();
                } else {
                    actions.hideModal(dispatch);
                }
            }
        };
    }
)(props => {
    return (
        <React.Fragment>
            <button type="button" className="btn" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button type="button" className="btn danger" onClick={props.onDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </React.Fragment>
    );
});

CancelAndDelete.propTypes = {
    // A function to be called when clicking on the delete button.
    onDelete: PropTypes.func.isRequired,

    // A function to be called when clicking on the cancel button.
    onCancel: PropTypes.func
};

export default CancelAndDelete;
