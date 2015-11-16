import {store} from '../store';

import T from './Translated';

export default class LoadScreen extends React.Component {

    render() {
        return (
            <div>
                <h1>
                    <T k='loadscreen.title'>Please wait while Kresus installs dependencies…
                    </T>
                </h1>
                <p><T k='loadscreen.prolix'>
                Please reload the page in a short while, and contact a Kresus maintainer if you see any errors here!
                </T></p>
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
