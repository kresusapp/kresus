import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';
import { ADD_OPERATION_MODAL_SLUG } from './add-operation-modal';

const Export = connect(
    null,
    (dispatch, props) => {
        return {
            handleClick() {
                actions.showModal(dispatch, ADD_OPERATION_MODAL_SLUG, props.accountId);
            }
        };
    }
)(props => {
    return (
        <button
            type="button"
            className="btn transparent"
            aria-label={$t('client.operations.add_operation')}
            onClick={props.handleClick}
            title={$t('client.operations.add_operation')}>
            <span className="label">{$t('client.operations.add_operation')}</span>
            <span className="fa fa-plus-circle" />
        </button>
    );
});

Export.propTypes = {
    // The account identifier for which we're adding an operation.
    accountId: PropTypes.string.isRequired
};

export default Export;
