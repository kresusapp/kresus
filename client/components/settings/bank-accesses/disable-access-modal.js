import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

const Footer = connect(
    state => {
        return {
            accessId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ accessId }, { dispatch }) => {
        return {
            handleDisableAccess() {
                actions.disableAccess(dispatch, accessId);
            },
            handlHideModal() {
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    return (
        <div>
            <button type="button" className="btn btn-default" onClick={props.handleHideModal}>
                {$t('client.general.cancel')}
            </button>
            <button type="button" className="btn btn-warning" onClick={props.handleDisableAccess}>
                {$t('client.disableaccessmodal.confirm')}
            </button>
        </div>
    );
});

export function disableAccessModal() {
    return {
        title: $t('client.disableaccessmodal.title'),
        body: $t('client.disableaccessmodal.body'),
        footer: <Footer />
    };
}
