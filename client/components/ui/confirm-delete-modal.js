import React from 'react';

import { assertHas, translate as $t } from '../../helpers';

import Modal from './modal';

export default class ConfirmDeleteModal extends React.Component {

    constructor(props) {
        assertHas(props, 'modalId');
        assertHas(props, 'modalBody');
        assertHas(props, 'onDelete');
        super(props);
    }

    render() {
        let modalTitle = $t('client.confirmdeletemodal.title');

        let modalFooter = (
            <div>
                <button
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal">
                    { $t('client.confirmdeletemodal.dont_delete') }
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  data-dismiss="modal"
                  onClick={ this.props.onDelete }>
                    { $t('client.confirmdeletemodal.confirm') }
                </button>
            </div>
        );

        return (
            <Modal
              modalId={ this.props.modalId }
              modalBody={ this.props.modalBody }
              modalTitle={ modalTitle }
              modalFooter={ modalFooter }
            />
        );
    }
}
