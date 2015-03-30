// Helpers
var Events = require('./Events');
var t = require('./Helpers').translate;

// Classes
var AccountListComponent = require('./components/AccountListComponent');
var BankListComponent = require('./components/BankListComponent');
var CategoryComponent = require('./components/CategoryComponent');
var ChartComponent = require('./components/ChartComponent');
var OperationListComponent = require('./components/OperationListComponent');
var SimilarityComponent = require('./components/SimilarityComponent');

import SettingsComponent from './components/SettingsComponent';
import LoadScreenComponent from './components/LoadScreen';

// Global variables
var store = require('./store');

// Now this really begins.
class Kresus extends React.Component {

    constructor() {
        this.state = {
            showing: 'reports'
        }
    }

    componentDidMount() {
        // Let's go.
        store.loadStaticBanks();
        store.loadCategories();
        store.once(Events.state.categories, store.loadUserBanks);
    }

    _show(name) {
        return () => this.setState({ showing: name });
    }

    render() {

        if (!store.weboob.installed) {
            return <LoadScreenComponent />
        }

        var mainComponent;
        var showing = this.state.showing;
        switch(showing) {
            case "reports":
                mainComponent = <OperationListComponent/>
                break;
            case "charts":
                mainComponent = <ChartComponent/>
                break;
            case "categories":
                mainComponent = <CategoryComponent/>
                break;
            case "similarities":
                mainComponent = <SimilarityComponent/>
                break;
            case "settings":
                mainComponent = <SettingsComponent/>
                break;
            default:
                alert('unknown component to render: '  + showing + '!');
                break;
        }

        function IsActive(which) {
            return showing === which ? 'active' : '';
        }

        return (
        <div className="row">
            <div className="sidebar hidden-xs col-sm-3">
                <div className="logo sidebar-light">
                    <a href="#">{t('KRESUS')}</a>
                </div>

                <div className="sidebar-section-list">
                    <ul>
                        <li className={IsActive('reports')} onClick={this._show('reports')}>
                            <span className="sidebar-section-reports"> </span>{t('Reports')}
                        </li>
                        <li className={IsActive('charts')} onClick={this._show('charts')}>
                            <span className="sidebar-section-charts"> </span>{t('Charts')}
                        </li>
                        <li className={IsActive('categories')} onClick={this._show('categories')}>
                            <span className="sidebar-section-categories"> </span>{t('Categories')}
                        </li>
                        <li className={IsActive('similarities')} onClick={this._show('similarities')}>
                            <span className="sidebar-section-similarities"> </span>{t('Similarities')}
                        </li>
                        <li className={IsActive('settings')} onClick={this._show('settings')}>
                            <span className="sidebar-section-settings"> </span>{t('Settings')}
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="sidebar-bank-header">{t('Banks')}</h3>
                </div>

                <BankListComponent />
                <AccountListComponent />
            </div>

            <div className="col-sm-3"></div>

            <div className="main-block col-xs-12 col-sm-9">
                <div className="main-container">

                    {mainComponent}

                </div>
            </div>
        </div>
        );
    }
};

store.setupKresus(function() {
    React.render(<Kresus />, document.querySelector('#main'));
});
