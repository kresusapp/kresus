import React, { useCallback, useEffect, useRef } from 'react';

import { Chart, ScriptableLineSegmentContext } from 'chart.js';

// eslint-disable-next-line import/no-unassigned-import
import 'chartjs-adapter-moment';

import { getChartsDefaultColors, round2, translate as $t, assert, startOfDay } from '../../helpers';

import DiscoveryMessage from '../ui/discovery-message';

import { Transaction } from '../../models';

// Number of milliseconds in a day.
const DAY = 1000 * 60 * 60 * 24;

function roundDate(d: Date): number {
    return ((+d / DAY) | 0) * DAY;
}

function createChartBalance(
    chartId: string,
    currentBalance: number,
    inputTransactions: Transaction[],
    theme: string
) {
    const transactions = inputTransactions.slice().sort((a, b) => +a.date - +b.date);
    const dateToAmount: Map<number, number> = new Map();

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

    if (!dateToAmount.size && transactions.length) {
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

    const morning = startOfDay(new Date()).getTime();
    const data = [];
    const futureData = [];

    for (const [date, amount] of sorted) {
        if (date > morning) {
            // For future data store the amount only for now, in ascending order
            // to simplify the future balance computation.
            futureData.unshift({
                x: +date,
                y: amount,
            });
        } else {
            data.unshift({
                x: +date,
                y: round2(balance),
            });
            balance -= amount;
        }
    }

    // Compute each future's entry balance based on current balance and each amount.
    let futureBalance = currentBalance || 0;
    futureData.forEach(entry => {
        futureBalance += entry.y;
        entry.y = round2(futureBalance);
    });

    const futureDataIndex = data.length - 1;
    data.push(...futureData);

    // Create the chart.
    const chartsColors = getChartsDefaultColors(theme);

    const container = document.getElementById(chartId) as HTMLCanvasElement | null;
    assert(!!container, 'container must be mounted');

    const isFuture = (ctx: ScriptableLineSegmentContext, borderDash: number[]) => {
        if (ctx.p0DataIndex >= futureDataIndex) {
            return borderDash;
        }

        return undefined;
    };

    return new Chart(container, {
        type: 'line',

        data: {
            datasets: data.length
                ? [
                      {
                          indexAxis: 'x',
                          data,
                          borderColor: chartsColors.LINES,
                          borderWidth: 1,
                          fill: {
                              above: chartsColors.POSITIVE_FILL,
                              below: chartsColors.NEGATIVE_FILL,
                              target: {
                                  value: 0,
                              },
                          },
                          segment: {
                              borderDash: ctx => isFuture(ctx, [5, 5]),
                          },
                          pointRadius: 1,
                          stepped: true,
                      },
                  ]
                : [],
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

const BalanceChart = (props: { balance: number; transactions: Transaction[]; theme: string }) => {
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
