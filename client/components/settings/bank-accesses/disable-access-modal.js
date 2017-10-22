import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { actions } from '../../../store';
import { translate as $t } from '../../../helpers';

import Modal from '../../ui/modal';

class DisableAccessModal extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            enabled: this.props.enabled
        };
    }

    render() {
        let modalTitle = $t('client.disableaccessmodal.title');

        let modalBody = <p>{$t('client.disableaccessmodal.body')}</p>;

        let modalFooter = (
            <div>
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    {$t('client.general.cancel')}
                </button>
                <button
                    type="button"
                    className="btn btn-warning"
                    data-dismiss="modal"
                    onClick={this.props.handleDisableAccess}>
                    {$t('client.disableaccessmodal.confirm')}
                </button>
            </div>
        );
        return (
            <Modal
                modalId={this.props.modalId}
                modalTitle={modalTitle}
                modalBody={modalBody}
                modalFooter={modalFooter}
            />
        );
    }
}

const Export = connect(null, (dispatch, props) => {
    return {
        handleDisableAccess() {
            actions.disableAccess(dispatch, props.accessId);
        }
    };
})(DisableAccessModal);

Export.propTypes /* remove-proptypes */ = {
    // The string identifier of the modal.
    modalId: PropTypes.string.isRequired,

    // The string id of the access to be disabled.
    accessId: PropTypes.string.isRequired
};

export default Export;
