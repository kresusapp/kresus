import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { assert, translate as $t } from '../../helpers';

import { registerModal } from '../ui/new-modal';
import ModalContent from '../ui/modal-content';
import SaveAndCancel from '../ui/modal-save-and-cancel-button';

import OpCatChartPeriodSelect from '../charts/operations-by-category-period-select';
import OpAmountTypeSelect from './operations-by-amount-type-select';

const MODAL_SLUG = 'charts-default-params';

const DefaultParamsModal = connect(
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
            },

            handleClose() {
                actions.hideModal(dispatch);
            }
        };
    }
)(
    class Content extends React.Component {
        state = {
            isSaveDisabled: true,
            showPositiveOps: this.props.showPositiveOps,
            showNegativeOps: this.props.showNegativeOps
        };

        displayType = this.props.displayType;

        period = this.props.period;

        isSaveButtonDisabled() {
            return (
                this.state.showPositiveOps === this.props.showPositiveOps &&
                this.state.showNegativeOps === this.props.showNegativeOps &&
                this.displayType === this.props.displayType &&
                this.period === this.props.period
            );
        }

        handleSave = () => {
            if (
                this.state.showPositiveOps !== this.props.showPositiveOps ||
                this.state.showNegativeOps !== this.props.showNegativeOps
            ) {
                this.props.setAmountType(this.state.showPositiveOps, this.state.showNegativeOps);
            }

            if (this.displayType !== this.props.displayType) {
                this.props.setDisplayType(this.displayType);
            }

            if (this.period !== this.props.period) {
                this.props.setPeriod(this.period);
            }
            this.props.handleClose();
        };

        handleDisplayTypeChange = event => {
            this.displayType = event.target.value;
            this.setState({ isSaveDisabled: this.isSaveButtonDisabled() });
        };

        handlePeriodChange = event => {
            this.period = event.currentTarget.value;
            this.setState({ isSaveDisabled: this.isSaveButtonDisabled() });
        };

        handleAmountTypeChange = change => {
            let { showPositiveOps, showNegativeOps } = change;
            let isSaveDisabled =
                this.state.isSaveDisabled &&
                (typeof showPositiveOps === 'undefined' &&
                    showPositiveOps === this.props.showPositiveOps) &&
                (typeof showNegativeOps === 'undefined' &&
                    showNegativeOps === this.props.showNegativeOps);
            this.setState({
                ...change,
                isSaveDisabled
            });
        };

        render() {
            const body = (
                <React.Fragment>
                    <div className="form-group clearfix">
                        <label className="col-xs-12 col-md-4" htmlFor="defaultDisplayType">
                            {$t('client.charts.default_display')}
                        </label>

                        <div className="col-xs-12 col-md-8">
                            <select
                                className="form-control"
                                id="defaultDisplayType"
                                onChange={this.handleDisplayTypeChange}
                                defaultValue={this.displayType}>
                                <option value="all">{$t('client.charts.by_category')}</option>
                                <option value="balance">{$t('client.charts.balance')}</option>
                                <option value="earnings">
                                    {$t('client.charts.differences_all')}
                                </option>
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
                                onChange={this.handlePeriodChange}
                                htmlId="defaultChartPeriod"
                            />
                        </div>
                    </div>
                </React.Fragment>
            );

            let footer = (
                <SaveAndCancel
                    onClickSave={this.handleSave}
                    isSaveDisabled={this.state.isSaveDisabled}
                />
            );
            return (
                <ModalContent
                    title={$t('client.general.default_parameters')}
                    body={body}
                    footer={footer}
                />
            );
        }
    }
);

registerModal(MODAL_SLUG, <DefaultParamsModal />);

const ShowParamsButton = connect(null, dispatch => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG);
        }
    };
})(props => (
    <button className="btn btn-default pull-right" onClick={props.handleClick}>
        <span className="fa fa-cog" />
        {$t('client.general.default_parameters')}
    </button>
));

export default ShowParamsButton;
