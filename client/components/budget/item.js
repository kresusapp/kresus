import React from 'react';

import { translate as $t } from '../../helpers';

class BudgetListItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleViewOperations = this.viewOperations.bind(this);
    }

    handleChange() {
        let value = this.refs.threshold.value;
        let threshold = value ? Number.parseFloat(value) : 0;
        if (isNaN(threshold) || threshold < 0) {
            alert($t('client.budget.threshold_error'));
            this.refs.threshold.value = '';
            return;
        }

        if (this.props.cat.threshold === threshold) {
            return;
        }

        let category = {
            title: this.props.cat.title,
            color: this.props.cat.color,
            threshold
        };

        this.props.updateCategory(this.props.cat, category);
    }

    viewOperations() {
        this.props.showOperations(this.props.cat.id);
    }

    render() {
        let warningThreshold = 75;
        let amount = parseFloat(this.props.amount.toFixed(2));
        let remaining = 0;
        let amountDisplay = amount;
        let remainingDisplay = '-';
        let amountPct = amount ? 1 : 0;
        let c = this.props.cat;
        let threshold = c.threshold;
        let thresholdBasis;
        let bars = [];

        if (threshold > 0) {
            remaining = threshold - amount;
            remaining = parseFloat(remaining.toFixed(2));
            amountPct = (amount * 100 / threshold);
            amountPct = parseFloat(amountPct.toFixed(2));
        }

        if (this.props.displayInPercent) {
            amountDisplay = `${amountPct}%`;

            if (threshold) {
                remainingDisplay = `${(100 - amountPct).toFixed(2)}%`;
            }
        } else if (threshold) {
            remainingDisplay = remaining;
            thresholdBasis = (<span className="hidden-lg">
                                { `/${threshold}` }
            </span>);
        }

        let percentBeforeWarning = 0;
        let percentBeforeDanger = 0;
        let percentAfterDanger = 0;

        if (amountPct && threshold) {
            if (amountPct > 100) {
                let ratio = amountPct / 100;
                percentBeforeWarning = warningThreshold / ratio;
                percentBeforeDanger = (100 - warningThreshold) / ratio;
                percentAfterDanger = (amountPct - 100) / ratio;
            } else {
                percentBeforeWarning = Math.min(warningThreshold, amountPct);

                if (amountPct > warningThreshold)
                    percentBeforeDanger = amountPct - percentBeforeWarning;
            }
        }

        // From 0 to warningThreshold
        if (percentBeforeWarning) {
            bars.push((<div className="progress-bar progress-bar-success"
              key="beforeWarning"
              role="progressbar"
              style={ { width: `${percentBeforeWarning}%` } }>
            </div>));
        } else if (amount) {
            bars.push((<div className="progress-bar"
              key="empty"
              role="progressbar"
              style={ { width: '100%' } }>
            </div>));
        }

        // From warningThreshold to 100
        if (percentBeforeDanger) {
            let progressive = percentAfterDanger ? 'progressive' : '';
            bars.push((<div
              className={ `progress-bar progress-bar-warning ${progressive}` }
              key="beforeDanger"
              role="progressbar"
              style={ { width: `${percentBeforeDanger}%` } }>
            </div>));
        }

        // From 100 to amount in percent
        if (percentAfterDanger) {
            bars.push((<div className="progress-bar progress-bar-danger"
              key="afterDanger"
              role="progressbar"
              style={ { width: `${percentAfterDanger}%` } }>
            </div>));
        }

        return (
            <tr key={ c.id }>
                <td>
                    <span className="color_block_small"
                      style={ { backgroundColor: c.color } }>
                      &nbsp;
                    </span> { c.title }
                </td>
                <td>
                    <div className="progress budget">
                        { bars }
                        <span className="amountDisplay">
                            { amountDisplay } { thresholdBasis }
                        </span>
                    </div>
                </td>
                <td className="hidden-xs text-right">
                    <input
                      ref="threshold"
                      type="number"
                      step="any"
                      min="0"
                      onChange={ this.handleChange }
                      defaultValue={ threshold }
                      className="text-right"
                    />
                </td>
                <td className="hidden-xs text-right">
                    { remainingDisplay }
                </td>
                <td className="hidden-xs">
                    <button className="btn btn-sm btn-info fa fa-search"
                      onClick={ this.handleViewOperations }></button>
                </td>
            </tr>
        );
    }
}

BudgetListItem.propTypes = {
    // The category related to this budget item.
    cat: React.PropTypes.object.isRequired,

    // The total amount
    amount: React.PropTypes.number.isRequired,

    // Whether to display in percent or not
    displayInPercent: React.PropTypes.bool.isRequired,

    // The method to update a category.
    updateCategory: React.PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: React.PropTypes.func.isRequired,
};

export default BudgetListItem;
