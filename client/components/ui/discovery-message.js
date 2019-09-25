import React from 'react';
import { connect } from 'react-redux';
import { get, actions } from '../../store';
import PropTypes from 'prop-types';

import DisplayIf from './display-if';
import { MODAL_SLUG } from '../settings/customization/disable-discovery-modal';

const DiscoveryMessage = connect(
    state => {
        return {
            enabled: get.boolSetting(state, 'discovery-mode')
        };
    },
    dispatch => {
        return {
            handleClose() {
                actions.showModal(dispatch, MODAL_SLUG);
            }
        };
    }
)(props => {
    return (
        <DisplayIf condition={props.enabled}>
            <p className="alerts info with-action">
                <span>{props.message}</span>
                <button onClick={props.handleClose} className="fa fa-times-circle" />
            </p>
        </DisplayIf>
    );
});

DiscoveryMessage.propTypes = {
    // The help message to display.
    message: PropTypes.string.isRequired
};

export default DiscoveryMessage;
