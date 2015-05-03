// Constants
import {debug, translate as t} from '../Helpers';
import T from './Translated';

// Global variables
import {store, State} from '../store';

function DEBUG(text) {
    return debug('Chart Component - ' + text);
}

// Components
export default class ChartsComponent extends React.Component {

    constructor() {
        this.$chart = null;
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
        }, this.redraw);
    }

    componentDidMount() {
        // Changing a bank may change the selected account
        store.on(State.banks, this.reload);

        // Changing the selected account needs reloading graphs for the
        // selected account.
        store.on(State.accounts, this.reload);

        store.subscribeMaybeGet(State.operations, this.reload);
        store.subscribeMaybeGet(State.categories, this.reload);
        this.$chart = $('#chart');
    }

    componentWillUnmount() {
        store.removeListener(State.banks, this.reload);
        store.removeListener(State.accounts, this.reload);
        store.removeListener(State.operations, this.reload);
        store.removeListener(State.categories, this.reload);
    }

    redraw() {
        DEBUG('redraw');
        switch (this.state.kind) {
            case 'all':
                CreateChartAllByCategoryByMonth(this.$chart, this.state.operations);
                break;
            case 'balance':
                CreateChartBalance(this.$chart, this.state.account, this.state.operations);
                break;
            case 'by-category':
                var val = this.refs.select.getDOMNode().value;
                CreateChartByCategoryByMonth(this.$chart, val, this.state.operations);
                break;
            case 'pos-neg':
                CreateChartPositiveNegative(this.$chart, this.state.operations);
                break;
            case 'global-pos-neg':
                // Flatten operations
                var accounts = store.getCurrentBankAccounts();
                var ops = [];
                for (var i = 0; i < accounts.length; i++)
                    ops = ops.concat(accounts[i].operations);
                CreateChartPositiveNegative(this.$chart, ops);
                break;
            default:
                assert(true === false, 'unexpected value in redraw: ' + this.state.kind);
        }
    }

    changeKind(kind) {
        this.setState({
            kind: kind
        }, this.redraw);
    }

    onClick(kind) {
        return () => this.changeKind(kind);
    }

    render() {
        var categoryOptions = this.state.categories.map(function (c) {
            return (<option key={c.id} value={c.id}>{c.title}</option>);
        });

        var maybeSelect = this.state.kind !== 'by-category' ? '' :
            <select onChange={this.redraw.bind(this)} ref='select'>
                {categoryOptions}
            </select>

        var that = this;
        function IsActive(which) {
            return which == that.state.kind ? 'active' : '';
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
                        <li role="presentation" className={IsActive('by-category')}><a href="#" onClick={this.onClick('by-category')}>
                            <T k='charts.by_category_by_month'>by category (monthly)</T></a>
                        </li>
                        <li role="presentation" className={IsActive('balance')}><a href="#" onClick={this.onClick('balance')}>
                            <T k='charts.balance'>balance</T></a>
                        </li>
                        <li role="presentation" className={IsActive('pos-neg')}><a href="#" onClick={this.onClick('pos-neg')}>
                            <T k='charts.differences_account'>differences (account)</T></a>
                        </li>
                        <li role="presentation" className={IsActive('global-pos-neg')}><a href="#" onClick={this.onClick('global-pos-neg')}>
                            <T k='charts.differences_all'>differences (all)</T></a></li>
                    </ul>
                    <div className="tab-content">
                        {maybeSelect}
                        <div id='chart' style={{width: '100%'}}></div>
                    </div>
                </div>
            </div>
        );
    }
}

// Charts
function CreateChartByCategoryByMonth($chart, catId, operations) {
    var ops = operations.slice().filter(function(op) {
        return op.categoryId === catId;
    });
    CreateChartAllByCategoryByMonth($chart, ops);
}

function CreateChartAllByCategoryByMonth($chart, operations) {

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
            data.push(map[c][dk].reduce(function(a, b) { return a + b }, 0));
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
        }
    });
}

function CreateChartBalance($chart, account, operations) {

    if (account === null) {
        debug('ChartComponent: no account');
        return;
    }

    let ops = operations.slice().sort(function (a,b) { return +a.date - +b.date });

    function makeKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }

    // Date (day) -> sum amounts of this day (scalar)
    let opmap = new Map;
    ops.map(function(o) {
        let amount = o.amount;
        let key = makeKey(o.date);
        let totalAmountThisDate = opmap.has(key) ? opmap.get(key) : 0;
        opmap.set(key, totalAmountThisDate + amount);
    })

    let balance = account.initialAmount;
    let csv = "Date,Balance\n";
    for (let [date, amount] of opmap) {
        balance += amount;
        csv += `${date},${balance}\n`;
    }

    // Create the chart
    new Dygraph(document.getElementById('chart'), csv);
}

function CreateChartPositiveNegative($chart, operations) {

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
            data.push(map[dk][mapIndex]);
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
        }
    });
}

