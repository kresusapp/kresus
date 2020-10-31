import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

import LoadingMessage from './loading';
import UserActionForm from './user-action';

import './overlay.css';

// An overlay component, when we want to show something on screen on top of the
// previous content, without fiddling with the history state.

export default connect(state => {
    return {
        processingReason: get.backgroundProcessingReason(state),
        action: get.userActionRequested(state),
    };
})(props => {
    let child;

    // Note that both processingReason and action may be set at the same time:
    // for instance, after confirming a user action, a long request might be
    // sent to the server and trigger the processingReason spinner screen. In
    // particular, it's important to keep the checks here in this order, so the
    // processingReason screen is still being displayed "on top of" a user
    // action.
    if (props.processingReason) {
        child = <LoadingMessage message={$t(props.processingReason)} />;
    } else if (props.action) {
        child = <UserActionForm action={props.action} />;
    } else {
        return null;
    }

    return <div id="content-overlay">{child}</div>;
});

export { LoadingMessage };
