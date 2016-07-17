import React from 'react';

import { translate as $t } from '../../helpers';

import ChartComponent from './chart-base';
import { round2 } from './helpers';

function createChartPositiveNegative(chartId, operations) {

    function datekey(op) {
        let d = op.date;
        return `${d.getFullYear()} - ${d.getMonth()}`;
    }

    const POS = 0, NEG = 1, BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    let map = new Map;
    // Datekey -> Date
    let dateset = new Map;
    for (let i = 0; i < operations.length; i++) {
        let op = operations[i];
        let dk = datekey(op);
        map.set(dk, map.get(dk) || [0, 0, 0]);

        let triplet = map.get(dk);
        triplet[POS] += op.amount > 0 ? op.amount : 0;
        triplet[NEG] += op.amount < 0 ? -op.amount : 0;
        triplet[BAL] += op.amount;

        dateset.set(dk, +op.date);
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    let dates = Array.from(dateset);
    dates.sort((a, b) => a[1] - b[1]);

    let series = [];
    function addSerie(name, mapIndex) {
        let data = [];
        for (let j = 0; j < dates.length; j++) {
            let dk = dates[j][0];
            data.push(round2(map.get(dk)[mapIndex]));
        }
        let serie = [name].concat(data);
        series.push(serie);
    }

    addSerie($t('client.charts.received'), POS);
    addSerie($t('client.charts.spent'), NEG);
    addSerie($t('client.charts.saved'), BAL);

    let categories = [];
    for (let i = 0; i < dates.length; i++) {
        let date = new Date(dates[i][1]);
        // Undefined means the default locale
        let defaultLocale;
        let str = date.toLocaleDateString(defaultLocale, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    let yAxisLegend = $t('client.charts.amount');

    c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'bar'
        },

        bar: {
            width: {
                ratio: .5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories
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
        }
    });
}

export default class InOutChart extends ChartComponent {

    redraw() {
        createChartPositiveNegative('#barchart', this.props.operations);
    }

    render() {
        return <div id="barchart" style={ { width: '100%' } }></div>;
    }
}
