import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import BoolSetting from '../../ui/bool-setting';
import PasswordInput from '../../ui/password-input';
import FoldablePanel from '../../ui/foldable-panel';

const EmailConfig = props => {
    // In the Cozy mode, no need to allow the user to configurate their own
    // email service, since the platform does it for use.
    if (!props.standalone) {
        return null;
    }

    let rejectUnauthorized = !!props.config.tls.rejectUnauthorized;
    let secure = !!props.config.secure;

    let host = null;
    let port = null;
    let user = null;
    let password = null;
    let fromEmail = null;
    let toEmail = null;

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
        let config = {
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

        if (!config.fromEmail.length ||
            !config.toEmail.length ||
            !config.host.length ||
            !config.port.length) {
            alert($t('client.settings.emails.missing_fields'));
            return;
        }

        let portAsInt = Number.parseInt(config.port, 10) | 0;
        if (String(portAsInt) !== config.port || portAsInt < 1 || portAsInt > 65535) {
            alert($t('client.settings.emails.invalid_port'));
            return;
        }

        if (config.auth.user === '' && config.auth.pass === '') {
            delete config.auth;
        }

        return config;
    };

    const handleSubmit = () => {
        let config = getCheckedConfig();
        if (!config)
            return;

        props.saveConfig(config);
    };

    const handleSendTestEmail = () => {
        let config = getCheckedConfig();
        if (!config)
            return;

        props.sendTestEmail(config);
    };

    const handleToggleRejectUnauthorized = event => {
        rejectUnauthorized = event.target.checked;
    };

    const handleToggleSecure = event => {
        secure = event.target.checked;
    };

    return (
        <FoldablePanel
          className="email-panel"
          title={ $t('client.settings.emails.config_title') }
          iconTitle={ $t('client.settings.emails.config_toggle') }
          top={ true }>
            <form onSubmit={ handleSubmit }>

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
                          placeholder="127.0.0.1"
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
                          type="number"
                          step="1"
                          min="1"
                          max="65535"
                          ref={ refPort }
                          defaultValue={ props.config.port }
                          placeholder="587"
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
                          defaultValue={ props.config.user }
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
                          type="email"
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
                          type="email"
                          ref={ refToEmail }
                          defaultValue={ props.config.toEmail }
                        />
                    </div>
                </div>

                <BoolSetting
                  label={ $t('client.settings.emails.secure') }
                  checked={ props.config.secure }
                  onChange={ handleToggleSecure }
                />

                <BoolSetting
                  label={ $t('client.settings.emails.reject_unauthorized') }
                  checked={ props.config.tls.rejectUnauthorized }
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
                      type="submit"
                      className="btn btn-primary"
                      value={ $t('client.settings.submit') }
                    />
                </div>
            </form>
        </FoldablePanel>
    );
};

export default connect(state => {
    return {
        standalone: get.boolSetting(state, 'standalone-mode'),
        config: JSON.parse(get.setting(state, 'mail-config')),
        sendingEmail: get.isSendingTestEmail(state)
    };
}, dispatch => {
    return {
        saveConfig: config => actions.setSetting(dispatch, 'mail-config', JSON.stringify(config)),
        sendTestEmail: config => actions.sendTestEmail(dispatch, config)
    };
})(EmailConfig);
