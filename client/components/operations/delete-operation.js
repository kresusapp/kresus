import { has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

export default class DeleteOperation extends React.Component {
    constructor(props) {
        has(props, 'operation');
        has(props, 'formatCurrency');
        super(props);
        this.handleDeleteOperation = this.handleDeleteOperation.bind(this);
    }

    handleDeleteOperation() {
        Actions.deleteOperation(this.props.operation);
    }

    render() {
        let op = this.props.operation;

        let label = `"${op.customLabel ? op.customLabel : op.title}"`;

        let amount = this.props.formatCurrency(op.amount);
        let date = op.date.toLocaleDateString();
        let modalBody = (
            <div>
                <div>{ $t('client.operations.warning_delete') }</div>
                <div>{ $t('client.operations.are_you_sure', { label, amount, date }) }</div>
            </div>
        );

        return (
            <div>
                <button className="btn btn-danger"
                  data-toggle="modal"
                  data-target={ `#delete${op.id}` }>
                    <span className="fa fa-trash"></span>&nbsp;
                    { $t('client.operations.delete_operation_button') }
                </button>
                <ConfirmDeleteModal
                  modalId={ `delete${op.id}` }
                  modalBody={ modalBody }
                  onDelete={ this.handleDeleteOperation }
                />
            </div>
        );
    }
}
