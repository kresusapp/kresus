import { has, translate as $t } from '../../helpers';
import { Actions, store, State } from '../../store';
import { maybeHandleSyncError } from '../../errors';

export default class SyncButton extends React.Component {

    constructor(props) {
        has(props, 'account');
        super(props);
        this.state = {
            isSynchronizing: false
        };
        this.afterFetchOperations = this.afterFetchOperations.bind(this);
        this.handleFetch = this.handleFetch.bind(this);
    }

    handleFetch() {
        store.once(State.sync, this.afterFetchOperations);
        Actions.fetchOperations();
        // Change UI to show a message indicating sync.
        this.setState({
            isSynchronizing: true
        });
    }

    afterFetchOperations(err) {
        this.setState({
            isSynchronizing: false
        });
        maybeHandleSyncError(err);
    }

    render() {
        let text = (
            this.state.isSynchronizing ?
                <div className="last-sync">
                    <span className="option-legend">
                        { $t('client.operations.syncing') }
                    </span>
                    <span className="fa fa-refresh fa-spin"></span>
                </div> :
                <div className="last-sync">
                    <span className="option-legend">
                        { $t('client.operations.last_sync') }
                        &nbsp;
                        { new Date(this.props.account.lastChecked).toLocaleString() }
                    </span>
                    <a href="#" onClick={ this.handleFetch }>
                        <span className="option-legend fa fa-refresh"></span>
                    </a>
                </div>
         );

        return (
            <div className="panel-options">
                { text }
            </div>
        );
    }
}
