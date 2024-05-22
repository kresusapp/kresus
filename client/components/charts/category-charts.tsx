import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import { assert, translate as $t, useKresusState } from '../../helpers';
import * as CategoriesStore from '../../store/categories';
import * as SettingsStore from '../../store/settings';

import { DEFAULT_CHART_PERIOD, DEFAULT_CHART_TYPE } from '../../../shared/settings';

import DiscoveryMessage from '../ui/discovery-message';
import BarChart from './category-barchart';
import PieChart, { PieChartWithHelp } from './category-pie-chart';
import AmountKindSelect from './amount-select';
import { Category, Transaction } from '../../models';
import { Hideable } from './hidable-chart';
import { DateRange, Form, PredefinedDateRanges } from '../ui';
import moment from 'moment';
import type { LegendItem } from 'chart.js/dist/types/index';

interface AllPieChartsProps {
    getCategoryById: (id: number) => Category;
    rawIncomeOps: Transaction[];
    rawSpendingOps: Transaction[];
    netIncomeOps: Transaction[];
    netSpendingOps: Transaction[];
    handleLegendClick: (legendItem: LegendItem) => void;
}

const AllPieCharts = forwardRef<Hideable, AllPieChartsProps>((props, ref) => {
    const refRawIncome = React.createRef<Hideable>();
    const refRawSpendings = React.createRef<Hideable>();
    const refNetIncome = React.createRef<Hideable>();
    const refNetSpendings = React.createRef<Hideable>();

    useImperativeHandle(ref, () => ({
        show() {
            assert(!!refRawIncome.current, 'must be mounted');
            assert(!!refRawSpendings.current, 'must be mounted');
            assert(!!refNetIncome.current, 'must be mounted');
            assert(!!refNetSpendings.current, 'must be mounted');
            refRawIncome.current.show();
            refRawSpendings.current.show();
            refNetIncome.current.show();
            refNetSpendings.current.show();
        },
        hide() {
            assert(!!refRawIncome.current, 'must be mounted');
            assert(!!refRawSpendings.current, 'must be mounted');
            assert(!!refNetIncome.current, 'must be mounted');
            assert(!!refNetSpendings.current, 'must be mounted');
            refRawIncome.current.hide();
            refRawSpendings.current.hide();
            refNetIncome.current.hide();
            refNetSpendings.current.hide();
        },
        showCategory(name: string) {
            assert(!!refRawIncome.current, 'must be mounted');
            assert(!!refRawSpendings.current, 'must be mounted');
            assert(!!refNetIncome.current, 'must be mounted');
            assert(!!refNetSpendings.current, 'must be mounted');
            refRawIncome.current.showCategory(name);
            refRawSpendings.current.showCategory(name);
            refNetIncome.current.showCategory(name);
            refNetSpendings.current.showCategory(name);
        },
        hideCategory(name: string) {
            assert(!!refRawIncome.current, 'must be mounted');
            assert(!!refRawSpendings.current, 'must be mounted');
            assert(!!refNetIncome.current, 'must be mounted');
            assert(!!refNetSpendings.current, 'must be mounted');
            refRawIncome.current.hideCategory(name);
            refRawSpendings.current.hideCategory(name);
            refNetIncome.current.hideCategory(name);
            refNetSpendings.current.hideCategory(name);
        },
    }));

    return (
        <div className="pie-charts">
            <PieChartWithHelp
                chartId="rawIncomePie"
                helpKey="client.charts.help_raw_income"
                titleKey="client.charts.raw_income"
                getCategoryById={props.getCategoryById}
                transactions={props.rawIncomeOps}
                ref={refRawIncome}
                handleLegendClick={props.handleLegendClick}
            />

            <PieChartWithHelp
                chartId="rawSpendingsPie"
                helpKey="client.charts.help_raw_spendings"
                titleKey="client.charts.raw_spendings"
                getCategoryById={props.getCategoryById}
                transactions={props.rawSpendingOps}
                ref={refRawSpendings}
                handleLegendClick={props.handleLegendClick}
            />

            <PieChartWithHelp
                chartId="netIncomePie"
                helpKey="client.charts.help_net_income"
                titleKey="client.charts.net_income"
                getCategoryById={props.getCategoryById}
                transactions={props.netIncomeOps}
                ref={refNetIncome}
                handleLegendClick={props.handleLegendClick}
            />

            <PieChartWithHelp
                chartId="netSpendingsPie"
                helpKey="client.charts.help_net_spendings"
                titleKey="client.charts.net_spendings"
                getCategoryById={props.getCategoryById}
                transactions={props.netSpendingOps}
                ref={refNetSpendings}
                handleLegendClick={props.handleLegendClick}
            />
        </div>
    );
});

const CategorySection = (props: { transactions: Transaction[] }) => {
    const defaultAmountKind = useKresusState(state =>
        SettingsStore.get(state.settings, DEFAULT_CHART_TYPE)
    );
    const defaultPeriod = useKresusState(state =>
        SettingsStore.get(state.settings, DEFAULT_CHART_PERIOD)
    );

    const getCatById = useKresusState(
        state => (id: number) => CategoriesStore.fromId(state.categories, id)
    );

    const [amountKind, setAmountKind] = useState(defaultAmountKind);

    // What to display in the date range picker?
    const [dateRange, setDateRange] = useState<[Date, Date] | [Date] | undefined>(undefined);
    // How to filter transactions, based on the value in the date range picker?
    const [filterDate, setFilterDate] = useState<null | ((t: Transaction) => boolean)>(null);

    const onChangePeriod = useCallback(
        (dates: [Date, Date?] | null) => {
            if (dates === null) {
                setDateRange(undefined);
                setFilterDate(null);
            } else if (dates.length === 2) {
                if (typeof dates[1] === 'undefined') {
                    setDateRange([dates[0]]);
                    setFilterDate(
                        () => (t: Transaction) =>
                            t.date.setHours(0, 0, 0, 0) === dates[0].setHours(0, 0, 0, 0)
                    );
                } else {
                    setDateRange([dates[0], dates[1]]);
                    // Note: When React sees a functor, React calls it; hence the
                    // double function-wrapping here.
                    const d1 = dates[1];
                    setFilterDate(() => (t: Transaction) => t.date >= dates[0] && t.date <= d1);
                }
            }
        },
        [setDateRange, setFilterDate]
    );

    // Only on mount.
    useEffect(() => {
        switch (defaultPeriod) {
            case 'all':
                return; // do nothing
            case 'current-month':
                return onChangePeriod([
                    moment().startOf('month').toDate(),
                    moment().endOf('month').toDate(),
                ]);
            case 'last-month':
                return onChangePeriod([
                    moment().subtract(1, 'month').startOf('month').toDate(),
                    moment().subtract(1, 'month').endOf('month').toDate(),
                ]);
            case '3-months':
                return onChangePeriod([
                    moment().subtract(2, 'month').startOf('month').toDate(),
                    moment().endOf('month').toDate(),
                ]);
            case '6-months':
                return onChangePeriod([
                    moment().subtract(5, 'month').startOf('month').toDate(),
                    moment().endOf('month').toDate(),
                ]);
            case 'current-year':
                return onChangePeriod([
                    moment().startOf('year').toDate(),
                    moment().endOf('year').toDate(),
                ]);
            case 'last-year':
                return onChangePeriod([
                    moment().subtract(1, 'year').startOf('year').toDate(),
                    moment().subtract(1, 'year').endOf('year').toDate(),
                ]);
            default:
                assert(false, 'unknown period');
        }
    }, [onChangePeriod, defaultPeriod]);

    const refBarchart = useRef<Hideable>(null);
    const refPiecharts = useRef<Hideable>(null);

    const handleShowAll = useCallback(() => {
        assert(!!refBarchart.current, 'component mounted');
        assert(!!refPiecharts.current, 'component mounted');
        refBarchart.current.show();
        refPiecharts.current.show();
    }, []);

    const handleHideAll = useCallback(() => {
        assert(!!refBarchart.current, 'component mounted');
        assert(!!refPiecharts.current, 'component mounted');
        refBarchart.current.hide();
        refPiecharts.current.hide();
    }, []);

    const handleLegendClick = useCallback((legendItem: LegendItem) => {
        // If the element was hidden and we clicked on it, we're about to show it.
        const show = legendItem.hidden === true;
        const name = legendItem.text;

        assert(!!refBarchart.current, 'component mounted');
        assert(!!refPiecharts.current, 'component mounted');
        if (show) {
            refBarchart.current.showCategory(name);
            refPiecharts.current.showCategory(name);
        } else {
            refBarchart.current.hideCategory(name);
            refPiecharts.current.hideCategory(name);
        }
    }, []);

    let allTransactions = props.transactions;

    // Filter by kind.
    const onlyPositive = amountKind === 'positive';
    const onlyNegative = amountKind === 'negative';

    if (onlyNegative) {
        allTransactions = allTransactions.filter(op => op.amount < 0);
    } else if (onlyPositive) {
        allTransactions = allTransactions.filter(op => op.amount > 0);
    }

    let pies = null;
    const transactionsInPeriod =
        filterDate !== null
            ? allTransactions.filter((t: Transaction) => filterDate(t))
            : allTransactions;
    if (onlyPositive || onlyNegative) {
        pies = (
            <PieChart
                chartId="piechart"
                getCategoryById={getCatById}
                transactions={transactionsInPeriod}
                ref={refPiecharts}
                handleLegendClick={handleLegendClick}
            />
        );
    } else {
        // Compute raw income/spending.
        const rawIncomeOps = transactionsInPeriod.filter(op => op.amount > 0);
        const rawSpendingOps = transactionsInPeriod.filter(op => op.amount < 0);

        // Compute net income/spending.
        const catMap = new Map<number, Transaction[]>();
        for (const op of transactionsInPeriod) {
            if (!catMap.has(op.categoryId)) {
                catMap.set(op.categoryId, []);
            }
            const e = catMap.get(op.categoryId);
            assert(typeof e !== 'undefined', 'just created');
            e.push(op);
        }

        let netIncomeOps: Transaction[] = [];
        let netSpendingOps: Transaction[] = [];
        for (const categoryTransactions of catMap.values()) {
            if (categoryTransactions.reduce((acc, op) => acc + op.amount, 0) > 0) {
                netIncomeOps = netIncomeOps.concat(categoryTransactions);
            } else {
                netSpendingOps = netSpendingOps.concat(categoryTransactions);
            }
        }

        pies = (
            <AllPieCharts
                getCategoryById={getCatById}
                rawIncomeOps={rawIncomeOps}
                netIncomeOps={netIncomeOps}
                rawSpendingOps={rawSpendingOps}
                netSpendingOps={netSpendingOps}
                ref={refPiecharts}
                handleLegendClick={handleLegendClick}
            />
        );
    }

    return (
        <>
            <DiscoveryMessage message={$t('client.charts.by_category_desc')} />

            <Form center={true}>
                <Form.Input id="amount-type" label={$t('client.charts.amount_type')}>
                    <AmountKindSelect defaultValue={amountKind} onChange={setAmountKind} />
                </Form.Input>

                <Form.Input
                    id="period"
                    label={$t('client.charts.period')}
                    sub={
                        <PredefinedDateRanges
                            onChange={onChangePeriod}
                            includeWeeks={true}
                            includeMonths={true}
                            includeYears={true}
                        />
                    }>
                    <DateRange onSelect={onChangePeriod} value={dateRange} />
                </Form.Input>

                <Form.Input
                    id="categories"
                    dontPropagateId={true}
                    label={$t('client.menu.categories')}>
                    <p className="buttons-group" role="group" aria-label="Show/Hide categories">
                        <button type="button" className="btn" onClick={handleHideAll}>
                            {$t('client.general.unselect_all')}
                        </button>
                        <button type="button" className="btn" onClick={handleShowAll}>
                            {$t('client.general.select_all')}
                        </button>
                    </p>
                </Form.Input>
            </Form>

            <hr />

            <BarChart
                transactions={transactionsInPeriod}
                getCategoryById={getCatById}
                invertSign={onlyNegative}
                chartId="barchart"
                ref={refBarchart}
                handleLegendClick={handleLegendClick}
            />

            {pies}
        </>
    );
};

CategorySection.displayName = 'CategorySection';

export default CategorySection;
