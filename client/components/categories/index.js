import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

import { translate as $t } from '../../helpers';

import CategoryListItem from './item';

class CategoryList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showForm: false,
        };

        this.handleShowForm = this.handleShowForm.bind(this);
        this.handleCancelCreation = this.handleCancelCreation.bind(this);
    }

    handleShowForm(e) {
        e.preventDefault();

        this.setState({
            showForm: !this.state.showForm
        }, function() {
            // then
            if (this.state.showForm)
                this.refs.newCategory.selectTitle();
        });
    }

    handleCancelCreation(e) {
        this.handleShowForm(e, true);
    }

    render() {

        let items = this.props.categories.map(cat =>
            <CategoryListItem
              cat={ cat }
              categories={ this.props.categories }
              updateCategory={ this.props.updateCategory }
              deleteCategory={ this.props.deleteCategory }
              key={ cat.id }
            />);

        let maybeForm = (
            this.state.showForm ?
                (<CategoryListItem
                  cat={ {} }
                  categories={ this.props.categories }
                  createCategory={ this.props.createCategory }
                  cancelCreation={ this.handleCancelCreation }
                  ref="newCategory"
                 />) :
                <tr/>
        );

        let showForm = this.state.showForm;

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">
                            { $t('client.category.title') }
                        </h3>

                        <div className="panel-options">
                            <span className={ `option-legend fa fa-${showForm ?
                              'minus' : 'plus'}-circle` }
                              aria-label={ showForm ? 'cancel' : 'add' }
                              title={ $t(showForm ? 'client.general.cancel' :
                              'client.category.add') }
                              onClick={ this.handleShowForm }>
                            </span>
                        </div>
                    </div>

                    <table className="table table-striped table-hover table-bordered">
                        <thead>
                            <tr>
                                <th className="col-sm-1">
                                    { $t('client.category.column_category_color') }
                                </th>
                                <th className="col-sm-10">
                                    { $t('client.category.column_category_name') }
                                </th>

                                <th className="col-sm-1">
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

const Export = connect(state => {
    return {
        categories: get.categoriesButNone(state)
    };
}, dispatch => {
    return {
        createCategory(category) {
            actions.createCategory(dispatch, category);
        },
        updateCategory(former, newer) {
            actions.updateCategory(dispatch, former, newer);
        },
        deleteCategory(former, replaceById) {
            actions.deleteCategory(dispatch, former, replaceById);
        }
    };
})(CategoryList);

export default Export;
