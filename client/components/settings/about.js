import { translate as $t } from '../../helpers';
import packageConfig from '../../../package.json';

export default class About extends React.Component {

    render() {
        return (
            <div className="top-panel panel panel-default about">
                <div className="panel-heading">
                    <h3 className="title panel-title">{ $t('client.settings.tab_about') }</h3>
                </div>

                <div className="panel-body">
                    <h3 className="app-title">KRESUS</h3>
                    <span>
                        Version: <code>{ packageConfig.version }</code> &nbsp;
                        { $t('client.settings.license') }: <code>{ packageConfig.license }</code>
                    </span>

                    <p>{ $t('client.about') }</p>

                    <div className="btn-group">
                        <a className="btn btn-default"
                          href="https://framagit.org/bnjbvr/kresus"
                          target="_blank">
                            <i className="fa fa-code"></i> { $t('client.settings.sources') }
                        </a>
                        <a className="btn btn-default"
                          href="https://forum.cozy.io/t/app-kresus"
                          target="_blank">
                            <i className="fa fa-cloud"></i> { $t('client.settings.forum_thread') }
                        </a>
                        <a className="btn btn-default"
                          href="https://blog.benj.me/tag/kresus"
                          target="_blank">
                            <i className="fa fa-pencil-square-o"></i> { $t('client.settings.blog') }
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
