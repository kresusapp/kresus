import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import CancelAndWarning from '../../ui/modal-cancel-and-warning-button';

const Footer = connect(
    state => {
        return {
            accessId: get.modal(state).state
        };
    },
    dispatch => ({ dispatch }),
    ({ accessId }, { dispatch }) => {
        return {
            handleClickWarning() {
                actions.disableAccess(dispatch, accessId);
            },
            warningLabel: $t('client.disableaccessmodal.confirm')
        };
    }
)(CancelAndWarning);

export function disableAccessModal() {
    return {
        title: $t('client.disableaccessmodal.title'),
        body: $t('client.disableaccessmodal.body'),
        footer: <Footer />
    };
}
