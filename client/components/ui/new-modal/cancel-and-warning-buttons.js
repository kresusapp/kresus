import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const CancelAndWarning = connect(
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
            <button className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button
                className="btn btn-warning"
                onClick={props.onClickWarning}
                disabled={props.isSaveDisabled}>
                {props.warningLabel}
            </button>
        </React.Fragment>
    );
});

CancelAndWarning.propTypes = {
    // A function to be called when clicking on warning button.
    onClickWarning: PropTypes.func.isRequired,

    // An optional boolean telling whether the save button is disabled.
    isSaveDisabled: PropTypes.bool,

    // A label describing the action to be realized on clicking the warning button.
    warningLabel: PropTypes.string.isRequired
};

CancelAndWarning.defaultProps = {
    isSaveDisabled: false
};

export default CancelAndWarning;
