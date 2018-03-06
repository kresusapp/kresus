import React from 'react';
import c3 from 'c3';

import { translate as $t, round2, getWellsColors } from '../../helpers';

import ChartComponent from './chart-base';

const CHART_SIZE = 600;
const SUBCHART_SIZE = 100;

// Initial subchart extent, in months.
const SUBCHART_EXTENT = 3;

function createChartPositiveNegative(chartId, operations, theme) {
    function datekey(op) {
        let d = op.budgetDate;
        return `${d.getFullYear()} - ${d.getMonth()}`;
    }

    const POS = 0,
        NEG = 1,
        BAL = 2;

    // Type -> color
    let colorMap = {};

    // Month -> [Positive amount, Negative amount, Diff]
    let map = new Map();
    // Datekey -> Date
    let dateset = new Map();
    for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
        let dk = datekey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        let triplet = map.get(dk);
        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +op.budgetDate);
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    let dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    let series = [];
    function addSerie(name, mapIndex, color) {
        let data = [];
        for (let j = 0; j < dates.length; j++) {
            let dk = dates[j][0];
            data.push(round2(map.get(dk)[mapIndex]));
        }
        let serie = [name].concat(data);
        series.push(serie);
        colorMap[name] = color;
    }

    const wellsColors = getWellsColors(theme);
    addSerie($t('client.charts.received'), POS, wellsColors.RECEIVED);
    addSerie($t('client.charts.spent'), NEG, wellsColors.SPENT);
    addSerie($t('client.charts.saved'), BAL, wellsColors.SAVED);

    let categories = [];
    for (let i = 0; i < dates.length; i++) {
        let date = new Date(dates[i][1]);
        // Undefined means the default locale
        let defaultLocale;
        let str = date.toLocaleDateString(defaultLocale, {
            year: '2-digit',
            month: 'short'
        });
        categories.push(str);
    }

    // Show last ${SUBCHART_EXTENT} months in the subchart.
    let lowExtent = Math.max(dates.length, SUBCHART_EXTENT) - SUBCHART_EXTENT;
    let highExtent = dates.length;

    let yAxisLegend = $t('client.charts.amount');

    c3.generate({
        bindto: chartId,

        data: {
            columns: series,
            type: 'bar',
            colors: colorMap
        },

        bar: {
            width: {
                ratio: 0.5
            }
        },

        axis: {
            x: {
                type: 'category',
                extent: [lowExtent, highExtent],
                categories,
                tick: {
                    fit: false
                }
            },

            y: {
                label: yAxisLegend
            }
        },

        grid: {
            x: {
                show: true
            },
            y: {
                show: true,
                lines: [{ value: 0 }]
            }
        },

        size: {
            height: CHART_SIZE
        },

        subchart: {
            show: true,
            size: {
                height: SUBCHART_SIZE
            }
        },

        zoom: {
            rescale: true
        }
    });
}

export default class InOutChart extends ChartComponent {
    redraw() {
        createChartPositiveNegative('#barchart', this.props.operations, this.props.theme);
    }

    render() {
        return <div id="barchart" style={{ width: '100%' }} />;
    }
}
