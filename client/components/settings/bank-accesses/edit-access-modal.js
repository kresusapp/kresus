import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { actions, get } from '../../../store';

import CustomBankField from './custom-bank-field';
import PasswordInput from '../../ui/password-input';
import SaveAndCancel from '../../ui/modal-save-and-cancel-button';
import ModalContent from '../../ui/modal-content';
import { registerModal } from '../../ui/new-modal';

const MODAL_SLUG = 'edit-access';

const EditAccessModal = connect(
    state => {
        let accessId = get.modal(state, MODAL_SLUG).state;
        let access = get.accessById(state, accessId);
        return {
            access,
            staticCustomFields: get.bankByUuid(state, access.bank).customFields || []
        };
    },
    dispatch => {
        return {
            makeHandleSave(accessId, login, password, customFields) {
                actions.updateAccess(dispatch, accessId, login, password, customFields);
            }
        };
    },
    ({ access, staticCustomFields }, { makeHandleSave }) => {
        return {
            access,
            staticCustomFields,
            handleSave(login, password, customFields) {
                makeHandleSave(access.id, login, password, customFields);
            }
        };
    }
)(
    class Content extends React.Component {
        constructor(props) {
            super(props);
            for (let field of this.props.access.customFields) {
                this.formCustomFields.set(field.name, field.value);
            }
        }
        state = { isSaveDisabled: true };
        password = '';
        formCustomFields = new Map();

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
                                className="form-control"
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
                                autoFocus={true}
                            />
                        </div>

                        {customFieldsComponents}
                    </form>
                </React.Fragment>
            );

            let footer = (
                <SaveAndCancel
                    onClickSave={this.handleSubmit}
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

registerModal(MODAL_SLUG, <EditAccessModal />);

const ShowEditAccessModalButton = connect(null, (dispatch, props) => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, props.accessId);
        }
    };
})(props => {
    return (
        <button
            className="fa fa-cog option-legend"
            aria-label="Edit bank access"
            onClick={props.handleClick}
            title={$t('client.settings.change_password_button')}
        />
    );
});

ShowEditAccessModalButton.propTypes = {
    // The unique string id of the access to be updated.
    accessId: PropTypes.string.isRequired
};

const EnableAccessModalButton = connect(null, (dispatch, props) => {
    return {
        handleClick() {
            actions.showModal(dispatch, MODAL_SLUG, props.accessId);
        }
    };
})(props => {
    return (
        <button
            className="fa fa-power-off option-legend"
            aria-label="Enable bank access"
            onClick={props.handleClick}
            title={$t('client.settings.enable_access')}
        />
    );
});

EnableAccessModalButton.propTypes = {
    // The unique string id of the access to be enabled.
    accessId: PropTypes.string.isRequired
};

export { ShowEditAccessModalButton, EnableAccessModalButton };
