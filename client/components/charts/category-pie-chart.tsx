import { Chart } from 'chart.js';
import type { LegendItem } from 'chart.js/dist/types/index';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { assert, localeComparator, round2, translate as $t } from '../../helpers';
import { Hideable } from './hidable-chart';
import type { TransactionsChartProps } from './category-barchart';

const PieChart = forwardRef<Hideable, TransactionsChartProps>((props, ref) => {
    const container = useRef<Chart<'pie'>>();

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
        const labels: string[] = [];
        const colors: string[] = [];
        let totalAmount = 0;
        for (const [catId, amount] of catMap) {
            const c = props.getCategoryById(catId);
            labels.push(c.label);
            colors.push(c.color);

            series.push(amount);
            totalAmount += amount;
        }

        container.current = new Chart(props.chartId, {
            type: 'pie',

            data: {
                labels,
                datasets: series.length
                    ? [
                          {
                              data: series,
                              backgroundColor: colors,
                          },
                      ]
                    : [],
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
            },
        });
    }, [props]);

    useEffect(() => {
        // Redraw on mount and update.
        redraw();

        // We cannot hide the categories on redraw, it needs to be done dynamically.
        const chart = container.current;
        if (
            props.hiddenCategories &&
            props.hiddenCategories.length &&
            chart &&
            chart.legend &&
            chart.legend.legendItems
        ) {
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
                <span
                    className="tooltipped tooltipped-ne tooltipped-multiline"
                    aria-label={$t(props.helpKey)}>
                    <span className="fa fa-question-circle clickable" />
                </span>
                {$t(props.titleKey)}
            </h3>
            <PieChart
                chartId={props.chartId}
                getCategoryById={props.getCategoryById}
                transactions={props.transactions}
                ref={ref}
                handleLegendClick={props.handleLegendClick}
                hiddenCategories={props.hiddenCategories}
            />
        </div>
    );
});

PieChartWithHelp.displayName = 'PieChartWithHelp';
