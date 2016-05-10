import {store} from '../store';
import {translate as $t} from '../helpers';

export default class LoadScreen extends React.Component {

    render() {
        return (
            <div>
                <h1>
                    {$t('client.loadscreen.title')}
                </h1>
                <div className="well">
                    {$t('client.loadscreen.prolix1')}
                    <br/><br/>
                    {$t('client.loadscreen.prolix2')}
                    &nbsp;<a href="https://github.com/bnjbvr/kresus/blob/incoming/README.md">README</a>
                    &nbsp;{$t('client.loadscreen.prolix3')}
                    <br/><br/>
                    {$t('client.loadscreen.prolix4')}
                    &nbsp;<a href="https://forum.cozy.io/t/app-kresus/">forum</a>.
                    <br/><br/>
                    {$t('client.loadscreen.prolix5')}
                </div>
                <div>
                    <iframe
                      width="100%"
                      height="600px"
                      src="https://www.youtube.com/embed/Cdo0lfWoqws"
                      frameBorder="0"
                      allowFullScreen>
                    </iframe>
                </div>
            </div>
       );
    }
}
