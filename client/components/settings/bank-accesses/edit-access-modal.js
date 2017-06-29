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
            isActive: this.props.access.isActive
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.extractCustomFieldValue = this.extractCustomFieldValue.bind(this);

        this.loginInput = null;
        this.passwordInput = null;
        this.form = null;
        this.customFieldsInputs = [];
    }

    extractCustomFieldValue(field, index) {
        return this.customFieldsInputs[index].getValue();
    }

    handleSubmit(event) {
        event.preventDefault();
        let update;
        if (!this.state.isActive) {
            update = { isActive: false };
        } else {
            let newLogin = this.loginInput.value.trim();
            let newPassword = this.passwordInput.getValue();
            if (!newPassword.length) {
                alert($t('client.editaccessmodal.not_empty'));
                return;
            }

            let customFields;
            let { access } = this.props;
            if (access.customFields && access.customFields.length) {
                customFields = access.customFields.map(this.extractCustomFieldValue);
                if (customFields.some(f => !f.value)) {
                    alert($t('client.editaccessmodal.customFields_not_empty'));
                    return;
                }
            }

            update = { isActive: true, login: newLogin, password: newPassword, customFields };
            this.passwordInput.clear();
        }
        this.props.onSave(update);
        $(`#${this.props.modalId}`).modal('hide');
    }

    handleClick() {
        this.setState({ isActive: !this.state.isActive });
    }

    render() {
        this.customFieldsInputs = [];

        let customFields;
        let { access } = this.props;

        if (access.customFields && access.customFields.length) {
            customFields = access.customFields.map((field, index) => {
                let refCustomFieldInput = input => {
                    this.customFieldsInputs.push(input);
                };
                return (
                    <CustomBankField
                      key={ index }
                      refCallback={ refCustomFieldInput }
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

        // The credentials form or the explanation how to enable the access.
        let credentialsOrExplanation = null;

        // The warning to be displayed when the user click the disable button.
        let maybeWarning = null;

        if (this.state.isActive) {
            credentialsOrExplanation = (
                <div>
                    <h4>
                        { $t('client.settings.edit_credentials') }
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
                    <hr />
                </div>
            );
        } else if (!this.props.access.isActive) {
            // Show this message only when the access is disabled.
            credentialsOrExplanation = (
                <p className="alert alert-info">
                    { $t('client.settings.disabled_access') }
                </p>
            );
        } else {
            maybeWarning = (
                <p className="alert alert-warning">
                    { $t('client.settings.warn_before_disable_access') }
                </p>
            );
        }

        let buttonLabel;
        if (this.state.isActive) {
            buttonLabel = 'client.settings.disable';
        } else if (this.props.access.isActive) {
            buttonLabel = 'client.settings.cancel';
        } else {
            buttonLabel = 'client.settings.enable';
        }

        let modalBody = (
            <div>
                <form
                  id={ `${this.props.modalId}-form` }
                  ref={ refForm }
                  onSubmit={ this.handleSubmit }>
                    { credentialsOrExplanation }

                    <h4>
                        { $t(this.state.isActive ?
                             'client.settings.disable_access' :
                             'client.settings.enable_access') }
                    </h4>
                    { maybeWarning }
                    <button
                      type="button"
                      className="btn btn-default"
                      onClick={ this.handleClick }>
                        { $t(buttonLabel) }
                    </button>

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
            this.setState({ isActive: this.props.access.isActive });
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
    let access = get.accessById(state, props.accessId);
    return {
        access
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
