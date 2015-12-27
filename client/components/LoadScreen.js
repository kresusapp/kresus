import {store} from '../store';

import T from './Translated';

export default class LoadScreen extends React.Component {

    render() {
        return (
            <div>
                <h1>
                    <T k='client.loadscreen.title'>Please wait while Kresus installs dependencies…
                    </T>
                </h1>
                <div className="well">
                    <T k='client.loadscreen.prolix1'>
                        Kresus is currently trying to install its dependencies.
                        This can take up to 10 minutes on slow servers.
                    </T>
                    <br/><br/>
                    <T k='client.loadscreen.prolix2'>
                        If you're self-hosting, please consider reading the
                    </T>
                    &nbsp;<a href="https://github.com/bnjbvr/kresus/blob/incoming/README.md">README</a>
                    &nbsp;<T k='client.loadscreen.prolix3'>
                        to ensure all the needed prerequisites have been
                        installed on your machine. On the CozyCloud infra, your
                        machine should be already set up.
                    </T>
                    <br/><br/>
                    <T k='client.loadscreen.prolix4'>
                        The page is going to automatically reload in a short while. If
                        you get stuck after 10 minutes, consider writing a message in
                        the
                    </T>
                    &nbsp;<a href="https://forum.cozy.io/t/app-kresus/">forum</a>.
                    <br/><br/>
                    <T k='client.loadscreen.prolix5'>
                        Thank you for your patience.
                    </T>
                </div>
                <div>
                    <iframe
                      width="100%"
                      height="600px"
                      src="https://www.youtube.com/embed/INB3aV4CQBE"
                      frameBorder="0"
                      allowFullScreen>
                    </iframe>
                </div>
            </div>
       );
    }
}
