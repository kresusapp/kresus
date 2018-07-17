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
        state = { isSaveDisabled: true };
        password = '';

        constructor(props) {
            super(props);
            this.formCustomFields = new Map();
            for (let field of this.props.access.customFields) {
                this.formCustomFields.set(field.name, field.value);
            }
        }

        refLoginInput = node => {
            this.loginInput = node;
        };

        handleSubmit = event => {
            event.preventDefault();

            let newLogin = this.loginInput.value.trim();

            let customFields = [];
            for (let { name, type } of this.props.staticCustomFields) {
                if (this.formCustomFields.has(name) && this.formCustomFields.get(name)) {
                    customFields.push({ name, value: this.formCustomFields.get(name) });
                } else if (type !== 'select') {
                    alert($t('client.editaccessmodal.customFields_not_empty'));
                    return;
                }
            }

            this.props.handleSave(newLogin, this.password, customFields);
        };

        handleChangeCustomField = (name, value) => {
            this.formCustomFields.set(name, value);
        };

        handleChangePassword = event => {
            this.password = event.target.value;
            this.setState({ isSaveDisabled: this.password.length === 0 });
        };

        getFieldByName = name => {
            return this.props.access.customFields.find(field => field.name === name) || {};
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
                            value={this.getFieldByName(field.name).value}
                        />
                    );
                });
            }

            let body = (
                <React.Fragment>
                    {$t('client.editaccessmodal.body')}

                    <form className="form-group">
                        <div className="form-group">
                            <label htmlFor="login">{$t('client.settings.login')}</label>
                            <input
                                type="text"
                                className="form-element-block"
                                id="login"
                                defaultValue={access.login}
                                ref={this.refLoginInput}
                            />
                        </div>

                        <div className="form-group">
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

            let footer = (
                <CancelAndSave
                    onSave={this.handleSubmit}
                    isSaveDisabled={this.state.isSaveDisabled}
                />
            );

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
