import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import OpCatChartPeriodSelect from '../../charts/operations-by-category-period-select';
import OpCatChartTypeSelect from '../../charts/operations-by-category-type-select';

class DefaultParameters extends React.Component {

    constructor(props) {
        super(props);
        this.handleDuplicateThresholdChange = this.handleDuplicateThresholdChange.bind(this);
        this.handleDefaultChartTypeChange = this.handleDefaultChartTypeChange.bind(this);
        this.handleDefaultChartPeriodChange = this.handleDefaultChartPeriodChange.bind(this);
    }

    handleDuplicateThresholdChange() {
        let val = this.refs.duplicateThreshold.value;
        this.props.setDuplicateThreshold(val);
        return true;
    }

    handleDefaultChartTypeChange() {
        let val = this.refs.defaultChartType.getValue();
        this.props.setDefaultChartType(val);
        return true;
    }

    handleDefaultChartPeriodChange() {
        let val = this.refs.defaultChartPeriod.getValue();
        this.props.setDefaultChartPeriod(val);
        return true;
    }

    render() {
        return (
            <form className="form-horizontal">
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{ $t('client.similarity.title') }</h3>
                    </div>

                    <div className="panel-body">
                        <div className="form-group">
                            <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">
                                { $t('client.settings.duplicate_threshold') }
                            </label>
                            <div className="col-xs-8">
                                <div className="input-group">
                                    <input
                                      id="duplicateThreshold" ref="duplicateThreshold"
                                      type="number" className="form-control"
                                      min="0" step="1"
                                      value={ this.props.duplicateThreshold }
                                      onChange={ this.handleDuplicateThresholdChange }
                                    />
                                    <span className="input-group-addon">
                                        { $t('client.units.hours') }
                                    </span>
                                </div>
                                <span className="help-block">
                                    { $t('client.settings.duplicate_help') }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">{ $t('client.charts.title') }</h3>
                    </div>

                    <div className="panel-body">
                        <div className="form-group">
                            <label htmlFor="defaultChartType" className="col-xs-4 control-label">
                                { $t('client.settings.default_chart_type') }
                            </label>
                            <div className="col-xs-8">
                                <OpCatChartTypeSelect
                                  defaultValue={ this.props.defaultChartType }
                                  onChange={ this.handleDefaultChartTypeChange }
                                  ref="defaultChartType"
                                  htmlId="defaultChartType"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="defaultChartPeriod" className="col-xs-4 control-label">
                                { $t('client.settings.default_chart_period') }
                            </label>
                            <div className="col-xs-8">
                                <OpCatChartPeriodSelect
                                  defaultValue={ this.props.defaultChartPeriod }
                                  onChange={ this.handleDefaultChartPeriodChange }
                                  ref="defaultChartPeriod"
                                  htmlId="defaultChartPeriod"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
}

export default connect(state => {
    return {
        duplicateThreshold: get.setting(state, 'duplicateThreshold'),
        defaultChartType: get.setting(state, 'defaultChartType'),
        defaultChartPeriod: get.setting(state, 'defaultChartPeriod')
    };
}, dispatch => {
    return {
        setDuplicateThreshold(val) {
            actions.setSetting(dispatch, 'duplicateThreshold', val);
        },
        setDefaultChartType(val) {
            actions.setSetting(dispatch, 'defaultChartType', val);
        },
        setDefaultChartPeriod(val) {
            actions.setSetting(dispatch, 'defaultChartPeriod', val);
        }
    };
})(DefaultParameters);
