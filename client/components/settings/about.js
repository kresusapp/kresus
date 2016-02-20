import { translate as $t } from '../../helpers';
import packageConfig from '../../../package.json';

export default class About extends React.Component {

    render() {
        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">{ $t('client.settings.tab_about') }</h3>
                </div>

                <div className="panel-body">
                    <h3 className="app-title">KRESUS</h3>
                    <span>
                        Version: <code>{ packageConfig.version }</code> &nbsp;
                        { $t('client.settings.license') }: <code>{ packageConfig.license }</code>
                    </span>

                    <p style={ { paddingTop: '20', paddingBottom: '15' } }>
                        { $t('client.about') }
                    </p>

                    <div className="btn-group">
                        <a className="btn btn-default"
                          href="https://github.com/bnjbvr/kresus"
                          target="_blank">
                            <i className="fa fa-code"></i> Sources
                        </a>
                        <a className="btn btn-default"
                          href="https://forum.cozy.io/t/app-kresus"
                          target="_blank">
                            <i className="fa fa-cloud"></i> { $t('client.settings.forum_thread') }
                        </a>
                        <a className="btn btn-default"
                          href="https://blog.benj.me/tag/kresus"
                          target="_blank">
                            <i className="fa fa-pencil-square-o"></i> Blog
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
