import React from 'react';

import { translate as $t } from '../../helpers';
import { Actions, store } from '../../store';

import OpCatChartPeriodSelect from '../shared/operations-by-category-period-select';
import OpCatChartTypeSelect from '../shared/operations-by-category-type-select';

export default class DefaultParameters extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            duplicateThreshold: store.getSetting('duplicateThreshold'),
            defaultChartType: store.getSetting('defaultChartType'),
            defaultChartPeriod: store.getSetting('defaultChartPeriod')
        };

        this.handleDuplicateThresholdChange = this.handleDuplicateThresholdChange.bind(this);
        this.handleDefaultChartTypeChange = this.handleDefaultChartTypeChange.bind(this);
        this.handleDefaultChartPeriodChange = this.handleDefaultChartPeriodChange.bind(this);
    }

    handleDuplicateThresholdChange() {
        let val = this.refs.duplicateThreshold.value;
        Actions.changeSetting('duplicateThreshold', val);
        this.setState({
            duplicateThreshold: val
        });
        return true;
    }

    handleDefaultChartTypeChange() {
        let val = this.refs.defaultChartType.getValue();
        Actions.changeSetting('defaultChartType', val);
        this.setState({
            defaultChartType: val
        });
        return true;
    }

    handleDefaultChartPeriodChange() {
        let val = this.refs.defaultChartPeriod.getValue();
        Actions.changeSetting('defaultChartPeriod', val);
        this.setState({
            defaultChartPeriod: val
        });
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
                                    <input id="duplicateThreshold" ref="duplicateThreshold"
                                      type="number" className="form-control"
                                      min="0" step="1"
                                      value={ this.state.duplicateThreshold }
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
                                  defaultValue={ this.state.defaultChartType }
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
                                  defaultValue={ this.state.defaultChartPeriod }
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
