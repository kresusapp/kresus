import React from 'react';
import { connect } from 'react-redux';

import { actions, get } from '../../../store';
import { translate as $t } from '../../../helpers';

import BoolSetting from '../../ui/bool-setting';

class EmailConfig extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            expanded: false
        };

        this.checkConfig = this.checkConfig.bind(this);
        this.handleToggleExpand = this.handleToggleExpand.bind(this);
        this.handleToggleRejectUnauthorized = this.handleToggleRejectUnauthorized.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSendTestEmail = this.handleSendTestEmail.bind(this);

        this.rejectUnauthorized = this.props.config.tls.rejectUnauthorized;
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
            auth: {
                user: this.user.value && this.user.value.trim(),
                pass: this.password.value && this.password.value.trim()
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

        this.props.sendTestMail(config);
    }

    handleToggleRejectUnauthorized(event) {
        this.rejectUnauthorized = event.target.checked;
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
                            <input
                              id="email_password"
                              type="password"
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
                              type="text"
                              ref={ refToEmail }
                              defaultValue={ this.props.config.toEmail }
                            />
                        </div>
                    </div>

                    <BoolSetting
                      label={ $t('client.settings.emails.reject_unauthorized') }
                      checked={ this.props.config.tls.rejectUnauthorized }
                      onChange={ this.handleToggleRejectUnauthorized }
                    />

                    <div className="btn-toolbar pull-right">
                        <input
                          type="button"
                          className="btn btn-warning"
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
            return <div />;
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
                          className={ `option-legend fa fa-${expanded ? 'minus' : 'plus'}-circle` }
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
        sendTestMail: config => actions.sendTestEmail(dispatch, config)
    };
})(EmailConfig);
