import { translate as $t } from '../../helpers';

export default class WeboobInstallReadme extends React.Component {

    render() {
        return (
            <div>
                <h1>
                    { $t('client.weboobinstallreadme.title') }
                </h1>
                <div className="well">
                    { $t('client.weboobinstallreadme.content') }
                    <a href="https://framagit.org/bnjbvr/kresus/blob/incoming/README.md">README</a>.
                </div>
            </div>
       );
    }
}
