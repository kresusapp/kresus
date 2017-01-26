import React from 'react';

import { translate as $t } from '../../helpers';

const OpAmountTypeSelect = props => {

    const handleChange = event => {
        let name = event.target.getAttribute('name');
        let isChecked = event.target.checked;
        let result = {
            [name]: isChecked
        };

        // If both are now unchecked, automatically select the other
        let otherInputName = name === 'showPositiveOps' ? 'showNegativeOps' : 'showPositiveOps';
        let otherInput = event.target.parentElement.parentElement.querySelector(`input[name='${otherInputName}']`);
        if (!isChecked && !otherInput.checked) {
            result[otherInputName] = true;
        }

        props.onChange(result);
    };

    return (<div className={ props.className }>
        <label className="col-md-6 col-xs-12 checkbox-inside-label">
            <input
              type="checkbox"
              name="showPositiveOps"
              checked={ props.showPositiveOps }
              onChange={ handleChange }
            />
            <span>{ $t('client.charts.positive') }</span>
        </label>

        <label className="col-md-6 col-xs-12 checkbox-inside-label">
            <input
              type="checkbox"
              name="showNegativeOps"
              checked={ props.showNegativeOps }
              onChange={ handleChange }
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
