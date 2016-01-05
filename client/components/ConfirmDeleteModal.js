import {has} from '../helpers';

import T from './Translated';
import Modal from './Modal';

export default class ConfirmDeleteModal extends React.Component {

    constructor(props) {
        has(props, 'modalId');
        has(props, 'modalBody');
        has(props, 'onDelete');
        super(props);
    }

    render() {
        let modalTitle = <T k='client.confirmdeletemodal.title'>Confirm deletion</T>;

        let modalFooter = <div>
            <button type="button" className="btn btn-default" data-dismiss="modal">
                <T k='client.confirmdeletemodal.dont_delete'>Don't delete</T>
            </button>
            <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.props.onDelete}>
                <T k='client.confirmdeletemodal.confirm'>Confirm deletion</T>
            </button>
        </div>;

        return <Modal modalId={this.props.modalId}
                      modalBody={this.props.modalBody}
                      modalTitle={modalTitle}
                      modalFooter={modalFooter} />;
    }
}
