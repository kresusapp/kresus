import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

const SaveAndCancel = connect(null, dispatch => {
    return {
        handleCancel() {
            actions.hideModal(dispatch);
        }
    };
})(props => {
    // Set the default label inside the component rather than with defaultProps because we need
    // the language to be set.
    let saveLabel = props.saveLabel ? props.saveLabel : $t('client.general.save');

    return (
        <React.Fragment>
            <input
                type="button"
                className="btn btn-default"
                onClick={props.handleCancel}
                value={$t('client.general.cancel')}
            />
            <input
                type="submit"
                className="btn btn-success"
                value={saveLabel}
                onClick={props.onClickSave}
                disabled={props.isSaveDisabled}
            />
        </React.Fragment>
    );
});

SaveAndCancel.propTypes = {
    // A function to be called when clicking on save button.
    onClickSave: PropTypes.func.isRequired,

    // An optionnal boolean telling whetehet the save button is disabled.
    isSaveDisabled: PropTypes.bool,

    // The label to be displayed on the submit button.
    saveLabel: PropTypes.string
};

SaveAndCancel.defaultProps = {
    isSaveDisabled: false
};

export default SaveAndCancel;
