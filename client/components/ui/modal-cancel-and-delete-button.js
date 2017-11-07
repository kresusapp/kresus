import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

const CancelAndDelete = connect(null, dispatch => {
    return {
        handleCancel() {
            actions.hideModal(dispatch);
        }
    };
})(props => {
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
    // A function to be called when clicking on warning button.
    onClickDelete: PropTypes.func.isRequired
};

export default CancelAndDelete;
