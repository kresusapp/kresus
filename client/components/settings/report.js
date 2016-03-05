import { assert, has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

export default class ReportItem extends React.Component {

    constructor(props) {
        super(props);
        this.handleOnSelectChange = this.handleOnSelectChange.bind(this);
        this.handleOnDelete = this.handleOnDelete.bind(this);
    }

    handleOnSelectChange() {
        let newValue = this.refs.selector.getDOMNode().value;
        if (newValue === this.props.alert.order)
            return;
        Actions.updateAlert(this.props.alert, { frequency: newValue });
    }

    handleOnDelete() {
        Actions.deleteAlert(this.props.alert);
    }

    render() {
        let { account, alert } = this.props;

        has(alert, 'frequency');
        assert(alert.type === 'report');

        return (
            <tr>
                <td className="col-md-3">{ account.title }</td>
                <td className="col-md-3">
                    <span className="condition">
                        { $t('client.settings.emails.send_report') }
                    </span>
                </td>
                <td className="col-md-5 frequency">
                    <select className="form-control pull-right"
                      defaultValue={ alert.frequency }
                      ref="selector"
                      onChange={ this.handleOnSelectChange }>
                        <option value="daily">
                            { $t('client.settings.emails.daily') }
                        </option>
                        <option value="weekly">
                            { $t('client.settings.emails.weekly') }
                        </option>
                        <option value="monthly">
                            { $t('client.settings.emails.monthly') }
                        </option>
                    </select>
                </td>
                <td className="col-md-1">
                    <span className="pull-right fa fa-times-circle" aria-label="remove"
                      data-toggle="modal"
                      data-target={ `#confirmDeleteAlert${alert.id}` }
                      title={ $t('client.settings.emails.delete_report') }>
                    </span>

                    <ConfirmDeleteModal
                      modalId={ `confirmDeleteAlert${alert.id}` }
                      modalBody={ $t('client.settings.emails.delete_report_full_text') }
                      onDelete={ this.handleOnDelete }
                    />
                </td>
            </tr>
        );
    }
}
