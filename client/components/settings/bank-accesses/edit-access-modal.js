import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../../helpers';

import CustomBankField from './custom-bank-field';
import Modal from '../../ui/modal';
import PasswordInput from '../../ui/password-input';

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
        let newPassword = this.passwordInput.getValue();
        if (!newPassword.length) {
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
        this.passwordInput.clear();

        $(`#${this.props.modalId}`).modal('hide');
    }

    render() {
        this.customFieldsInputs = [];

        let customFields;
        if (this.props.customFields) {
            customFields = this.props.customFields.map((field, index) => {
                let refCustomFieldInput = input => {
                    this.customFieldsInputs.push(input);
                };
                return (
                    <CustomBankField
                      key={ index }
                      ref={ refCustomFieldInput }
                      params={ field }
                    />
                );
            });
        }

        let modalTitle = $t('client.editaccessmodal.title');

        let refLoginInput = element => {
            this.loginInput = element;
        };
        let refPasswordInput = element => {
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
                          ref={ refLoginInput }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            { $t('client.settings.password') }
                        </label>
                        <PasswordInput
                          id="password"
                          ref={ refPasswordInput }
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
                  className="btn btn-primary">
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
    modalId: PropTypes.string.isRequired,

    // The function called to save the edited access
    onSave: PropTypes.func.isRequired,

    // The access' custom fields
    customFields: PropTypes.array
};

export default EditAccessModal;
