import { has, translate as $t } from '../../helpers';
import { Actions } from '../../store';
import { DetailedViewLabelComponent } from './Label';

import OperationTypeSelectComponent from '../ui/OperationTypeSelectComponent';
import CategorySelectComponent from '../ui/CategorySelectComponent';

function ComputeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

export default class OperationDetails extends React.Component {
    constructor(props) {
        has(props, 'toggleDetails');
        has(props, 'operation');
        has(props, 'rowClassName');
        super(props);
    }

    onSelectOperationType(id) {
        Actions.SetOperationType(this.props.operation, id);
        this.props.operation.operationTypeID = id;
    }

    onSelectCategory(id) {
        Actions.SetOperationCategory(this.props.operation, id);
        this.props.operation.categoryId = id;
    }

    render() {
        let op = this.props.operation;

        let maybeAttachment = '';
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op);
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
                    <a href="#" onClick={ this.props.toggleDetails }>
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
                            <DetailedViewLabelComponent operation={ op } />
                        </li>
                        <li>
                            { $t('client.operations.amount') }
                            { op.amount }
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.type') }
                            <OperationTypeSelectComponent
                              operation={ op }
                              onSelectId={ this.onSelectOperationType.bind(this) }
                            />
                        </li>
                        <li className="form-inline">
                            { $t('client.operations.category') }
                            <CategorySelectComponent
                              operation={ op }
                              onSelectId={ this.onSelectCategory.bind(this) }
                            />
                        </li>
                        { maybeAttachment }
                    </ul>
                </td>
            </tr>
        );
    }
}
