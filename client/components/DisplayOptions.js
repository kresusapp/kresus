import { store, Actions } from '../store';
import { has, translate as $t } from '../helpers';
import CheckBox from './CheckBox';
import TogglablePanel from './TogglablePanel';

export default class DisplayOptions extends React.Component {
    constructor(props) {
        super(props);
        this.handleOnChangeShowFutureOperations = this.handleOnChangeShowFutureOperations.bind(this);
    }

    handleOnChangeShowFutureOperations() {
        Actions.ToggleBoolSetting('showFutureOperations');
    }

    render() {
        let body;
        body = (
            <form>
                <div className="form-group">
                    <CheckBox
                      label={ $t('client.display_options.future_operations') }
                      checked={ store.getBoolSetting('showFutureOperations') }
                      onChange={ this.handleOnChangeShowFutureOperations }
                    />
                </div>
            </form>
        );
        return (
            <TogglablePanel
              body={ body }
              title={ $t('client.display_options.title') }
            />
       );
    }
}
