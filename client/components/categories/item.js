import React from 'react';
import PropTypes from 'prop-types';

import { ButtonLink } from '../ui';

import URL from './urls';

const CategoryListItem = props => {
    const { category } = props;

    const style = {
        backgroundColor: category.color,
    };

    return (
        <tr key={category.id}>
            <td>
                <div className="color-preview" style={style} />
            </td>

            <td>{category.label}</td>

            <td className="item-actions">
                <ButtonLink className="primary" to={URL.edit(category.id)} icon="edit" />
                <ButtonLink className="danger" to={URL.delete(category.id)} icon="trash" />
            </td>
        </tr>
    );
};

CategoryListItem.propTypes = {
    // The category related to this item.
    category: PropTypes.object.isRequired,
};

export default CategoryListItem;
