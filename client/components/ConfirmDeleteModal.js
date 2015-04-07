import T from './Translated';

export default class ConfirmDeleteModal extends React.Component {
    constructor(props) {
        // this.props = {
        //  modalId
        //  modalBody,
        //  onDelete
        // }
        super(props);
    }

    render() {
        return (
        <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 className="modal-title" id="myModalLabel">
                    <T k='confirmdeletemodal.title'>Confirm deletion</T>
                </h4>
              </div>
              <div className="modal-body">
                {this.props.modalBody}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    <T k='confirmdeletemodal.dont_delete'>Don't delete</T>
                </button>
                <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={this.props.onDelete}>
                    <T k='confirmdeletemodal.confirm'>Confirm deletion</T>
                </button>
              </div>
            </div>
          </div>
        </div>
        )
    }
}
