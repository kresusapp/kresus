import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const CancelAndDelete = connect(
    null,
    (dispatch, props) => {
        // If the prop 'onClickCancel' is provided, it overrides the default.
        return {
            handleCancel() {
                if (typeof props.onClickCancel === 'function') {
                    props.onClickCancel();
                } else {
                    actions.hideModal(dispatch);
                }
            }
        };
    }
)(props => {
    return (
        <React.Fragment>
            <button type="button" className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button type="button" className="btn btn-danger" onClick={props.onClickDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </React.Fragment>
    );
});

CancelAndDelete.propTypes = {
    // A function to be called when clicking on delete button.
    onClickDelete: PropTypes.func.isRequired,

    // A function to be called when clicking on don't delete button.
    onClickCancel: PropTypes.func
};

export default CancelAndDelete;
