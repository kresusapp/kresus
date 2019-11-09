import React from 'react';
import { connect } from 'react-redux';

import { assert, translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import PasswordInput from '../../ui/password-input';
import CancelAndSubmit from '../../ui/modal/cancel-and-submit-buttons';
import ModalContent from '../../ui/modal/content';
import { registerModal } from '../../ui/modal';
import ValidableInputText from '../../ui/validated-text-input';

import { renderCustomFields, areCustomFieldsValid } from './new-access-form';

export const EDIT_ACCESS_MODAL_SLUG = 'edit-access';

const EditAccessModal = connect(
    state => {
        let accessId = get.modal(state, EDIT_ACCESS_MODAL_SLUG).state;
        let access = get.accessById(state, accessId);
        return {
            access,
            bankDesc: get.bankByUuid(state, access.vendorId)
        };
    },

    dispatch => {
        return {
            async updateAndFetchAccess(accessId, login, password, customFields) {
                try {
                    await actions.updateAndFetchAccess(
                        dispatch,
                        accessId,
                        login,
                        password,
                        customFields
                    );
                    actions.hideModal(dispatch);
                } catch (err) {
                    // TODO properly report.
                }
            }
        };
    },

    ({ access, bankDesc }, { updateAndFetchAccess }) => {
        return {
            access,
            bankDesc,
            async handleSave(login, password, customFields) {
                await updateAndFetchAccess(access.id, login, password, customFields);
            }
        };
    }
)(
    class Content extends React.Component {
        constructor(props) {
            super(props);

            // Define values for every custom field, including optional ones.
            let customFields = {};
            for (let fieldDesc of this.props.bankDesc.customFields) {
                let maybeField = this.props.access.customFields.find(
                    field => field.name === fieldDesc.name
                );

                let value;
                if (!maybeField || typeof maybeField.value === 'undefined') {
                    // We could in theory assert here, but if a new custom
                    // field is added by Weboob and the user hasn't updated it,
                    // they'll see an error that doesn't prevent anything from
                    // working correctly and might be hard to understand, so
                    // don't do it.
                    value = null;
                } else {
                    value = maybeField.value;
                }
                customFields[fieldDesc.name] = value;
            }

            this.state = {
                customFields,
                login: props.access.login,
                password: null
            };
        }

        handleChangeLogin = login => {
            this.setState({ login });
        };
        handleChangePassword = password => {
            this.setState({ password });
        };

        handleChangeCustomField = (name, value) => {
            assert(
                typeof this.state.customFields[name] !== 'undefined',
                'all custom fields must have an initial value'
            );
            // Make sure to create a copy to trigger a re-render.
            let customFields = Object.assign({}, this.state.customFields, { [name]: value });
            this.setState({
                customFields
            });
        };

        handleSubmit = event => {
            event.preventDefault();
            let customFields = this.props.bankDesc.customFields.map(field => {
                assert(
                    typeof this.state.customFields[field.name] !== 'undefined',
                    'custom fields should all be set'
                );
                return {
                    name: field.name,
                    value: this.state.customFields[field.name]
                };
            });
            this.props.handleSave(this.state.login, this.state.password, customFields);
        };

        isFormValid = () => {
            return (
                !!this.state.login &&
                !!this.state.password &&
                areCustomFieldsValid(this.props.bankDesc, this.state.customFields)
            );
        };

        render() {
            let { bankDesc } = this.props;
            let customFieldsComponents = renderCustomFields(
                bankDesc,
                this.state.customFields,
                this.handleChangeCustomField
            );

            let body = (
                <React.Fragment>
                    <p>{$t('client.editaccessmodal.body')}</p>

                    <form id={EDIT_ACCESS_MODAL_SLUG} onSubmit={this.handleSubmit}>
                        <p className="cols-with-label">
                            <label htmlFor="login">{$t('client.settings.login')}</label>
                            <ValidableInputText
                                className="form-element-block"
                                placeholder="123456789"
                                id="login"
                                onChange={this.handleChangeLogin}
                                value={this.state.login}
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

            let footer = (
                <CancelAndSubmit
                    formId={EDIT_ACCESS_MODAL_SLUG}
                    isSubmitDisabled={!this.isFormValid()}
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
