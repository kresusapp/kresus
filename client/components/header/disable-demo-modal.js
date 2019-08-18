import React from 'react';
import { connect } from 'react-redux';

import { actions } from '../../store';
import { translate as $t } from '../../helpers';

import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';
import CancelAndWarn from '../ui/modal/cancel-and-warn-buttons';

export const MODAL_SLUG = 'disable-demo-params';

const DisableDemoModal = connect(
    null,

    dispatch => {
        return {
            handleDisable() {
                actions.disableDemoMode(dispatch);
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    const body = <p>{$t('client.demo.disable_warning')}</p>;
    const footer = (
        <CancelAndWarn onConfirm={props.handleDisable} warningLabel={$t('client.demo.disable')} />
    );
    return <ModalContent title={$t('client.demo.title')} body={body} footer={footer} />;
});

registerModal(MODAL_SLUG, () => <DisableDemoModal />);
