import React from 'react';

import { translate as $t } from '../../helpers';

import { DetailedViewLabel } from './label';
import OperationTypeSelect from './type-select';
import CategorySelect from './category-select';

export function computeAttachmentLink(op) {
    let file = op.binary.fileName || 'file';
    return `operations/${op.id}/${file}`;
}

class DetailedOperation extends React.Component {
    render() {
        let op = this.props.operation;

        let typeSelect = (
            <OperationTypeSelect
              operation={ op }
              onSelectId={ this.props.makeHandleSelectType(op) }
              types={ this.props.types }
            />
        );

        let categorySelect = (
            <CategorySelect
              operation={ op }
              onSelectId={ this.props.makeHandleSelectCategory(op) }
              categories={ this.props.categories }
              getCategoryTitle={ this.props.getCategoryTitle }
            />
        );

        let attachment = null;
        if (op.binary !== null) {
            attachment = {
                link: computeAttachmentLink(op),
                text: $t('client.operations.attached_file')
            };
        } else if (op.attachments && op.attachments.url !== null) {
            attachment = {
                link: op.attachments.url,
                text: $t(`client.${op.attachments.linkTranslationKey}`)
            };
        }

        if (attachment) {
            attachment = (
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { attachment.text }
                    </label>
                    <label className="col-xs-8 text-info">
                        <a href={ attachment.link } target="_blank">
                            <span className="glyphicon glyphicon-file"></span>
                        </a>
                    </label>
                </div>
            );
        }

        return (
            <div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.full_label') }
                    </label>
                    <label className="col-xs-8">
                        { op.raw }
                    </label>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.custom_label') }
                    </label>
                    <div className="col-xs-8">
                        <DetailedViewLabel operation={ op } />
                    </div>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.amount') }
                    </label>
                    <label className="col-xs-8">
                        { this.props.formatCurrency(op.amount) }
                    </label>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.type') }
                    </label>
                    <div className="col-xs-8">
                        { typeSelect }
                    </div>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.category') }
                    </label>
                    <div className="col-xs-8">
                        { categorySelect }
                    </div>
                </div>
                { attachment }
            </div>
        );
    }
}

DetailedOperation.propTypes = {
    operation: React.PropTypes.object.isRequired,
    formatCurrency: React.PropTypes.func.isRequired,
    makeHandleSelectCategory: React.PropTypes.func.isRequired,
    categories: React.PropTypes.array.isRequired,
    types: React.PropTypes.array.isRequired,
    makeHandleSelectType: React.PropTypes.func.isRequired
};

export default DetailedOperation;

class DetailedSubOperation_ extends React.Component {
    render() {
        let op = this.props.operation;

        return (
            <div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.full_label') }
                    </label>
                    <div className="col-xs-8">
                        { op.title }
                    </div>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.amount') }
                    </label>
                    <div className="col-xs-8">
                        { this.props.formatCurrency(op.amount) }
                    </div>
                </div>
                <div className="form-group clearfix">
                    <label className="col-xs-4 control-label">
                        { $t('client.operations.category') }
                    </label>
                    <div className="col-xs-8">
                        { this.props.getCategoryTitle(op.categoryId) }
                    </div>
                </div>
            </div>
        );
    }
}

DetailedSubOperation_.propTypes = {
    operation: React.PropTypes.object.isRequired,
    formatCurrency: React.PropTypes.func.isRequired,
    getCategoryTitle: React.PropTypes.func.isRequired
};

export const DetailedSubOperation = DetailedSubOperation_;
