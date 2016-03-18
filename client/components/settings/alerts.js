import React from 'react';

import { has, translate as $t } from '../../helpers';
import { store, State } from '../../store';

import AlertCreationModal from './create-alert-modal';
import AlertItem from './alert';

export default class Alerts extends React.Component {

    constructor(props) {
        has(props, 'alertType');
        has(props, 'sendIfText');
        has(props, 'titleTranslationKey');
        has(props, 'panelTitleKey');
        super(props);
        this.state = {
            alerts: store.getAlerts(this.props.alertType)
        };
        this.onAlertChange = this.onAlertChange.bind(this);
    }

    componentDidMount() {
        store.on(State.alerts, this.onAlertChange);
    }
    componentWillUnmount() {
        store.removeListener(State.alerts, this.onAlertChange);
    }

    onAlertChange() {
        this.setState({
            alerts: store.getAlerts(this.props.alertType)
        });
    }

    render() {

        let pairs = this.state.alerts;
        let items = pairs.map(pair =>
            <AlertItem
              key={ pair.alert.id }
              alert={ pair.alert }
              account={ pair.account }
              sendIfText={ this.props.sendIfText }
            />
        );

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t(this.props.panelTitleKey) }
                    </h3>

                    <div className="panel-options">
                        <span className="option-legend fa fa-plus-circle" aria-label="create alert"
                          data-toggle="modal"
                          data-target={ `#alert-${this.props.alertType}-creation` }>
                        </span>
                    </div>
                </div>

                <AlertCreationModal
                  modalId={ `alert-${this.props.alertType}-creation` }
                  alertType={ this.props.alertType }
                  titleTranslationKey={ this.props.titleTranslationKey }
                  sendIfText={ this.props.sendIfText }
                />

                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{ $t('client.settings.emails.account') }</th>
                                <th>{ $t('client.settings.emails.details') }</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            { items }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
