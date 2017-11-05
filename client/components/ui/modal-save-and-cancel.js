import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

const SaveAndCancel = connect(null, dispatch => {
    return {
        handleHide() {
            actions.hideModal(dispatch);
        }
    };
})(props => {
    return (
        <div>
            <input
                type="button"
                className="btn btn-default"
                onClick={props.handleHide}
                value={$t('client.general.cancel')}
            />
            <input
                type="submit"
                className="btn btn-success"
                value={$t('client.general.save')}
                onClick={props.handleSave}
                disabled={props.isSaveDisabled}
            />
        </div>
    );
});

SaveAndCancel.propTypes = {
    // A function to be called when clicking on save button.
    handleSave: PropTypes.func.isRequired,

    // An optionnal boolean telling whetehet the save button is disabled.
    isSaveDisabled: PropTypes.bool
};

SaveAndCancel.defaultProps = {
    isSaveDisabled: false
};

export default SaveAndCancel;
