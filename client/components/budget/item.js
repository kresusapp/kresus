import React from 'react';

import { assertHas, translate as $t } from '../../helpers';

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
            alert($t('client.budget.threshold_error'));
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
        let threshold = c.threshold;
        let classNames = 'progress-bar';

        for (let op of this.props.operations) {
            amount += op.amount;
        }

        amount = Math.abs(amount);

        let amountPct = amount ? 1 : 0;

        if (threshold > 0) {
            remaining = threshold - amount;
            amountPct = Math.min(100, amount * 100 / threshold);

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
                          style={ { minWidth: '2em', width: `${amountPct}%` } }>
                          { amount }
                            <span className="hidden-lg">
                            { threshold ? `/${threshold}` : '' }
                            </span>
                        </div>
                    </div>
                </td>
                <td className="hidden-xs">
                    <input
                      ref="threshold"
                      type="number"
                      step="any"
                      min="0"
                      onChange={ this.handleChange }
                      defaultValue={ threshold }
                    />
                </td>
                <td className="hidden-xs">
                    { threshold ? remaining : '-' }
                </td>
                <td className="hidden-xs">
                    <button className="btn btn-sm btn-info fa fa-search"
                      onClick={ this.handleSeeOperationsClick }></button>
                </td>
            </tr>
        );
    }
}
