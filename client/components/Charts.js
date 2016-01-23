import {store, State} from '../store';
import {assert, has, debug, NYI, translate as $t} from '../helpers';
import {Operation} from '../models';

function DEBUG(text) {
    return debug('Chart Component - ' + text);
}

function round2(x) {
    return Math.round(x * 100) / 100;
}

class ChartComponent extends React.Component {

    redraw() {
        NYI();
    }

    componentDidUpdate() {
        this.redraw();
    }

    componentDidMount() {
        // Force update!
        this.setState({});
    }

}

class SelectWithDefault extends React.Component {

    constructor(props, options) {
        has(props, 'defaultValue');
        has(props, 'onChange');
        has(props, 'htmlId');
        super(props);
        this.options = options;
    }

    getValue() {
        return this.refs.selector.getDOMNode().value;
    }

    render() {
        return (
        <select className="form-control"
          defaultValue={this.props.defaultValue}
          onChange={this.props.onChange}
          ref="selector" id={this.props.htmlId}>
            {this.options}
        </select>
        );
    }
}

export class OpCatChartTypeSelect extends SelectWithDefault  {

    constructor(props) {
        let options = [
            <option key='all' value='all'>{$t('client.charts.all_types')}</option>,
            <option key='positive' value='positive'>{$t('client.charts.positive')}</option>,
            <option key='negative' value='negative'>{$t('client.charts.negative')}</option>,
        ];
        super(props, options);
    }

}

export class OpCatChartPeriodSelect extends SelectWithDefault  {

    constructor(props) {
        let options = [
            <option key='value' value='all'>{$t('client.charts.all_periods')}</option>,
            <option key='current-month' value='current-month'>{$t('client.charts.current_month')}</option>,
            <option key='last-month' value='last-month'>{$t('client.charts.last_month')}</option>,
            <option key='3-months' value='3-months'>{$t('client.charts.three_months')}</option>,
            <option key='6-months' value='6-months'>{$t('client.charts.six_months')}</option>
        ];
        super(props, options);
    }

}

class OpCatChart extends ChartComponent {

    createPeriodFilter(option) {

        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth(); // Careful: January is month 0
        let previous;

        switch(option) {
            case 'all':
                return () => true;

            case 'current-month':
                return (d) => d.getMonth() == month && d.getFullYear() == year;

            case 'last-month':
                previous = month > 0 ? month - 1 : 11;
                year = month > 0 ? year : year - 1;
                return (d) => d.getMonth() == previous && d.getFullYear() == year;

            case '3-months':
                if (month >= 3) {
                    previous = month - 3;
                    return (d) => d.getMonth() >= previous && d.getFullYear() == year;
                }
                previous = (month + 9) % 12;
                return (d) => (d.getMonth() >= previous && d.getFullYear() == (year - 1)) ||
                              (d.getMonth() <= month && d.getFullYear() == year);

            case '6-months':
                if (month >= 6) {
                    previous = month - 6;
                    return (d) => d.getMonth() >= previous && d.getFullYear() == year;
                }
                previous = (month + 6) % 12;
                return (d) => (d.getMonth() >= previous && d.getFullYear() == (year - 1)) ||
                              (d.getMonth() <= month && d.getFullYear() == year);

            default: assert(false, 'unexpected option for date filter');
        }
    }

    createKindFilter(option) {
        if (option === 'all')
            return () => true;
        if (option === 'positive')
            return (op) => op.amount > 0;
        if (option === 'negative')
            return (op) => op.amount < 0;
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
        this.barchart = CreateBarChartAll(ops, '#barchart');
        if (kind !== 'all') {
            this.piechart = CreatePieChartAll(ops, '#piechart');
        } else {
            document.querySelector('#piechart').innerHTML = '';
            this.piechart = null;
        }
    }

    onShowAll() {
        this.barchart && this.barchart.show();
        this.piechart && this.piechart.show();
    }

    onHideAll() {
        this.barchart && this.barchart.hide();
        this.piechart && this.piechart.hide();
    }

    render() {

        let defaultType = store.getSetting('defaultChartType');
        let defaultPeriod = store.getSetting('defaultChartPeriod');

        return (<div>

        <div className="panel panel-default">
            <form className="panel-body">

                <div className="form-horizontal">
                    <label htmlFor='kind'>{$t('client.charts.type')}</label>
                    <OpCatChartTypeSelect
                      defaultValue={defaultType}
                      onChange={this.redraw.bind(this)}
                      htmlId="kind"
                      ref="type"
                    />
                </div>

                <div className="form-horizontal">
                    <label htmlFor='period'>{$t('client.charts.period')}</label>
                    <OpCatChartPeriodSelect
                      defaultValue={defaultPeriod}
                      onChange={this.redraw.bind(this)}
                      htmlId="period"
                      ref="period"
                    />
                </div>

                <div className="form-horizontal">
                    <div className="btn-group" role="group" aria-label="Show/Hide categories">
                        <button type="button" className="btn btn-primary"
                          onClick={this.onHideAll.bind(this)}>
                            {$t("client.charts.unselect_all_categories")}
                        </button>
                        <button type="button" className="btn btn-primary"
                          onClick={this.onShowAll.bind(this)}>
                          {$t("client.charts.select_all_categories")}
                        </button>
                    </div>
                </div>

            </form>
        </div>

        <div id='barchart' style={{width: '100%'}}></div>

        <div id='piechart' style={{width: '100%'}}></div>

        </div>);
    }
}

class BalanceChart extends ChartComponent {

    redraw() {
        CreateChartBalance('#barchart', this.props.account, this.props.operations);
    }

    render() {
        return <div id='barchart' style={{width: '100%'}}></div>;
    }
}

class InOutChart extends ChartComponent {

    redraw() {
        CreateChartPositiveNegative('#barchart', this.props.operations);
    }

    render() {
        return <div id='barchart' style={{width: '100%'}}></div>;
    }
}

// Components
export default class ChartsComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            account: null,
            operations: [],
            categories: [],
            kind: 'all'         // which chart are we showing?
        }

        this.reload = this._reload.bind(this);
    }

    _reload() {
        DEBUG('reload');
        this.setState({
            account:    store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            categories: store.getCategories()
        });
    }

    componentDidMount() {
        // Changing a bank may change the selected account
        store.on(State.banks, this.reload);

        // Changing the selected account needs reloading graphs for the
        // selected account.
        store.on(State.accounts, this.reload);

        // Obviously new categories means new graphs.
        store.on(State.categories, this.reload);

        store.subscribeMaybeGet(State.operations, this.reload);
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.reload);
        store.removeListener(State.accounts, this.reload);
        store.removeListener(State.operations, this.reload);
        store.removeListener(State.categories, this.reload);
    }

    changeKind(kind) {
        this.setState({
            kind: kind
        });
    }

    onClick(kind) {
        return () => this.changeKind(kind);
    }

    render() {
        let chartComponent = '';
        switch (this.state.kind) {
            case 'all': {
                chartComponent = <OpCatChart operations={this.state.operations} />;
                break;
            }
            case 'balance': {
                chartComponent = <BalanceChart operations={this.state.operations} account={this.state.account} />;
                break;
            }
            case 'pos-neg': {
                // Flatten operations
                let accounts = store.getCurrentBankAccounts();
                let ops = [];
                for (var i = 0; i < accounts.length; i++)
                    ops = ops.concat(accounts[i].operations);
                chartComponent = <InOutChart operations={ops} />;
                break;
            }
            default: assert(false, 'unexpected chart kind');
        }

        let IsActive = (which) => {
            return which == this.state.kind ? 'active' : '';
        }

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        {$t('client.charts.title')}
                    </h3>
                </div>

                <div className="panel-body">
                    <ul className="nav nav-pills" role="tablist">
                        <li role="presentation" className={IsActive('all')}>
                            <a href="#" onClick={this.onClick('all')}>
                                {$t('client.charts.by_category')}
                            </a>
                        </li>
                        <li role="presentation" className={IsActive('balance')}>
                            <a href="#" onClick={this.onClick('balance')}>
                                {$t('client.charts.balance')}
                            </a>
                        </li>
                        <li role="presentation" className={IsActive('pos-neg')}>
                            <a href="#" onClick={this.onClick('pos-neg')}>
                                {$t('client.charts.differences_all')}
                            </a>
                        </li>
                    </ul>
                    <div className="tab-content">
                        {chartComponent}
                    </div>
                </div>
            </div>
        );
    }
}

// Charts
function CreateBarChartAll(operations, barchartId) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    // Category -> {Month -> [Amounts]}
    var map = {};

    // Category -> color
    let colorMap = {};

    // Datekey -> Date
    var dateset = {};
    for (let i = 0, size = operations.length; i < size; i++) {
        let op = operations[i];
        let c = store.getCategoryFromId(op.categoryId);
        map[c.title] = map[c.title] || {};

        var dk = datekey(op);
        map[c.title][dk] = map[c.title][dk] || [];
        map[c.title][dk].push(op.amount);
        dateset[dk] = +op.date;

        colorMap[c.title] = colorMap[c.title] || c.color;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort((a, b) => a[1] - b[1]);

    var series = [];
    for (let c in map) {
        let data = [];

        for (var j = 0; j < dates.length; j++) {
            var dk = dates[j][0];
            map[c][dk] = map[c][dk] || [];
            data.push(round2(map[c][dk].reduce(function(a, b) { return a + b }, 0)));
        }

        data = [c].concat(data);
        series.push(data);
    }

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString(/* use the default locale */ undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    let yAxisLegend = $t('client.charts.Amount');

    return c3.generate({

        bindto: barchartId,

        data: {
            columns: series,
            type: 'bar',
            colors: colorMap
        },

        bar: {
            width: {
                ratio: .5
            }
        },

        axis: {
            x: {
                type: 'category',
                categories: categories
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
                lines: [{value: 0}]
            }
        }
    });
}


function CreatePieChartAll(operations, chartId) {

    let catMap = new Map;
    // categoryId -> [val1, val2, val3]
    for (let op of operations) {
        let catId = op.categoryId;
        let arr = catMap.has(catId) ? catMap.get(catId) : [];
        arr.push(op.amount);
        catMap.set(catId, arr);
    }

    // [ [categoryName, val1, val2], [anotherCategoryName, val3, val4] ]
    let series = [];
    // {label -> color}
    let colorMap = {};
    for (let [catId, valueArr] of catMap) {
        let c = store.getCategoryFromId(catId);
        series.push([c.title].concat(valueArr));
        colorMap[c.title] = c.color;
    }

    return c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'pie',
            colors: colorMap
        },

        tooltip: {
            format: {
                value: function(value, ratio, id) {
                    return round2(ratio*100) + '% (' + Math.abs(round2(value)) + ')';
                }
            }
        }

    });
}


function CreateChartBalance(chartId, account, operations) {

    if (account === null) {
        debug('ChartComponent: no account');
        return;
    }

    let ops = operations.slice().sort((a,b) => +a.date - +b.date);

    function makeKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    let opmap = new Map;

    // Fill all dates
    const DAY = 1000 * 60 * 60 * 24;

    let firstDate = ops.length ? +ops[0].date : Date.now();
    firstDate = (firstDate / DAY | 0) * DAY;

    let today = (Date.now() / DAY | 0) * DAY;
    for (; firstDate <= today; firstDate += DAY) {
        opmap.set(makeKey(new Date(firstDate)), 0);
    }

    // Date (day) -> cumulated sum of amounts for this day (scalar)
    for (let o of ops) {
        let key = makeKey(o.date);
        opmap.set(key, opmap.get(key) + o.amount);
    };

    let balance = account.initialAmount;
    let csv = "Date,Balance\n";
    for (let [date, amount] of opmap) {
        balance += amount;
        csv += `${date},${round2(balance)}\n`;
    }

    // Create the chart
    new Dygraph(document.querySelector(chartId), csv);
}

function CreateChartPositiveNegative(chartId, operations) {

    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    const POS = 0, NEG = 1, BAL = 2;

    // Month -> [Positive amount, Negative amount, Diff]
    var map = {};
    // Datekey -> Date
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var dk = datekey(op);
        map[dk] = map[dk] || [0, 0, 0];

        map[dk][POS] += op.amount > 0 ? op.amount : 0;
        map[dk][NEG] += op.amount < 0 ? -op.amount : 0;
        map[dk][BAL] += op.amount;

        dateset[dk] = +op.date;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort((a, b) => a[1] - b[1]);

    var series = [];
    function addSerie(name, mapIndex) {
        var data = [];
        for (var i = 0; i < dates.length; i++) {
            var dk = dates[i][0];
            data.push(round2(map[dk][mapIndex]));
        }
        let serie = [name].concat(data);
        series.push(serie);
    }

    addSerie($t('client.charts.Received'), POS);
    addSerie($t('client.charts.Paid'), NEG);
    addSerie($t('client.charts.Saved'), BAL);

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString(/* use the default locale */ undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    let yAxisLegend = $t('client.charts.Amount');

    let chart = c3.generate({

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
                categories: categories
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
                lines: [{value: 0}]
            }
        }
    });
}
