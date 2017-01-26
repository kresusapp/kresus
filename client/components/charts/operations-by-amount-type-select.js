import React from 'react';

import { translate as $t } from '../../helpers';

const OpAmountTypeSelect = props => {

    let showPositiveOpsInput;
    let showNegativeOpsInput;

    const handleChange = event => {
        let name = event.target.getAttribute('name');
        let isChecked = event.target.checked;
        let result = {
            [name]: isChecked
        };

        // If both are now unchecked, automatically select the other
        let otherInput;
        let otherInputName;
        if (name === 'showPositiveOps') {
            otherInput = showNegativeOpsInput;
            otherInputName = 'showNegativeOps';
        } else {
            otherInput = showPositiveOpsInput;
            otherInputName = 'showPositiveOps';
        }

        if (!isChecked && !otherInput.checked) {
            result[otherInputName] = true;
        }

        props.onChange(result);
    };

    let refPositive = node => {
        showPositiveOpsInput = node;
    };

    let refNegative = node => {
        showNegativeOpsInput = node;
    };

    return (<div className={ props.className }>
        <label className="col-md-6 col-xs-12 checkbox-inside-label">
            <input
              type="checkbox"
              name="showPositiveOps"
              checked={ props.showPositiveOps }
              onChange={ handleChange }
              ref={ refPositive }
            />
            <span>{ $t('client.charts.positive') }</span>
        </label>

        <label className="col-md-6 col-xs-12 checkbox-inside-label">
            <input
              type="checkbox"
              name="showNegativeOps"
              checked={ props.showNegativeOps }
              onChange={ handleChange }
              ref={ refNegative }
            />
            <span>{ $t('client.charts.negative') }</span>
        </label>
    </div>);
};

OpAmountTypeSelect.propTypes = {
    // The components CSS classes
    className: React.PropTypes.string,

    // Whether to display positive operations
    showPositiveOps: React.PropTypes.bool.isRequired,

    // Whether to display negative operations
    showNegativeOps: React.PropTypes.bool.isRequired,

    // A callback called whenever one of the inputs change
    onChange: React.PropTypes.func.isRequired
};

export default OpAmountTypeSelect;
