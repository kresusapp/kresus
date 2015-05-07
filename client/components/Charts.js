// Constants
import {assert, debug, NYI, translate as t} from '../Helpers';
import T from './Translated';

// Global variables
import {store, State} from '../store';

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
        let period = this.refs.period.getDOMNode().value || 'all';
        let periodFilter = this.createPeriodFilter(period);
        ops = ops.filter((op) => periodFilter(op.date));

        // Kind
        let kind = this.refs.kind.getDOMNode().value || 'all';
        let kindFilter = this.createKindFilter(kind);
        ops = ops.filter(kindFilter);

        // Print charts
        CreateBarChartAll(ops, '#barchart');
        if (kind !== 'all') {
            CreatePieChartAll(ops, '#piechart');
        } else {
            document.querySelector('#piechart').innerHTML = '';
        }
    }

    render() {

        let defaultType = store.getSetting('defaultChartType');
        let defaultPeriod = store.getSetting('defaultChartPeriod');

        return (<div>

        <div className="panel panel-default">
            <div className="panel-body">

                <div className="form-horizontal">
                    <label htmlFor='kind'><T k='charts.type'>Type</T></label>
                    <select className="form-control"
                      defaultValue={defaultType}
                      onChange={this.redraw.bind(this)}
                      ref='kind' id='kind'>
                        <option value='all'><T k='charts.all_types'>All types</T></option>
                        <option value='positive'><T k='charts.positive'>Positive</T></option>
                        <option value='negative'><T k='charts.negative'>Negative</T></option>
                    </select>
                </div>

                <div className="form-horizontal">
                    <label htmlFor='period'><T k='charts.period'>Period</T></label>
                    <select className="form-control"
                      defaultValue={defaultPeriod}
                      onChange={this.redraw.bind(this)}
                      ref='period' id='period'>
                        <option value='all'><T k='charts.all_periods'>All times</T></option>
                        <option value='current-month'><T k='charts.current_month'>Current month</T></option>
                        <option value='last-month'><T k='charts.last_month'>Last month</T></option>
                        <option value='3-months'><T k='charts.three_months'>3 last months</T></option>
                        <option value='6-months'><T k='charts.six_months'>6 last months</T></option>
                    </select>
                </div>

            </div>
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
                        <T k='charts.title'>Graphs</T>
                    </h3>
                </div>

                <div className="panel-body">
                    <ul className="nav nav-pills" role="tablist">
                        <li role="presentation" className={IsActive('all')}><a href="#" onClick={this.onClick('all')}>
                            <T k='charts.by_category'>by category</T></a>
                        </li>
                        <li role="presentation" className={IsActive('balance')}><a href="#" onClick={this.onClick('balance')}>
                            <T k='charts.balance'>balance</T></a>
                        </li>
                        <li role="presentation" className={IsActive('pos-neg')}><a href="#" onClick={this.onClick('pos-neg')}>
                            <T k='charts.differences_all'>differences</T></a>
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
    // Datekey -> Date
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var c = store.categoryToLabel(op.categoryId);
        map[c] = map[c] || {};

        var dk = datekey(op);
        map[c][dk] = map[c][dk] || [];
        map[c][dk].push(op.amount);
        dateset[dk] = +op.date;
    }

    // Sort date in ascending order: push all pairs of (datekey, date) in an
    // array and sort that array by the second element. Then read that array in
    // ascending order.
    var dates = [];
    for (var dk in dateset) {
        dates.push([dk, dateset[dk]]);
    }
    dates.sort(function(a, b) {
        return a[1] - b[1];
    });

    var series = [];
    for (var c in map) {
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

    let yAxisLegend = t('charts.Amount') || 'Amount';

    let chart = c3.generate({

        bindto: barchartId,

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
    for (let [catId, valueArr] of catMap) {
        series.push([store.categoryToLabel(catId)].concat(valueArr));
    }

    let chart = c3.generate({

        bindto: chartId,

        data: {
            columns: series,
            type: 'pie'
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

    let ops = operations.slice().sort(function (a,b) { return +a.date - +b.date });

    function makeKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    let opmap = new Map;

    // Fill all dates
    let DAY = 1000 * 60 * 60 * 24;
    let firstDate = (+ops[0].date / DAY | 0) * DAY;
    let today = (Date.now() / DAY | 0) * DAY;
    for (; firstDate != today; firstDate += DAY) {
        opmap.set(makeKey(new Date(firstDate)), 0);
    }

    // Date (day) -> cumulated sum of amounts for this day (scalar)
    ops.map(function(o) {
        let key = makeKey(o.date);
        opmap.set(key, opmap.get(key) + o.amount);
    });

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
    dates.sort(function(a, b) {
        return a[1] - b[1];
    });

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

    addSerie(t('charts.Received') || 'Received', POS);
    addSerie(t('charts.Paid') || 'Paid', NEG);
    addSerie(t('charts.Saved') || 'Saved', BAL);

    var categories = [];
    for (var i = 0; i < dates.length; i++) {
        var date = new Date(dates[i][1]);
        var str = date.toLocaleDateString(/* use the default locale */ undefined, {
            year: 'numeric',
            month: 'long'
        });
        categories.push(str);
    }

    let yAxisLegend = t('charts.Amount') || 'Amounts';

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

