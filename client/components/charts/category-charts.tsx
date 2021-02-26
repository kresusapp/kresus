import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';

import { assert, translate as $t, useKresusState } from '../../helpers';
import { get } from '../../store';

import { DEFAULT_CHART_PERIOD, DEFAULT_CHART_TYPE } from '../../../shared/settings';

import DiscoveryMessage from '../ui/discovery-message';
import BarChart from './category-barchart';
import PieChart, { PieChartWithHelp } from './category-pie-chart';
import AmountKindSelect from './amount-select';
import PeriodSelect from './period-select';
import { Category, Operation } from '../../models';
import { Hideable } from './hidable-chart';
import { Form } from '../ui';

interface AllPieChartsProps {
    getCategoryById: (id: number) => Category;
    rawIncomeOps: Operation[];
    rawSpendingOps: Operation[];
    netIncomeOps: Operation[];
    netSpendingOps: Operation[];
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
            />

            <PieChartWithHelp
                chartId="rawSpendingsPie"
                helpKey="client.charts.help_raw_spendings"
                titleKey="client.charts.raw_spendings"
                getCategoryById={props.getCategoryById}
                transactions={props.rawSpendingOps}
                ref={refRawSpendings}
            />

            <PieChartWithHelp
                chartId="netIncomePie"
                helpKey="client.charts.help_net_income"
                titleKey="client.charts.net_income"
                getCategoryById={props.getCategoryById}
                transactions={props.netIncomeOps}
                ref={refNetIncome}
            />

            <PieChartWithHelp
                chartId="netSpendingsPie"
                helpKey="client.charts.help_net_spendings"
                titleKey="client.charts.net_spendings"
                getCategoryById={props.getCategoryById}
                transactions={props.netSpendingOps}
                ref={refNetSpendings}
            />
        </div>
    );
});

function createPeriodFilter(option: string): (d: Date) => boolean {
    const date = new Date();
    let year = date.getFullYear();

    // Careful: January is month 0.
    const month = date.getMonth();
    let previous: number;

    switch (option) {
        case 'all':
            return () => true;

        case 'current-month':
            return d => d.getMonth() === month && d.getFullYear() === year;

        case 'last-month':
            previous = month > 0 ? month - 1 : 11;
            year = month > 0 ? year : year - 1;
            return d => d.getMonth() === previous && d.getFullYear() === year;

        case '3-months':
            if (month >= 3) {
                previous = month - 3;
                return d => d.getMonth() >= previous && d.getFullYear() === year;
            }
            previous = (month + 9) % 12;
            return d =>
                (d.getMonth() >= previous && d.getFullYear() === year - 1) ||
                (d.getMonth() <= month && d.getFullYear() === year);

        case '6-months':
            if (month >= 6) {
                previous = month - 6;
                return d => d.getMonth() >= previous && d.getFullYear() === year;
            }
            previous = (month + 6) % 12;
            return d =>
                (d.getMonth() >= previous && d.getFullYear() === year - 1) ||
                (d.getMonth() <= month && d.getFullYear() === year);

        case 'current-year':
            return d => d.getFullYear() === year;

        case 'last-year':
            return d => d.getFullYear() === year - 1;

        default:
            assert(false, 'unexpected option for date filter');
    }
}

const CategorySection = (props: { transactions: Operation[] }) => {
    const defaultAmountKind = useKresusState(state => get.setting(state, DEFAULT_CHART_TYPE));
    const defaultPeriod = useKresusState(state => get.setting(state, DEFAULT_CHART_PERIOD));

    const getCategoryById = useKresusState(state => (id: number) => get.categoryById(state, id));

    const [amountKind, setAmountKind] = useState(defaultAmountKind);
    const [period, setPeriod] = useState(defaultPeriod);

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

    const filterByDate = createPeriodFilter(period);
    let allOps = props.transactions;

    // Filter by kind.
    const onlyPositive = amountKind === 'positive';
    const onlyNegative = amountKind === 'negative';

    if (onlyNegative) {
        allOps = allOps.filter(op => op.amount < 0);
    } else if (onlyPositive) {
        allOps = allOps.filter(op => op.amount > 0);
    }

    let pies = null;
    const pieOps = allOps.filter(op => filterByDate(op.budgetDate));
    if (onlyPositive || onlyNegative) {
        pies = (
            <PieChart
                chartId="piechart"
                getCategoryById={getCategoryById}
                transactions={pieOps}
                ref={refPiecharts}
            />
        );
    } else {
        // Compute raw income/spending.
        const rawIncomeOps = pieOps.filter(op => op.amount > 0);
        const rawSpendingOps = pieOps.filter(op => op.amount < 0);

        // Compute net income/spending.
        const catMap = new Map<number, Operation[]>();
        for (const op of pieOps) {
            if (!catMap.has(op.categoryId)) {
                catMap.set(op.categoryId, []);
            }
            const e = catMap.get(op.categoryId);
            assert(typeof e !== 'undefined', 'just created');
            e.push(op);
        }

        let netIncomeOps: Operation[] = [];
        let netSpendingOps: Operation[] = [];
        for (const categoryTransactions of catMap.values()) {
            if (categoryTransactions.reduce((acc, op) => acc + op.amount, 0) > 0) {
                netIncomeOps = netIncomeOps.concat(categoryTransactions);
            } else {
                netSpendingOps = netSpendingOps.concat(categoryTransactions);
            }
        }

        pies = (
            <AllPieCharts
                getCategoryById={getCategoryById}
                rawIncomeOps={rawIncomeOps}
                netIncomeOps={netIncomeOps}
                rawSpendingOps={rawSpendingOps}
                netSpendingOps={netSpendingOps}
                ref={refPiecharts}
            />
        );
    }

    return (
        <>
            <DiscoveryMessage message={$t('client.charts.by_category_desc')} />

            <Form>
                <Form.Input id="amount-type" label={$t('client.charts.amount_type')}>
                    <AmountKindSelect defaultValue={amountKind} onChange={setAmountKind} />
                </Form.Input>

                <Form.Input id="period" label={$t('client.charts.period')}>
                    <PeriodSelect defaultValue={defaultPeriod} onChange={setPeriod} id="period" />
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

            <BarChart
                transactions={allOps}
                getCategoryById={getCategoryById}
                invertSign={onlyNegative}
                chartId="barchart"
                ref={refBarchart}
                period={period}
            />

            {pies}
        </>
    );
};

CategorySection.displayName = 'CategorySection';

export default CategorySection;
