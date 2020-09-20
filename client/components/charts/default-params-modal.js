import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';
import { translate as $t } from '../../helpers';

import {
    DEFAULT_CHART_DISPLAY_TYPE,
    DEFAULT_CHART_FREQUENCY,
    DEFAULT_CHART_PERIOD,
    DEFAULT_CHART_TYPE,
} from '../../../shared/settings';

import { registerModal } from '../ui/modal';
import ModalContent from '../ui/modal/content';
import CancelAndSubmit from '../ui/modal/cancel-and-submit-buttons';

import { PeriodSelect, AmountKindSelect } from './category-charts';
import { FrequencySelect } from './in-out-chart';

export const MODAL_SLUG = 'charts-default-params';

const DefaultParamsModal = connect(
    state => {
        let amountKind = get.setting(state, DEFAULT_CHART_TYPE);
        let displayType = get.setting(state, DEFAULT_CHART_DISPLAY_TYPE);
        let period = get.setting(state, DEFAULT_CHART_PERIOD);
        let frequency = get.setting(state, DEFAULT_CHART_FREQUENCY);
        return {
            amountKind,
            displayType,
            period,
            frequency,
        };
    },

    dispatch => {
        return {
            setAmountKind(amountKind) {
                actions.setSetting(dispatch, DEFAULT_CHART_TYPE, amountKind);
            },

            setDisplayType(val) {
                actions.setSetting(dispatch, DEFAULT_CHART_DISPLAY_TYPE, val);
            },

            setPeriod(val) {
                actions.setSetting(dispatch, DEFAULT_CHART_PERIOD, val);
            },

            setFrequency(val) {
                actions.setSetting(dispatch, DEFAULT_CHART_FREQUENCY, val);
            },

            handleClose() {
                actions.hideModal(dispatch);
            },
        };
    }
)(
    class Content extends React.Component {
        state = {
            isSubmitDisabled: true,
            amountKind: this.props.amountKind,
            displayType: this.props.displayType,
            period: this.props.period,
            frequency: this.props.frequency,
        };

        isSubmitDisabled() {
            return (
                this.state.amountKind === this.props.amountKind &&
                this.state.displayType === this.props.displayType &&
                this.state.period === this.props.period &&
                this.state.frequency === this.props.frequency
            );
        }

        handleSubmit = () => {
            if (this.state.amountKind !== this.props.amountKind) {
                this.props.setAmountKind(this.state.amountKind);
            }

            if (this.state.displayType !== this.props.displayType) {
                this.props.setDisplayType(this.state.displayType);
            }

            if (this.state.period !== this.props.period) {
                this.props.setPeriod(this.state.period);
            }

            if (this.state.frequency !== this.props.frequency) {
                this.props.setFrequency(this.state.frequency);
            }

            // TODO create a chain of promises and close only if all the
            // backend actions have succeeded.
            this.props.handleClose();
        };

        handleDisplayTypeChange = event => {
            this.setState({ displayType: event.target.value });
        };

        handlePeriodChange = period => {
            this.setState({ period });
        };

        handleFrequencyChange = frequency => {
            this.setState({ frequency });
        };

        handleChangeAmountKind = amountKind => {
            this.setState({ amountKind });
        };

        render() {
            const body = (
                <form id={MODAL_SLUG} onSubmit={this.handleSubmit}>
                    <div className="cols-with-label">
                        <label htmlFor="defaultDisplayType">
                            {$t('client.charts.default_display')}
                        </label>

                        <select
                            className="form-element-block"
                            id="defaultDisplayType"
                            onChange={this.handleDisplayTypeChange}
                            defaultValue={this.state.displayType}>
                            <option value="all">{$t('client.charts.by_category')}</option>
                            <option value="balance">{$t('client.charts.balance')}</option>
                            <option value="earnings">{$t('client.charts.differences_all')}</option>
                        </select>
                    </div>

                    <h5>{$t('client.charts.category_chart')}</h5>

                    <div className="cols-with-label" id="default-params">
                        <label>{$t('client.charts.default_amount_type')}</label>

                        <AmountKindSelect
                            defaultValue={this.state.amountKind}
                            onChange={this.handleChangeAmountKind}
                        />
                    </div>

                    <div className="cols-with-label">
                        <label htmlFor="defaultChartPeriod">
                            {$t('client.charts.default_period')}
                        </label>
                        <PeriodSelect
                            defaultValue={this.state.period}
                            onChange={this.handlePeriodChange}
                            htmlId="defaultChartPeriod"
                        />
                    </div>

                    <h5>{$t('client.charts.in_out_chart')}</h5>

                    <div className="cols-with-label">
                        <label htmlFor="defaultChartFrequency">
                            {$t('client.charts.default_frequency')}
                        </label>
                        <FrequencySelect
                            defaultValue={this.state.frequency}
                            onChange={this.handleFrequencyChange}
                            htmlId="defaultChartFrequency"
                        />
                    </div>
                </form>
            );

            let footer = (
                <CancelAndSubmit isSubmitDisabled={this.isSubmitDisabled()} formId={MODAL_SLUG} />
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
