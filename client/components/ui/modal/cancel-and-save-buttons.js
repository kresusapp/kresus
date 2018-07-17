import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const CancelAndSave = connect(
    null,
    dispatch => {
        return {
            handleCancel() {
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    // Set the default label inside the component rather than with defaultProps because we need
    // the language to be set.
    let saveLabel = props.saveLabel || $t('client.general.save');

    return (
        <React.Fragment>
            <button className="btn btn-default" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button
                className="btn btn-success"
                onClick={props.onSave}
                disabled={props.isSaveDisabled}>
                {saveLabel}
            </button>
        </React.Fragment>
    );
});

CancelAndSave.propTypes = {
    // A function to be called when clicking the save button.
    onSave: PropTypes.func.isRequired,

    // An optinnal boolean telling whether the save button is disabled.
    isSaveDisabled: PropTypes.bool,

    // The label to be displayed on the submit button.
    saveLabel: PropTypes.string
};

CancelAndSave.defaultProps = {
    isSaveDisabled: false
};

export default CancelAndSave;
