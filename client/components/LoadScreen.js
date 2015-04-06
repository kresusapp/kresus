import {store} from '../store';

import { translate as t } from '../Helpers';

export default class LoadScreen extends React.Component {

    constructor() {
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
                    <iframe width="100%" height="600px" src="https://www.youtube.com/embed/n2skcS7oHfw" frameBorder="0" allowFullScreen></iframe>
                </div>;

        return (
            <div>
                <h1>{t('Please wait during Kresus dependencies installation')}</h1>
                <p>{t('dependencies-install')}</p>
                <p><button className="btn btn-primary pull-right" onClick={this.toggleLog.bind(this)}>Toggle log</button></p>
                {details}
            </div>
       );
    }

}
