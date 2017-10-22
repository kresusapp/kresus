import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

import Modal from './modal';

const ConfirmDeleteModal = props => {
    let modalTitle = $t('client.confirmdeletemodal.title');

    let modalFooter = (
        <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                {$t('client.confirmdeletemodal.dont_delete')}
            </button>
            <button
                type="button"
                className="btn btn-danger"
                data-dismiss="modal"
                onClick={props.onDelete}>
                {$t('client.confirmdeletemodal.confirm')}
            </button>
        </div>
    );

    return (
        <Modal
            modalId={props.modalId}
            modalBody={props.modalBody}
            modalTitle={modalTitle}
            modalFooter={modalFooter}
        />
    );
};

ConfirmDeleteModal.propTypes = {
    // CSS unique id.
    modalId: PropTypes.string.isRequired,

    // Content of the modal.
    // TODO can also be a string
    // modalBody: PropTypes.element.isRequired,

    // Function to call when deletion is confirmed.
    onDelete: PropTypes.func.isRequired
};

export default ConfirmDeleteModal;
