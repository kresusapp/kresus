import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { get, actions } from '../../store';

import { round2, translate as $t } from '../../helpers';

import AmountInput from '../ui/amount-input';

function computeAmountRatio(amount, threshold) {
    if (threshold === 0) {
        return 0;
    }

    let ratio = (100 * amount) / threshold;

    if (ratio < 0) {
        ratio -= 100;
    }

    return round2(ratio);
}

function getBars(threshold, amount, warningThresholdInPct) {
    const amountPct = computeAmountRatio(amount, threshold);
    let bars = new Map();
    if (threshold === 0) {
        bars.set('empty', {
            classes: '',
            width: 100
        });
    } else if (threshold > 0) {
        // Positive threshold, it's an income: invert all the meanings.
        let state;
        if (amountPct < warningThresholdInPct) {
            state = 'danger';
        } else if (amountPct < 100) {
            state = 'warning';
        } else {
            state = 'success';
        }

        bars.set('successRange', {
            classes: `stacked-progress-part-${state}`,
            width: amountPct !== 0 ? Math.min(100, Math.abs(amountPct)) : 100
        });
    } else {
        let successRange = 0;
        let warningRange = 0;
        let dangerRange = 0;

        // The bar should look like this if we're in budget:
        // |--- successRange ---|--- warningRange (optional) ---|
        // else like this:
        // |--- successRange ---|--- warningRange ---|--- dangerRange ---|
        if (amountPct < 0) {
            // Negative threshold and positive amount
            successRange = 100;
        } else if (amountPct <= 100) {
            // We're in budget
            successRange = Math.min(amountPct, warningThresholdInPct);

            if (amountPct > warningThresholdInPct) {
                warningRange = amountPct - warningThresholdInPct;
            }
        } else {
            // We're out of budget for a negative threshold
            let ratio = amountPct / 100;
            successRange = warningThresholdInPct / ratio;
            warningRange = (100 - warningThresholdInPct) / ratio;
            dangerRange = (amountPct - 100) / ratio;
        }

        // From 0 to warningThresholdInPct
        if (successRange > 0) {
            bars.set('successRange', {
                classes: 'stacked-progress-part-success',
                width: successRange
            });
        }

        // From warningThresholdInPct to 100
        if (warningRange > 0) {
            let progressive = dangerRange ? 'progressive' : '';
            bars.set('warningRange', {
                classes: `stacked-progress-part-warning ${progressive}`.trim(),
                width: warningRange
            });
        }

        // From 100 to amount in percent
        if (dangerRange > 0) {
            bars.set('dangerRange', {
                classes: 'stacked-progress-part-danger',
                width: dangerRange
            });
        }
    }

    return bars;
}

export const testing = {
    getBars
};

class BudgetListItem extends React.Component {
    handleChange = threshold => {
        if (this.props.budget.threshold === threshold || Number.isNaN(threshold)) {
            return;
        }

        let budget = {
            categoryId: this.props.budget.categoryId,
            year: this.props.budget.year,
            month: this.props.budget.month,
            threshold
        };

        this.props.updateBudget(this.props.budget, budget);
    };

    handleViewOperations = () => {
        this.props.showOperations(this.props.category.id);
        this.props.showSearchDetails();
    };

    render() {
        let { category, amount, budget } = this.props;
        let threshold = budget.threshold;

        const amountPct = computeAmountRatio(amount, threshold);
        let amountText = amount;
        let remainingText = '-';
        let thresholdText = null;

        if (threshold !== 0) {
            if (this.props.displayInPercent) {
                amountText = `${amountPct}%`;

                let remainingToSpendPct = 100 - amountPct;
                if (threshold > 0) {
                    remainingToSpendPct *= -1;
                }

                remainingText = `${remainingToSpendPct.toFixed(2)}%`;
            } else {
                thresholdText = <span className="threshold">{`/${threshold}`}</span>;

                remainingText = round2(amount - threshold);
            }
        }

        let bars = [];
        // TODO: the "75" value should be editable by the user
        const barsMap = getBars(threshold, amount, 75);
        for (let [key, values] of barsMap) {
            bars.push(
                <div
                    key={key}
                    role="progressbar"
                    className={`${values.classes}`}
                    style={{ width: `${values.width}%` }}
                />
            );
        }

        return (
            <tr>
                <td className="category-name">
                    <span className="color-block-small" style={{ backgroundColor: category.color }}>
                        &nbsp;
                    </span>{' '}
                    {category.label}
                </td>
                <td className="category-amount">
                    <div className="stacked-progress-bar">
                        {bars}
                        <span className="stacked-progress-bar-label">
                            {amountText} {thresholdText}
                        </span>
                    </div>
                </td>
                <td className="category-threshold">
                    <AmountInput
                        onInput={this.handleChange}
                        defaultValue={Math.abs(threshold)}
                        initiallyNegative={threshold < 0}
                        className="block"
                        signId={`sign-${this.props.id}`}
                    />
                </td>
                <td className="category-diff amount">{remainingText}</td>
                <td className="category-button">
                    <Link
                        to={`/reports/${this.props.currentAccountId}`}
                        onClick={this.handleViewOperations}>
                        <i
                            className="btn info fa fa-search"
                            title={$t('client.budget.see_operations')}
                        />
                    </Link>
                </td>
            </tr>
        );
    }
}

BudgetListItem.propTypes = {
    // The total amount
    amount: PropTypes.number.isRequired,

    // The budget item.
    budget: PropTypes.object.isRequired,

    // Whether to display in percent or not
    displayInPercent: PropTypes.bool.isRequired,

    // The method to update a budget.
    updateBudget: PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: PropTypes.func.isRequired,

    // A string indicating which account is active
    currentAccountId: PropTypes.string.isRequired
};

const Export = connect(
    (state, ownProps) => {
        const category = get.categoryById(state, ownProps.budget.categoryId);
        return {
            category,
            ...ownProps
        };
    },
    dispatch => ({
        showSearchDetails: () => actions.toggleSearchDetails(dispatch, true),

        updateBudget: (former, newer) => {
            actions.updateBudget(dispatch, former, newer);
        }
    })
)(BudgetListItem);
export default Export;
