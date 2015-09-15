import {has} from '../Helpers';
import {store} from '../store';

import DatePicker from './DatePicker';
import T from './Translated';

export default class SearchComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initialState();
    }

    initialState() {
        return {
            showDetails: false,

            keywords: [],
            category: '',
            type: '',
            amount_low: '',
            amount_high: '',
            date_low: null,
            date_high: null
        }
    }

    clearSearch() {
        this.setState(this.initialState(), this.filter);
    }

    toggleDetails() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    }

    componentDidMount() {
        // Force search with empty query, to show all operations
        this.filter();
    }

    ref(name) {
        has(this.refs, name);
        return this.refs[name].getDOMNode();
    }

    changeLowDate(value) {
        this.setState({
            date_low: value
        }, this.filter);
    }

    changeHighDate(value) {
        this.setState({
            date_high: value
        }, this.filter);
    }

    syncKeyword() {
        var kw = this.ref('keywords');
        this.setState({
            keywords: kw.value.split(' ').map(function (w) { return w.toLowerCase(); })
        }, this.filter);
    }

    syncCategory() {
        var cat = this.ref('cat');
        this.setState({
            category: cat.value.toLowerCase()
        }, this.filter);
    }

    syncType() {
        var type = this.ref('type');
        this.setState({
            type: type.value
        }, this.filter)
    }

    syncAmountLow() {
        var low = this.ref('amount_low');
        this.setState({
            amount_low: low.value
        }, this.filter);
    }

    syncAmountHigh() {
        var high = this.ref('amount_high');
        this.setState({
            amount_high: high.value
        }, this.filter);
    }

    filter() {
        function contains(where, substring) {
            return where.toLowerCase().indexOf(substring) !== -1;
        }

        function filterIf(condition, array, callback) {
            if (condition)
                return array.filter(callback);
            return array;
        }

        // Filter! Apply most discriminatory / easiest filters first
        var operations = this.props.operations.slice();

        var self = this;
        operations = filterIf(this.state.category !== '', operations, function(op) {
            return contains(store.categoryToLabel(op.categoryId), self.state.category);
        });

        operations = filterIf(this.state.type !== '', operations, function(op) {
            return op.type === self.state.type;
        });

        operations = filterIf(this.state.amount_low !== '', operations, function(op) {
            return op.amount >= self.state.amount_low;
        });

        operations = filterIf(this.state.amount_high !== '', operations, function(op) {
            return op.amount <= self.state.amount_high;
        });

        operations = filterIf(this.state.date_low !== null, operations, function(op) {
            return op.date >= self.state.date_low;
        });

        operations = filterIf(this.state.date_high !== null, operations, function(op) {
            return op.date <= self.state.date_high;
        });

        operations = filterIf(this.state.keywords.length > 0, operations, function(op) {
            for (var i = 0; i < self.state.keywords.length; i++) {
                var str = self.state.keywords[i];
                if (!contains(op.raw, str) && !contains(op.title, str))
                    return false;
            }
            return true;
        });

        this.props.setFilteredOperations(operations);
    }

    render() {
        var details;
        if (!this.state.showDetails) {
            details = <div className="transition-expand" />;
        } else {
            var catOptions = [<option key='_' value=''><T k='search.any_category'>Any category</T></option>].concat(
                store.getCategories().map((c) => <option key={c.id} value={c.title}>{c.title}</option>)
            );

            var typeOptions = [<option key='_' value=''><T k='search.any_type'>Any type</T></option>].concat(
                store.getOperationTypes().map((t) => <option key={t.id} value={t.id}>{store.operationTypeToLabel(t.id)}</option>)
            );

            details = <div className="panel-body transition-expand">

                <div className="form-group">
                    <label htmlFor="keywords"><T k='search.keywords'>Keywords:</T></label>
                    <input type="text" className="form-control"
                       onKeyUp={this.syncKeyword.bind(this)} defaultValue={this.state.keywords.join(' ')}
                       id="keywords" ref="keywords" />
                </div>

                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-xs-2">
                            <label htmlFor="category-selector"><T k='search.category'>Category:</T></label>
                        </div>
                        <div className="col-xs-5">
                            <select className="form-control" id="category-selector"
                               onChange={this.syncCategory.bind(this)} defaultValue={this.state.category}
                               ref='cat'>
                                {catOptions}
                            </select>
                        </div>
                        <div className="col-xs-1">
                            <label htmlFor="type-selector"><T k='search.type'>Type:</T></label>
                        </div>
                        <div className="col-xs-4">
                            <select className="form-control" id="type-selector"
                               onChange={this.syncType.bind(this)} defaultValue={this.state.type}
                               ref='type'>
                                {typeOptions}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-xs-2">
                            <label className="control-label" htmlFor="amount-low"><T k='search.amount_low'>Amount: between</T></label>
                        </div>
                        <div className="col-xs-5">
                            <input type="number" className="form-control"
                              onChange={this.syncAmountLow.bind(this)} defaultValue={this.state.amount_low}
                              id="amount-low" ref="amount_low" />
                        </div>
                        <div className="col-xs-1">
                            <label className="control-label" htmlFor="amount-high"><T k='search.and'>and</T></label>
                        </div>
                        <div className="col-xs-4">
                            <input type="number" className="form-control"
                              onChange={this.syncAmountHigh.bind(this)} defaultValue={this.state.amount_high}
                              id="amount-high" ref="amount_high" />
                        </div>
                    </div>
                </div>

                <div className="form-horizontal">
                    <div className="form-group">
                        <div className="col-xs-2">
                            <label className="control-label" htmlFor="date-low"><T k='search.date_low'>Date: between</T></label>
                        </div>
                        <div className="col-xs-5">
                            <DatePicker ref="date_low" id="date-low" key="date-low" onSelect={this.changeLowDate.bind(this)} />
                        </div>
                        <div className="col-xs-1">
                            <label className="control-label" htmlFor="date-high"><T k='search.and'>and</T></label>
                        </div>
                        <div className="col-xs-4">
                            <DatePicker ref="date_high" id="date-high" key="date-high" onSelect={this.changeHighDate.bind(this)} />
                        </div>
                    </div>
                </div>

                <div>
                    <button className="btn btn-primary pull-right" onClick={this.clearSearch.bind(this)}><T k='search.clear'>clear</T></button>
                </div>
            </div>;
        }

        return (
        <div className="panel panel-default">
            <div className="panel-heading clickable" onClick={this.toggleDetails.bind(this)}>
                <h5 className="panel-title"><T k='search.title'>Search</T></h5>
            </div>
            {details}
        </div>
        );

    }
}
