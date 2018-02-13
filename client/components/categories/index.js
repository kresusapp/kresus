import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

import { translate as $t } from '../../helpers';

import CategoryListItem from './item';

class CategoryList extends React.Component {
    constructor(props) {
        super(props);

        this.refNewCategory = this.refNewCategory.bind(this);
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

        return (
            <div>
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
                        <CategoryListItem
                            cat={{}}
                            categories={this.props.categories}
                            createCategory={this.props.createCategory}
                            ref={this.refNewCategory}
                            className="new-category"
                            placeholder="client.category.new_category_label"
                        />
                        {items}
                    </tbody>
                </table>
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
