import { Actions, store, State } from '../../store';
import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';

import CategoryListItem from './item';
import CreateForm from './create-form';

export default class CategoryList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showForm: false,
            categories: []
        };

        this.listener = this.listener.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.handleShowForm = this.handleShowForm.bind(this);
    }

    listener() {
        this.setState({
            categories: store.getCategories()
        });
    }

    componentDidMount() {
        store.subscribeMaybeGet(State.categories, this.listener);
    }

    componentWillUnmount() {
        store.removeListener(State.categories, this.listener);
    }

    handleShowForm(e) {
        e.preventDefault();
        this.setState({
            showForm: !this.state.showForm
        }, function() {
            // then
            if (this.state.showForm)
                this.refs.createform.selectLabel();
        });
    }

    handleSave(e, title, color) {
        e.preventDefault();

        let category = {
            title,
            color
        };

        Actions.createCategory(category);

        this.refs.createform.clearLabel();
        this.setState({
            showForm: false
        });
        return false;
    }

    render() {
        let items = this.state.categories
            .filter(cat => cat.id !== NONE_CATEGORY_ID)
            .map(cat => <CategoryListItem cat={ cat } key={ cat.id } />);

        let maybeForm = (
            this.state.showForm ?
                (<CreateForm
                  ref="createform"
                  onSave={ this.handleSave }
                  onCancel={ this.handleShowForm }
                 />) :
                <tr/>
        );

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.category.title') }
                        </h3>
                    </div>

                    <div className="panel-body">
                        <a className="btn btn-primary text-uppercase pull-right"
                          href="#" onClick={ this.handleShowForm } >
                            <span className="fa fa-plus"></span>
                            { $t('client.category.add') }
                        </a>
                    </div>

                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                <th className="col-sm-1">
                                    { $t('client.category.column_category_color') }
                                </th>
                                <th className="col-sm-9">
                                    { $t('client.category.column_category_name') }
                                </th>
                                <th className="col-sm-2">
                                    { $t('client.category.column_action') }
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { maybeForm }
                            { items }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
