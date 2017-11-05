import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

const SaveAndCancel = connect(
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
                className="btn btn-success"
                onClick={props.onClickSave}
                disabled={props.isSaveDisabled}>
                {$t('client.general.save')}
            </button>
        </React.Fragment>
    );
});

SaveAndCancel.propTypes = {
    // A function to be called when clicking on save button.
    onClickSave: PropTypes.func.isRequired,

    // An optionnal boolean telling whether the save button is disabled.
    isSaveDisabled: PropTypes.bool
};

SaveAndCancel.defaultProps = {
    isSaveDisabled: false
};

export default SaveAndCancel;
