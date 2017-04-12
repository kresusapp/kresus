import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t,
         formatDateToLocaleString,
         formatDateToLongLocaleString } from '../../helpers';

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

    let customLabelA = null;
    if (props.a.customLabel) {
        customLabelA = (
            <span
              className="fa fa-question-circle pull-right"
              title={ props.a.customLabel }
            />
        );
    }
    let customLabelB = null;
    if (props.b.customLabel) {
        customLabelB = (
            <span
              className="fa fa-question-circle pull-right"
              title={ props.b.customLabel }
            />
        );
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
                    <td>{ formatDateToLocaleString(props.a.date) }</td>
                    <td>
                        { props.a.title }
                        { customLabelA }
                    </td>
                    <td>{ props.formatCurrency(props.a.amount) }</td>
                    <td>{ props.categoryA.title }</td>
                    <td>{ $t(`client.${props.a.type}`) }</td>
                    <td>{ formatDateToLongLocaleString(props.a.dateImport) }</td>
                    <td rowSpan={ 2 }>
                        <button
                          className="btn btn-primary"
                          onClick={ handleMerge }>
                            <span
                              className="fa fa-compress"
                              aria-hidden="true"
                            />
                        </button>
                    </td>
                </tr>

                <tr>
                    <td>{ formatDateToLocaleString(props.b.date) }</td>
                    <td>
                        { props.b.title }
                        { customLabelB }
                    </td>
                    <td>{ props.formatCurrency(props.b.amount) }</td>
                    <td>{ props.categoryB.title }</td>
                    <td>{ $t(`client.${props.b.type}`) }</td>
                    <td>{ formatDateToLongLocaleString(props.b.dateImport) }</td>
                </tr>

            </tbody>
        </table>
    );
});
