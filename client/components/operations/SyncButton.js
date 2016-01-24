import { has, translate as $t } from '../../helpers';
import { Actions, store, State } from '../../store';
import { MaybeHandleSyncError } from '../../errors';

export default class SyncButton extends React.Component {

    constructor(props) {
        has(props, 'account');
        super(props);
        this.state = {
            isSynchronizing: false
        };
    }

    onFetchOperations() {
        store.once(State.sync, this.afterFetchOperations.bind(this));
        Actions.FetchOperations();
        // Change UI to show a message indicating sync.
        this.setState({
            isSynchronizing: true
        });
    }

    afterFetchOperations(err) {
        this.setState({
            isSynchronizing: false
        });
        MaybeHandleSyncError(err);
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
                        { ` ${new Date(this.props.account.lastChecked).toLocaleString()}` }
                    </span>
                    <a href="#" onClick={ this.onFetchOperations.bind(this) }>
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
