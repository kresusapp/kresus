import React from 'react';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import CategorySelect from './category-select';
import DatePicker from '../ui/date-picker';
import { DetailedSubOperation } from './detailed-operation';

class SubOpEditForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryId: NONE_CATEGORY_ID,
            amount: this.props.amount,
            title: this.props.title,
            date: this.props.date,
            isAmountOK: false,
            isLabelOK: false
        };
        this.handleChangeLabel = this.handleChangeLabel.bind(this);
        this.handleSelectCategory = this.handleSelectCategory.bind(this);
        this.handleSelectDate = this.handleSelectDate.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
    }

    handleChangeLabel(event) {
        let title = event.target.value;
        this.setState({ title });
    }

    handleChangeAmount(event) {
        let amount = event.target.value;
        this.setState({ amount }, this.props.onChangeAmount);
    }

    handleSelectCategory(categoryId) {
        this.setState({ categoryId });
    }

    handleSelectDate(date) {
        this.setState({ date });
    }

    getOperationAmount() {
        return this.state.amount;
    }

    getOperation() {
        let operation = {
            amount: this.state.amount,
            title: this.state.title,
            date: this.state.date,
            categoryId: this.state.categoryId,
            type: this.props.type,
            bankAccount: this.props.bankAccount
        };
        if (this.props.id) {
            operation.id = this.props.id;
        }
        return operation;
    }

    render() {
        return (
            <li>
                <div className="row">
                    <div className="form-group col-sm-12">
                        <div className="input-group">
                            <span className="input-group-addon">
                                <i className="fa fa-pencil"></i>
                            </span>
                            <input className="form-control" type="text"
                              defaultValue={ this.props.title }
                              onChange={ this.handleChangeLabel }
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="form-group col-sm-4"
                      aria-title={ $t('client.split_operations.amount') }>
                        <div className="input-group">

                            <input className="form-control" type="number" step="0.01"
                              onChange={ this.handleChangeAmount }
                              defaultValue={ this.props.amount }
                            />
                            <span className="input-group-addon">
                                <i className="fa fa-euro"></i>
                            </span>
                        </div>
                    </div>
                    <div className="form-group col-sm-4">
                        <div className="input-group">
                            <span className="input-group-addon">
                                <i className="fa fa-calendar-o"></i>
                            </span>
                            <DatePicker
                              ref="datepicker"
                              onSelect={ this.handleSelectDate }
                              minDate={ this.props.minDate }
                              defaultValue={ this.props.date }
                            />
                        </div>
                    </div>
                    <div className="form-group col-sm-4">
                        <CategorySelect
                          operation={ this.state }
                          categories= { this.props.categories }
                          onSelectId={ this.handleSelectCategory }
                          getCategoryTitle={ this.props.getCategoryTitle }
                        />
                    </div>
                </div>
            </li>
        );
    }
}
SubOpEditForm.propTypes = {
    minDate: React.PropTypes.instanceOf(Date).isRequired,
    amount: React.PropTypes.number.isRequired,
    title: React.PropTypes.string.isRequired,
    date: React.PropTypes.instanceOf(Date).isRequired,
    onChangeAmount: React.PropTypes.func.isRequired,
    categories: React.PropTypes.array.isRequired,
    getCategoryTitle: React.PropTypes.func.isRequired
};
class SubOperations extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: this.props.editMode,
            amountTotalIsCorrect: true,
            allAmountsAreCorrect: false
        };
        this.handleToggleEdit = this.handleToggleEdit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.operation.id !== this.props.operation.id) {
            this.setState({ editMode: false });
        }
    }

    handleToggleEdit() {
        this.setState({ editMode: !this.state.editMode });
    }

    handleSave() {
        let subOps = this.refs.subOps.getSubOperations();
        this.props.onSubOperationsUpdate(this.props.operation, subOps);
        this.handleToggleEdit();
    }

    handleDelete() {
        this.props.onSubOperationsUpdate(this.props.operation, []);
        this.setState({ editMode: false });
    }

    handleChangeAmount(sumOfAmounts, allOpValid) {
        let amountTotalIsCorrect = Math.abs((sumOfAmounts - this.props.operation.amount)) < 0.01;
        let allAmountsAreCorrect = allOpValid;
        this.setState({ amountTotalIsCorrect, allAmountsAreCorrect });
    }

    render() {
        let subOps;
        if (this.state.editMode) {
            subOps = (
                <SubOperationsEditMode
                  ref="subOps"
                  operation={ this.props.operation }
                  subOperations={ this.props.subOperations }
                  categories={ this.props.categories }
                  getCategoryTitle={ this.props.getCategoryTitle }
                  onToggleEdit={ this.handleToggleEdit }
                  onChangeAmount={ this.handleChangeAmount }
                />
            );
        } else {
            subOps = this.props.subOperations.map((subOp, index) => {
                let maybeHr = index < this.props.subOperations.length - 1 ? <hr/> : '';
                return (
                    <div key={ `subOp${index}` }>
                        <DetailedSubOperation
                          operation={ subOp }
                          formatCurrency={ this.props.formatCurrency }
                          getCategoryTitle={ this.props.getCategoryTitle }
                        />
                        { maybeHr }
                    </div>
                );
            });
        }

        let maybeDeleteButton = '';

        // Show the delete button only if there are some subops
        if (this.props.subOperations.length > 0) {
            maybeDeleteButton = (
                <button className="btn btn-danger" onClick={ this.handleDelete }>
                    { $t('client.split_operations.delete') }
                </button>
            );
        }

        let maybeCancelButton = '';
        if (this.state.editMode) {
            maybeCancelButton = (
                <button className="btn btn-warning" onClick={ this.handleToggleEdit }>
                    { $t(`client.split_operations.cancel`) }
                </button>
            );
        }


        let maybeCreateModifyButton = '';
        if (!this.state.editMode) {
            maybeCreateModifyButton = (
                <button className="btn btn-primary" onClick={ this.handleToggleEdit }>
                    { $t(`client.split_operations.${this.props.subOperations.length > 0 ?
                      'modify' : 'create'}`) }
                </button>
            );
        }

        let mayBeSaveButton = '';
        if (this.state.editMode) {
            mayBeSaveButton = (
                <button className="btn btn-primary" onClick={ this.handleSave }
                  disabled={ !this.state.amountTotalIsCorrect || !this.state.allAmountsAreCorrect }>
                    { $t('client.split_operations.save') }
                </button>
            );
        }

        let maybeError = '';
        if (!this.state.amountTotalIsCorrect && this.state.editMode) {
            maybeError = (
                <div className="alert alert-danger">
                    { $t('client.split_operations.wrong_amount_total') }
                </div>
            );
        }

        let maybeError2 = '';
        if (!this.state.allAmountsAreCorrect && this.state.editMode) {
            maybeError2 = (
                <div className="alert alert-danger">
                    { $t('client.split_operations.wrong_amounts') }
                </div>
            );
        }


        return (
            <div>
                <h4>{ $t('client.split_operations.title') }</h4>
                { subOps }
                { maybeError }
                { maybeError2 }
                { maybeDeleteButton }
                { maybeCancelButton }
                { maybeCreateModifyButton }
                { mayBeSaveButton }
            </div>
        );
    }
}
SubOperations.propTypes = {
    operationId: React.PropTypes.string.isRequired,
    categories: React.PropTypes.array.isRequired,
    types: React.PropTypes.array.isRequired,
    formatCurrency: React.PropTypes.func.isRequired,
    getCategoryTitle: React.PropTypes.func.isRequired,
    makeHandleSelectCategory: React.PropTypes.func.isRequired,
    makeHandleSelectType: React.PropTypes.func.isRequired
};

let ConnectedSubOperations = connect((state, props) => {
    let operation = props.operationId ? get.operationById(state, props.operationId) : null;
    let subOperations = props.operationId ?
                        get.operationsByParentOperationId(state, props.operationId) :
                        [];
    return {
        operation,
        subOperations,
        editMode: false
    }; }, dispatch => {
    return {
        onSubOperationsUpdate: (operation, subOperations) => {
            actions.setSubOperations(dispatch, operation, subOperations);
        }
    };
})(SubOperations);

export default ConnectedSubOperations;

class SubOperationsEditMode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subOpsNumber: Math.max(this.props.subOperations.length, 2),
            sumOfAmounts: null
        };

        this.handleChangeOfSubOps = this.handleChangeOfSubOps.bind(this);
        this.handleChangeAmount = this.handleChangeAmount.bind(this);
    }

    handleChangeOfSubOps(e) {
        this.setState({ subOpsNumber: e.target.value });
    }

    getSubOperation(index) {
        let ref = `subOp${index}`;
        return this.refs[ref].getOperation();
    }

    getSubOperations() {
        let operations = [];
        for (let i = 0; i < this.state.subOpsNumber; i++) {
            operations.push(this.getSubOperation(i));
        }
        return operations;
    }

    getSubOperationAmount(index) {
        let ref = `subOp${index}`;
        return this.refs[ref].getOperationAmount();
    }

    handleChangeAmount() {
        let op = this.props.operation;
        let sumOfAmounts = 0;
        let allSubOpsOk = true;
        for (let i = 0; i < this.state.subOpsNumber; i++) {
            let amount = parseFloat(this.getSubOperationAmount(i));
            sumOfAmounts += amount;

            // A sub-operation is valid only if its amount is not 0 and it has the same sign
            // as the paten operation
            let subOpOK = Math.sign(op.amount) === Math.sign(amount) && amount !== 0;
            allSubOpsOk = allSubOpsOk && subOpOK;
        }

        this.props.onChangeAmount(sumOfAmounts, allSubOpsOk);
    }

    render() {
        let operationToSplit = this.props.operation;

        let subOps = [];

        // First add the existing suboperations
        let length = Math.min(this.props.subOperations.length, this.state.subOpsNumber);
        subOps = this.props.subOperations.slice(0, length).map((op, index) =>
            <div key={ `${operationToSplit.id}subOp${index}` }>
                <SubOpEditForm ref={ `subOp${index}` } id={ op.id }
                  minDate={ operationToSplit.date }
                  amount={ op.amount }
                  title={ op.title }
                  date={ op.date }
                  onChangeAmount={ this.handleChangeAmount }
                  getCategoryTitle={ this.props.getCategoryTitle }
                  categories={ this.props.categories }
                  type={ this.props.operation.type }
                  bankAccount={ this.props.operation.bankAccount }
                />
                { index < this.state.subOpsNumber - 1 ? <hr/> : '' }
            </div>
        );

        // Then add empty operations
        for (let i = subOps.length; i <= this.state.subOpsNumber - 1; i++) {
            subOps.push(
                <SubOpEditForm ref={ `subOp${i}` }
                  key={ `${operationToSplit.id}subOp${i}` }
                  minDate={ new Date(operationToSplit.date) }
                  amount={ i === 1 ? operationToSplit.amount : 0 }
                  title={ operationToSplit.customLabel ?
                          operationToSplit.customLabel :
                          operationToSplit.title }
                  date={ new Date(operationToSplit.date) }
                  onChangeAmount={ this.handleChangeAmount }
                  getCategoryTitle={ this.props.getCategoryTitle }
                  categories={ this.props.categories }
                  type={ this.props.operation.type }
                  bankAccount={ this.props.operation.bankAccount }
                />
            );
        }

        return (
            <div>
                <div className="form-group clearfix">
                    <label className="col-xs-6 control-label">
                        { $t('client.split_operations.text') }
                    </label>
                    <div className="col-xs-4 col-xs-offset-2">
                        <input className="form-control"
                          type="number" step="1" defaultValue={ this.state.subOpsNumber }
                          min="2"
                          onChange={ this.handleChangeOfSubOps }
                        />
                    </div>

                </div>

                <ul className="list-group">
                    { subOps }
                </ul>
            </div>
        );
    }
}
SubOperationsEditMode.propTypes = {
    operation: React.PropTypes.object.isRequired,
    categories: React.PropTypes.array.isRequired,
    getCategoryTitle: React.PropTypes.func.isRequired,
    onToggleEdit: React.PropTypes.func.isRequired,
    onChangeAmount: React.PropTypes.func.isRequired
};
