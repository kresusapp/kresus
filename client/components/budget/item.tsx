import React, { useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import URL from '../../urls';
import { useDispatch } from 'react-redux';

import * as CategoriesStore from '../../store/categories';
import * as UiStore from '../../store/ui';
import * as BudgetStore from '../../store/budgets';

import { NONE_CATEGORY_ID, round2, translate as $t, useKresusState } from '../../helpers';

import AmountInput from '../ui/amount-input';
import { Budget } from '../../models';
import { Driver, ViewContext } from '../drivers';
import { useGenericError } from '../../hooks';

function computeAmountRatio(amount: number, threshold: number) {
    if (threshold === 0) {
        return 0;
    }

    let ratio = (100 * amount) / threshold;

    if (ratio < 0) {
        ratio -= 100;
    }

    return round2(ratio);
}

function getBars(threshold: number | null, amount: number, warningThresholdInPct: number) {
    if (threshold === null) {
        return null;
    }

    const amountPct = computeAmountRatio(amount, threshold);
    const bars = new Map<string, { classes: string; width: number }>();

    if (threshold === 0) {
        if (amount === 0) {
            bars.set('successRange', {
                classes: 'stacked-progress-part-success',
                width: 100,
            });
        } else {
            bars.set('dangerRange', {
                classes: 'stacked-progress-part-danger',
                width: 100,
            });
        }
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
            width: amountPct !== 0 ? Math.min(100, Math.abs(amountPct)) : 100,
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
            const ratio = amountPct / 100;
            successRange = warningThresholdInPct / ratio;
            warningRange = (100 - warningThresholdInPct) / ratio;
            dangerRange = (amountPct - 100) / ratio;
        }

        // From 0 to warningThresholdInPct
        if (successRange > 0) {
            bars.set('successRange', {
                classes: 'stacked-progress-part-success',
                width: successRange,
            });
        }

        // From warningThresholdInPct to 100
        if (warningRange > 0) {
            const progressive = dangerRange ? 'progressive' : '';
            bars.set('warningRange', {
                classes: `stacked-progress-part-warning ${progressive}`.trim(),
                width: warningRange,
            });
        }

        // From 100 to amount in percent
        if (dangerRange > 0) {
            bars.set('dangerRange', {
                classes: 'stacked-progress-part-danger',
                width: dangerRange,
            });
        }
    }

    return bars;
}

export const testing = {
    getBars,
};

interface BudgetListItemProps {
    // HTML id.
    id: string;

    // The budget item.
    budget: Budget;

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showTransactions: (categoryId: number) => void;

    // The threshold amount.
    amount: number;

    // Whether to display in percent or not.
    displayPercent: boolean;
}

const BudgetListItem = (props: BudgetListItemProps) => {
    const view = useContext(ViewContext);
    const isSmallScreen = useKresusState(state => UiStore.isSmallScreen(state.ui));
    const category = useKresusState(state =>
        CategoriesStore.fromId(state.categories, props.budget.categoryId)
    );

    const dispatch = useDispatch();

    const updateBudget = useGenericError(
        useCallback(
            (former: Budget, newer: BudgetStore.BudgetUpdateFields) =>
                dispatch(BudgetStore.update(former, newer)),
            [dispatch]
        )
    );

    const handleChange = useCallback(
        async (threshold: number | null) => {
            const newThreshold = Number.isNaN(threshold) ? null : threshold;
            if (props.budget.threshold === newThreshold) {
                return;
            }

            await updateBudget(props.budget, {
                categoryId: props.budget.categoryId,
                year: props.budget.year,
                month: props.budget.month,
                threshold: newThreshold,
            });
        },
        [updateBudget, props]
    );

    const { showTransactions } = props;
    const handleViewTransactions = useCallback(() => {
        showTransactions(category.id);
        dispatch(UiStore.toggleSearchDetails(true));
    }, [showTransactions, dispatch, category]);

    const { amount, budget } = props;
    const threshold = budget.threshold;

    let amountText = amount.toString();
    let remainingText = '-';
    let thresholdText: JSX.Element | null = null;

    if (threshold !== null && threshold !== 0) {
        if (props.displayPercent) {
            const amountPct = computeAmountRatio(amount, threshold);

            amountText = `${amountPct}%`;

            let remainingToSpendPct = 100 - amountPct;
            if (threshold > 0) {
                remainingToSpendPct *= -1;
            }

            remainingText = `${remainingToSpendPct.toFixed(2)}%`;
        } else {
            thresholdText = <span className="threshold">{`/ ${threshold}`}</span>;

            remainingText = `${round2(amount - threshold)}`;
        }
    }

    const bars: JSX.Element[] = [];
    // TODO: the "75" value should be editable by the user.
    const barsMap = getBars(threshold, amount, 75);
    if (barsMap) {
        for (const [key, values] of barsMap) {
            bars.push(
                <div
                    key={key}
                    role="progressbar"
                    className={`${values.classes}`}
                    style={{ width: `${values.width}%` }}
                />
            );
        }
    }

    const GoToTransactionsWrapper = (wrapperProps: { children: React.ReactNode }) => (
        <Link to={URL.reports.url(view.driver)} onClick={handleViewTransactions}>
            {wrapperProps.children}
        </Link>
    );

    const ProgressBar = () => (
        <div className="stacked-progress-bar">
            {bars}
            <span className="stacked-progress-bar-label">
                {amountText} {thresholdText}
            </span>
        </div>
    );

    const ClickableProgressBarOnSmallScreen = () => {
        if (isSmallScreen) {
            return (
                <GoToTransactionsWrapper>
                    <ProgressBar />
                </GoToTransactionsWrapper>
            );
        }

        return <ProgressBar />;
    };

    return (
        <tr>
            <td className="category-name">
                <span className="color-block-small" style={{ backgroundColor: category.color }}>
                    &nbsp;
                </span>{' '}
                {category.label}
            </td>
            <td className="category-amount">
                <ClickableProgressBarOnSmallScreen />
            </td>
            <td className="category-threshold">
                <AmountInput
                    onInput={handleChange}
                    defaultValue={threshold}
                    className="block"
                    signId={`sign-${props.id}`}
                />
            </td>
            <td className="category-diff amount">{remainingText}</td>
            <td className="category-button">
                <GoToTransactionsWrapper>
                    <i
                        className="btn info fa fa-search"
                        title={$t('client.budget.see_transactions')}
                    />
                </GoToTransactionsWrapper>
            </td>
        </tr>
    );
};

export default BudgetListItem;

interface UncategorizedTransactionsItemProps {
    amount: number;
    showTransactions: (categoryId: number) => void;
    currentDriver: Driver;
}

export const UncategorizedTransactionsItem = (props: UncategorizedTransactionsItemProps) => {
    const dispatch = useDispatch();

    const { showTransactions, currentDriver } = props;
    const viewTransactions = useCallback(() => {
        showTransactions(NONE_CATEGORY_ID);
        dispatch(UiStore.toggleSearchDetails(true));
    }, [dispatch, showTransactions]);

    return (
        <tr>
            <td className="category-name">{$t('client.budget.uncategorized')}</td>
            <td className="category-amount text-center">{props.amount.toFixed(2)}</td>
            <td className="category-threshold text-right">-</td>
            <td className="category-diff amount">-</td>
            <td className="category-button">
                <Link to={URL.reports.url(currentDriver)} onClick={viewTransactions}>
                    <i
                        className="btn info fa fa-search"
                        title={$t('client.budget.see_transactions')}
                    />
                </Link>
            </td>
        </tr>
    );
};
