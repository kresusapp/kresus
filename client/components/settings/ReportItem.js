import { assert, has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default class ReportItem extends React.Component {

    constructor(props) {
        super(props);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onSelectChange() {
        let newValue = this.refs.selector.getDOMNode().value;
        if (newValue === this.props.alert.order)
            return;
        Actions.UpdateAlert(this.props.alert, {frequency: newValue});
    }

    onDelete() {
        Actions.DeleteAlert(this.props.alert);
    }

    render() {
        let {account, alert} = this.props;

        has(alert, 'frequency');
        assert(alert.type === 'report');

        return <tr>
            <td>{account.title}</td>
            <td>
                <div className="form-inline">
                    <span>{$t('client.settings.emails.send_report')}&nbsp;</span>

                    <select className="form-control"
                      defaultValue={alert.frequency}
                      ref="selector"
                      onChange={this.onSelectChange}
                    >
                        <option value="daily">{$t('client.settings.emails.daily')}</option>
                        <option value="weekly">{$t('client.settings.emails.weekly')}</option>
                        <option value="monthly">{$t('client.settings.emails.monthly')}</option>
                    </select>
                </div>
            </td>
            <td>
                <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                  data-toggle="modal" data-target={'#confirmDeleteAlert' + alert.id}
                  title={$t("client.settings.emails.delete_report")}>
                    <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                </button>

                <ConfirmDeleteModal
                    modalId={'confirmDeleteAlert' + alert.id}
                    modalBody={$t('client.settings.emails.delete_report_full_text')}
                    onDelete={this.onDelete}
                />
            </td>
        </tr>;
    }
}


