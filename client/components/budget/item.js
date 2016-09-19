import React from 'react';

import { assertHas } from '../../helpers';

export default class BudgetListItem extends React.Component {

    constructor(props) {
        assertHas(props, 'cat');
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSeeOperationsClick = this.viewOperations.bind(this);
    }

    handleChange() {
        let threshold = Number.parseFloat(this.refs.threshold.value);
        if (isNaN(threshold)) {
            return;
        }

        let category = {
            title: this.props.cat.title,
            color: this.props.cat.color,
            threshold: Math.abs(threshold)
        };

        this.props.updateCategory(this.props.cat, category);
    }

    viewOperations() {
        this.props.showOperations(this.props.cat.id);
    }

    render() {
        let c = this.props.cat;
        let amount = 0;
        let remaining = 0;
        let threshold = c.threshold || 0;
        let classNames = 'progress-bar';

        for (let op of this.props.operations) {
            amount += op.amount;
        }

        amount = Math.abs(amount);

        let amountPct = amount ? 1 : 0;

        if (threshold > 0) {
            remaining = threshold - amount;
            amountPct = amount * 100 / threshold;

            if (amountPct > 100)
                amountPct = 100;

            if (amountPct === 100)
                classNames += ' progress-bar-danger';
            else if (amountPct > 75)
                classNames += ' progress-bar-warning';
            else if (amountPct)
                classNames += ' progress-bar-success';
        }
        else
            classNames += ' progress-bar-striped';

        return (
            <tr key={ c.id }>
                <td>
                    <span className="color_block_small"
                      style={ { backgroundColor: c.color } }>
                      &nbsp;
                    </span> { c.title }
                </td>
                <td>
                    <div className="progress budget">
                        <div className={ classNames }
                          role="progressbar"
                          aria-valuenow={ amount }
                          aria-valuemin="0"
                          aria-valuemax={ threshold || amount }
                          style={ { minWidth: '2em', width: amountPct + '%' } }>
                          { amount }
                        </div>
                    </div>
                </td>
                <td>
                    <input
                      ref="threshold"
                      type="number"
                      step="any"
                      min="0"
                      onChange={ this.handleChange }
                      defaultValue={ threshold }
                    />
                </td>
                <td>
                    { threshold ? remaining : '-' }
                </td>
                <td>
                    <button className="btn btn-sm btn-info fa fa-briefcase"
                      onClick={ this.handleSeeOperationsClick }></button>
                </td>
            </tr>
        );
    }
}
