import {Actions, store, State} from '../store';
import {translate as $t, NONE_CATEGORY_ID} from '../helpers';

import ConfirmDeleteModal from './ConfirmDeleteModal';
import ColorPicker from './ColorPicker';

function CreateForm(onSave, onCancel, previousValue, previousColor) {

    function onKeyUp(e) {
        if (e.keyCode == 13) {
            return onSave(e);
        }
        return true;
    }

    return (
        <tr>
            <td>
                <ColorPicker defaultValue={previousColor} ref="color" />
            </td>
            <td>
                <input type="text" className="form-control"
                  placeholder={$t('client.category.label')}
                  defaultValue={previousValue || ''} onKeyUp={onKeyUp}
                  ref="label" />
            </td>
            <td>
                <div className="btn-group btn-group-justified" role="group">
                    <a className="btn btn-success" role="button" onClick={onSave}>
                        {$t('client.general.save')}
                    </a>
                    <a className="btn btn-danger" role="button" onClick={onCancel}>
                        {$t('client.general.cancel')}
                    </a>
                </div>
            </td>
        </tr>);
}

class CategoryListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        }
    }

    onSaveEdit(e) {
        let label = this.refs.label.getDOMNode().value.trim();
        let color = this.refs.color.getValue();
        if (!label || !color)
            return false;

        var category = {
            title: label,
            color
        };

        Actions.UpdateCategory(this.props.cat, category);

        this.setState({
            editMode: false
        });
        e.preventDefault();
    }

    onCancelEdit(e) {
        this.setState({
            editMode: false
        });
        e.preventDefault();
    }

    onShowEdit(e) {
        this.setState({
            editMode: true
        }, function() {
            // then
            this.refs.label.getDOMNode().select();
        });
        e.preventDefault();
    }

    onDelete() {
        let replaceCategory = this.refs.replacement.getDOMNode().value;
        Actions.DeleteCategory(this.props.cat, replaceCategory);
    }

    render() {
        let c = this.props.cat;

        if (this.state.editMode)
            return CreateForm(this.onSaveEdit.bind(this), this.onCancelEdit.bind(this), c.title, c.color);

        let replacementOptions = store.getCategories()
                                    .filter(cat => (cat.id !== c.id && cat.id !== NONE_CATEGORY_ID))
                                    .map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>);

        replacementOptions = [
            <option key='none' value={NONE_CATEGORY_ID}>
                {$t('client.category.dont_replace')}
            </option>
        ].concat(replacementOptions);

        let modalBody = <div>
            <div className="alert alert-info">
                {$t('client.category.erase', {title: c.title})}
            </div>
            <div>
                <select className="form-control" ref="replacement">
                    {replacementOptions}
                </select>
            </div>
        </div>;

        return (
            <tr key={c.id}>
                <td>
                    <span style={{backgroundColor: c.color}} className="color_block">&nbsp;</span>
                </td>
                <td>{c.title}</td>
                <td>
                    <div className="btn-group btn-group-justified" role="group">
                        <a className="btn btn-primary" role="button" onClick={this.onShowEdit.bind(this)}>
                            {$t('client.general.edit')}
                        </a>
                        <a className="btn btn-danger" role="button" data-toggle="modal"
                          data-target={'#confirmDeleteCategory' + c.id}>
                            {$t('client.general.delete')}
                        </a>
                    </div>

                    <ConfirmDeleteModal
                        modalId={'confirmDeleteCategory' + c.id}
                        modalBody={modalBody}
                        onDelete={this.onDelete.bind(this)}
                    />
                </td>
            </tr>
        );
    }
}

export default class CategoryList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showForm: false,
            categories: []
        }
        this.listener = this._listener.bind(this);
    }

    _listener() {
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

    onShowForm(e) {
        e.preventDefault();
        this.setState({
            showForm: !this.state.showForm
        }, function() {
            // then
            if (this.state.showForm)
                this.refs.label.getDOMNode().select();
        });
    }

    onSave(e) {
        e.preventDefault();

        let label = this.refs.label.getDOMNode().value.trim();
        let color = this.refs.color.getValue();
        if (!label || !color)
            return false;

        let category = {
            title: label,
            color
        };

        Actions.CreateCategory(category);

        this.refs.label.getDOMNode().value = '';
        this.setState({
            showForm: false
        });
        return false;
    }

    render() {
        let items = this.state.categories
            .filter((cat) => cat.id != NONE_CATEGORY_ID)
            .map((cat) => <CategoryListItem cat={cat} key={cat.id} />);

        let maybeForm = this.state.showForm ? CreateForm(this.onSave.bind(this), this.onShowForm.bind(this))
                                            : <tr/>;

        return (
        <div>
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        {$t('client.category.title')}
                    </h3>
                </div>

                <div className="panel-body">
                    <a className="btn btn-primary text-uppercase pull-right" href="#" onClick={this.onShowForm.bind(this)}>
                        <span className="fa fa-plus"></span>
                        {$t('client.category.add')}
                    </a>
                </div>

                <table className="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th className="col-sm-1">
                                {$t('client.category.column_category_color')}
                            </th>
                            <th className="col-sm-9">
                                {$t('client.category.column_category_name')}
                            </th>
                            <th className="col-sm-2">
                                {$t('client.category.column_action')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {maybeForm}
                        {items}
                    </tbody>
                </table>
            </div>
        </div>);
    }
}
