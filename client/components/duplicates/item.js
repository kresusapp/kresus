import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from '../../store';
import { translate as $t } from '../../helpers';

import Operation from './operation-item';

const Pair = connect((state, props) => {
    let op1 = get.operationId(state, props.a);
    let op2 = get.operationId(state, props.b);
    let older, younger;
    if (+op1.dateImport < +op2.dateImport) {
        [older, younger] = [props.a, props.b];
    } else {
        [older, younger] = [props.b, props.a];
    }
    return {
        older,
        younger
    };
}, dispatch => {
    return {
        makeMerge: (toKeep, toRemove) => {
            actions.mergeOperations(dispatch, toKeep, toRemove);
        }
    };
},(mapStateToProps, mapDispatchToProps) => {
    let { younger, older } = mapStateToProps;
    return {
        merge: mapDispatchToProps.makeMerge(younger, older)
    };
})(props => {

    return (
        <table
          key={ `dpair-${props.a}-${props.b}` }
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
                <Operation
                  operationId={ props.a }
                  firstInPair={ true }
                  merge={ props.merge }
                  formatCurrency={ props.formatCurrency }
                />
                <Operation
                  operationId={ props.b }
                  firstInPair={ false }
                  merge={ props.merge }
                  formatCurrency={ props.formatCurrency }
                />
            </tbody>
        </table>
    );
});

Pair.propTypes = {
    // The id of the first operation to display
    a: PropTypes.string.isRequired,

    // The id of the 2nd operation to display
    b: PropTypes.string.isRequired,

    // A function to display the currency
    formatCurrency: PropTypes.func.isRequired
};

export default Pair;
