import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { Chart, type LegendItem } from 'chart.js';

import { assert, round2, localeComparator } from '../../helpers';
import { Category, Transaction } from '../../models';
import { Hideable } from './hidable-chart';
import moment, { Moment } from 'moment';
import { useNavigate } from 'react-router';
import URLs from '../../urls';
import * as UiStore from '../../store/ui';
import { useDispatch } from 'react-redux';
import { DriverContext } from '../drivers';
import { AmountKindType } from './amount-select';

function datekey(op: Transaction) {
    const d = op.budgetDate || op.date;
    return `${d.getFullYear()}-${d.getMonth()}`;
}

export interface BaseChartProps {
    // Function to map from a category id to its content.
    getCategoryById: (id: number) => Category;

    // Click handler on a legend item, to select/deselect it.
    handleLegendClick: (legendItem: LegendItem) => void;

    // A list of categories to hide by default.
    hiddenCategories?: string[];
}

export interface TransactionsChartProps extends BaseChartProps {
    // Array containing all the transactions.
    transactions: Transaction[];

    // A unique chart id that will serve as the container's id.
    chartId: string;

    // What's the selected date range?
    dateRange?: [Date] | [Date, Date];

    // What's the selected type (only positive, only negative, or both)?
    amountKind: AmountKindType;
}

interface BarchartProps extends TransactionsChartProps {
    // Should we invert the amounts before making the bars?
    invertSign: boolean;

    // Aspect ratio (width/height). 2 by default. If the width is too small, height will be too and
    // barchart legends can be cropped (and some legend items might be missing).
    aspectRatio?: number;
}

const BarChart = forwardRef<Hideable, BarchartProps>((props, ref) => {
    const container = useRef<Chart | null>(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const driver = useContext(DriverContext);

    const redraw = useCallback(() => {
        // Category name -> {date key string -> [amounts]}.
        const map = new Map<string, Record<string, number[]>>();
        const categoryNameToId = new Map<string, number>();

        // Category name -> color string.
        const colorMap: Record<string, string> = {};

        // Datekey -> Date.
        const dateset = new Map<string, number>();

        for (const op of props.transactions) {
            const cat = props.getCategoryById(op.categoryId);

            map.set(cat.label, map.get(cat.label) || {});
            categoryNameToId.set(cat.label, cat.id);

            const categoryDates = map.get(cat.label);
            assert(typeof categoryDates !== 'undefined', 'defensively created above');

            const dk = datekey(op);
            const amount = props.invertSign ? -op.amount : op.amount;
            (categoryDates[dk] = categoryDates[dk] || []).push(amount);
            dateset.set(dk, +(op.budgetDate || op.date));

            colorMap[cat.label] = colorMap[cat.label] || cat.color;
        }

        // Sort date in ascending order: push all pairs of (datekey, date) in
        // an array and sort that array by the second element. Then read that
        // array in ascending order.
        const dates = Array.from(dateset);
        dates.sort((a, b) => a[1] - b[1]);

        const datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            hidden?: boolean;
            categoryId: number;
        }[] = [];
        for (const categoryName of map.keys()) {
            const data: number[] = [];

            for (let j = 0; j < dates.length; j++) {
                const dk = dates[j][0];
                const mapEntry = map.get(categoryName);
                assert(typeof mapEntry !== 'undefined', 'found by construction');
                const values = (mapEntry[dk] = mapEntry[dk] || []);
                data.push(round2(values.reduce((a, b) => a + b, 0)));
            }

            const categoryId = categoryNameToId.get(categoryName)!;

            datasets.push({
                label: categoryName,
                data,
                backgroundColor: colorMap[categoryName],
                hidden:
                    props.hiddenCategories instanceof Array &&
                    props.hiddenCategories.includes(categoryName),
                categoryId,
            });
        }

        // Undefined means the default locale.
        let defaultLocale;

        const labels: string[] = [];
        for (let i = 0; i < dates.length; i++) {
            const date = new Date(dates[i][1]);
            const str = date.toLocaleDateString(defaultLocale, {
                year: '2-digit',
                month: 'short',
            });
            labels.push(str);
        }

        const chart: Chart = new Chart(props.chartId, {
            type: 'bar',
            data: {
                labels,
                datasets,
            },
            options: {
                aspectRatio: props.aspectRatio || 2,

                // Make it clear that the elements can be clicked.
                onHover: (_evt, elements, thisChart) => {
                    thisChart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                },

                // On click, open the reports view corresponding to the current category.
                onClick(_event, elements) {
                    for (const e of elements) {
                        // e.datasetIndex is the dataset for a given category; we can retrieve the
                        // categoryId quite easily.
                        const categoryId = datasets[e.datasetIndex].categoryId;

                        // e.index refers to the selected date.
                        const clickedDate = moment(dates[e.index][1]);
                        const firstDayOfClickedMonth = clickedDate.date(1);
                        const lastDayOfClickedMonth = moment(clickedDate).date(
                            clickedDate.daysInMonth()
                        );

                        // We want to compute a min and a max bound according to the following:
                        // min := max(first day of clicked month, dateRange[0])
                        // max := min(last day of clicked month, dateRange[1])
                        let newLeftBound: Moment, newRightBound: Moment;
                        if (typeof props.dateRange === 'undefined') {
                            // The bounds are the full month.
                            newLeftBound = firstDayOfClickedMonth;
                            newRightBound = lastDayOfClickedMonth;
                        } else if (typeof props.dateRange[1] === 'undefined') {
                            // Only a left bound is set; take the later date (max) among the first
                            // day, or the left bound.
                            newLeftBound = moment.max(
                                firstDayOfClickedMonth,
                                moment(props.dateRange[0])
                            );
                            newRightBound = lastDayOfClickedMonth;
                        } else {
                            // Both bounds are set; take the later date for the left bound, and the
                            // sooner date for the right bound.
                            newLeftBound = moment.max(
                                firstDayOfClickedMonth,
                                moment(props.dateRange[0])
                            );
                            newRightBound = moment.min(
                                lastDayOfClickedMonth,
                                moment(props.dateRange[1])
                            );
                        }

                        // Extend the date boundaries as much as possible to avoid bad surprises.
                        newLeftBound.hours(0).minutes(0).seconds(0);
                        newRightBound.hours(23).minutes(59).seconds(59);

                        // Make sure the search panel is open, in the reports view.
                        dispatch(UiStore.toggleSearchDetails(true));

                        const amountLow = props.amountKind === 'positive' ? 0 : undefined;
                        const amountHigh = props.amountKind === 'negative' ? 0 : undefined;

                        // Set the date, category, and amount fields if needs be.
                        dispatch(
                            UiStore.setSearchFields({
                                dateLow: newLeftBound.toDate(),
                                dateHigh: newRightBound.toDate(),
                                categoryIds: [categoryId],
                                amountLow,
                                amountHigh,
                            })
                        );

                        // Move to the reports view.
                        navigate(URLs.reports.url(driver));
                        break;
                    }
                },

                plugins: {
                    legend: {
                        labels: {
                            sort: (a: LegendItem, b: LegendItem) => {
                                return localeComparator(a.text, b.text);
                            },
                        },
                        onClick: (_evt, legendItem) => {
                            props.handleLegendClick(legendItem);
                        },
                        onHover: (_evt, _legendItem, legend) => {
                            legend.chart.canvas.style.cursor = 'pointer';
                        },
                        onLeave: (_evt, _legendItem, legend) => {
                            legend.chart.canvas.style.cursor = 'initial';
                        },
                    },
                },
            },
        });

        container.current = chart;
    }, [props, navigate, dispatch, driver]);

    useEffect(() => {
        // Redraw on mount and update.
        redraw();

        return () => {
            // Unmount: destroy the container.
            if (container.current) {
                container.current.destroy();
            }
        };
    }, [redraw]);

    useImperativeHandle(ref, () => ({
        show() {
            assert(!!container.current, 'container has been mounted');
            for (let i = 0; i < container.current.data.datasets.length; i++) {
                container.current.setDatasetVisibility(i, true);
            }
            container.current.update();
        },

        hide() {
            assert(!!container.current, 'container has been mounted');
            for (let i = 0; i < container.current.data.datasets.length; i++) {
                container.current.setDatasetVisibility(i, false);
            }
            container.current.update();
        },
    }));

    return <canvas id={props.chartId} />;
});

BarChart.displayName = 'BarChart';

export default BarChart;
