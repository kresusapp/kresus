import { assert, has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/confirm-delete-modal';

export default class AlertItem extends React.Component {

    constructor(props) {
        has(props, 'alert');
        has(props, 'account');
        has(props, 'sendIfText');
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleChangeLimit = this.handleChangeLimit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleSelect() {
        let newValue = this.refs.select.getDOMNode().value;
        if (newValue === this.props.alert.order)
            return;
        Actions.updateAlert(this.props.alert, { order: newValue });
    }

    handleChangeLimit() {
        let newValue = parseFloat(this.refs.limit.getDOMNode().value);
        if (newValue === this.props.alert.limit || isNaN(newValue))
            return;
        Actions.updateAlert(this.props.alert, { limit: newValue });
    }

    handleDelete() {
        Actions.deleteAlert(this.props.alert);
    }

    render() {
        let { account, alert } = this.props;

        assert(alert.order === 'gt' || alert.order === 'lt');

        return (
            <tr>
                <td className="col-md-3">{ account.title }</td>
                <td className="col-md-3">
                    <span className="condition">{ this.props.sendIfText }</span>
                </td>
                <td className="col-md-5">
                    <div className="form-inline pull-right">
                        <div className="form-group">
                            <select className="form-control"
                              defaultValue={ alert.order }
                              ref="select"
                              onChange={ this.handleSelect }>
                                <option value="gt">
                                    { $t('client.settings.emails.greater_than') }
                                </option>
                                <option value="lt">
                                    { $t('client.settings.emails.less_than') }
                                </option>
                            </select>
                        </div>

                        <div className="input-group input-group-money">
                            <input type="number"
                              ref="limit"
                              className="form-control"
                              defaultValue={ alert.limit }
                              onChange={ this.handleChangeLimit }
                            />
                            <span className="input-group-addon">
                                { account.currencySymbol }
                            </span>
                        </div>
                    </div>
                </td>
                <td className="col-md-1">
                    <span className="pull-right fa fa-times-circle" aria-label="remove"
                      data-toggle="modal"
                      data-target={ `#confirmDeleteAlert${ alert.id}` }
                      title={ $t('client.settings.emails.delete_alert') }>
                    </span>

                    <ConfirmDeleteModal
                      modalId={ `confirmDeleteAlert${alert.id}` }
                      modalBody={ $t('client.settings.emails.delete_alert_full_text') }
                      onDelete={ this.handleDelete }
                    />
                </td>
            </tr>
        );
    }
}
