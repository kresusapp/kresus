import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { assert, translate as $t } from '../../helpers';

import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';
import CancelAndSave from '../ui/modal/cancel-and-save-buttons';

import OpCatChartPeriodSelect from '../charts/operations-by-category-period-select';
import OpAmountTypeSelect from './operations-by-amount-type-select';

export const MODAL_SLUG = 'charts-default-params';

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

        isSaveDisabled({ showPositiveOps, showNegativeOps }) {
            return (
                showPositiveOps === this.props.showPositiveOps &&
                showNegativeOps === this.props.showNegativeOps &&
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

            // TODO create a chain of promises and close only if all the
            // backend actions have succeeded.
            this.props.handleClose();
        };

        handleDisplayTypeChange = event => {
            this.displayType = event.target.value;
            this.setState({ isSaveDisabled: this.isSaveDisabled(this.state) });
        };

        handlePeriodChange = event => {
            this.period = event.currentTarget.value;
            this.setState({ isSaveDisabled: this.isSaveDisabled(this.state) });
        };

        handleAmountTypeChange = change => {
            let { showPositiveOps, showNegativeOps } = change;

            showPositiveOps =
                typeof showPositiveOps !== 'undefined'
                    ? showPositiveOps
                    : this.state.showPositiveOps;
            showNegativeOps =
                typeof showNegativeOps !== 'undefined'
                    ? showNegativeOps
                    : this.state.showNegativeOps;
            let isSaveDisabled = this.isSaveDisabled({ showPositiveOps, showNegativeOps });

            this.setState({
                ...change,
                isSaveDisabled
            });
        };

        render() {
            const body = (
                <React.Fragment>
                    <div className="cols-with-label">
                        <label htmlFor="defaultDisplayType">
                            {$t('client.charts.default_display')}
                        </label>

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

                    <h5>{$t('client.charts.category_chart')}</h5>

                    <div className="cols-with-label" id="default-params">
                        <label>{$t('client.charts.default_amount_type')}</label>

                        <OpAmountTypeSelect
                            showPositiveOps={this.state.showPositiveOps}
                            showNegativeOps={this.state.showNegativeOps}
                            onChange={this.handleAmountTypeChange}
                        />
                    </div>

                    <div className="cols-with-label">
                        <label htmlFor="defaultChartPeriod">
                            {$t('client.charts.default_period')}
                        </label>
                        <OpCatChartPeriodSelect
                            defaultValue={this.props.period}
                            onChange={this.handlePeriodChange}
                            htmlId="defaultChartPeriod"
                        />
                    </div>
                </React.Fragment>
            );

            let footer = (
                <CancelAndSave
                    onSave={this.handleSave}
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

registerModal(MODAL_SLUG, () => <DefaultParamsModal />);
