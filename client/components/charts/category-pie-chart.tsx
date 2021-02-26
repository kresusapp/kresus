import c3 from 'c3';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { assert, round2, translate as $t } from '../../helpers';
import { Category, Operation } from '../../models';
import { Hideable } from './hidable-chart';

interface PieChartProps {
    // Function to map from a category id to its content.
    getCategoryById: (id: number) => Category;

    // Array containing all the transactions.
    transactions: Operation[];

    // A unique chart id that will serve as the container's id.
    chartId: string;
}

const PieChart = forwardRef<Hideable, PieChartProps>((props, ref) => {
    const container = useRef<c3.ChartAPI>();

    const redraw = useCallback(() => {
        const catMap = new Map<number, number[]>();

        // categoryId -> [val1, val2, val3].
        for (const op of props.transactions) {
            const catId = op.categoryId;
            if (!catMap.has(catId)) {
                catMap.set(catId, []);
            }
            const entry = catMap.get(catId);
            assert(typeof entry !== 'undefined', 'we just added it');
            entry.push(op.amount);
        }

        // [ [categoryName, val1, val2], [anotherCategoryName, val3, val4] ].
        const series: Array<[string, ...number[]]> = [];
        // {label -> color}.
        const colorMap: Record<string, string> = {};

        for (const [catId, values] of catMap) {
            const c = props.getCategoryById(catId);
            series.push([c.label, ...values]);
            colorMap[c.label] = c.color;
        }

        container.current = c3.generate({
            bindto: `#${props.chartId}`,

            data: {
                columns: series,
                type: 'pie',
                colors: colorMap,
            },

            tooltip: {
                format: {
                    value(value, ratio) {
                        assert(typeof ratio !== 'undefined', 'ratio is defined');
                        return `${round2(ratio * 100)}% (${Math.abs(round2(value))})`;
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
            container.current.show();
        },
        hide() {
            assert(!!container.current, 'container has been mounted');
            container.current.hide();
        },
    }));

    return <div id={props.chartId} />;
});

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
            />
        </div>
    );
});

PieChartWithHelp.displayName = 'PieChartWithHelp';
