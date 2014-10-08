/** @jsx React.DOM */

// Helpers
var EE = require('events').EventEmitter;

var Helpers = require('./Helpers');
var debug = Helpers.debug;
var assert = Helpers.assert;
var maybeHas = Helpers.maybeHas;
var has = Helpers.has;
var xhrError = Helpers.xhrError;

var Events = require('./Events');

// Classes
var AccountListComponent = require('./components/AccountListComponent');
var BankListComponent = require('./components/BankListComponent');
var CategoryComponent = require('./components/CategoryComponent');
var OperationListComponent = require('./components/OperationListComponent');

// Global variables
var flux = require('./flux/dispatcher');
var store = require('./store');

// Now this really begins.

/*
 * React Components
 */
var CategorySelectComponent = React.createClass({

    getInitialState: function() {
        return { editMode: false }
    },

    onChange: function(e) {
        var selected = this.refs.cat.getDOMNode().value;
        this.props.updateOperationCategory(this.props.operation, selected);
    },

    switchToEditMode: function() {
        this.setState({ editMode: true }, function() {
            this.refs.cat.getDOMNode().focus();
        });
    },
    switchToStaticMode: function() {
        this.setState({ editMode: false });
    },

    render: function() {
        var label = this.props.operation.categoryLabel;
        var selectedId = this.props.operation.categoryId;

        if (!this.state.editMode) {
            return (<span onClick={this.switchToEditMode}>{label}</span>)
        }

        var categories = [new Category({title: 'None', id: '-1'})].concat(this.props.categories);
        var options = categories.map(function (c) {
            return (<option key={c.id} value={c.id}>{c.title}</option>)
        });
        return (
            <select onChange={this.onChange} onBlur={this.switchToStaticMode} defaultValue={selectedId} ref='cat' >
                {options}
            </select>
        );
    }
});

var SimilarityItemComponent = React.createClass({

    deleteOperation: function() {
        this.props.deleteOperation(this.props.op);
    },

    render: function() {
        return (
            <tr>
                <td>{this.props.op.date.toString()}</td>
                <td>{this.props.op.title}</td>
                <td>{this.props.op.amount}</td>
                <td><a onClick={this.deleteOperation}>x</a></td>
            </tr>
        );
    }
});

var SimilarityPairComponent = React.createClass({

    render: function() {
        return (
            <table>
                <SimilarityItemComponent op={this.props.a} deleteOperation={this.props.deleteOperation} />
                <SimilarityItemComponent op={this.props.b} deleteOperation={this.props.deleteOperation} />
            </table>
        );
    }
});

// Props: pairs: [[Operation, Operation]], deleteOperation: function(Operation){}
var SimilarityComponent = React.createClass({

    render: function() {
        var pairs = this.props.pairs;
        if (pairs.length === 0) {
            return (
                <div>No similar operations found.</div>
            )
        }

        var deleteOperation = this.props.deleteOperation;
        var sim = pairs.map(function (p) {
            var key = p[0].id.toString() + p[1].id.toString();
            return (<SimilarityPairComponent key={key} a={p[0]} b={p[1]} deleteOperation={deleteOperation} />)
        });
        return (
            <div>
                <h1>Similarities</h1>
                <div>
                    {sim}
                </div>
            </div>)
    }
});

// Props: operations, categories
var ChartComponent = React.createClass({

    _onChange: function() {
        var val = this.refs.select.getDOMNode().value;
        if (val === 'all') {
            CreateChartAllByCategoryByMonth(this.props.operations);
            return;
        }

        var c = CategoryMap[val];
        CreateChartByCategoryByMonth(val, this.props.operations);
    },

    render: function() {
        var categoryOptions = this.props.categories.map(function (c) {
            return (<option key={c.id} value={c.id}>{c.title}</option>);
        });

        return (
        <div>
            <h1>Charts</h1>
            <select onChange={this._onChange} defaultValue='all' ref='select'>
                <option value='all'>All</option>
                {categoryOptions}
            </select>
            <div id='chart'></div>
        </div>
        );
    }
});

var CategoryMap = {};

var Kresus = React.createClass({

    getInitialState: function() {
        return {
            // All banks
            banks: [],
            categories: [],
            // Current bank
            currentBank: null,
            accounts: [],
            // Current account
            currentAccount: null,
            operations: [],
            redundantPairs: []
        }
    },

    deleteOperation: function(operation) {
        if (!operation)
            return;
        assert(operation instanceof Operation);

        var that = this;
        $.ajax({
            url: 'operations/' + operation.id,
            type: 'DELETE',
            success: that.loadOperations,
            error: xhrError
        });
    },

    updateOperationCategory: function(op, catId) {
        assert(op instanceof Operation);
        var data = {
            categoryId: catId
        }

        $.ajax({
            url:'operations/' + op.id,
            type: 'PUT',
            data: data,
            success: function () {
                op.updateLabel(catId)
            },
            error: xhrError
        });
    },

    componentDidMount: function() {
        // Let's go.
        store.getCategories();
        store.getAllBanks();
    },

    render: function() {
        return (
            <div className='row'>

            <div className='panel small-2 columns'>
                <BankListComponent />
                <AccountListComponent />
            </div>

            <div className="small-10 columns">
                <ul className="tabs" data-tab>
                    <li className="tab-title active"><a href="#panel-operations">Operations</a></li>
                    <li className="tab-title"><a href="#panel-charts">Charts</a></li>
                    <li className="tab-title"><a href="#panel-similarities">Similarities</a></li>
                    <li className="tab-title"><a href="#panel-categories">Categories</a></li>
                </ul>

                <div className="tabs-content">

                    <div className='content active' id='panel-operations'>
                        <OperationListComponent />
                    </div>

                    <div className='content' id='panel-similarities'>
                        <SimilarityComponent
                            pairs={this.state.redundantPairs}
                            deleteOperation={this.deleteOperation}
                        />
                    </div>

                    <div className='content' id='panel-charts'>
                        <ChartComponent
                            account={this.state.currentAccount}
                            operations={this.state.operations}
                            categories={this.state.categories}
                        />
                    </div>

                    <div className='content' id='panel-categories'>
                        <CategoryComponent />
                    </div>

                </div>
            </div>

            </div>
        );
    }
});

var S = document.querySelector.bind(document);
React.renderComponent(<Kresus />, S('#main'));

/*
 * ALGORITHMS
 */
const TIME_SIMILAR_THRESHOLD = 1000 * 60 * 60 * 24 * 2; // 48 hours
function findRedundantAlgorithm(operations) {
    var similar = [];

    // O(n log n)
    function sortCriteria(a,b) { return a.amount - b.amount; }
    var sorted = operations.slice().sort(sortCriteria);
    for (var i = 0; i < operations.length; ++i) {
        if (i + 1 >= operations.length)
            continue;
        var op = sorted[i];
        var next = sorted[i+1];
        if (op.amount == next.amount) {
            var datediff = +op.date - +next.date;
            if (datediff <= TIME_SIMILAR_THRESHOLD)
                similar.push([op, next]);
        }
    }

    return similar;
}

/*
 * CHARTS
 */

$chart = $('#chart');

function CreateChartByCategoryByMonth(catId, operations) {
    var ops = [];
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        if (op.categoryId === catId)
            ops.push(op);
    }
    CreateChartAllByCategoryByMonth(ops);
}

function CreateChartAllByCategoryByMonth(operations) {
    function datekey(op) {
        var d = op.date;
        return d.getFullYear() + '-' + d.getMonth();
    }

    var map = {};
    var dateset = {};
    for (var i = 0; i < operations.length; i++) {
        var op = operations[i];
        var c = op.categoryLabel;
        map[c] = map[c] || {};

        var dk = datekey(op);
        map[c][dk] = map[c][dk] || [];
        map[c][dk].push(op.amount);
        dateset[dk] = true;
    }

    var series = [];
    for (var c in map) {
        var data = [];

        for (var dk in dateset) {
            map[c][dk] = map[c][dk] || [];
            var s = 0;
            var arr = map[c][dk];
            for (var i = 0; i < arr.length; i++)
                s += arr[i];
            data.push(s);
        }

        var serie = {
            name: c,
            data: data
        };

        series.push(serie);
    }

    var categories = [];
    for (var dk in dateset)
        categories.push(dk);

    var title = 'By category';
    var yAxisLegend = 'Amount';

    $chart.highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: {
                text: yAxisLegend
            }
        },
        tooltip: {
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} eur</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
        series: series
    });
}

// TODO unused right now
function CreateChartAllOperations(account, operations) {
    createChart(account.initialAmount, operations.slice(), account.title);
}

function CreateChartByCategory(catId, catLabel, operations) {
    var ops = operations.slice().filter(function(x) {
        return x.categoryId == catId;
    });

    createChart(0, ops, catLabel);
}

function createChart(initialAmount, operations, title) {
    if (operations.length === 0)
        return;

    var ops = operations.sort(function (a,b) { return +a.date - +b.date });
    var cumulativeAmount = initialAmount;
    // Must contain array pairs [+date, value]
    var positive = (initialAmount > 0) ? initialAmount : 0;
    var negative = (initialAmount < 0) ? -initialAmount : 0;
    var balance = initialAmount;

    var posd = [];
    var negd = [];
    var bald = [];

    var opmap = {};
    var posmap = {};
    var negmap = {};

    ops.map(function(o) {
        // Convert date into a number: it's going to be converted into a string
        // when used as a key.
        var a = o.amount;
        var d = +o.date;
        opmap[d] = opmap[d] || 0;
        opmap[d] += a;

        if (a < 0) {
            negmap[d] = negmap[d] || 0;
            negmap[d] += -a;
        } else if (a > 0) {
            posmap[d] = posmap[d] || 0;
            posmap[d] += a;
        }
    })

    for (var date in opmap) {
        // date is a string now: convert it back to a number for highcharts.
        balance += opmap[date];
        bald.push([+date, balance]);

        if (posmap[date]) {
            positive += posmap[date];
        }
        if (negmap[date]) {
            negative += negmap[date];
        }
        posd.push([+date, positive]);
        negd.push([+date, negative]);
    }

    // Create the chart
    $chart.highcharts('StockChart', {
        rangeSelector : {
            selected : 1,
            inputEnabled: $chart.width() > 480
        },

        title : {
            text : title
        },

        series : [{
            name : 'Balance',
            data : bald,
            tooltip: { valueDecimals: 2 }
        }, {
            name: 'Credit',
            data: posd,
            tooltip: { valueDecimals: 2 }
        }, {
            name: 'Debit',
            data: negd,
            tooltip: { valueDecimals: 2 }
        }]
    });
}

