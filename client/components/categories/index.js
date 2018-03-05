import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

import { translate as $t } from '../../helpers';

import CategoryListItem from './item';

class CategoryList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            showForm: false
        };

        this.handleShowForm = this.handleShowForm.bind(this);
        this.refNewCategory = this.refNewCategory.bind(this);
    }

    handleAddDefault = () => {
        this.props.createDefaultCategories();
    };

    handleShowForm(e) {
        e.preventDefault();

        this.setState(
            {
                showForm: !this.state.showForm
            },
            function() {
                // then
                if (this.state.showForm) {
                    this.newCategory.selectTitle();
                }
            }
        );
    }

    refNewCategory(node) {
        this.newCategory = node;
    }

    render() {
        let items = this.props.categories.map(cat => (
            <CategoryListItem
                cat={cat}
                categories={this.props.categories}
                updateCategory={this.props.updateCategory}
                deleteCategory={this.props.deleteCategory}
                key={cat.id}
            />
        ));

        let maybeForm = this.state.showForm ? (
            <CategoryListItem
                cat={{}}
                categories={this.props.categories}
                createCategory={this.props.createCategory}
                onCancelCreation={this.handleShowForm}
                ref={this.refNewCategory}
            />
        ) : (
            <tr />
        );

        let buttonType = 'plus';
        let buttonAriaLabel = 'add';
        let buttonLabel = 'client.category.add';

        if (this.state.showForm) {
            buttonType = 'minus';
            buttonAriaLabel = 'cancel';
            buttonLabel = 'client.general.cancel';
        }

        return (
            <div>
                <p className="clearfix">
                    <button
                        className="btn btn-default pull-right"
                        aria-label={buttonAriaLabel}
                        onClick={this.handleShowForm}>
                        <span className={`fa fa-${buttonType}-circle`} />
                        {$t(buttonLabel)}
                    </button>
                </p>

                <table className="table table-striped table-hover table-bordered">
                    <thead>
                        <tr>
                            <th className="col-sm-1">
                                {$t('client.category.column_category_color')}
                            </th>
                            <th className="col-sm-10">
                                {$t('client.category.column_category_name')}
                            </th>

                            <th className="col-sm-1">{$t('client.category.column_action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {maybeForm}
                        {items}
                    </tbody>
                </table>

                <p className="text-center">
                    <button
                        className="btn btn-default"
                        aria-label="add default"
                        onClick={this.handleAddDefault}>
                        <span className={`fa fa-${buttonType}-circle`} />
                        {$t('client.category.add_default')}
                    </button>
                </p>
            </div>
        );
    }
}

const Export = connect(
    state => {
        return {
            categories: get.categoriesButNone(state)
        };
    },
    dispatch => {
        return {
            createCategory(category) {
                actions.createCategory(dispatch, category);
            },
            createDefaultCategories: () => actions.createDefaultCategories(dispatch),
            updateCategory(former, newer) {
                actions.updateCategory(dispatch, former, newer);
            },
            deleteCategory(former, replaceById) {
                actions.deleteCategory(dispatch, former, replaceById);
            }
        };
    }
)(CategoryList);

export default Export;
