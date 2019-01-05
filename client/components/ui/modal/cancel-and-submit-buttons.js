import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const CancelAndSubmit = connect(
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
    let submitLabel = props.submitLabel || $t('client.general.save');

    return (
        <React.Fragment>
            <button type="button" className="btn" onClick={props.handleCancel}>
                {$t('client.general.cancel')}
            </button>
            <button
                className="btn success"
                type="submit"
                form={props.formId}
                disabled={props.isSubmitDisabled}>
                {submitLabel}
            </button>
        </React.Fragment>
    );
});

CancelAndSubmit.propTypes = {
    // An optional boolean telling whether the submit button is disabled.
    isSubmitDisabled: PropTypes.bool,

    // The label to be displayed on the submit button.
    submitLabel: PropTypes.string,

    // The form id the submit button relates to.
    formId: PropTypes.string.isRequired
};

CancelAndSubmit.defaultProps = {
    isSubmitDisabled: false
};

export default CancelAndSubmit;
