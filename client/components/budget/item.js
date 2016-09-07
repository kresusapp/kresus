import React from 'react';

import {
    round2
} from '../../helpers';

import AmountInput from '../ui/amount-input';

const WARNING_THRESHOLD = 75;

class BudgetListItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleViewOperations = this.viewOperations.bind(this);
    }

    handleChange(threshold) {
        if (this.props.cat.threshold === threshold || Number.isNaN(threshold)) {
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
        let { cat: category, amount } = this.props;
        let threshold = category.threshold;

        let amountText = amount;
        let remainingText = '-';
        let thresholdText = null;

        let bars = [];
        if (threshold !== 0) {
            let amountPct = round2(100 * amount / threshold);

            if (this.props.displayInPercent) {
                amountText = `${amountPct}%`;

                let remainingToSpendPct = 100 - amountPct;
                if (threshold > 0)
                    remainingToSpendPct *= -1;

                remainingText = `${remainingToSpendPct.toFixed(2)}%`;
            } else {
                thresholdText = (<span className="hidden-lg">
                    { `/${threshold}` }
                </span>);

                remainingText = round2(amount - threshold);
            }

            // Create bars with respect to the threshold value.
            if (threshold > 0) {
                // Positive threshold, it's an income: invert all the meanings.
                let state;
                if (amountPct < WARNING_THRESHOLD)
                    state = 'danger';
                else if (amount < threshold)
                    state = 'warning';
                else
                    state = 'success';

                let width = amountPct !== 0 ? Math.min(100, amountPct) : 100;

                bars.push((<div
                  className={ `progress-bar progress-bar-${state}` }
                  key="beforeWarning"
                  role="progressbar"
                  style={ { width: `${width}%` } }
                />));
            } else {
                let percentToWarning = 0;
                let percentFromDanger = 0;
                let percentAfterDanger = 0;

                // The bar should look like this if we're in budget (amount < negative threshold):
                // |--- percentToWarning ---|--- percentFromDanger (optional) ---|
                // else like this:
                // |--- percentToWarning ---|--- percentFromDanger ---|--- percentAfterDanger ---|

                if (amountPct <= 100) {
                    // We're in budget
                    percentToWarning = Math.min(amountPct, WARNING_THRESHOLD);

                    if (amountPct > WARNING_THRESHOLD) {
                        percentFromDanger = amountPct - WARNING_THRESHOLD;
                    }
                } else {
                    // We're out of budget for a negative threshold
                    let ratio = amount / threshold;
                    percentToWarning = WARNING_THRESHOLD / ratio;
                    percentFromDanger = (100 - WARNING_THRESHOLD) / ratio;
                    percentAfterDanger = (amountPct - 100) / ratio;
                }

                // From 0 to WARNING_THRESHOLD
                bars.push((<div
                  className="progress-bar progress-bar-success"
                  key="beforeWarning"
                  role="progressbar"
                  style={ { width: `${percentToWarning}%` } }
                />));

                // From WARNING_THRESHOLD to 100
                let progressive = percentAfterDanger ? 'progressive' : '';
                bars.push((<div
                  className={ `progress-bar progress-bar-warning ${progressive}` }
                  key="beforeDanger"
                  role="progressbar"
                  style={ { width: `${percentFromDanger}%` } }
                />));

                // From 100 to amount in percent
                bars.push((<div
                  className="progress-bar progress-bar-danger"
                  key="afterDanger"
                  role="progressbar"
                  style={ { width: `${percentAfterDanger}%` } }
                />));
            }
        } else if (amount) {
            // Display a different progress bar whenever we have an amount but
            // no threshold.
            bars.push((<div
              className="progress-bar"
              key="empty"
              role="progressbar"
              style={ { width: '100%' } }
            />));
        }

        return (
            <tr key={ category.id }>
                <td>
                    <span
                      className="color-block-small"
                      style={ { backgroundColor: category.color } }>
                      &nbsp;
                    </span> { category.title }
                </td>
                <td>
                    <div className="progress budget">
                        { bars }
                        <span className="amount-display">
                            { amountText } { thresholdText }
                        </span>
                    </div>
                </td>
                <td className="hidden-xs">
                    <AmountInput
                      initiallyNegative={ false }
                      togglable={ false }
                      onChange={ this.handleChange }
                      defaultValue={ threshold }
                      signId={ category.id }
                    />
                </td>
                <td className="hidden-xs text-right">
                    { remainingText }
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
