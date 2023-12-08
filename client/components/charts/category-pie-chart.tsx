import { Chart, LegendItem } from 'chart.js';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { assert, round2, translate as $t } from '../../helpers';
import { Category, Transaction } from '../../models';
import { Hideable } from './hidable-chart';

interface PieChartProps {
    // Function to map from a category id to its content.
    getCategoryById: (id: number) => Category;

    // Array containing all the transactions.
    transactions: Transaction[];

    // A unique chart id that will serve as the container's id.
    chartId: string;

    // Click handler on a legend item, to select/deselect it.
    handleLegendClick: (legendItem: LegendItem) => void;
}

const PieChart = forwardRef<Hideable, PieChartProps>((props, ref) => {
    const container = useRef<Chart>();

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

        showCategory(name: string) {
            assert(!!container.current, 'container has been mounted');
            setVisible(container.current, name, true);
        },

        hideCategory(name: string) {
            assert(!!container.current, 'container has been mounted');
            setVisible(container.current, name, false);
        },
    }));

    return <canvas id={props.chartId} style={{ maxHeight: '300px' }} />;
});

const setVisible = (chart: Chart, name: string, makeVisible: boolean) => {
    assert(!!chart.legend, 'chart has a legend');
    // Find the category by name, retrieve its index in the data set.
    const legendItems = chart.legend.legendItems;
    if (legendItems) {
        for (const legend of legendItems) {
            if (legend.text === name && typeof legend.index !== 'undefined') {
                const isVisible = chart.getDataVisibility(legend.index);
                if ((!isVisible && makeVisible) || (isVisible && !makeVisible)) {
                    chart.toggleDataVisibility(legend.index);
                    chart.update();
                }
                break;
            }
        }
    }
};

PieChart.displayName = 'PieChart';

export default PieChart;

interface PieChartWithHelpProps extends PieChartProps {
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
            />
        </div>
    );
});

PieChartWithHelp.displayName = 'PieChartWithHelp';
