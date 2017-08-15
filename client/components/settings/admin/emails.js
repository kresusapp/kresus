import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import BoolSetting from '../../ui/bool-setting';
import PasswordInput from '../../ui/password-input';

const EmailConfig = props => {
    let { config } = props;
    let rejectUnauthorized = (typeof config !== 'undefined' && typeof config.tls !== 'undefined') ?
                             !!config.tls.rejectUnauthorized :
                             false;

    let secure = typeof config.secure !== 'undefined' ? !!config.secure : false;

    let form = null;
    let host = null;
    let port = null;
    let user = null;
    let password = null;
    let fromEmail = null;
    let toEmail = null;

    let refForm = node => {
        form = node;
    };
    let refHost = node => {
        host = node;
    };
    let refPort = node => {
        port = node;
    };
    let refUser = node => {
        user = node;
    };
    let refPassword = node => {
        password = node;
    };
    let refFromEmail = node => {
        fromEmail = node;
    };
    let refToEmail = node => {
        toEmail = node;
    };

    const getCheckedConfig = () => {
        let newConfig = {
            fromEmail: fromEmail.value.trim(),
            toEmail: toEmail.value.trim(),
            host: host.value.trim(),
            port: port.value.trim(),
            secure,
            auth: {
                user: user.value && user.value.trim(),
                pass: password.getValue()
            },
            tls: {
                rejectUnauthorized
            }
        };

        if (!newConfig.fromEmail.length ||
            !newConfig.toEmail.length ||
            !newConfig.host.length ||
            !newConfig.port.length) {
            alert($t('client.settings.emails.missing_fields'));
            return;
        }

        let portAsInt = Number.parseInt(newConfig.port, 10) | 0;
        if (String(portAsInt) !== newConfig.port || portAsInt < 1 || portAsInt > 65535) {
            alert($t('client.settings.emails.invalid_port'));
            return;
        }

        if (newConfig.auth.user === '' && newConfig.auth.pass === '') {
            delete newConfig.auth;
        }

        return newConfig;
    };

    const handleSubmit = () => {
        let newConfig = getCheckedConfig();
        if (!newConfig)
            return;
        props.saveConfig(newConfig);
    };

    const handleDeleteConfig = () => {
        props.saveConfig({});

        form.reset();

        // Manually reset text fields that could have a non-empty default value.
        host.value = '';
        port.value = '';
        fromEmail.value = '';
        toEmail.value = '';
        user.value = '';
        password.value = '';
    };

    const handleSendTestEmail = () => {
        let testConfig = getCheckedConfig();
        if (!testConfig)
            return;
        props.sendTestEmail(testConfig);
    };

    const handleToggleRejectUnauthorized = event => {
        rejectUnauthorized = event.target.checked;
    };

    const handleToggleSecure = event => {
        secure = event.target.checked;
    };

    let maybeUser = typeof props.config.auth !== 'undefined' ? props.config.auth.user : null;

    return (
        <form
          ref={ refForm }
          className="top-panel"
          onSubmit={ handleSubmit }>
            <h3>{ $t('client.settings.emails.title') }</h3>

            <p className="alert alert-info">
                <span className="fa fa-question-circle pull-left" />
                { $t('client.settings.emails.description')}
            </p>

            <div className="form-group">
                <label
                  className="col-xs-4 control-label"
                  htmlFor="email_host">
                    { $t('client.settings.emails.host') }
                </label>
                <div className="col-xs-8">
                    <input
                      id="email_host"
                      className="form-control"
                      type="text"
                      ref={ refHost }
                      defaultValue={ props.config.host }
                    />
                </div>
            </div>

            <div className="form-group">
                <label
                  className="col-xs-4 control-label"
                  htmlFor="email_port">
                    { $t('client.settings.emails.port') }
                </label>
                <div className="col-xs-8">
                    <input
                      id="email_port"
                      className="form-control"
                      type="text"
                      ref={ refPort }
                      defaultValue={ props.config.port }
                    />
                </div>
            </div>

            <div className="form-group">
                <label
                  className="col-xs-4 control-label"
                  htmlFor="email_user">
                    { $t('client.settings.emails.user') }
                </label>
                <div className="col-xs-8">
                    <input
                      id="email_user"
                      className="form-control"
                      type="text"
                      ref={ refUser }
                      defaultValue={ maybeUser }
                    />
                </div>
            </div>

            <div className="form-group">
                <label
                  className="col-xs-4 control-label"
                  htmlFor="email_password">
                    { $t('client.settings.emails.password') }
                </label>
                <div className="col-xs-8">
                    <PasswordInput
                      id="email_password"
                      ref={ refPassword }
                    />
                </div>
            </div>

            <div className="form-group">
                <label
                  className="col-xs-4 control-label"
                  htmlFor="email_send_from">
                    { $t('client.settings.emails.send_from') }
                </label>
                <div className="col-xs-8">
                    <input
                      id="email_send_from"
                      className="form-control"
                      type="text"
                      ref={ refFromEmail }
                      defaultValue={ props.config.fromEmail }
                    />
                </div>
            </div>

            <div className="form-group">
                <label
                  className="col-xs-4 control-label"
                  htmlFor="email_send_to">
                    { $t('client.settings.emails.send_to') }
                </label>
                <div className="col-xs-8">
                    <input
                      id="email_send_to"
                      className="form-control"
                      type="text"
                      ref={ refToEmail }
                      defaultValue={ props.config.toEmail }
                    />
                </div>
            </div>

            <BoolSetting
              label={ $t('client.settings.emails.secure') }
              checked={ secure }
              onChange={ handleToggleSecure }
            />

            <BoolSetting
              label={ $t('client.settings.emails.reject_unauthorized') }
              checked={ rejectUnauthorized }
              onChange={ handleToggleRejectUnauthorized }
            />

            <div className="btn-toolbar pull-right">
                <input
                  type="button"
                  className="btn btn-default"
                  disabled={ props.sendingEmail }
                  onClick={ handleSendTestEmail }
                  value={ $t('client.settings.emails.send_test_email') }
                />

                <input
                  type="button"
                  className="btn btn-danger"
                  onClick={ handleDeleteConfig }
                  value={ $t('client.settings.emails.delete_config') }
                />

                <input
                  type="submit"
                  className="btn btn-primary"
                  value={ $t('client.settings.submit') }
                />
            </div>
        </form>
    );
};

export default connect(state => {
    return {
        config: JSON.parse(get.setting(state, 'mail-config')),
        sendingEmail: get.isSendingTestEmail(state)
    };
}, dispatch => {
    return {
        saveConfig: config => actions.setSetting(dispatch, 'mail-config', JSON.stringify(config)),
        sendTestEmail: config => actions.sendTestEmail(dispatch, config)
    };
})(EmailConfig);
