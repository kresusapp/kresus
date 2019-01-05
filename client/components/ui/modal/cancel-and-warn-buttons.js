import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const CancelAndWarn = connect(
    null,
    dispatch => {
        return {
            handleCancel() {
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    return (
        <React.Fragment>
            <button className="btn" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button className="btn warning" onClick={props.onConfirm}>
                {props.warningLabel}
            </button>
        </React.Fragment>
    );
});

CancelAndWarn.propTypes = {
    // A function to be called when clicking the confirm button.
    onConfirm: PropTypes.func.isRequired,

    // A label describing the action to be realized when clicking the confirm button.
    warningLabel: PropTypes.string.isRequired
};

export default CancelAndWarn;
