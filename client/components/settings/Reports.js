import { translate as $t } from '../../helpers';
import { State, store } from '../../store';

import ReportItem from './ReportItem';
import ReportCreationModal from './ReportCreationModal';

export default class Reports extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            alerts: store.getAlerts('report')
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
            alerts: store.getAlerts('report')
        });
    }

    render() {

        let pairs = this.state.alerts;
        let items = pairs.map(pair => <ReportItem alert={ pair.alert } account={ pair.account } />);

        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.settings.emails.reports_title') }
                    </h3>

                    <div className="panel-options">
                        <span className="option-legend fa fa-plus-circle" aria-label="create report"
                          data-toggle="modal" data-target="#report-creation">
                        </span>
                    </div>
                </div>

                <ReportCreationModal />

                <div className="panel-body">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{ $t('client.settings.emails.account') }</th>
                                <th>{ $t('client.settings.emails.details') }</th>
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
