import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

export default connect((state, ownProps) => {
    let categoryA = get.categoryById(state, ownProps.a.categoryId);
    let categoryB = get.categoryById(state, ownProps.b.categoryId);

    return {
        categoryA,
        categoryB
    };
}, dispatch => {
    return {
        merge: (toKeep, toRemove) => {
            actions.mergeOperations(dispatch, toKeep, toRemove);
        }
    };
})(props => {

    function handleMerge(e) {
        let older, younger;
        if (+props.a.dateImport < +props.b.dateImport) {
            [older, younger] = [props.a, props.b];
        } else {
            [older, younger] = [props.b, props.a];
        }
        props.merge(younger, older);
        e.preventDefault();
    }

    return (
        <table
          key={ `dpair-${props.a.id}-${props.b.id}` }
          className="table table-striped table-bordered">
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
                    <td>{ $t(`client.${props.a.type}`) }</td>
                    <td>{ new Date(props.a.dateImport).toLocaleString() }</td>
                    <td rowSpan={ 2 }>
                        <button className="btn btn-primary" onClick={ handleMerge }>
                            <span
                              className="glyphicon glyphicon-resize-small"
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
                    <td>{ $t(`client.${props.b.type}`) }</td>
                    <td>{ new Date(props.b.dateImport).toLocaleString() }</td>
                </tr>

            </tbody>
        </table>
    );
});
