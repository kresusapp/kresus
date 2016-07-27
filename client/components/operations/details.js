import { has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import { DetailedViewLabel } from './label';
import DeleteOperation from './delete-operation';

import OperationTypeSelect from '../ui/operation-type-select';
import CategorySelect from '../ui/category-select';

export function computeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

export default class OperationDetails extends React.Component {
    constructor(props) {
        has(props, 'onToggleDetails');
        has(props, 'operation');
        has(props, 'rowClassName');
        has(props, 'formatCurrency');
        super(props);
        this.handleSelectType = this.handleSelectType.bind(this);
        this.handleSelectCategory = this.handleSelectCategory.bind(this);
    }

    handleSelectType(id) {
        Actions.setOperationType(this.props.operation, id);
        this.props.operation.operationTypeID = id;
    }

    handleSelectCategory(id) {
        Actions.setOperationCategory(this.props.operation, id);
        this.props.operation.categoryId = id;
    }

    render() {
        let op = this.props.operation;

        let maybeAttachment = '';
        if (op.binary !== null) {
            let opLink = computeAttachmentLink(op);
            maybeAttachment = (
                <span>
                    <a href={ opLink } target="_blank">
                        <span className="glyphicon glyphicon-file"></span>
                        { $t('client.operations.attached_file') }
                    </a>
                </span>
            );
        } else if (op.attachments && op.attachments.url !== null) {
            maybeAttachment = (
                <span>
                    <a href={ op.attachments.url } target="_blank">
                        <span className="glyphicon glyphicon-file"></span>
                        { $t(`client.${op.attachments.linkTranslationKey}`) }
                    </a>
                </span>
            );
        }

        return (
            <tr className={ this.props.rowClassName }>
                <td>
                    <a href="#" onClick={ this.props.onToggleDetails }>
                        <i className="fa fa-minus-square"></i>
                    </a>
                </td>
                <td colSpan="5" className="text-uppercase">
                    <ul>
                        <li>
                            { $t('client.operations.full_label') }
                            { op.raw }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.custom_label') }
                            <DetailedViewLabel operation={ op } />
                        </li>
                        <li>
                            { $t('client.operations.amount') }
                            { this.props.formatCurrency(op.amount) }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.type') }
                            <OperationTypeSelect
                              operation={ op }
                              onSelectId={ this.handleSelectType }
                            />
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.category') }
                            <CategorySelect
                              operation={ op }
                              onSelectId={ this.handleSelectCategory }
                            />
                        </li>
                        { maybeAttachment }
                        <li>
                            <DeleteOperation
                              operation={ this.props.operation }
                              formatCurrency={ this.props.formatCurrency }
                            />
                        </li>
                    </ul>

                </td>
            </tr>
        );
    }
}
