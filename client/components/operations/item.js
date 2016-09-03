import React from 'react';
import { connect } from 'react-redux';

import { actions } from '../../store';

import { translate as $t } from '../../helpers';

import { default as OperationDetails, computeAttachmentLink } from './details';
import { OperationListViewLabel } from './label';

import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

class Operation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showDetails: false
        };
        this.handleToggleDetails = this.handleToggleDetails.bind(this);
    }

    handleToggleDetails(e) {
        e.preventDefault();
        this.setState({ showDetails: !this.state.showDetails });
    }

    render() {
        let op = this.props.operation;

        let rowClassName = op.amount > 0 ? 'success' : '';

        let typeSelect = (
            <OperationTypeSelect
              operation={ op }
              onSelectId={ this.props.handleSelectType }
            />
        );

        let categorySelect = (
            <CategorySelect
              operation={ op }
              onSelectId={ this.props.handleSelectCategory }
              categories={ this.props.categories }
              getCategoryTitle={ this.props.getCategoryTitle }
            />
        );

        if (this.state.showDetails) {
            return (
                <OperationDetails
                  onToggleDetails={ this.handleToggleDetails }
                  operation={ op }
                  rowClassName={ rowClassName }
                  formatCurrency={ this.props.formatCurrency }
                  typeSelect={ typeSelect }
                  categorySelect={ categorySelect }
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
                    <span className="fa fa-file" aria-hidden="true"></span>
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

        if (link) {
            link = (
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
                <td>
                    { op.date.toLocaleDateString() }
                </td>
                <td className="hidden-xs">
                    { typeSelect }
                </td>
                <td>
                    <OperationListViewLabel
                      operation={ op }
                      link={ link }
                    />
                </td>
                <td className="text-right">
                    { this.props.formatCurrency(op.amount) }
                </td>
                <td className="hidden-xs">
                    { categorySelect }
                </td>
            </tr>
        );
    }
}

Operation.propTypes = {
    // The operation this item is representing.
    operation: React.PropTypes.object.isRequired,

    // A method to compute the currency.
    formatCurrency: React.PropTypes.func.isRequired,

    // An array of categories.
    categories: React.PropTypes.array.isRequired,

    // A function mapping category id => title.
    getCategoryTitle: React.PropTypes.func.isRequired
};

export default connect(null, (dispatch, props) => {
    return {
        handleSelectType: type => {
            actions.setOperationType(dispatch, props.operation, type);
        },
        handleSelectCategory: category => {
            actions.setOperationCategory(dispatch, props.operation, category);
        }
    };
})(Operation);
