import React, { useCallback, useEffect, useRef } from 'react';
import Dygraph from 'dygraphs';

import { getChartsDefaultColors, round2, translate as $t, assert } from '../../helpers';

import DiscoveryMessage from '../ui/discovery-message';

import 'dygraphs/dist/dygraph.css';
import { Operation } from '../../models';

function makeKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function createChartBalance(
    chartId: string,
    initialBalance: number,
    transactions: Operation[],
    theme: string
) {
    const ops = transactions.slice().sort((a, b) => +a.date - +b.date);

    const opmap = new Map();

    // Fill all dates.
    const DAY = 1000 * 60 * 60 * 24;

    let firstDate = ops.length ? +ops[0].date : Date.now();
    firstDate = ((firstDate / DAY) | 0) * DAY;

    const today = ((Date.now() / DAY) | 0) * DAY;
    for (; firstDate <= today; firstDate += DAY) {
        opmap.set(makeKey(new Date(firstDate)), 0);
    }

    // Date (day) -> cumulated sum of amounts for this day (scalar).
    for (const o of ops) {
        const key = makeKey(o.date);
        if (opmap.has(key)) {
            opmap.set(key, opmap.get(key) + o.amount);
        }
    }

    let balance = initialBalance ? initialBalance : 0;
    let csv = 'Date,Balance\n';
    for (const [date, amount] of opmap) {
        balance += amount;
        csv += `${date},${round2(balance)}\n`;
    }

    /* eslint-disable no-new */

    // Create the chart
    const chartsColors = getChartsDefaultColors(theme);

    const container = document.getElementById(chartId);
    assert(!!container, 'container must be mounted');

    return new Dygraph(container, csv, {
        color: chartsColors.LINES,

        axisLineColor: chartsColors.AXIS,

        axes: {
            x: {
                axisLabelFormatter: date => {
                    // Undefined means the default locale
                    let defaultLocale;
                    assert(date instanceof Date, 'must be a date?');
                    return date.toLocaleDateString(defaultLocale, {
                        year: '2-digit',
                        month: 'short',
                    });
                },
            },
        },

        fillGraph: true,

        showRangeSelector: true,

        rangeSelectorPlotStrokeColor: chartsColors.LINES,

        // 6 months (180 days) window
        dateWindow: [today - DAY * 180, today],

        // 4px dashes separated by a 2px blank space
        gridLinePattern: [4, 2],
    });
}

const BalanceChart = (props: {
    initialBalance: number;
    transactions: Operation[];
    theme: string;
}) => {
    const container = useRef<Dygraph>();

    const redraw = useCallback(() => {
        container.current = createChartBalance(
            'barchart',
            props.initialBalance,
            props.transactions,
            props.theme
        );
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

    return (
        <React.Fragment>
            <DiscoveryMessage message={$t('client.charts.balance_desc')} />
            <div id="barchart" style={{ width: '100%' }} />
        </React.Fragment>
    );
};

BalanceChart.displayName = 'BalanceChart';
export default BalanceChart;
