import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

const OpAmountTypeSelect = props => {
    let inputs = {
        showPositiveOps: null,
        showNegativeOps: null
    };

    const onChange = props.onChange;

    const handleChange = event => {
        let name = event.target.getAttribute('name');
        let isChecked = event.target.checked;

        let [thisName, otherName] = ['showPositiveOps', 'showNegativeOps'];
        if (name === otherName) {
            [thisName, otherName] = [otherName, thisName];
        }

        let result = {};

        result[name] = isChecked;

        // If both are now unchecked, automatically select the other.
        if (!isChecked && !inputs[otherName].checked) {
            result[otherName] = true;
        }

        onChange(result);
    };

    let refShowPositive = node => {
        inputs.showPositiveOps = node;
    };

    let refShowNegative = node => {
        inputs.showNegativeOps = node;
    };

    return (<div className={ props.className }>
        <label className="col-xs-12 col-md-6 checkbox-inside-label">
            <input
              type="checkbox"
              name="showPositiveOps"
              checked={ props.showPositiveOps }
              onChange={ handleChange }
              ref={ refShowPositive }
            />
            <span>{ $t('client.charts.positive') }</span>
        </label>

        <label className="col-xs-12 col-md-6 checkbox-inside-label">
            <input
              type="checkbox"
              name="showNegativeOps"
              checked={ props.showNegativeOps }
              onChange={ handleChange }
              ref={ refShowNegative }
            />
            <span>{ $t('client.charts.negative') }</span>
        </label>
    </div>);
};

OpAmountTypeSelect.propTypes = {
    // The components CSS classes.
    className: PropTypes.string,

    // Whether to display positive operations.
    showPositiveOps: PropTypes.bool.isRequired,

    // Whether to display negative operations.
    showNegativeOps: PropTypes.bool.isRequired,

    // A callback called whenever one of the inputs change.
    onChange: PropTypes.func.isRequired
};

export default OpAmountTypeSelect;
