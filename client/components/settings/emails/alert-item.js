import React from 'react';
import { connect } from 'react-redux';

import { assert, translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import ConfirmDeleteModal from '../../ui/confirm-delete-modal';
import AmountInput from '../../ui/amount-input';

const AlertItem = props => {

    // TODO hoist this logic in the above component.
    const handleSelect = event => {
        let newValue = event.target.value;
        if (newValue === props.alert.order)
            return;

        props.update({ order: newValue });
    };

    const handleChangeLimit = value => {
        if (Math.abs(value - props.alert.limit) <= 0.001)
            return;

        props.update({ limit: value });
    };

    let { account, alert, access } = props;
    let { limit, type, id } = alert;

    assert(alert.order === 'gt' || alert.order === 'lt');

    return (
        <tr>
            <td className="col-md-3">{ `${access.name} − ${account.title}` }</td>
            <td className="col-md-3">
                <span className="condition">{ props.sendIfText }</span>
            </td>
            <td className="col-md-5">
                <div className="form-inline pull-right">
                    <div className="form-group">
                        <select
                          className="form-control"
                          defaultValue={ alert.order }
                          onChange={ handleSelect }>
                            <option value="gt">
                                { $t('client.settings.emails.greater_than') }
                            </option>
                            <option value="lt">
                                { $t('client.settings.emails.less_than') }
                            </option>
                        </select>
                    </div>

                    <div className="input-group input-group-money">
                        <AmountInput
                          defaultValue={ Math.abs(limit) }
                          initiallyNegative={ limit < 0 && type === 'balance' }
                          onInput={ handleChangeLimit }
                          togglable={ type === 'balance' }
                          signId={ `alert-limit-sign-${id}` }
                        />
                        <span className="input-group-addon">
                            { account.currencySymbol }
                        </span>
                    </div>
                </div>
            </td>
            <td className="col-md-1">
                <span
                  className="pull-right fa fa-times-circle"
                  aria-label="remove"
                  data-toggle="modal"
                  data-target={ `#confirmDeleteAlert${alert.id}` }
                  title={ $t('client.settings.emails.delete_alert') }
                />

                <ConfirmDeleteModal
                  modalId={ `confirmDeleteAlert${alert.id}` }
                  modalBody={ $t('client.settings.emails.delete_alert_full_text') }
                  onDelete={ props.handleDelete }
                />
            </td>
        </tr>
    );
};

AlertItem.propTypes = {
    // Description of the type of alert
    sendIfText: React.PropTypes.string.isRequired,

    // The alert
    alert: React.PropTypes.object.isRequired,

    // The account for which the alert is configured
    account: React.PropTypes.object.isRequired,

    // The alert update function
    update: React.PropTypes.func.isRequired,

    // The alert deletion function
    handleDelete: React.PropTypes.func.isRequired,

    // The bank access to which is attached the account of the alert
    access: React.PropTypes.object.isRequired
};

export default connect((state, ownProps) => {
    let access = get.accessById(state, ownProps.account.bankAccess);
    return { access };
}, (dispatch, props) => {
    return {
        update(newFields) {
            actions.updateAlert(dispatch, props.alert.id, newFields);
        },
        handleDelete() {
            actions.deleteAlert(dispatch, props.alert.id);
        }
    };
})(AlertItem);
