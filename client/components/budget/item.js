import React from 'react';

import AmountInput from '../ui/amount-input';

class BudgetListItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleViewOperations = this.viewOperations.bind(this);
    }

    handleChange(threshold) {
        if (this.props.cat.threshold === threshold || Number.isNaN(threshold)) {
            return;
        }

        let category = {
            title: this.props.cat.title,
            color: this.props.cat.color,
            threshold
        };

        this.props.updateCategory(this.props.cat, category);
    }

    viewOperations() {
        this.props.showOperations(this.props.cat.id);
    }

    render() {
        let amount = this.props.operations.reduce((acc, op) => acc + op.amount, 0);
        amount = Math.abs(amount);
        amount = parseFloat(amount.toFixed(2));

        let remaining = 0;
        let classNames = 'progress-bar';
        let amountPct = amount ? 1 : 0;

        let c = this.props.cat;
        let threshold = c.threshold;
        if (threshold > 0) {
            remaining = threshold - amount;
            remaining = parseFloat(remaining.toFixed(2));
            amountPct = Math.min(100, amount * 100 / threshold);
            amountPct = parseFloat(amountPct.toFixed(2));

            if (amountPct === 100) {
                classNames += ' progress-bar-danger';
            } else if (amountPct > 75) {
                classNames += ' progress-bar-warning';
            } else if (amountPct) {
                classNames += ' progress-bar-success';
            }
        } else {
            classNames += ' progress-bar-striped';
        }

        return (
            <tr key={ c.id }>
                <td>
                    <span
                      className="color_block_small"
                      style={ { backgroundColor: c.color } }>
                      &nbsp;
                    </span> { c.title }
                </td>
                <td>
                    <div className="progress budget">
                        <div
                          className={ classNames }
                          role="progressbar"
                          aria-valuenow={ amount }
                          aria-valuemin="0"
                          aria-valuemax={ threshold || amount }
                          style={ { minWidth: '2vw', width: `${amountPct}%` } }>
                            { amount }
                            <span className="hidden-lg">
                                { threshold ? `/${threshold}` : '' }
                            </span>
                        </div>
                    </div>
                </td>
                <td className="hidden-xs">
                    <AmountInput
                      isInitiallyNegative={ false }
                      togglable={ false }
                      onChange={ this.handleChange }
                      defaultValue={ threshold }
                      signId={ c.id }
                    />
                </td>
                <td className="hidden-xs">
                    { threshold ? remaining : '-' }
                </td>
                <td className="hidden-xs">
                    <button
                      className="btn btn-sm btn-info fa fa-search"
                      onClick={ this.handleViewOperations }
                    />
                </td>
            </tr>
        );
    }
}

BudgetListItem.propTypes = {
    // The category related to this budget item.
    cat: React.PropTypes.object.isRequired,

    // The list of operations for the related category/period.
    operations: React.PropTypes.array.isRequired,

    // The method to update a category.
    updateCategory: React.PropTypes.func.isRequired,

    // A method to display the reports component inside the main app, pre-filled
    // with the year/month and category filters.
    showOperations: React.PropTypes.func.isRequired
};

export default BudgetListItem;
