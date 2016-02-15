import { assert, translate as $t } from '../../helpers';

import packageConfig from '../../../package.json';

import WeboobParameters from '../shared/WeboobParameters';

import BankAccountsList from './bank-accounts-subsection';
import DefaultParameters from './default-parameters-subsection';
import BackupParameters from './backup-subsection';
import EmailsParameters from './emails-subsection';

class About extends React.Component {
    render() {
        return (
            <div>
                <h3>Kresus</h3>
                <ul>
                    <li>Version: { packageConfig.version }</li>
                    <li>License: { packageConfig.license }</li>
                    <li>
                        <a href="https://github.com/bnjbvr/kresus" target="_blank">
                            Code
                        </a>
                    </li>
                    <li>
                        <a href="https://forum.cozy.io/t/app-kresus" target="_blank">
                            Cozy Forum thread
                        </a>
                    </li>
                    <li>
                        <a href="https://blog.benj.me/tag/kresus" target="_blank">
                            Blog
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default class SettingsComponents extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showing: 'accounts'
        };
    }

    show(which) {
        return () => {
            this.setState({
                showing: which
            });
        };
    }

    render() {
        let self = this;
        function maybeActive(name) {
            return self.state.showing === name ? 'active' : '';
        }

        let Tab;
        switch (this.state.showing) {
            case 'accounts':
                Tab = <BankAccountsList/>;
                break;
            case 'defaults':
                Tab = <DefaultParameters/>;
                break;
            case 'about':
                Tab = <About/>;
                break;
            case 'backup':
                Tab = <BackupParameters/>;
                break;
            case 'weboob':
                Tab = <WeboobParameters/>;
                break;
            case 'emails':
                Tab = <EmailsParameters/>;
                break;
            default:
                assert(false, 'unknown state to show in settings');
        }

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.settings.title') }
                        </h3>
                    </div>

                    <div className="panel-body">
                        <div className="col-md-3">
                            <nav className="top-panel navbar navbar-default">
                                <div className="navbar-header">
                                    <button type="button" className="navbar-toggle"
                                      data-toggle="collapse"
                                      data-target="#settings-menu-collapse">
                                        <span className="sr-only">Toggle navigation</span>
                                        <span className="fa fa-navicon"></span>
                                    </button>
                                </div>

                                <div className="collapse navbar-collapse sidebar-navbar-collapse"
                                  id="settings-menu-collapse">
                                    <ul className="nav nav-pills nav-stacked">
                                        <li role="presentation"
                                          className={ maybeActive('accounts') }>
                                            <a href="#" onClick={ this.show('accounts') }>
                                                { $t('client.settings.tab_accounts') }
                                            </a>
                                        </li>
                                        <li role="presentation"
                                          className={ maybeActive('emails') }>
                                            <a href="#" onClick={ this.show('emails') }>
                                                { $t('client.settings.tab_emails') }
                                            </a>
                                        </li>
                                        <li role="presentation"
                                          className={ maybeActive('defaults') }>
                                            <a href="#" onClick={ this.show('defaults') }>
                                                { $t('client.settings.tab_defaults') }
                                            </a>
                                        </li>
                                        <li role="presentation"
                                          className={ maybeActive('backup') }>
                                            <a href="#" onClick={ this.show('backup') }>
                                                { $t('client.settings.tab_backup') }
                                            </a>
                                        </li>
                                        <li role="presentation"
                                          className={ maybeActive('weboob') }>
                                            <a href="#" onClick={ this.show('weboob') }>
                                                { $t('client.settings.tab_weboob') }
                                            </a>
                                        </li>
                                        <li role="presentation"
                                          className={ maybeActive('about') }>
                                            <a href="#" onClick={ this.show('about') }>
                                                { $t('client.settings.tab_about') }
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </nav>
                        </div>

                        <div className="col-xs-12 col-md-9">
                            { Tab }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
