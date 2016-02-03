import { store, State } from '../../store';
import { assert, has, debug, NYI, translate as $t } from '../../helpers';
import { Operation } from '../../models';

import ChartComponent from './ChartComponent';
import OpCatChart from './OpCatChart';

function DEBUG(text) {
    return debug('Chart Component - ' + text);
}

function round2(x) {
    return Math.round(x * 100) / 100;
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
            account: store.getCurrentAccount(),
            operations: store.getCurrentOperations(),
            categories: store.getCategories(),
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

        store.on(State.operations, this.reload);
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
export function CreateBarChartAll(operations, barchartId) {

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


export function CreatePieChartAll(operations, chartId) {

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


export function CreateChartBalance(chartId, account, operations) {

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

export function CreateChartPositiveNegative(chartId, operations) {

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
        for (let j = 0; i < dates.length; j++) {
            let dk = dates[j][0];
            data.push(round2(map[dk][mapIndex]));
        }
        let serie = [name].concat(data);
        series.push(serie);
    }

    addSerie($t('client.charts.Received'), POS);
    addSerie($t('client.charts.Paid'), NEG);
    addSerie($t('client.charts.Saved'), BAL);

    let categories = [];
    for (let i = 0; i < dates.length; i++) {
        let date = new Date(dates[i][1]);
        // use the default locale
        let str = date.toLocaleDateString(undefined, {
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
