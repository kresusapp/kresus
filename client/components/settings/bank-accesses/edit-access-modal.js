import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get } from '../../../store';

import CustomBankField from './custom-bank-field';
import Modal from '../../ui/modal';
import PasswordInput from '../../ui/password-input';

class EditAccessModal extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChangeCustomField = this.handleChangeCustomField.bind(this);

        this.loginInput = null;
        this.passwordInput = null;
        this.form = null;

        this.customFields = new Map();

        for (let field of this.props.access.customFields) {
            this.customFields.set(field.name, field.value);
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        let newLogin = this.loginInput.value.trim();
        let newPassword = this.passwordInput.getValue();
        if (!newPassword.length) {
            alert($t('client.editaccessmodal.not_empty'));
            return;
        }

        let { access } = this.props;

        let customFields = [];
        if (access.customFields && access.customFields.length) {

            for (let [name, value] of this.customFields.entries()) {
                if (typeof value === 'undefined' || value.length === 0) {
                    alert($t('client.editaccessmodal.customFields_not_empty'));
                    return;
                }
                customFields.push({ name, value });
            }

        }

        let update = {
            isActive: true,
            login: newLogin,
            password: newPassword,
            customFields
        };

        this.passwordInput.clear();

        this.props.onSave(update);
        $(`#${this.props.modalId}`).modal('hide');
    }

    handleChangeCustomField(name, value) {
        this.customFields.set(name, value);
    }

    render() {
        let customFields;
        let { access } = this.props;

        if (access.customFields && access.customFields.length) {
            customFields = access.customFields.map((field, index) => {
                return (
                    <CustomBankField
                      key={ index }
                      onChange={ this.handleChangeCustomField }
                      name={ field.name }
                      bank={ access.bank }
                      value={ field.value }
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
        let refForm = element => {
            this.form = element;
        };

        let modalBody = (
            <div>
                { $t('client.editaccessmodal.body') }

                <form
                  id={ `${this.props.modalId}-form` }
                  ref={ refForm }
                  onSubmit={ this.handleSubmit }>
                    <div className="form-group">
                        <label htmlFor="login">
                            { $t('client.settings.login') }
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="login"
                          defaultValue={ access.login }
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
                  className="btn btn-success">
                    { $t('client.editaccessmodal.save') }
                </button>
            </div>
        );

        let focusPasswordField = () => {
            this.passwordInput.focus();
        };

        let resetForm = () => {
            this.form.reset();
        };

        return (
            <Modal
              modalId={ this.props.modalId }
              modalTitle={ modalTitle }
              modalBody={ modalBody }
              modalFooter={ modalFooter }
              onAfterOpen={ focusPasswordField }
              onBeforeHide={ resetForm }
            />
        );
    }
}

const Export = connect((state, props) => {
    return {
        access: get.accessById(state, props.accessId)
    };
})(EditAccessModal);

Export.propTypes = {
    // The id of the modal.
    modalId: PropTypes.string.isRequired,

    // The function called to save the edited access.
    onSave: PropTypes.func.isRequired,

    // The id of the access to be updated.
    accessId: PropTypes.string.isRequired,
};

export default Export;
