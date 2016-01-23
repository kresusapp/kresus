import { translate as $t } from '../../helpers';
import { Actions } from '../../store';

import OperationDetails from './OperationDetails';
import { OperationListViewLabelComponent} from './Label';
import OperationTypeSelectComponent from '../ui/OperationTypeSelectComponent';
import CategorySelectComponent from '../ui/CategorySelectComponent';

function ComputeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/`+file;
}

export default class Operation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false
        };
    }

    toggleDetails(e) {
        this.setState({ showDetails: !this.state.showDetails});
        e.preventDefault();
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

        let rowClassName = op.amount > 0 ? "success" : "";

        if (this.state.showDetails) {
            return <OperationDetails
                     toggleDetails={this.toggleDetails.bind(this)}
                     operation={op}
                     rowClassName={rowClassName} />;
        }

        // Add a link to the attached file, if there is any.
        let link;
        if (op.binary !== null) {
            let opLink = ComputeAttachmentLink(op);
            link= <label for={op.id} className="input-group-addon box-transparent">
                    <a
                      target="_blank"
                      href={opLink}
                      title={$t('client.operations.attached_file')}>
                        <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                    </a>
                  </label>;
        } else if (op.attachments && op.attachments.url !== null) {
            let maybeAttachment = <span>
                <a href={op.attachments.url} target="_blank">
                    <span className="glyphicon glyphicon-link"></span>
                    {$t('client.' + op.attachments.linkTranslationKey)}
                </a>
            </span>;
        }

        return (
            <tr className={rowClassName}>
                <td>
                    <a href="#" onClick={this.toggleDetails.bind(this)}>
                        <i className="fa fa-plus-square"></i>
                    </a>
                </td>
                <td>{op.date.toLocaleDateString()}</td>
                <td>
                    <OperationTypeSelectComponent
                      operation={op}
                      onSelectId={this.onSelectOperationType.bind(this)}
                    />
                </td>
                <td><OperationListViewLabelComponent operation={op} link={link} /></td>
                <td>{op.amount}</td>
                <td>
                    <CategorySelectComponent
                      operation={op}
                      onSelectId={this.onSelectCategory.bind(this)}
                    />
                </td>
            </tr>
        );
    }
}
