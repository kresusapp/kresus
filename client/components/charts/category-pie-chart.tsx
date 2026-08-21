import { Chart, type LegendItem } from 'chart.js';
import moment from 'moment';
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { translate as $t, assert, localeComparator, round2 } from '../../helpers';
import * as UiStore from '../../store/ui';
import URLs from '../../urls';
import { DriverContext } from '../drivers';
import type { TransactionsChartProps } from './category-barchart';
import type { Hideable } from './hidable-chart';

const PieChart = forwardRef<Hideable, TransactionsChartProps>((props, ref) => {
    const container = useRef<Chart<'pie'> | null>(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const driver = useContext(DriverContext);

    const redraw = useCallback(() => {
        const catMap = new Map<number, number>();

        // categoryId -> categoryTotalAmount
        for (const t of props.transactions) {
            const catId = t.categoryId;
            if (!catMap.has(catId)) {
                catMap.set(catId, 0);
            }
            const entry = catMap.get(catId);
            assert(typeof entry !== 'undefined', 'we just added it');
            catMap.set(catId, entry + t.amount);
        }

        const series: number[] = [];
        const categoryIds: number[] = [];
        const labels: string[] = [];
        const colors: string[] = [];
        let totalAmount = 0;
        for (const [catId, amount] of catMap) {
            const c = props.getCategoryById(catId);
            labels.push(c.label);
            colors.push(c.color);
            categoryIds.push(c.id);

            series.push(amount);
            totalAmount += amount;
        }

        const datasets = series.length
            ? [
                  {
                      data: series,
                      backgroundColor: colors,
                  },
              ]
            : [];

        container.current = new Chart(props.chartId, {
            type: 'pie',

            data: {
                labels,
                datasets,
            },

            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label(context) {
                                return `${context.label}: ${round2(context.parsed)} (${round2(
                                    (context.parsed * 100) / totalAmount
                                )}%)`;
                            },
                        },
                    },

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

                // Make it clear that the elements can be clicked.
                onHover: (_evt, elements, thisChart) => {
                    thisChart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
                },

                // On click, open the reports view corresponding to the current category.
                onClick(_event, elements) {
                    if (datasets.length === 0 || elements.length === 0) {
                        return;
                    }

                    // Can click only one element at a time.
                    const e = elements[0];

                    // Index is the category in the series array.
                    // The categoryIds array has been constructed such that index always match
                    // the index in the series too.
                    const categoryId = categoryIds[e.index];

                    const dates = props.dateRange;

                    // Extend the date boundaries as much as possible to avoid bad surprises.
                    const dateLow =
                        dates && dates.length > 0
                            ? moment(dates[0]).hours(0).minutes(0).seconds(0).toDate()
                            : undefined;
                    const dateHigh =
                        dates && dates.length > 1
                            ? moment(dates[1]).hours(23).minutes(59).seconds(59).toDate()
                            : undefined;

                    // Make sure the search panel is open, in the reports view.
                    dispatch(UiStore.toggleSearchDetails(true));

                    const amountLow = props.amountKind === 'positive' ? 0 : undefined;
                    const amountHigh = props.amountKind === 'negative' ? 0 : undefined;

                    // Set the date, category, and amount fields if needs be.
                    dispatch(
                        UiStore.setSearchFields({
                            dateLow,
                            dateHigh,
                            categoryIds: [categoryId],
                            amountLow,
                            amountHigh,
                        })
                    );

                    // Move to the reports view.
                    navigate(URLs.reports.url(driver));
                },
            },
        });
    }, [props, dispatch, navigate, driver]);

    useEffect(() => {
        // Redraw on mount and update.
        redraw();

        // We cannot hide the categories on redraw, it needs to be done dynamically.
        const chart = container.current;
        if (props.hiddenCategories?.length && chart?.legend?.legendItems) {
            for (const legend of chart.legend.legendItems) {
                if (
                    props.hiddenCategories.includes(legend.text) &&
                    typeof legend.index !== 'undefined'
                ) {
                    chart.toggleDataVisibility(legend.index);
                }
            }

            chart.update();
        }

        return () => {
            // Unmount: destroy the container.
            if (container.current) {
                container.current.destroy();
            }
        };
    }, [redraw, props.hiddenCategories]);

    useImperativeHandle(ref, () => ({
        show() {
            assert(!!container.current, 'container has been mounted');
            // Kind of stupid, but chartjs doesn't let us do it another way...
            const meta = container.current.getDatasetMeta(0);
            for (let i = 0; i < meta.data.length; i++) {
                if (!container.current.getDataVisibility(i)) {
                    container.current.toggleDataVisibility(i);
                }
            }
            container.current.update();
        },

        hide() {
            assert(!!container.current, 'container has been mounted');
            const meta = container.current.getDatasetMeta(0);
            for (let i = 0; i < meta.data.length; i++) {
                if (container.current.getDataVisibility(i)) {
                    container.current.toggleDataVisibility(i);
                }
            }
            container.current.update();
        },
    }));

    return <canvas id={props.chartId} style={{ maxHeight: '300px' }} />;
});

PieChart.displayName = 'PieChart';

export default PieChart;

interface PieChartWithHelpProps extends TransactionsChartProps {
    helpKey: string;
    titleKey: string;
}

export const PieChartWithHelp = forwardRef<Hideable, PieChartWithHelpProps>((props, ref) => {
    return (
        <div>
            <h3>
                {/** biome-ignore lint/a11y/useAriaPropsSupportedByRole: required for tooltipped */}
                <span
                    className="tooltipped tooltipped-ne tooltipped-multiline"
                    aria-label={$t(props.helpKey)}
                >
                    <span className="fa fa-question-circle clickable" />
                </span>
                {$t(props.titleKey)}
            </h3>

            <PieChart ref={ref} {...props} />
        </div>
    );
});

PieChartWithHelp.displayName = 'PieChartWithHelp';
