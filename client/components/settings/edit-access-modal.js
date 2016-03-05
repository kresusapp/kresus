import { has, translate as $t } from '../../helpers';

import CustomBankField from '../shared/custom-bank-field';
import Modal from '../ui/Modal';

export default class EditAccessModal extends React.Component {

    extractCustomFieldValue(field, index) {
        return this.refs[`customField${index}`].getValue();
    }

    handleSubmit(event) {
        event.preventDefault();

        let newLogin = this.refs.login.getDOMNode().value.trim();
        let newPassword = this.refs.password.getDOMNode().value.trim();
        if (!newPassword || !newPassword.length) {
            alert($t('client.editaccessmodal.not_empty'));
            return;
        }

        let customFields;
        if (this.props.customFields) {
            customFields = this.props.customFields.map(this.extractCustomFieldValue);
            if (customFields.some(f => !f.value)) {
                alert($t('client.editaccessmodal.customFields_not_empty'));
                return;
            }
        }

        this.props.onSave(newLogin, newPassword, customFields);
        this.refs.password.getDOMNode().value = '';

        $(`#${this.props.modalId}`).modal('hide');
    }

    constructor(props) {
        has(props, 'modalId');
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.extractCustomFieldValue = this.extractCustomFieldValue.bind(this);
    }

    componentDidMount() {
        $(`#${this.props.modalId}`).on('shown.bs.modal', () => {
            this.refs.password.getDOMNode().focus();
        });
    }

    render() {
        let customFields;

        if (this.props.customFields) {
            customFields = this.props.customFields.map((field, index) =>
                <CustomBankField
                  key={ `customField${index}` }
                  ref={ `customField${index}` }
                  params={ field }
                />
            );
        }

        let modalTitle = $t('client.editaccessmodal.title');

        let modalBody = (
            <div>
                { $t('client.editaccessmodal.body') }

                <form id={ `${this.props.modalId}-form` }
                  className="form-group"
                  onSubmit={ this.handleSubmit }>
                    <div className="form-group">
                        <label htmlFor="login">
                            { $t('client.settings.login') }
                        </label>
                        <input type="text" className="form-control" id="login"
                          ref="login"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            { $t('client.settings.password') }
                        </label>
                        <input type="password" className="form-control" id="password"
                          ref="password"
                        />
                    </div>

                    { customFields }
                </form>
            </div>
        );

        let modalFooter = (
            <div>
                <button type="button" className="btn btn-default" data-dismiss="modal">
                    { $t('client.editaccessmodal.cancel') }
                </button>
                <button
                  type="submit" form={ `${this.props.modalId}-form` }
                  className="btn btn-success">
                    { $t('client.editaccessmodal.save') }
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
