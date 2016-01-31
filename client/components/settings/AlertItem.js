import { assert, has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default class AlertItem extends React.Component {

    constructor(props) {
        has(props, 'alert');
        has(props, 'account');
        has(props, 'sendIfText');
        super(props);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onLimitChange = this.onLimitChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onSelectChange() {
        let newValue = this.refs.selector.getDOMNode().value;
        if (newValue === this.props.alert.order)
            return;
        Actions.UpdateAlert(this.props.alert, { order: newValue });
    }

    onLimitChange() {
        let newValue = parseFloat(this.refs.limit.getDOMNode().value);
        if (newValue === this.props.alert.limit || newValue !== newValue)
            return;
        Actions.UpdateAlert(this.props.alert, { limit: newValue });
    }

    onDelete() {
        Actions.DeleteAlert(this.props.alert);
    }

    render() {
        let { account, alert } = this.props;

        assert(alert.order === 'gt' || alert.order === 'lt');

        return (
            <tr>
                <td>{ account.title }</td>
                <td>
                    <div className="form-inline">
                        <span>{ this.props.sendIfText }&nbsp;</span>

                        <select className="form-control"
                          defaultValue={ alert.order }
                          ref="selector"
                          onChange={ this.onSelectChange }>
                            <option value="gt">
                                { $t('client.settings.emails.greater_than') }
                            </option>
                            <option value="lt">
                                { $t('client.settings.emails.less_than') }
                            </option>
                        </select>

                        <span>&nbsp;</span>

                        <input type="number"
                          ref="limit"
                          className="form-control"
                          defaultValue={ alert.limit }
                          onChange={ this.onLimitChange }
                        />
                    </div>
                </td>
                <td>
                    <button type="button" className="btn btn-danger pull-right" aria-label="remove"
                      data-toggle="modal" data-target={ `#confirmDeleteAlert${ alert.id}` }
                      title={ $t('client.settings.emails.delete_alert') }>
                        <span className="glyphicon glyphicon-remove" aria-hidden="true"></span>
                    </button>

                    <ConfirmDeleteModal
                      modalId={ `confirmDeleteAlert${alert.id}` }
                      modalBody={ $t('client.settings.emails.delete_alert_full_text') }
                      onDelete={ this.onDelete }
                    />
                </td>
            </tr>
        );
    }
}
