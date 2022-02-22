import React, { useCallback, useEffect, useRef } from 'react';

import { Chart } from 'chart.js';

// eslint-disable-next-line import/no-unassigned-import
import 'chartjs-adapter-moment';

import { getChartsDefaultColors, round2, translate as $t, assert } from '../../helpers';

import DiscoveryMessage from '../ui/discovery-message';

import { Operation } from '../../models';

// Number of milliseconds in a day.
const DAY = 1000 * 60 * 60 * 24;

function roundDate(d: Date): number {
    return ((+d / DAY) | 0) * DAY;
}

function createChartBalance(
    chartId: string,
    currentBalance: number,
    inputTransactions: Operation[],
    theme: string
) {
    const transactions = inputTransactions.slice().sort((a, b) => +a.date - +b.date);
    const dateToAmount: Map<number, number> = new Map();

    // Set a default value of 0 for every day from the time where the first
    // transaction was imported.
    const now = roundDate(new Date());
    let start = roundDate(transactions.length ? transactions[0].date : new Date());
    for (; start < now; start += DAY) {
        dateToAmount.set(start, 0);
    }

    // For each date, what amount was added on that day.
    for (const t of transactions) {
        const date = roundDate(t.date);
        const prevValue = dateToAmount.get(date);
        if (typeof prevValue === 'undefined') {
            dateToAmount.set(date, t.amount);
        } else {
            dateToAmount.set(date, prevValue + t.amount);
        }
    }

    let balance = currentBalance || 0;

    if (!dateToAmount.size) {
        // Should be an edge use-case, but if there are no transactions, just
        // make it so the balance was filled yesterday, to display a constant
        // line.
        dateToAmount.set(Date.now(), 0);
        dateToAmount.set(Date.now() - DAY, balance);
    }

    // Sort them from more recent to oldest to start from current/real balance and deduce each day's
    // amount.
    const sorted = Array.from(dateToAmount).sort((a, b) => {
        if (a[0] > b[0]) return -1;
        if (a[0] < b[0]) return 1;
        return 0;
    });

    const data = [];
    for (const [date, amount] of sorted) {
        data.unshift({
            x: +date,
            y: round2(balance),
        });

        balance -= amount;
    }

    // Create the chart.
    const chartsColors = getChartsDefaultColors(theme);
    const fillColor = theme === 'dark' ? '#123356' : '#d9ecec';

    const container = document.getElementById(chartId) as HTMLCanvasElement | null;
    assert(!!container, 'container must be mounted');

    return new Chart(container, {
        type: 'line',

        data: {
            datasets: [
                {
                    indexAxis: 'x',
                    data,
                    fill: true,
                    borderColor: chartsColors.LINES,
                    backgroundColor: fillColor,
                    pointRadius: 1,
                },
            ],
        },

        options: {
            animation: false,
            parsing: false,

            plugins: {
                legend: {
                    display: false,
                },

                // Reduce the number of points displayed.
                decimation: {
                    enabled: true,
                    algorithm: 'lttb',
                },

                zoom: {
                    zoom: {
                        drag: { enabled: true },
                        pinch: { enabled: true },
                        mode: 'x',
                    },
                    limits: {
                        x: {
                            minRange: DAY,
                        },
                    },
                },

                tooltip: {
                    intersect: false,
                },
            },

            scales: {
                x: {
                    type: 'time',
                    ticks: {
                        source: 'auto',
                        maxRotation: 0,
                        autoSkip: true,
                    },
                    grid: {
                        borderColor: chartsColors.AXIS,
                    },
                    time: {
                        tooltipFormat: 'DD MMMM YYYY',
                    },
                },

                yAxes: {
                    grid: {
                        borderColor: chartsColors.AXIS,
                    },
                },
            },
        },
    });
}

const BalanceChart = (props: { balance: number; transactions: Operation[]; theme: string }) => {
    const container = useRef<Chart>();

    const redraw = useCallback(() => {
        container.current = createChartBalance(
            'barchart',
            props.balance,
            props.transactions,
            props.theme
        );
    }, [props]);

    const resetZoom = useCallback(() => {
        if (container.current) {
            container.current.resetZoom();
        }
    }, []);

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
            <canvas id="barchart" style={{ width: '100%' }} onDoubleClick={resetZoom} />
        </React.Fragment>
    );
};

BalanceChart.displayName = 'BalanceChart';
export default BalanceChart;
