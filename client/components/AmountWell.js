import {translate as t} from '../Helpers';

export default class AmountWell extends React.Component {
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

    computeTotal() {
        var total = this.props.operations
                        .filter(this.props.filterFunction)
                        .reduce((a,b) => a + b.amount, this.props.initialAmount);
        return (total * 100 | 0) / 100;
    }

    render() {
        let style = "well " + this.props.backgroundColor;

        return (
        <div className={this.props.size}>
            <div className={style}>
                <span className="operation-amount">{this.computeTotal()} €</span><br/>
                <span className="well-title">{this.props.title}</span><br/>
                <span className="well-sub">{this.props.subtitle}</span>
            </div>
        </div>);
    }
}
