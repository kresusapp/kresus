import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import CustomBankField from './custom-bank-field';
import PasswordInput from '../../ui/password-input';
import CancelAndSave from '../../ui/modal/cancel-and-save-buttons';
import ModalContent from '../../ui/modal/content';
import { registerModal } from '../../ui/modal';

export const EDIT_ACCESS_MODAL_SLUG = 'edit-access';

const EditAccessModal = connect(
    state => {
        let accessId = get.modal(state, EDIT_ACCESS_MODAL_SLUG).state;
        let access = get.accessById(state, accessId);
        return {
            access,
            staticCustomFields: get.bankByUuid(state, access.bank).customFields || []
        };
    },

    dispatch => {
        return {
            async updateAccess(accessId, login, password, customFields) {
                try {
                    await actions.updateAccess(dispatch, accessId, login, password, customFields);
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO properly report.
                }
            }
        };
    },

    ({ access, staticCustomFields }, { updateAccess }) => {
        return {
            access,
            staticCustomFields,
            async handleSave(login, password, customFields) {
                await updateAccess(access.id, login, password, customFields);
            }
        };
    }
)(
    class Content extends React.Component {
        constructor(props) {
            super(props);

            let customFields = {};
            for (let field of this.props.access.customFields) {
                customFields[field.name] = field.value;
            }

            this.state = {
                customFields,
                password: ''
            };
        }

        refLoginInput = node => {
            this.loginInput = node;
        };

        handleSubmit = event => {
            event.preventDefault();

            let newLogin = this.loginInput.value.trim();
            if (!newLogin.length || !this.state.password.length) {
                alert($t('client.settings.missing_login_or_password'));
                return;
            }

            let customFields = [];
            for (let { name, type } of this.props.staticCustomFields) {
                if (name in this.state.customFields && this.state.customFields[name]) {
                    customFields.push({ name, value: this.state.customFields[name] });
                } else if (type !== 'select') {
                    alert($t('client.editaccessmodal.customFields_not_empty'));
                    return;
                }
            }

            this.props.handleSave(newLogin, this.state.password, customFields);
        };

        handleChangeCustomField = (name, value) => {
            let customFields = this.state.customFields ? { ...this.state.customFields } : {};
            customFields[name] = value;
            this.setState({
                customFields
            });
        };

        handleChangePassword = event => {
            let password = event.target.value.trim();
            this.setState({ password });
        };

        render() {
            let customFieldsComponents;
            let { access, staticCustomFields } = this.props;

            if (staticCustomFields && staticCustomFields.length) {
                customFieldsComponents = staticCustomFields.map((field, index) => {
                    return (
                        <CustomBankField
                            key={index}
                            onChange={this.handleChangeCustomField}
                            name={field.name}
                            bank={access.bank}
                            value={this.state.customFields[field.name]}
                        />
                    );
                });
            }

            let body = (
                <React.Fragment>
                    <p>{$t('client.editaccessmodal.body')}</p>

                    <form>
                        <p className="cols-with-label">
                            <label htmlFor="login">{$t('client.settings.login')}</label>
                            <input
                                type="text"
                                className="form-element-block"
                                id="login"
                                defaultValue={access.login}
                                ref={this.refLoginInput}
                            />
                        </p>

                        <div className="cols-with-label">
                            <label htmlFor="password">{$t('client.settings.password')}</label>
                            <PasswordInput
                                id="password"
                                onChange={this.handleChangePassword}
                                className="block"
                                autoFocus={true}
                            />
                        </div>

                        {customFieldsComponents}
                    </form>
                </React.Fragment>
            );

            let footer = <CancelAndSave onSave={this.handleSubmit} />;

            return (
                <ModalContent
                    title={$t('client.editaccessmodal.title')}
                    body={body}
                    footer={footer}
                />
            );
        }
    }
);

registerModal(EDIT_ACCESS_MODAL_SLUG, () => <EditAccessModal />);
