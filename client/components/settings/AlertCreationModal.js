import { has, translate as $t } from '../../helpers';
import { Actions } from '../../store';

import AccountSelector from './AccountSelector';
import Modal from '../ui/Modal';

export default class AlertCreationModal extends React.Component {

    constructor(props) {
        has(props, 'alertType');
        has(props, 'modalId');
        has(props, 'titleTranslationKey');
        has(props, 'sendIfText');
        super(props);
        this.state = {
            maybeLimitError: ''
        };
    }

    onSubmit() {

        // Validate data
        let limitDom = this.refs.limit.getDOMNode();
        let limit = parseFloat(limitDom.value);
        if (limit !== limit) {
            this.setState({
                maybeLimitError: $t('client.settings.emails.invalid_limit')
            });
            return;
        }

        // Actually submit the form
        let newAlert = {
            type: this.props.alertType,
            limit,
            order: this.refs.selector.getDOMNode().value,
            bankAccount: this.refs.account.value(),
        };

        Actions.createAlert(newAlert);

        $(`#${this.props.modalId}`).modal('toggle');

        // Clear form and errors
        limitDom.value = 0;
        if (this.state.maybeLimitError.length) {
            this.setState({ maybeLimitError: '' });
        }
    }

    render() {
        let modalTitle = $t(this.props.titleTranslationKey);

        let modalBody = (
            <div>
                <div className="form-group">
                    <label htmlFor="account">
                        { $t('client.settings.emails.account') }
                    </label>
                    <AccountSelector ref="account" id="account" />
                </div>

                <div className="form-group">
                    <span>{ this.props.sendIfText }&nbsp;</span>

                    <select className="form-control" ref="selector">
                        <option value="gt">{ $t('client.settings.emails.greater_than') }</option>
                        <option value="lt">{ $t('client.settings.emails.less_than') }</option>
                    </select>
                </div>

                <div className="form-group">
                    <span className="text-danger">{ this.state.maybeLimitError }</span>
                    <input type="number" ref="limit" className="form-control"
                      defaultValue="0"
                    />
                </div>
            </div>
        );

        let modalFooter = (
            <div>
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    { $t('client.settings.emails.cancel') }
                </button>
                <button type="button" className="btn btn-success"
                  onClick={ this.onSubmit.bind(this) }>
                    { $t('client.settings.emails.create') }
                </button>
            </div>
        );

        return (
            <Modal modalId={ this.props.modalId }
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
            />
        );
    }
}
