import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import { MODAL_SLUG } from './disable-demo-modal';

const DemoButton = connect(
    state => {
        return {
            isDemoMode: get.isDemoMode(state)
        };
    },
    dispatch => {
        return {
            handleClick() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => {
    if (!props.isDemoMode) {
        return null;
    }

    return (
        <button type="reset" className="btn warning disable-demo-mode" onClick={props.handleClick}>
            {$t('client.demo.disable')}
        </button>
    );
});

export default DemoButton;
