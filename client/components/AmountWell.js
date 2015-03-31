import {translate as t} from '../Helpers';

export class AmountWell extends React.Component {
    constructor(props) {
        // this.props = {
        //  backgroundColor,
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
        return (total * 100 | 0) / 100;
    }

    getTotal() {
        return this.ComputeTotal(this.props.operations);
    }

    render() {
        let style = "well " + this.props.backgroundColor;

        return (
        <div className={this.props.size}>
            <div className={style}>
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

        return (
        <div className={this.props.size}>
            <div className={style}>
                <span className="operation-amount">{this.getTotal()} €</span><br/>
                <span className="well-title">{this.props.title}</span><br/>
                <span className="well-sub">{
                    filtered
                    ? t('For this search')
                    : t('This month')
                }</span>
            </div>
        </div>);
    }
}
