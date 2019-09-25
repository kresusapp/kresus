import React from 'react';
import { connect } from 'react-redux';
import { translate as $t } from '../../../helpers';
import { actions } from '../../../store';

import { registerModal } from '../../ui/modal';
import ModalContent from '../../ui/modal/content';
import CancelAndSubmit from '../../ui/modal/cancel-and-submit-buttons';

export const MODAL_SLUG = 'confirm-disable-discovery-modal';

const ConfirmDisableDiscoveryModal = connect(
    null,

    dispatch => {
        return {
            handleDisable() {
                actions.setBoolSetting(dispatch, 'discovery-mode', false);
                actions.hideModal(dispatch);
            }
        };
    }
)(props => {
    const body = (
        <form id={MODAL_SLUG} onSubmit={props.handleDisable}>
            <p>{$t('client.settings.customization.confirm_disable_discovery')}</p>
        </form>
    );

    return (
        <ModalContent
            title={$t('client.settings.customization.discovery')}
            body={body}
            footer={<CancelAndSubmit formId={MODAL_SLUG} />}
        />
    );
});

registerModal(MODAL_SLUG, () => <ConfirmDisableDiscoveryModal />);
