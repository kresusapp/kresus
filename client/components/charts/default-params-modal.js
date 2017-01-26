import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import Modal from '../ui/modal';
import OpCatChartPeriodSelect from '../charts/operations-by-category-period-select';
import OpAmountTypeSelect from './operations-by-amount-type-select';

class DefaultParamsModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleSave = this.handleSave.bind(this);
        this.handleAmountTypeChange = this.setState.bind(this);
        this.handlePeriod = this.handlePeriodChange.bind(this);

        this.period = this.props.period;

        this.state = {
            showPositiveOps: props.showPositiveOps,
            showNegativeOps: props.showNegativeOps
        };
    }

    handleSave() {
        let close = false;

        if (this.state.showPositiveOps !== this.props.showPositiveOps ||
            this.state.showNegativeOps !== this.props.showNegativeOps) {
            this.props.setAmountType(this.state.showPositiveOps, this.state.showNegativeOps);
            close = true;
        }

        if (this.period !== this.props.period) {
            this.props.setPeriod(this.period);
            close = true;
        }

        if (close) {
            $(`#${this.props.modalId}`).modal('toggle');
        }
    }

    handlePeriodChange(event) {
        this.period = event.currentTarget.value;
    }

    render() {
        let modalBody = (<div>
            <div className="form-group clearfix">
                <label className="col-md-4 col-xs-12">
                    { $t('client.charts.default_amount_type') }
                </label>

                <OpAmountTypeSelect
                  className="col-md-8 col-xs-12"
                  showPositiveOps={ this.state.showPositiveOps }
                  showNegativeOps={ this.state.showNegativeOps }
                  onChange={ this.handleAmountTypeChange }
                />
            </div>

            <div className="form-group clearfix">
                <label
                  htmlFor="defaultChartPeriod"
                  className="col-xs-4 control-label">
                    { $t('client.charts.default_period') }
                </label>
                <div className="col-xs-8">
                    <OpCatChartPeriodSelect
                      defaultValue={ this.props.period }
                      onChange={ this.handlePeriod }
                      ref="defaultChartPeriod"
                      htmlId="defaultChartPeriod"
                    />
                </div>
            </div>
        </div>);

        let modalFooter = (
            <div>
                <input
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal"
                  value={ $t('client.general.cancel') }
                />
                <input
                  type="submit"
                  className="btn btn-success"
                  value={ $t('client.general.save') }
                  onClick={ this.handleSave }
                />
            </div>
        );

        return (
            <Modal
              modalId={ this.props.modalId }
              modalBody={ modalBody }
              modalTitle={ $t('client.general.default_parameters') }
              modalFooter={ modalFooter }
            />
        );
    }
}

DefaultParamsModal.propTypes = {
    // Unique identifier of the modal
    modalId: React.PropTypes.string.isRequired,

    // Whether to display positive operations
    showPositiveOps: React.PropTypes.bool.isRequired,

    // Whether to display negative operations
    showNegativeOps: React.PropTypes.bool.isRequired,

    // The function to set the default chart type
    setAmountType: React.PropTypes.func.isRequired,

    // The current default chart period
    period: React.PropTypes.string.isRequired,

    // The function to set the default chart period
    setPeriod: React.PropTypes.func.isRequired
};

const Export = connect(state => {
    let amountType = get.setting(state, 'defaultChartType');

    return {
        showPositiveOps: ['all', 'positive'].includes(amountType),
        showNegativeOps: ['all', 'negative'].includes(amountType),
        period: get.setting(state, 'defaultChartPeriod')
    };
}, dispatch => {
    return {
        setAmountType(showPositiveOps, showNegativeOps) {
            let type = null;
            if (showPositiveOps && showNegativeOps) {
                type = 'all';
            } else if (showPositiveOps) {
                type = 'positive';
            } else if (showNegativeOps) {
                type = 'negative';
            }

            if (type !== null) {
                actions.setSetting(dispatch, 'defaultChartType', type);
            }
        },

        setPeriod(val) {
            actions.setSetting(dispatch, 'defaultChartPeriod', val);
        }
    };
})(DefaultParamsModal);

export default Export;
