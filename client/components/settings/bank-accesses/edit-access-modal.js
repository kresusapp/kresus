import React from 'react';

import { translate as $t } from '../../../helpers';

import CustomBankField from './custom-bank-field';
import Modal from '../../ui/modal';

class EditAccessModal extends React.Component {

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.extractCustomFieldValue = this.extractCustomFieldValue.bind(this);

        this.loginInput = null;
        this.passwordInput = null;
        this.customFieldsInputs = [];
    }

    extractCustomFieldValue(field, index) {
        return this.customFieldsInputs[index].getValue();
    }

    handleSubmit(event) {
        event.preventDefault();

        let newLogin = this.loginInput.value.trim();
        let newPassword = this.passwordInput.value.trim();
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
        this.passwordInput.value = '';

        $(`#${this.props.modalId}`).modal('hide');
    }

    render() {
        this.customFieldsInputs = [];
        let customFields;

        if (this.props.customFields) {
            customFields = this.props.customFields.map((field, index) => {
                let customFieldsInputCb = input => {
                    this.customFieldsInputs.push(input);
                };
                return (
                    <CustomBankField
                      key={ index }
                      ref={ customFieldsInputCb }
                      params={ field }
                    />
                );
            });
        }

        let modalTitle = $t('client.editaccessmodal.title');
        let loginInputCb = element => {
            this.loginInput = element;
        };
        let passwordInputCb = element => {
            this.passwordInput = element;
        };

        let modalBody = (
            <div>
                { $t('client.editaccessmodal.body') }

                <form
                  id={ `${this.props.modalId}-form` }
                  className="form-group"
                  onSubmit={ this.handleSubmit }>
                    <div className="form-group">
                        <label htmlFor="login">
                            { $t('client.settings.login') }
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="login"
                          ref={ loginInputCb }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            { $t('client.settings.password') }
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          ref={ passwordInputCb }
                        />
                    </div>

                    { customFields }
                </form>
            </div>
        );

        let modalFooter = (
            <div>
                <button
                  type="button"
                  className="btn btn-default"
                  data-dismiss="modal">
                    { $t('client.editaccessmodal.cancel') }
                </button>
                <button
                  type="submit"
                  form={ `${this.props.modalId}-form` }
                  className="btn btn-success">
                    { $t('client.editaccessmodal.save') }
                </button>
            </div>
        );

        let focusPasswordField = () => {
            this.passwordInput.focus();
        };

        return (
            <Modal
              modalId={ this.props.modalId }
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
              onAfterOpen={ focusPasswordField }
            />
        );
    }
}

EditAccessModal.propTypes = {
    // Unique identifier of the modal
    modalId: React.PropTypes.string.isRequired,

    // The function called to save the edited access
    onSave: React.PropTypes.func.isRequired,

    // The access' custom fields
    customFields: React.PropTypes.array
};

export default EditAccessModal;
