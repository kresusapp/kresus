import { translate as $t } from '../../helpers';
import { store, Actions, State } from '../../store';

export default class WeboobParameters extends React.Component {

    constructor(props) {
        super(props);
        this.onWeboobUpdated = this._onWeboobUpdated.bind(this);
        this.handleToggleWeboobAutoMergeAccounts = this.handleToggleWeboobAutoMergeAccounts.bind(this);
        this.handleToggleWeboobAutoUpdate = this.handleToggleWeboobAutoUpdate.bind(this);
        this.state = {
            isUpdatingWeboob: false
        };
    }

    componentDidMount() {
        store.on(State.weboob, this.onWeboobUpdated);
    }
    componentWillUnmount() {
        store.removeListener(State.weboob, this.onWeboobUpdated);
    }

    onWeboobUpdate(which) {
        Actions.UpdateWeboob();
        this.setState({
            isUpdatingWeboob: true
        });
    }

    _onWeboobUpdated() {
        this.setState({
            isUpdatingWeboob: false
        });
    }

    handleToggleWeboobAutoMergeAccounts(e) {
        let newValue = e.target.checked;
        Actions.ChangeBoolSetting('weboob-auto-merge-accounts', newValue);
    }

    handleToggleWeboobAutoUpdate(e) {
        let newValue = e.target.checked;
        Actions.ChangeBoolSetting('weboob-auto-update', newValue);
    }

    render() {
        return <form>

            <div className="form-group clearfix">
                <label htmlFor="autoMerge" className="col-xs-4 control-label">
                    {$t('client.settings.weboob_auto_merge_accounts')}
                </label>
                <div className="col-xs-8">
                    <input
                      id="autoMerge"
                      type="checkbox"
                      ref="autoMerge"
                      defaultChecked={store.getBoolSetting('weboob-auto-merge-accounts')}
                      onChange={this.handleToggleWeboobAutoMergeAccounts}
                    />
                </div>
            </div>

            <div className="form-group clearfix">
                <label htmlFor="autoUpdate" className="col-xs-4 control-label">
                    {$t('client.settings.weboob_auto_update')}
                </label>
                <div className="col-xs-8">
                    <input
                      id="autoUpdate"
                      type="checkbox"
                      ref="autoUpdate"
                      defaultChecked={store.getBoolSetting('weboob-auto-update')}
                      onChange={this.handleToggleWeboobAutoUpdate}
                    />
                </div>
            </div>

            <div className="form-group clearfix">
                <label htmlFor="updateWeboob" className="col-xs-4 control-label">
                    {$t('client.settings.update_weboob')}
                </label>
                <div className="col-xs-8">
                    <button
                        id="updateWeboob"
                        type="button"
                        className="btn btn-primary"
                        onClick={this.onWeboobUpdate.bind(this)}
                        disabled={this.state.isUpdatingWeboob ? 'disabled' : undefined}>
                            {$t('client.settings.go_update_weboob')}
                    </button>
                    <span className="help-block">
                        {$t('client.settings.update_weboob_help')}
                    </span>
                </div>
            </div>
        </form>;
    }
}
