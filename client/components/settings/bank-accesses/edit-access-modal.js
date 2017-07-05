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
        this.state = {
            showDisableButton: true
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClick = this.handleClick.bind(this);
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
        let update;

        if (this.props.access.isActive && !this.state.showDisableButton) {
            update = { isActive: false };
        } else {
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

            update = {
                isActive: true,
                login: newLogin,
                password: newPassword,
                customFields
            };
            this.passwordInput.clear();
        }
        this.props.onSave(update);
        $(`#${this.props.modalId}`).modal('hide');
    }

    handleClick() {
        this.setState({ showDisableButton: false });
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

        let explanations = null;
        if (access.isActive) {
            if (this.state.showDisableButton) {
                explanations = (
                    <p className="alert alert-info">
                        { $t('client.editaccessmodal.info_before_disable_access') }
                    </p>
                );
            } else {
                explanations = (
                    <p className="alert alert-warning">
                        { $t('client.editaccessmodal.warn_before_submit_disable_access') }
                    </p>
                );
            }
        } else if (this.state.showDisableButton) {
            explanations = (
                <p className="alert alert-info">
                    { $t('client.editaccessmodal.disabled_access') }
                </p>
            );
        }

        let maybeButton = null;
        if (this.state.showDisableButton) {
            if (access.isActive) {
                maybeButton = (
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={ this.handleClick }>
                        { $t('client.editaccessmodal.disable') }
                    </button>
                );
            } else {
                maybeButton = (
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={ this.handleClick }>
                        { $t('client.editaccessmodal.enable') }
                    </button>
                );
            }
        }

        let maybeDisableForm = null;
        if (access.isActive || this.state.showDisableButton) {
            maybeDisableForm = (
                <div>
                    <h4>
                        { $t(access.isActive ?
                          'client.editaccessmodal.disable_access' :
                          'client.editaccessmodal.enable_access') }
                    </h4>
                    { explanations }
                    { maybeButton }
                </div>
            );
        }

        let maybeCredentials = null;

        // Display the credentials form if :
        // - the access is enabled and the user didn't click on the disable button.
        // - the access is disabled ant the user clicked on the enable button.
        if ((access.isActive && this.state.showDisableButton) ||
            (!access.isActive && !this.state.showDisableButton)) {
            maybeCredentials = (
                <div>
                    <h4>
                        { $t('client.editaccessmodal.edit_credentials') }
                    </h4>
                    { $t('client.editaccessmodal.body') }
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
                    { maybeDisableForm ? <hr /> : null }
                </div>
            );
        }

        let modalBody = (
            <div>
                <form
                  id={ `${this.props.modalId}-form` }
                  ref={ refForm }
                  onSubmit={ this.handleSubmit }>

                    { maybeCredentials }

                    { maybeDisableForm }

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
            if (this.state.isActive) {
                this.passwordInput.focus();
            }
        };

        // Reset the modal before open, if the user closed the modal in the middle
        // of the disable process.
        const handleBeforeOpen = () => {
            this.setState({ showDisableButton: true });
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
              onBeforeOpen={ handleBeforeOpen }
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
