import React from 'react';

import { translate as $t } from '../../helpers';

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

    computeTotal(operations) {
        let total = operations
                        .filter(this.props.filterFunction)
                        .reduce((a, b) => a + b.amount, this.props.initialAmount);
        return Math.round(total * 100) / 100;
    }

    getTotal() {
        return this.computeTotal(this.props.operations);
    }

    render() {
        let style = `well ${this.props.backgroundColor}`;

        return (
            <div className={ this.props.size }>
                <div className={ style }>
                    <span className="well-icon">
                        <i className={ `fa fa-${this.props.icon}` }></i>
                    </span>
                    <span className="operation-amount">
                        { this.props.formatCurrency(this.getTotal()) }
                    </span><br/>
                    <span className="well-title">{ this.props.title }</span><br/>
                    <span className="well-sub">{ this.props.subtitle }</span>
                </div>
            </div>
        );
    }
}

export class FilteredAmountWell extends AmountWell {
    render() {
        let style = `well ${this.props.backgroundColor}`;

        let sub = this.props.hasFilteredOperations ?
                    $t('client.amount_well.current_search') :
                    $t('client.amount_well.this_month');

        return (
            <div className={ this.props.size }>
                <div className={ style }>
                    <span className="well-icon">
                        <i className={ `fa fa-${this.props.icon}` }></i>
                    </span>
                    <span className="operation-amount">
                        { this.props.formatCurrency(this.getTotal()) }
                    </span><br/>
                    <span className="well-title">{ this.props.title }</span><br/>
                    <span className="well-sub">{ sub }</span>
                </div>
            </div>
        );
    }
}
