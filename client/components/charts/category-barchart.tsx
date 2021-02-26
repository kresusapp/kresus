import { assert, round2, translate as $t } from '../../helpers';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { Category, Operation } from '../../models';
import c3 from 'c3';
import { Hideable } from './hidable-chart';

function datekey(op: Operation) {
    const d = op.budgetDate;
    return `${d.getFullYear()}-${d.getMonth()}`;
}

interface BarchartProps {
    // Function to map from a category id to its content.
    getCategoryById: (id: number) => Category;

    // Array containing all the transactions.
    transactions: Operation[];

    // Should we invert the amounts before making the bars?
    invertSign: boolean;

    // A unique chart id that will serve as the container's id.
    chartId: string;

    period: string;
}

const BarChart = forwardRef<Hideable, BarchartProps>((props, ref) => {
    const container = useRef<c3.ChartAPI>();

    const redraw = useCallback(() => {
        // Category name -> {date key string -> [amounts]}.
        const map = new Map<string, Record<string, number[]>>();

        // Category name -> color string.
        const colorMap: Record<string, string> = {};

        // Datekey -> Date.
        const dateset = new Map<string, number>();

        for (const op of props.transactions) {
            const c = props.getCategoryById(op.categoryId);

            map.set(c.label, map.get(c.label) || {});
            const categoryDates = map.get(c.label);
            assert(typeof categoryDates !== 'undefined', 'defensively created above');

            const dk = datekey(op);
            const amount = props.invertSign ? -op.amount : op.amount;
            (categoryDates[dk] = categoryDates[dk] || []).push(amount);
            dateset.set(dk, +op.budgetDate);

            colorMap[c.label] = colorMap[c.label] || c.color;
        }

        // Sort date in ascending order: push all pairs of (datekey, date) in
        // an array and sort that array by the second element. Then read that
        // array in ascending order.
        const dates = Array.from(dateset);
        dates.sort((a, b) => a[1] - b[1]);

        const series: Array<[string, ...number[]]> = [];
        for (const c of map.keys()) {
            const data: number[] = [];

            for (let j = 0; j < dates.length; j++) {
                const dk = dates[j][0];
                const mapEntry = map.get(c);
                assert(typeof mapEntry !== 'undefined', 'found by construction');
                const values = (mapEntry[dk] = mapEntry[dk] || []);
                data.push(round2(values.reduce((a, b) => a + b, 0)));
            }

            series.push([c, ...data]);
        }

        const monthLabels: string[] = [];
        for (let i = 0; i < dates.length; i++) {
            const date = new Date(dates[i][1]);
            // Undefined means the default locale.
            let defaultLocale;
            const str = date.toLocaleDateString(defaultLocale, {
                year: '2-digit',
                month: 'short',
            });
            monthLabels.push(str);
        }

        const date = new Date();
        const month = date.getMonth();

        let xAxisExtent;
        switch (props.period) {
            case 'current-month':
                xAxisExtent = [Math.max(0, monthLabels.length - 1), monthLabels.length];
                break;
            case 'last-month':
                xAxisExtent = [
                    Math.max(0, monthLabels.length - 2),
                    Math.max(0, monthLabels.length - 1),
                ];
                break;
            case '3-months':
                xAxisExtent = [Math.max(0, monthLabels.length - 3), monthLabels.length];
                break;
            case 'current-year':
                xAxisExtent = [Math.max(0, monthLabels.length - month - 1), monthLabels.length];
                break;
            case 'last-year':
                xAxisExtent = [
                    Math.max(0, monthLabels.length - month - 13),
                    Math.max(0, monthLabels.length - month - 1),
                ];
                break;
            default:
                // All times or last 6 months: only show 6 months at a time.
                xAxisExtent = [Math.max(0, monthLabels.length - 6), monthLabels.length];
                break;
        }

        container.current = c3.generate({
            bindto: `#${props.chartId}`,

            size: {
                height: 600,
            },

            data: {
                columns: series,
                type: 'bar',
                colors: colorMap,
            },

            bar: {
                width: {
                    ratio: 0.5,
                },
            },

            axis: {
                x: {
                    type: 'category',
                    categories: monthLabels,
                    tick: {
                        fit: false,
                    },
                    extent: xAxisExtent,
                },

                y: {
                    label: $t('client.charts.amount'),
                },
            },

            grid: {
                x: {
                    show: true,
                },

                y: {
                    show: true,
                    lines: [{ value: 0 }],
                },
            },

            subchart: {
                show: true,
                size: {
                    height: 80,
                },
            },

            transition: {
                duration: 0,
            },

            zoom: {
                rescale: true,
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
            container.current.show();
        },
        hide() {
            assert(!!container.current, 'container has been mounted');
            container.current.hide();
        },
    }));

    return <div id={props.chartId} />;
});

BarChart.displayName = 'BarChart';

export default BarChart;
