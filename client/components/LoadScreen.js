import {store} from '../store';

import T from './Translated';

export default class LoadScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showLog: false
        }
    }

    toggleLog() {
        this.setState({
            showLog: !this.state.showLog
        });
    }

    render() {
        var style = {
            width: '100%',
            height: '800px'
        }

        var details = this.state.showLog ?
                <textarea style={style}>
                    {store.getWeboobLog()}
                </textarea>
            :
                <div>
                    <iframe
                      width="100%"
                      height="600px"
                      src="https://www.youtube.com/embed/1NYm6_a_XYw"
                      frameBorder="0"
                      allowFullScreen>
                    </iframe>
                </div>;

        return (
            <div>
                <h1>
                    <T k='loadscreen.title'>Please wait while Kresus installs dependencies…
                    </T>
                </h1>
                <p><T k='loadscreen.prolix'>
                Please reload the page in a short while, and contact a Kresus maintainer if you see any errors here!
                </T></p>
                <p><button className="btn btn-primary pull-right" onClick={this.toggleLog.bind(this)}>Toggle log</button></p>
                {details}
            </div>
       );
    }

}
