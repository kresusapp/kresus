import { translate as $t, has } from '../../helpers';
import { Actions } from '../../store';

import { default as OperationDetails, computeAttachmentLink } from './details';
import { OperationListViewLabel } from './label';

import OperationTypeSelect from '../ui/operation-type-select';
import CategorySelect from '../ui/category-select';

export default class Operation extends React.Component {

    constructor(props) {
        has(props, 'operation');
        has(props, 'formatCurrency');
        super(props);
        this.state = {
            showDetails: false
        };
        this.handleToggleDetails = this.handleToggleDetails.bind(this);
        this.handleSelectType = this.handleSelectType.bind(this);
        this.handleSelectCategory = this.handleSelectCategory.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.showDetails !== nextState.showDetails ||
            this.props.visible !== nextProps.visible;
    }
    handleToggleDetails(e) {
        this.setState({ showDetails: !this.state.showDetails });
        e.preventDefault();
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

        let rowClassName = op.amount > 0 ? 'success' : '';

        if (this.state.showDetails) {
            return (
                <OperationDetails
                  onToggleDetails ={ this.handleToggleDetails }
                  operation={ op }
                  rowClassName={ rowClassName }
                />
            );
        }

        // Add a link to the attached file, if there is any.
        let link;
        if (op.binary !== null) {
            let opLink = computeAttachmentLink(op);
            link = (
                <a
                  target="_blank"
                  href={ opLink }
                  title={ $t('client.operations.attached_file') }>
                    <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                </a>
            );
        } else if (op.attachments && op.attachments.url !== null) {
            link = (
                <a href={ op.attachments.url } target="_blank">
                    <span className="glyphicon glyphicon-link"></span>
                    { $t(`client.${op.attachments.linkTranslationKey}`) }
                </a>
            );
        }

        let maybeLink;
        if (link) {
            maybeLink = (
                <label htmlFor={ op.id } className="input-group-addon box-transparent">
                    { link }
                </label>
            );
        }
        return (
            <tr className={ rowClassName }>
                <td className="hidden-xs">
                    <a href="#" onClick={ this.handleToggleDetails }>
                        <i className="fa fa-plus-square"></i>
                    </a>
                </td>
                <td>{ op.date.toLocaleDateString() }</td>
                <td className="hidden-xs">
                    <OperationTypeSelect
                      operation={ op }
                      onSelectId={ this.handleSelectType }
                    />
                </td>
                <td><OperationListViewLabel operation={ op } link={ maybeLink } /></td>
                <td className="text-right">{ this.props.formatCurrency(op.amount) }</td>
                <td className="hidden-xs">
                    <CategorySelect
                      operation={ op }
                      onSelectId={ this.handleSelectCategory }
                    />
                </td>
            </tr>
        );
    }
}
