import React from 'react';

import { translate as $t } from '../../helpers';

const WARNING_THRESHOLD = 75;

class BudgetListItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleViewOperations = this.viewOperations.bind(this);
    }

    handleChange() {
        let value = this.refs.threshold.value;
        let threshold = value ? Number.parseFloat(value) : 0;
        if (isNaN(threshold)) {
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
        let c = this.props.cat;
        let threshold = c.threshold;
        let thresholdBasis;
        let amount = this.props.amount;
        let remainingToSpend = 0;
        let amountPct = amount ? 1 : 0;

        if (threshold !== 0) {
            remainingToSpend = threshold - amount;
            remainingToSpend = parseFloat(remainingToSpend.toFixed(2));
            amountPct = 100 * amount / threshold;
            amountPct = parseFloat(amountPct.toFixed(2));
        }

        remainingToSpend = -remainingToSpend;
        let amountDisplay = amount;
        let remainingToSpendDisplay = '-';
        if (this.props.displayInPercent) {
            amountDisplay = threshold ? `${amountPct}%` : '-';

            if (threshold > 0) {
                remainingToSpendDisplay = `${-(100 - amountPct).toFixed(2)}%`;
            } else if (threshold) {
                remainingToSpendDisplay = `${(100 - amountPct).toFixed(2)}%`;
            }
        } else if (threshold) {
            remainingToSpendDisplay = remainingToSpend;
            thresholdBasis = (<span className="hidden-lg">
                { `/${threshold}` }
            </span>);
        }

        let bars = [];

        if (amount && amount > threshold && threshold < 0) {
            bars.push((<div
              className="progress-bar progress-bar-success"
              key="full"
              role="progressbar"
              style={ { width: '100%' } }
            />));
        } else if (amountPct && threshold > 0) {
            let state = 'success';
            if (amount < threshold) {
                state = amountPct > WARNING_THRESHOLD ? 'warning' : 'danger';
            }

            bars.push((<div
              className={ `progress-bar progress-bar-${state}` }
              key="beforeWarning"
              role="progressbar"
              style={ { width: `${Math.min(100, amountPct)}%` } }
            />));
        } else {
            let percentToWarning = 0;
            let percentFromDanger = 0;
            let percentAfterDanger = 0;

            if (amountPct && threshold) {
                if (amountPct > 100) {
                    let ratio = amount / threshold;
                    percentToWarning = WARNING_THRESHOLD / ratio;
                    percentFromDanger = (100 - WARNING_THRESHOLD) / ratio;
                    percentAfterDanger = (amountPct - 100) / ratio;
                } else {
                    percentToWarning = Math.min(WARNING_THRESHOLD, amountPct);
                    if (amountPct > WARNING_THRESHOLD)
                        percentFromDanger = amountPct - percentToWarning;
                }
            }

            // From 0 to WARNING_THRESHOLD
            if (percentToWarning) {
                bars.push((<div
                  className="progress-bar progress-bar-success"
                  key="beforeWarning"
                  role="progressbar"
                  style={ { width: `${percentToWarning}%` } }
                />));
            } else if (amount) {
                bars.push((<div
                  className="progress-bar"
                  key="empty"
                  role="progressbar"
                  style={ { width: '100%' } }
                />));
            }

            // From WARNING_THRESHOLD to 100
            if (percentFromDanger) {
                let progressive = percentAfterDanger ? 'progressive' : '';
                bars.push((<div
                  className={ `progress-bar progress-bar-warning ${progressive}` }
                  key="beforeDanger"
                  role="progressbar"
                  style={ { width: `${percentFromDanger}%` } }
                />));
            }

            // From 100 to amount in percent
            if (percentAfterDanger) {
                bars.push((<div
                  className="progress-bar progress-bar-danger"
                  key="afterDanger"
                  role="progressbar"
                  style={ { width: `${percentAfterDanger}%` } }
                />));
            }
        }

        return (
            <tr key={ c.id }>
                <td>
                    <span
                      className="color-block-small"
                      style={ { backgroundColor: c.color } }>
                      &nbsp;
                    </span> { c.title }
                </td>
                <td>
                    <div className="progress budget">
                        { bars }
                        <span className="amount-display">
                            { amountDisplay } { thresholdBasis }
                        </span>
                    </div>
                </td>
                <td className="hidden-xs text-right">
                    <input
                      ref="threshold"
                      type="number"
                      step="any"
                      onChange={ this.handleChange }
                      defaultValue={ threshold }
                      className="text-right"
                    />
                </td>
                <td className="hidden-xs text-right">
                    { remainingToSpendDisplay }
                </td>
                <td className="hidden-xs">
                    <button
                      className="btn btn-sm btn-info fa fa-search"
                      onClick={ this.handleViewOperations }
                    />
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
    showOperations: React.PropTypes.func.isRequired
};

export default BudgetListItem;
