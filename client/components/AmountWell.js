import T from './Translated';

export class AmountWell extends React.Component {
    constructor(props) {
        // this.props = {
        //  backgroundColor,
        //  icon,
        //  title,
        //  subtitle,
        //  operations,
        //  initialAmount,
        //  filterFunction
        // }
        super(props);
    }

    ComputeTotal(operations) {
        var total = operations
                        .filter(this.props.filterFunction)
                        .reduce((a,b) => a + b.amount, this.props.initialAmount);
        return Math.round(total * 100) / 100;
    }

    getTotal() {
        return this.ComputeTotal(this.props.operations);
    }

    render() {
        let style = "well " + this.props.backgroundColor;

        return (
        <div className={this.props.size}>
            <div className={style}>
                <span className="well-icon">
                    <i className={"fa fa-" + this.props.icon}></i>
                </span>
                <span className="operation-amount">{this.getTotal()} €</span><br/>
                <span className="well-title">{this.props.title}</span><br/>
                <span className="well-sub">{this.props.subtitle}</span>
            </div>
        </div>);
    }
}

export class FilteredAmountWell extends AmountWell {
    constructor(props) {
        // this.props = {
        //  hasFilteredOperations,
        //  filteredOperations,
        //  operations
        // }
        super(props);
    }

    static FilterOperationsThisMonth(operations) {
        var now = new Date();
        return operations.filter(function(op) {
            var d = new Date(op.date);
            return d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth()
        });
    }

    getTotal() {
        if (this.props.hasFilteredOperations)
            return super.ComputeTotal(this.props.filteredOperations);
        return super.ComputeTotal(FilteredAmountWell.FilterOperationsThisMonth(this.props.operations));
    }

    render() {
        let style = "well " + this.props.backgroundColor;

        let filtered = this.props.hasFilteredOperations;
        let sub = filtered
                    ? <T k='amount_well.current_search'>For this search</T>
                    : <T k='amount_well.this_month'>This month</T>;

        return (
        <div className={this.props.size}>
            <div className={style}>
                <span className="well-icon">
                    <i className={"fa fa-" + this.props.icon}></i>
                </span>
                <span className="operation-amount">{this.getTotal()} €</span><br/>
                <span className="well-title">{this.props.title}</span><br/>
                <span className="well-sub">{sub}</span>
            </div>
        </div>);
    }
}
