import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import BoolSetting from '../../ui/bool-setting';
import PasswordInput from '../../ui/password-input';

class EmailConfig extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        };

        this.checkConfig = this.checkConfig.bind(this);
        this.handleToggleExpand = this.handleToggleExpand.bind(this);
        this.handleToggleRejectUnauthorized = this.handleToggleRejectUnauthorized.bind(this);
        this.handleToggleSecure = this.handleToggleSecure.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSendTestEmail = this.handleSendTestEmail.bind(this);

        this.rejectUnauthorized = !!this.props.config.tls.rejectUnauthorized;
        this.secure = !!this.props.config.secure;
    }

    handleToggleExpand() {
        this.setState({
            expanded: !this.state.expanded
        });
    }

    checkConfig() {
        let config = {
            fromEmail: this.fromEmail.value.trim(),
            toEmail: this.toEmail.value.trim(),
            host: this.host.value.trim(),
            port: this.port.value.trim(),
            secure: this.secure,
            auth: {
                user: this.user.value && this.user.value.trim(),
                pass: this.password.getValue()
            },
            tls: {
                rejectUnauthorized: this.rejectUnauthorized
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
    }

    handleSubmit() {
        let config = this.checkConfig();
        if (!config)
            return;

        this.props.saveConfig(config);
    }

    handleSendTestEmail() {
        let config = this.checkConfig();
        if (!config)
            return;

        this.props.sendTestEmail(config);
    }

    handleToggleRejectUnauthorized(event) {
        this.rejectUnauthorized = event.target.checked;
    }

    handleToggleSecure(event) {
        this.secure = event.target.checked;
    }

    renderFullForm() {
        let refHost = node => {
            this.host = node;
        };
        let refPort = node => {
            this.port = node;
        };
        let refUser = node => {
            this.user = node;
        };
        let refPassword = node => {
            this.password = node;
        };
        let refFromEmail = node => {
            this.fromEmail = node;
        };
        let refToEmail = node => {
            this.toEmail = node;
        };

        return (
            <div className="panel-body transition-expand">
                <form onSubmit={ this.handleSubmit }>

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
                              defaultValue={ this.props.config.host }
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
                              defaultValue={ this.props.config.port }
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
                              defaultValue={ this.props.config.user || '' }
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
                              defaultValue={ this.props.config.fromEmail }
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
                              defaultValue={ this.props.config.toEmail }
                            />
                        </div>
                    </div>

                    <BoolSetting
                      label={ $t('client.settings.emails.secure') }
                      checked={ this.props.config.secure }
                      onChange={ this.handleToggleSecure }
                    />

                    <BoolSetting
                      label={ $t('client.settings.emails.reject_unauthorized') }
                      checked={ this.props.config.tls.rejectUnauthorized }
                      onChange={ this.handleToggleRejectUnauthorized }
                    />

                    <div className="btn-toolbar pull-right">
                        <input
                          type="button"
                          className="btn btn-default"
                          disabled={ this.props.sendingEmail }
                          onClick={ this.handleSendTestEmail }
                          value={ $t('client.settings.emails.send_test_email') }
                        />
                        <input
                          type="submit"
                          className="btn btn-primary"
                          value={ $t('client.settings.submit') }
                        />
                    </div>

                </form>
            </div>
        );
    }

    render() {
        // In the Cozy mode, no need to allow the user to configurate their own
        // email service, since the platform does it for use.
        if (!this.props.standalone) {
            return null;
        }

        let { expanded } = this.state;
        let body = expanded ? this.renderFullForm() : <div />;

        return (
            <div className="top-panel panel panel-default">
                <div
                  className="panel-heading clickable"
                  onClick={ this.handleToggleExpand }>
                    <h3 className="title panel-title">
                        { $t('client.settings.emails.config_title') }
                    </h3>

                    <div className="panel-options">
                        <span
                          className={ `option-legend fa fa-${expanded ? 'minus' : 'plus'}-square` }
                          aria-label="set"
                          title={ $t('client.settings.emails.config_toggle') }
                        />
                    </div>
                </div>

                { body }
            </div>
        );
    }
}

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
