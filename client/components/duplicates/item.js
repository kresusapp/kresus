import React from 'react';
import { connect } from 'react-redux';

import { get, Actions } from '../../store';
import { translate as $t, has } from '../../helpers';

export default connect((state, ownProps) => {
    let categoryA = get.categoryById(state, ownProps.a.categoryId);
    let categoryB = get.categoryById(state, ownProps.b.categoryId);

    let operationTypeA = get.labelOfOperationType(state, ownProps.a.operationTypeID);
    let operationTypeB = get.labelOfOperationType(state, ownProps.b.operationTypeID);

    return {
        categoryA,
        categoryB,
        operationTypeA,
        operationTypeB
    };
}, dispatch => {
    return {
    };
})(props => {

    function handleMerge(e) {

        let older, younger;
        if (+this.props.a.dateImport < +this.props.b.dateImport) {
            [older, younger] = [this.props.a, this.props.b];
        } else {
            [older, younger] = [this.props.b, this.props.a];
        }

        // TODO FIXME XXX reimplement mergeOperations
        Actions.mergeOperations(younger, older);
        e.preventDefault();
    }

    return (
        <table className="table table-striped table-bordered">
            <thead>
                <tr>
                    <th className="col-xs-2">{ $t('client.similarity.date') }</th>
                    <th className="col-xs-3">{ $t('client.similarity.label') }</th>
                    <th className="col-xs-1">{ $t('client.similarity.amount') }</th>
                    <th className="col-xs-2">{ $t('client.similarity.category') }</th>
                    <th className="col-xs-1">{ $t('client.similarity.type') }</th>
                    <th className="col-xs-2">{ $t('client.similarity.imported_on') }</th>
                    <th className="col-xs-1">{ $t('client.similarity.merge') }</th>
                </tr>
            </thead>
            <tbody>

                <tr>
                    <td>{ props.a.date.toLocaleDateString() }</td>
                    <td>{ props.a.title }</td>
                    <td>{ props.formatCurrency(props.a.amount) }</td>
                    <td>{ props.categoryA.title }</td>
                    <td>{ props.operationTypeA }</td>
                    <td>{ new Date(props.a.dateImport).toLocaleString() }</td>
                    <td rowSpan={ 2 }>
                        <button className="btn btn-primary" onClick={ handleMerge }>
                            <span className="glyphicon glyphicon-resize-small"
                              aria-hidden="true"
                            />
                        </button>
                    </td>
                </tr>

                <tr>
                    <td>{ props.b.date.toLocaleDateString() }</td>
                    <td>{ props.b.title }</td>
                    <td>{ props.formatCurrency(props.b.amount) }</td>
                    <td>{ props.categoryB.title }</td>
                    <td>{ props.operationTypeB }</td>
                    <td>{ new Date(props.b.dateImport).toLocaleString() }</td>
                </tr>

            </tbody>
        </table>
    );
});
