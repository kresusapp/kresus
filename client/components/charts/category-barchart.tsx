import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Chart } from 'chart.js';
import type { LegendItem } from 'chart.js/dist/types/index';

import { assert, round2, localeComparator } from '../../helpers';
import { Category, Transaction } from '../../models';
import { Hideable } from './hidable-chart';

function datekey(op: Transaction) {
    const d = op.budgetDate || op.date;
    return `${d.getFullYear()}-${d.getMonth()}`;
}

interface BarchartProps {
    // Function to map from a category id to its content.
    getCategoryById: (id: number) => Category;

    // Array containing all the transactions.
    transactions: Transaction[];

    // Should we invert the amounts before making the bars?
    invertSign: boolean;

    // A unique chart id that will serve as the container's id.
    chartId: string;

    // Click handler on a legend item, to select/deselect it.
    handleLegendClick: (legendItem: LegendItem) => void;
}

const BarChart = forwardRef<Hideable, BarchartProps>((props, ref) => {
    const container = useRef<Chart>();

    const redraw = useCallback(() => {
        // Category name -> {date key string -> [amounts]}.
        const map = new Map<string, Record<string, number[]>>();

        // Category name -> color string.
        const colorMap: Record<string, string> = {};

        // Datekey -> Date.
        const dateset = new Map<string, number>();

        for (const op of props.transactions) {
            const cat = props.getCategoryById(op.categoryId);

            map.set(cat.label, map.get(cat.label) || {});
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

            datasets.push({
                label: categoryName,
                data,
                backgroundColor: colorMap[categoryName],
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

        showCategory(name: string) {
            assert(!!container.current, 'container has been mounted');
            setVisible(container.current, name, true);
        },

        hideCategory(name: string) {
            assert(!!container.current, 'container has been mounted');
            setVisible(container.current, name, false);
        },
    }));

    return <canvas id={props.chartId} />;
});

const setVisible = (chart: Chart, name: string, visible: boolean) => {
    assert(!!chart.legend, 'chart has a legend');
    // Find the category by name, retrieve its index in the data set.
    const legendItems = chart.legend.legendItems;
    if (legendItems) {
        for (const legend of legendItems) {
            if (legend.text === name && typeof legend.datasetIndex !== 'undefined') {
                chart.setDatasetVisibility(legend.datasetIndex, visible);
                chart.update();
                break;
            }
        }
    }
};

BarChart.displayName = 'BarChart';

export default BarChart;
