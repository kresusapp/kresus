import React from 'react';
import { connect } from 'react-redux';

import { assertHas, translate as $t } from '../../../helpers';
import { get } from '../../../store';

import AlertCreationModal from './alert-form-modal';
import AlertItem from './alert-item';

class Alerts extends React.Component {

    constructor(props) {
        assertHas(props, 'alertType');
        assertHas(props, 'sendIfText');
        assertHas(props, 'titleTranslationKey');
        assertHas(props, 'panelTitleKey');
        super(props);
    }

    render() {

        let items = this.props.alerts.map(pair =>
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
                        <span
                          className="option-legend fa fa-plus-circle"
                          aria-label="create alert"
                          data-toggle="modal"
                          data-target={ `#alert-${this.props.alertType}-creation` }
                        />
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
                                <th />
                                <th />
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

const Export = connect((state, props) => {
    return {
        alerts: get.alerts(state, props.alertType)
    };
})(Alerts);

export default Export;
