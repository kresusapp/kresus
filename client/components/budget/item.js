import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions } from '../../store';

import { round2 } from '../../helpers';

import AmountInput from '../ui/amount-input';

const WARNING_THRESHOLD = 75;

function getAmountPct(amount, threshold) {
    let amountPct = 0;

    if (threshold !== 0) {
        amountPct = 100 * amount / threshold;

        if (amountPct < 0) {
            amountPct -= 100;
        }

        amountPct = round2(amountPct);
    }

    return amountPct;
}

export function getBars(threshold, amount, warningThresholdInPct) {
    const amountPct = getAmountPct(amount, threshold);
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

        bars.set('beforeWarning', {
            classes: `progress-bar-${state}`,
            width: amountPct !== 0 ? Math.min(100, Math.abs(amountPct)) : 100
        });
    } else {
        let percentToWarning = 0;
        let percentFromDanger = 0;
        let percentAfterDanger = 0;

        // The bar should look like this if we're in budget:
        // |--- percentToWarning ---|--- percentFromDanger (optional) ---|
        // else like this:
        // |--- percentToWarning ---|--- percentFromDanger ---|--- percentAfterDanger ---|
        if (amountPct < 0) {
            // Negative threshold and positive amount
            percentToWarning = 100;
        } else if (amountPct <= 100) {
            // We're in budget
            percentToWarning = Math.min(amountPct, warningThresholdInPct);

            if (amountPct > warningThresholdInPct) {
                percentFromDanger = amountPct - warningThresholdInPct;
            }
        } else {
            // We're out of budget for a negative threshold
            let ratio = amountPct / 100;
            percentToWarning = warningThresholdInPct / ratio;
            percentFromDanger = (100 - warningThresholdInPct) / ratio;
            percentAfterDanger = (amountPct - 100) / ratio;
        }

        // From 0 to WARNING_THRESHOLD
        if (percentToWarning > 0) {
            bars.set('beforeWarning', {
                classes: 'progress-bar-success',
                width: percentToWarning
            });
        }

        // From WARNING_THRESHOLD to 100
        if (percentFromDanger > 0) {
            let progressive = percentAfterDanger ? 'progressive' : '';
            bars.set('beforeDanger', {
                classes: `progress-bar-warning ${progressive}`.trim(),
                width: percentFromDanger
            });
        }

        // From 100 to amount in percent
        if (percentAfterDanger > 0) {
            bars.set('afterDanger', {
                classes: 'progress-bar-danger',
                width: percentAfterDanger
            });
        }
    }

    return bars;
}

const BudgetListItem = props => {
    const updateCategory = props.updateCategory;

    const handleChange = threshold => {
        if (props.cat.threshold === threshold || Number.isNaN(threshold)) {
            return;
        }

        let category = {
            title: props.cat.title,
            color: props.cat.color,
            threshold
        };

        updateCategory(props.cat, category);
    };

    const handleViewOperations = () => {
        props.showOperations(props.cat.id);
        props.showSearchDetails();
    };

    let { cat: category, amount } = props;
    let threshold = category.threshold;

    const amountPct = getAmountPct(amount, threshold);
    let amountText = amount;
    let remainingText = '-';
    let thresholdText = null;

    if (threshold !== 0) {
        if (props.displayInPercent) {
            amountText = `${amountPct}%`;

            let remainingToSpendPct = 100 - amountPct;
            if (threshold > 0) {
                remainingToSpendPct *= -1;
            }

            remainingText = `${remainingToSpendPct.toFixed(2)}%`;
        } else {
            thresholdText = <span className="hidden-lg">{`/${threshold}`}</span>;

            remainingText = round2(amount - threshold);
        }
    }

    let bars = [];
    const barsMap = getBars(threshold, amount, WARNING_THRESHOLD);
    for (let [key, values] of barsMap) {
        bars.push(
            <div
                key={key}
                role="progressbar"
                className={`progress-bar ${values.classes}`}
                style={{ width: `${values.width}%` }}
            />
        );
    }

    return (
        <tr key={category.id}>
            <td>
                <span className="color-block-small" style={{ backgroundColor: category.color }}>
                    &nbsp;
                </span>{' '}
                {category.title}
            </td>
            <td>
                <div className="progress budget">
                    {bars}
                    <span className="amount-display">
                        {amountText} {thresholdText}
                    </span>
                </div>
            </td>
            <td className="hidden-xs">
                <AmountInput
                    onInput={handleChange}
                    defaultValue={Math.abs(threshold)}
                    initiallyNegative={threshold < 0}
                    signId={`sign-${category.id}`}
                />
            </td>
            <td className="hidden-xs text-right">{remainingText}</td>
            <td className="hidden-xs">
                <Link to={`/reports/${props.currentAccountId}`} onClick={handleViewOperations}>
                    <i className="btn btn-sm btn-info fa fa-search" />
                </Link>
            </td>
        </tr>
    );
};

BudgetListItem.propTypes = {
    // The category related to this budget item.
    cat: PropTypes.object.isRequired,

    // The total amount
    amount: PropTypes.number.isRequired,

    // Whether to display in percent or not
    displayInPercent: PropTypes.bool.isRequired,

    // The method to update a category.
    updateCategory: PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: PropTypes.func.isRequired,

    // A string indicating which account is active
    currentAccountId: PropTypes.string.isRequired
};

const Export = connect(null, dispatch => ({
    showSearchDetails: () => actions.toggleSearchDetails(dispatch, true)
}))(BudgetListItem);
export default Export;
