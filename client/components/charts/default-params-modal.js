import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../store';

import { translate as $t } from '../../helpers';

import Modal from '../ui/modal';
import OpCatChartPeriodSelect from '../charts/operations-by-category-period-select';
import OpCatChartTypeSelect from '../charts/operations-by-category-type-select';

class DefaultParamsModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleSave = this.handleSave.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handlePeriod = this.handlePeriodChange.bind(this);

        this.type = this.props.type;
        this.period = this.props.period;
    }

    handleSave() {
        let close = false;
        if (this.type !== this.props.type) {
            this.props.setType(this.type);
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

    handleTypeChange(event) {
        this.type = event.currentTarget.value;
    }

    handlePeriodChange(event) {
        this.period = event.currentTarget.value;
    }

    render() {
        let modalBody = (<div>
            <div className="form-group clearfix">
                <label
                  htmlFor="defaultChartType"
                  className="col-xs-4 control-label">
                    { $t('client.charts.default_type') }
                </label>
                <div className="col-xs-8">
                    <OpCatChartTypeSelect
                      defaultValue={ this.props.type }
                      onChange={ this.handleTypeChange }
                      ref="defaultChartType"
                      htmlId="defaultChartType"
                    />
                </div>
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

    // The current default chart type
    type: React.PropTypes.string.isRequired,

    // The current default chart period
    period: React.PropTypes.string.isRequired,

    // The function to set the default chart type
    setType: React.PropTypes.func.isRequired,

    // The function to set the default chart period
    setPeriod: React.PropTypes.func.isRequired
};

const Export = connect(state => {
    return {
        type: get.setting(state, 'defaultChartType'),
        period: get.setting(state, 'defaultChartPeriod')
    };
}, dispatch => {
    return {
        setType(val) {
            actions.setSetting(dispatch, 'defaultChartType', val);
        },
        setPeriod(val) {
            actions.setSetting(dispatch, 'defaultChartPeriod', val);
        }
    };
})(DefaultParamsModal);

export default Export;
