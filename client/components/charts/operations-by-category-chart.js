import React from 'react';

import { assert, translate as $t } from '../../helpers';
import { store } from '../../store';
import { Operation } from '../../models';

import OpCatChartPeriodSelect from '../shared/operations-by-category-period-select';
import OpCatChartTypeSelect from '../shared/operations-by-category-type-select';

import { createBarChartAll, createPieChartAll } from './';
import ChartComponent from './chart-base';

export default class OpCatChart extends ChartComponent {

    constructor(props) {
        super(props);
        this.handleRedraw = this.redraw.bind(this);
        this.handleHideAll = this.handleHideAll.bind(this);
        this.handleShowAll = this.handleShowAll.bind(this);
    }

    createPeriodFilter(option) {

        let date = new Date();
        let year = date.getFullYear();
        // Careful: January is month 0
        let month = date.getMonth();
        let previous;

        switch (option) {
            case 'all':
                return () => true;

            case 'current-month':
                return d => d.getMonth() === month && d.getFullYear() === year;

            case 'last-month':
                previous = month > 0 ? month - 1 : 11;
                year = month > 0 ? year : year - 1;
                return d => d.getMonth() === previous && d.getFullYear() === year;

            case '3-months':
                if (month >= 3) {
                    previous = month - 3;
                    return d => d.getMonth() >= previous && d.getFullYear() === year;
                }
                previous = (month + 9) % 12;
                return d => (d.getMonth() >= previous && d.getFullYear() === (year - 1)) ||
                              (d.getMonth() <= month && d.getFullYear() === year);

            case '6-months':
                if (month >= 6) {
                    previous = month - 6;
                    return d => d.getMonth() >= previous && d.getFullYear() === year;
                }
                previous = (month + 6) % 12;
                return d => (d.getMonth() >= previous && d.getFullYear() === (year - 1)) ||
                              (d.getMonth() <= month && d.getFullYear() === year);

            default: assert(false, 'unexpected option for date filter');
        }
    }

    createKindFilter(option) {
        if (option === 'all')
            return () => true;
        if (option === 'positive')
            return op => op.amount > 0;
        if (option === 'negative')
            return op => op.amount < 0;
        assert(false, 'unknown kind filter option');
    }

    redraw() {
        let ops = this.props.operations.slice();

        // Period
        let period = this.refs.period.getValue() || 'all';
        let periodFilter = this.createPeriodFilter(period);
        ops = ops.filter(op => periodFilter(op.date));

        // Kind
        let kind = this.refs.type.getValue() || 'all';
        let kindFilter = this.createKindFilter(kind);
        ops = ops.filter(kindFilter);

        // Invert values on the negative chart.
        if (kind === 'negative') {
            ops = ops.map(op => {
                let ret = new Operation(op, '');
                ret.amount = -ret.amount;
                return ret;
            });
        }

        // Print charts
        this.barchart = createBarChartAll(ops, '#barchart');
        if (kind !== 'all') {
            this.piechart = createPieChartAll(ops, '#piechart');
        } else {
            document.querySelector('#piechart').innerHTML = '';
            this.piechart = null;
        }
    }

    handleShowAll() {
        if (this.barchart)
            this.barchart.show();
        if (this.piechart)
            this.piechart.show();
    }

    handleHideAll() {
        if (this.barchart)
            this.barchart.hide();
        if (this.piechart)
            this.piechart.hide();
    }

    render() {

        let defaultType = store.getSetting('defaultChartType');
        let defaultPeriod = store.getSetting('defaultChartPeriod');

        return (
            <div>

                <div className="panel panel-default">
                    <form className="panel-body">

                        <div className="form-horizontal">
                            <label htmlFor="kind">{ $t('client.charts.type') }</label>
                            <OpCatChartTypeSelect
                              defaultValue={ defaultType }
                              onChange={ this.handleRedraw }
                              htmlId="kind"
                              ref="type"
                            />
                        </div>

                        <div className="form-horizontal">
                            <label htmlFor="period">{ $t('client.charts.period') }</label>
                            <OpCatChartPeriodSelect
                              defaultValue={ defaultPeriod }
                              onChange={ this.handleRedraw }
                              htmlId="period"
                              ref="period"
                            />
                        </div>

                        <div className="form-horizontal">
                            <div className="btn-group"
                              role="group" aria-label="Show/Hide categories">
                                <button type="button" className="btn btn-primary"
                                  onClick={ this.handleHideAll }>
                                    { $t('client.charts.unselect_all_categories') }
                                </button>
                                <button type="button" className="btn btn-primary"
                                  onClick={ this.handleShowAll } >
                                  { $t('client.charts.select_all_categories') }
                                </button>
                            </div>
                        </div>

                    </form>
                </div>

                <div id="barchart" style={ { width: '100%' } }/>

                <div id="piechart" style={ { width: '100%' } }/>

            </div>
        );
    }
}
