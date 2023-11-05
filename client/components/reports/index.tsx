import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useDispatch } from 'react-redux';

import {
    translate as $t,
    localeComparator,
    formatDate,
    useKresusState,
    assert,
} from '../../helpers';

import { get, actions, GlobalState } from '../../store';

import InfiniteList from '../ui/infinite-list';
import TransactionUrls from '../transactions/urls';

import SearchComponent from './search';
import BulkEditComponent from './bulkedit';
import { TransactionItem, PressableTransactionItem } from './item';
import MonthYearSeparator from './month-year-separator';
import SyncButton from './sync-button';
import DisplayIf, { IfNotMobile } from '../ui/display-if';
import { ViewContext } from '../drivers';

import './reports.css';
import './account-summary.css';
import './toolbar.css';

import { Transaction } from '../../models';
import { ButtonLink } from '../ui';
import { LIMIT_ONGOING_TO_CURRENT_MONTH } from '../../../shared/settings';

// Keep in sync with reports.css.
function getTransactionHeight(isSmallScreen: boolean) {
    return isSmallScreen ? 41 : 55;
}

// Infinite list properties.
const NUM_ITEM_BALLAST = 10;
const CONTAINER_ID = 'content-container';

const ITEM_KIND_TRANSACTION = 0;
const ITEM_KIND_DATE_SEPARATOR = 1;

const SearchButton = () => {
    const dispatch = useDispatch();

    const handleClick = useCallback(() => {
        actions.toggleSearchDetails(dispatch);
    }, [dispatch]);

    return (
        <button
            type="button"
            className="btn"
            aria-label={$t('client.search.title')}
            onClick={handleClick}
            title={$t('client.search.title')}>
            <span className="fa fa-search" />
            <span className="label">{$t('client.search.title')}</span>
        </button>
    );
};

const BulkEditButton = (props: { handleClick: () => void; isActive: boolean }) => {
    let toggleButtonClass = 'btn';
    if (props.isActive) {
        toggleButtonClass += ' active';
    }
    return (
        <button
            type="button"
            className={toggleButtonClass}
            aria-label={$t('client.bulkedit.title')}
            onClick={props.handleClick}
            title={$t('client.bulkedit.title')}>
            <span className="label">{$t('client.bulkedit.title')}</span>
            <span className="fa fa-list-alt" />
        </button>
    );
};

const Reports = () => {
    const view = useContext(ViewContext);

    const transactionIds = view.transactionIds;
    const hasSearchFields = useKresusState(state => get.hasSearchFields(state));
    const filteredTransactionIds = useKresusState(state => {
        if (!get.hasSearchFields(state)) {
            return transactionIds;
        }

        const search = get.searchFields(state);
        const filtered = [];
        for (const t of transactionIds.map(id => get.transactionById(state, id))) {
            if (search.categoryIds.length > 0 && !search.categoryIds.includes(t.categoryId)) {
                continue;
            }
            if (search.type !== '' && t.type !== search.type) {
                continue;
            }
            if (search.amountLow !== null && t.amount < search.amountLow) {
                continue;
            }
            if (search.amountHigh !== null && t.amount > search.amountHigh) {
                continue;
            }
            if (search.dateLow !== null && t.date < search.dateLow) {
                continue;
            }
            if (search.dateHigh !== null && t.date > search.dateHigh) {
                continue;
            }
            if (search.keywords.length > 0) {
                let foundAll = true;
                for (const str of search.keywords) {
                    if (
                        (t.customLabel === null || !localeContains(t.customLabel, str)) &&
                        !localeContains(t.label, str) &&
                        !localeContains(t.rawLabel, str)
                    ) {
                        foundAll = false;
                        break;
                    }
                }
                if (!foundAll) {
                    continue;
                }
            }
            filtered.push(t.id);
        }
        return filtered;
    });

    const wellTransactionIds = useKresusState(state => {
        if (hasSearchFields) {
            return filteredTransactionIds;
        }
        return filterTransactionsThisMonth(state, transactionIds);
    });

    const positiveSumNum = useKresusState(state =>
        computeTotal(state, x => x.amount > 0, wellTransactionIds)
    );
    const negativeSumNum = useKresusState(state =>
        computeTotal(state, x => x.amount < 0, wellTransactionIds)
    );
    const wellSumNum = positiveSumNum + negativeSumNum;

    const positiveSum = view.formatCurrency(positiveSumNum);
    const negativeSum = view.formatCurrency(negativeSumNum);
    const wellSum = view.formatCurrency(wellSumNum);

    // Insert month/year rows. We expect transactions ids to already be sorted chronologically.
    const filteredTransactionsItems = useKresusState(state => {
        const ret: {
            kind: typeof ITEM_KIND_DATE_SEPARATOR | typeof ITEM_KIND_TRANSACTION;
            transactionId?: number;
            month?: number;
            year?: number;
        }[] = [];

        let month = null;
        let year = null;
        for (const opId of filteredTransactionIds) {
            const transaction = get.transactionById(state, opId);
            const transactionMonth = transaction.date.getMonth();
            const transactionYear = transaction.date.getFullYear();

            if (
                month === null ||
                year === null ||
                transactionYear !== year ||
                transactionMonth !== month
            ) {
                ret.push({
                    kind: ITEM_KIND_DATE_SEPARATOR,
                    month: transactionMonth,
                    year: transactionYear,
                });
                month = transactionMonth;
                year = transactionYear;
            }

            ret.push({
                kind: ITEM_KIND_TRANSACTION,
                transactionId: opId,
            });
        }

        return ret;
    });

    const [minAmount, maxAmount] = useKresusState(state => computeMinMax(state, transactionIds));

    const isSmallScreen = useKresusState(state => get.isSmallScreen(state));
    const transactionHeight = getTransactionHeight(isSmallScreen);

    const refTransactionTable = React.createRef<HTMLTableElement>();
    const refThead = React.createRef<HTMLTableSectionElement>();

    const [heightAbove, setHeightAbove] = useState(0);
    const [inBulkEditMode, setInBulkEditMode] = useState(false);
    const [bulkEditSelectAll, setBulkEditSelectAll] = useState(false);
    const [bulkEditSelectedSet, setBulkEditSelectedSet] = useState<Set<number>>(new Set());

    const defineBulkSet = useCallback(
        (selectAll: boolean, selectedSet: Set<number>) => {
            const transactionsIds = filteredTransactionsItems
                .filter(item => item.kind === ITEM_KIND_TRANSACTION)
                .map(item => (item as { transactionId: number }).transactionId);

            let changedSet = false;

            // Removes from bulkEditSelectedSet all the transactions which aren't in the
            // filteredTransactionsItems array anymore (because we changed account, or
            // searched something, etc.).
            const newItemSet = new Set(transactionsIds);
            for (const id of selectedSet.values()) {
                if (!newItemSet.has(id)) {
                    selectedSet.delete(id);
                    changedSet = true;
                }
            }

            if (selectAll) {
                for (const id of transactionsIds) {
                    if (!selectedSet.has(id)) {
                        selectedSet.add(id);
                        changedSet = true;
                    }
                }
            }

            setBulkEditSelectAll(selectAll);
            setBulkEditSelectedSet(changedSet ? new Set(selectedSet) : selectedSet);
        },
        [filteredTransactionsItems, setBulkEditSelectAll, setBulkEditSelectedSet]
    );

    useEffect(() => {
        if (inBulkEditMode) {
            defineBulkSet(bulkEditSelectAll, bulkEditSelectedSet);
        }
    }, [
        filteredTransactionsItems,
        inBulkEditMode,
        bulkEditSelectAll,
        bulkEditSelectedSet,
        defineBulkSet,
    ]);

    const toggleBulkEditMode = useCallback(() => {
        setInBulkEditMode(!inBulkEditMode);
        defineBulkSet(false, new Set());
    }, [defineBulkSet, setInBulkEditMode, inBulkEditMode]);

    const toggleAllBulkItems = useCallback(
        (isChecked: boolean) => {
            let selected: Set<number>;
            if (!isChecked) {
                selected = new Set();
            } else {
                const transactionsIds = filteredTransactionsItems
                    .filter(item => item.kind === ITEM_KIND_TRANSACTION)
                    .map(item => (item as { transactionId: number }).transactionId);
                selected = new Set(transactionsIds);
            }
            defineBulkSet(isChecked, selected);
        },
        [filteredTransactionsItems, defineBulkSet]
    );

    const toggleBulkItem = useCallback(
        (itemId: number) => {
            // Deep copy the state, to force a re-render of the apply button.
            const selectedSet = new Set(bulkEditSelectedSet);

            if (selectedSet.has(itemId)) {
                selectedSet.delete(itemId);
            } else {
                selectedSet.add(itemId);
            }

            // Update the "select all" checkbox when transactions are manually selected.
            const selectedAll =
                selectedSet.size ===
                filteredTransactionsItems.reduce(
                    (count, item) => count + (item.kind === ITEM_KIND_TRANSACTION ? 1 : 0),
                    0
                );

            defineBulkSet(selectedAll, selectedSet);
        },
        [filteredTransactionsItems, bulkEditSelectedSet, defineBulkSet]
    );

    const renderItems = useCallback(
        (items: any[], low: number, high: number) => {
            const Item = isSmallScreen ? PressableTransactionItem : TransactionItem;

            const max = Math.min(items.length, high);

            const renderedItems = [];
            for (let i = low; i < max; ++i) {
                const item = items[i];

                // Check whether this is a transaction id or a month/year separator.
                if (item.kind === ITEM_KIND_DATE_SEPARATOR) {
                    renderedItems.push(
                        <MonthYearSeparator
                            key={`${item.month}${item.year}`}
                            month={item.month}
                            year={item.year}
                            colspan={isSmallScreen ? 3 : 6}
                        />
                    );
                } else {
                    renderedItems.push(
                        <Item
                            key={item.transactionId}
                            transactionId={item.transactionId}
                            formatCurrency={view.formatCurrency}
                            inBulkEditMode={inBulkEditMode}
                            bulkEditStatus={bulkEditSelectedSet.has(item.transactionId)}
                            toggleBulkItem={toggleBulkItem}
                        />
                    );
                }
            }

            return renderedItems;
        },
        [bulkEditSelectedSet, toggleBulkItem, view.formatCurrency, inBulkEditMode, isSmallScreen]
    );

    useEffect(() => {
        // On every re-render.
        let newHeightAbove;
        if (!refTransactionTable.current || !refThead.current) {
            newHeightAbove = 0;
        } else {
            newHeightAbove = refTransactionTable.current.offsetTop + refThead.current.scrollHeight;
        }
        if (heightAbove !== newHeightAbove) {
            setHeightAbove(newHeightAbove);
        }
    }, [heightAbove, refTransactionTable, refThead, setHeightAbove]);

    const asOf = $t('client.transactions.as_of');
    let lastCheckDate = formatDate.toShortString(view.lastCheckDate);
    lastCheckDate = `${asOf} ${lastCheckDate}`;

    const lastCheckDateTooltip = `${$t(
        'client.transactions.last_sync_full'
    )} ${formatDate.toLongString(view.lastCheckDate)}`;

    const { balance, outstandingSum, formatCurrency } = view;

    let syncButton;
    if (view.driver.config.showSync) {
        assert(view.account !== null, 'must have an account if we show the sync button');
        syncButton = (
            <li>
                <SyncButton account={view.account} />
            </li>
        );
    }

    const { outstandingSumLabel, futureBalanceLabel } = useKresusState(state => {
        const onlyMonth = get.boolSetting(state, LIMIT_ONGOING_TO_CURRENT_MONTH);
        if (onlyMonth) {
            return {
                outstandingSumLabel: $t('client.menu.outstanding_sum_month'),
                futureBalanceLabel: $t('client.menu.outstanding_balance_month'),
            };
        }
        return {
            outstandingSumLabel: $t('client.menu.outstanding_sum'),
            futureBalanceLabel: $t('client.menu.outstanding_balance'),
        };
    });

    return (
        <>
            <div className="account-summary">
                <span className="icon">
                    <span className="fa fa-balance-scale" />
                </span>

                <div>
                    <p className="main-balance">
                        <span className="label">
                            <span className="balance-text">
                                {$t('client.transactions.current_balance')}
                            </span>
                            <span className="separator">&nbsp;</span>
                            <span className="date">{lastCheckDate}</span>
                            <span
                                className="tooltipped tooltipped-sw tooltipped-multiline"
                                aria-label={lastCheckDateTooltip}>
                                <span className="fa fa-question-circle clickable" />
                            </span>
                        </span>
                        <span className="amount">{formatCurrency(balance)}</span>
                    </p>

                    <DisplayIf condition={outstandingSum !== 0}>
                        <p>
                            <span className="label">{outstandingSumLabel}</span>
                            <span className="amount">{formatCurrency(outstandingSum)}</span>
                        </p>

                        <p>
                            <span className="label">{futureBalanceLabel}</span>
                            <span className="amount">
                                {formatCurrency(balance + outstandingSum)}
                            </span>
                        </p>
                    </DisplayIf>
                </div>
            </div>

            <div className="transaction-toolbar">
                <ul>
                    <li>
                        <SearchButton />
                    </li>

                    {syncButton}

                    <DisplayIf condition={view.driver.config.showAddTransaction}>
                        <li>
                            <ButtonLink
                                to={TransactionUrls.new.url(view.driver)}
                                aria={$t('client.transactions.add_transaction')}
                                icon="plus"
                                label={$t('client.transactions.add_transaction')}
                            />
                        </li>
                    </DisplayIf>

                    <IfNotMobile>
                        <li>
                            <BulkEditButton
                                isActive={inBulkEditMode}
                                handleClick={toggleBulkEditMode}
                            />
                        </li>
                    </IfNotMobile>
                </ul>
                <SearchComponent minAmount={minAmount} maxAmount={maxAmount} />
            </div>

            <DisplayIf condition={filteredTransactionsItems.length === 0}>
                <p className="alerts info">
                    {$t('client.transactions.no_transaction_found')}
                    <DisplayIf condition={hasSearchFields}>
                        {` ${$t('client.transactions.broaden_search')}`}
                    </DisplayIf>
                </p>
            </DisplayIf>

            <DisplayIf condition={filteredTransactionsItems.length > 0}>
                <DisplayIf condition={hasSearchFields}>
                    <ul className="search-summary">
                        <li className="received">
                            <span className="fa fa-arrow-down" />
                            <span>{$t('client.transactions.received')}</span>
                            <span>{positiveSum}</span>
                        </li>

                        <li className="spent">
                            <span className="fa fa-arrow-up" />
                            <span>{$t('client.transactions.spent')}</span>
                            <span>{negativeSum}</span>
                        </li>

                        <li className="saved">
                            <span className="fa fa-database" />
                            <span>{$t('client.transactions.saved')}</span>
                            <span>{wellSum}</span>
                        </li>
                    </ul>
                </DisplayIf>

                <table className="transaction-table" ref={refTransactionTable}>
                    <thead ref={refThead}>
                        <tr>
                            <IfNotMobile>
                                <th className="details-button" />
                            </IfNotMobile>
                            <th className="date">{$t('client.transactions.column_date')}</th>
                            <IfNotMobile>
                                <th className="type">{$t('client.transactions.column_type')}</th>
                            </IfNotMobile>
                            <th className="label">{$t('client.transactions.column_name')}</th>
                            <th className="amount">{$t('client.transactions.column_amount')}</th>
                            <IfNotMobile>
                                <th className="category">
                                    {$t('client.transactions.column_category')}
                                </th>
                            </IfNotMobile>
                        </tr>

                        <BulkEditComponent
                            inBulkEditMode={inBulkEditMode}
                            items={bulkEditSelectedSet}
                            setAllStatus={bulkEditSelectAll}
                            setAllBulkEdit={toggleAllBulkItems}
                        />
                    </thead>

                    <InfiniteList
                        ballast={NUM_ITEM_BALLAST}
                        items={filteredTransactionsItems}
                        itemHeight={transactionHeight}
                        heightAbove={heightAbove}
                        renderItems={renderItems}
                        containerId={CONTAINER_ID}
                        key={view.driver.value}
                    />
                </table>
            </DisplayIf>
        </>
    );
};

function localeContains(where: string, substring: string) {
    const haystack = where.toLowerCase().normalize('NFKC');
    const needle = substring.toLowerCase().normalize('NFKC');
    if (haystack.includes(needle)) {
        return true;
    }
    const needleLength = needle.length;
    const max = Math.max(haystack.length - needleLength + 1, 0);
    for (let i = 0; i < max; ++i) {
        let match = true;
        for (let j = 0; j < needleLength; ++j) {
            const cur = haystack[i + j];
            if (cur === ' ') {
                // Skip to the next word in the haystack.
                i += j;
                match = false;
                break;
            } else if (localeComparator(needle[j], cur) !== 0) {
                match = false;
                break;
            }
        }
        if (match) {
            return true;
        }
    }
    return false;
}

// Returns transactions ids.
function filterTransactionsThisMonth(state: GlobalState, transactionIds: number[]) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    return transactionIds.filter(id => {
        const op = get.transactionById(state, id);
        const opDate = op.budgetDate || op.date;
        return opDate.getFullYear() === currentYear && opDate.getMonth() === currentMonth;
    });
}

function computeMinMax(state: GlobalState, transactionIds: number[]) {
    let min = Infinity;
    let max = -Infinity;
    for (const id of transactionIds) {
        const op = get.transactionById(state, id);
        if (op.amount < min) {
            min = op.amount;
        }
        if (op.amount > max) {
            max = op.amount;
        }
    }
    // Round the values to the nearest integer.
    min = Math.floor(min);
    max = Math.ceil(max);
    return [min, max];
}

function computeTotal(
    state: GlobalState,
    filterFunction: (op: Transaction) => boolean,
    transactionIds: number[]
) {
    const total = transactionIds
        .map(id => get.transactionById(state, id))
        .filter(filterFunction)
        .reduce((a, b) => a + b.amount, 0);
    return Math.round(total * 100) / 100;
}

export default Reports;

export const testing = {
    localeContains,
};
