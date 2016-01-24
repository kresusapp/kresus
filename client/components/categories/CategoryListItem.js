import { Actions, store } from '../../store';
import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';

import { CreateForm } from './CategoryList';
import ConfirmDeleteModal from '../ui/ConfirmDeleteModal';

export default class CategoryListItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
    }

    onSaveEdit(e) {
        let label = this.refs.label.getDOMNode().value.trim();
        let color = this.refs.color.getValue();
        if (!label || !color)
            return false;

        let category = {
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
                                    .map(cat =>
                                        <option
                                          key={ cat.id }
                                          value={ cat.id }>
                                            { cat.title }
                                        </option>);

        replacementOptions = [
            <option key="none" value={ NONE_CATEGORY_ID }>
                { $t('client.category.dont_replace') }
            </option>
        ].concat(replacementOptions);

        let modalBody = <div>
            <div className="alert alert-info">
                { $t('client.category.erase', { title: c.title }) }
            </div>
            <div>
                <select className="form-control" ref="replacement">
                    { replacementOptions }
                </select>
            </div>
        </div>;

        return (
            <tr key={ c.id }>
                <td>
                    <span
                      style={ { backgroundColor: c.color } }
                      className="color_block">
                        &nbsp;
                    </span>
                </td>
                <td>{ c.title }</td>
                <td>
                    <div className="btn-group btn-group-justified" role="group">
                        <a
                          className="btn btn-primary"
                          role="button"
                          onClick={ this.onShowEdit.bind(this) }>
                            { $t('client.general.edit') }
                        </a>
                        <a className="btn btn-danger" role="button" data-toggle="modal"
                          data-target={ `#confirmDeleteCategory${c.id}` }>
                            { $t('client.general.delete') }
                        </a>
                    </div>

                    <ConfirmDeleteModal
                      modalId={ `confirmDeleteCategory${c.id}` }
                      modalBody={ modalBody }
                      onDelete={ this.onDelete.bind(this) }
                    />
                </td>
            </tr>
        );
    }
}
