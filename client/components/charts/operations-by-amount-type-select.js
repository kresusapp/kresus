import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

class OpAmountTypeSelect extends React.Component {
    inputs = {
        showPositiveOps: null,
        showNegativeOps: null
    };

    handleChange = event => {
        let name = event.target.getAttribute('name');
        let isChecked = event.target.checked;

        let [thisName, otherName] = ['showPositiveOps', 'showNegativeOps'];
        if (name === otherName) {
            [thisName, otherName] = [otherName, thisName];
        }

        let result = {};

        result[name] = isChecked;

        // If both are now unchecked, automatically select the other.
        if (!isChecked && !this.inputs[otherName].checked) {
            result[otherName] = true;
        }

        this.props.onChange(result);
    };

    refShowPositive = node => {
        this.inputs.showPositiveOps = node;
    };
    refShowNegative = node => {
        this.inputs.showNegativeOps = node;
    };

    render() {
        return (
            <div className={`${this.props.className} checkboxes`}>
                <label className="checkbox-inside-label">
                    <input
                        type="checkbox"
                        name="showPositiveOps"
                        checked={this.props.showPositiveOps}
                        onChange={this.handleChange}
                        ref={this.refShowPositive}
                    />
                    <span>{$t('client.charts.positive')}</span>
                </label>

                <label className="checkbox-inside-label">
                    <input
                        type="checkbox"
                        name="showNegativeOps"
                        checked={this.props.showNegativeOps}
                        onChange={this.handleChange}
                        ref={this.refShowNegative}
                    />
                    <span>{$t('client.charts.negative')}</span>
                </label>
            </div>
        );
    }
}

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
