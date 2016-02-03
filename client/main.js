// Global variables
import {store, State} from './store';
import {translate as $t} from './helpers';

// Components
import AccountListComponent from './components/menu/AccountList';
import BankListComponent from './components/menu/BankList';
import CategoryComponent from './components/categories';
import ChartComponent from './components/charts/Charts';
import OperationListComponent from './components/operations/OperationList';
import SimilarityComponent from './components/duplicates';
import SettingsComponent from './components/settings/Settings';
import MainAccountWizard from './components/init/MainAccountWizard';
import WeboobInstallReadme from './components/init/WeboobInstallReadme';

// Now this really begins.
class Kresus extends React.Component {

    constructor() {
        super();
        this.state = {
            showing: 'reports'
        };
    }

    componentDidMount() {
        // Fake mutations to re-trigger rendering
        store.on(State.weboob, () => this.setState({ showing: this.state.showing }));
        store.on(State.banks, () => this.setState({ showing: this.state.showing }));
    }

    show(name) {
        return () => this.setState({ showing: name });
    }

    render() {
        if (!store.isWeboobInstalled()) {
            return <WeboobInstallReadme />;
        }

        if (store.getCurrentBank() === null) {
            return <MainAccountWizard />;
        }

        var mainComponent;
        var showing = this.state.showing;
        switch(showing) {
            case "reports":
                mainComponent = <OperationListComponent/>;
                break;
            case "charts":
                mainComponent = <ChartComponent/>;
                break;
            case "categories":
                mainComponent = <CategoryComponent/>;
                break;
            case "similarities":
                mainComponent = <SimilarityComponent/>;
                break;
            case "settings":
                mainComponent = <SettingsComponent/>;
                break;
            default:
                alert('unknown component to render: '  + showing + '!');
                break;
        }

        function IsActive(which) {
            return showing === which ? 'active' : '';
        }

        return (
        <div>
            <div className="row navbar main-navbar visible-xs">
                <button className="navbar-toggle" data-toggle="offcanvas" data-target=".sidebar">
                    <span className="fa fa-navicon"></span>
                </button>
                <a className="navbar-brand" href="#">{$t('client.KRESUS')}</a>
            </div>

            <div className="row">
                <div className="sidebar offcanvas-xs col-sm-3 col-xs-10">
                    <div className="logo sidebar-light">
                        <a href="#">{$t('client.KRESUS')}</a>
                    </div>

                    <div className="banks-accounts-list">
                        <BankListComponent />
                        <AccountListComponent />
                    </div>

                    <div className="sidebar-section-list">
                        <ul>
                            <li className={IsActive('reports')} onClick={this.show('reports')}>
                                <i className="fa fa-briefcase"> </i>
                                {$t('client.menu.reports')}
                            </li>
                            <li className={IsActive('charts')} onClick={this.show('charts')}>
                                <i className="fa fa-line-chart"> </i>
                                {$t('client.menu.charts')}
                            </li>
                            <li className={IsActive('similarities')} onClick={this.show('similarities')}>
                                <i className="fa fa-clone"> </i>
                                {$t('client.menu.similarities')}
                            </li>
                            <li className={IsActive('categories')} onClick={this.show('categories')}>
                                <i className="fa fa-list-ul"> </i>
                                {$t('client.menu.categories')}
                            </li>
                            <li className={IsActive('settings')} onClick={this.show('settings')}>
                                <i className="fa fa-cogs"> </i>
                                {$t('client.menu.settings')}
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="col-sm-3"></div>

                <div className="main-block col-xs-12 col-sm-9">
                    <div className="main-container">
                        {mainComponent}
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

store.setupKresus(function() {
    React.render(<Kresus />, document.querySelector('#main'));
});
