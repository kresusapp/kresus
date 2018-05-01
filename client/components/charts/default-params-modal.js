import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { actions, get } from '../../store';

import { assert, translate as $t } from '../../helpers';

import Modal from '../ui/modal';

import OpCatChartPeriodSelect from '../charts/operations-by-category-period-select';
import OpAmountTypeSelect from './operations-by-amount-type-select';

class DefaultParamsModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleSave = this.handleSave.bind(this);
        this.handleDisplayTypeChange = this.handleDisplayTypeChange.bind(this);
        this.handleAmountTypeChange = this.setState.bind(this);
        this.handlePeriod = this.handlePeriodChange.bind(this);

        this.displayType = this.props.displayType;
        this.period = this.props.period;

        this.state = {
            showPositiveOps: props.showPositiveOps,
            showNegativeOps: props.showNegativeOps
        };
    }

    handleSave() {
        let close = false;

        if (
            this.state.showPositiveOps !== this.props.showPositiveOps ||
            this.state.showNegativeOps !== this.props.showNegativeOps
        ) {
            this.props.setAmountType(this.state.showPositiveOps, this.state.showNegativeOps);
            close = true;
        }

        if (this.displayType !== this.props.displayType) {
            this.props.setDisplayType(this.displayType);
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

    handleDisplayTypeChange(event) {
        this.displayType = event.target.value;
    }

    handlePeriodChange(event) {
        this.period = event.currentTarget.value;
    }

    render() {
        let modalBody = (
            <div>
                <div className="form-group clearfix">
                    <label className="col-xs-12 col-md-4" htmlFor="defaultDisplayType">
                        {$t('client.charts.default_display')}
                    </label>

                    <div className="col-xs-12 col-md-8">
                        <select
                            className="form-element-block"
                            id="defaultDisplayType"
                            onChange={this.handleDisplayTypeChange}
                            defaultValue={this.displayType}>
                            <option value="all">{$t('client.charts.by_category')}</option>
                            <option value="balance">{$t('client.charts.balance')}</option>
                            <option value="earnings">{$t('client.charts.differences_all')}</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <h5 className="col-xs-12">{$t('client.charts.category_chart')}</h5>
                </div>

                <div className="form-group clearfix">
                    <label className="col-xs-12 col-md-4">
                        {$t('client.charts.default_amount_type')}
                    </label>

                    <OpAmountTypeSelect
                        className="col-xs-12 col-md-8"
                        showPositiveOps={this.state.showPositiveOps}
                        showNegativeOps={this.state.showNegativeOps}
                        onChange={this.handleAmountTypeChange}
                    />
                </div>

                <div className="form-group clearfix">
                    <label
                        htmlFor="defaultChartPeriod"
                        className="col-xs-12 col-md-4 control-label">
                        {$t('client.charts.default_period')}
                    </label>
                    <div className="col-xs-12 col-md-8">
                        <OpCatChartPeriodSelect
                            defaultValue={this.props.period}
                            onChange={this.handlePeriod}
                            htmlId="defaultChartPeriod"
                        />
                    </div>
                </div>
            </div>
        );

        let modalFooter = (
            <div>
                <input
                    type="button"
                    className="btn btn-default"
                    data-dismiss="modal"
                    value={$t('client.general.cancel')}
                />
                <input
                    type="submit"
                    className="btn btn-success"
                    value={$t('client.general.save')}
                    onClick={this.handleSave}
                />
            </div>
        );

        return (
            <Modal
                modalId={this.props.modalId}
                modalBody={modalBody}
                modalTitle={$t('client.general.default_parameters')}
                modalFooter={modalFooter}
            />
        );
    }
}

DefaultParamsModal.propTypes = {
    // Unique identifier of the modal.
    modalId: PropTypes.string.isRequired,

    // Whether to display positive operations.
    showPositiveOps: PropTypes.bool.isRequired,

    // Whether to display negative operations.
    showNegativeOps: PropTypes.bool.isRequired,

    // The function to set the default amount type.
    setAmountType: PropTypes.func.isRequired,

    // The current default chart display type.
    displayType: PropTypes.string.isRequired,

    // The function to set the default chart display type.
    setDisplayType: PropTypes.func.isRequired,

    // The current default chart period.
    period: PropTypes.string.isRequired,

    // The function to set the default chart period.
    setPeriod: PropTypes.func.isRequired
};

const Export = connect(
    state => {
        let amountType = get.setting(state, 'defaultChartType');
        let showPositiveOps = ['all', 'positive'].includes(amountType);
        let showNegativeOps = ['all', 'negative'].includes(amountType);
        let displayType = get.setting(state, 'defaultChartDisplayType');
        let period = get.setting(state, 'defaultChartPeriod');

        return {
            showPositiveOps,
            showNegativeOps,
            displayType,
            period
        };
    },
    dispatch => {
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
                assert(type !== null);
                actions.setSetting(dispatch, 'defaultChartType', type);
            },

            setDisplayType(val) {
                actions.setSetting(dispatch, 'defaultChartDisplayType', val);
            },

            setPeriod(val) {
                actions.setSetting(dispatch, 'defaultChartPeriod', val);
            }
        };
    }
)(DefaultParamsModal);

export default Export;
