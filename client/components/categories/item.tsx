import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { ButtonLink } from '../ui';
import { IfMobile, IfNotMobile } from '../ui/display-if';
import { useTableRowSwipeDetection } from '../ui/use-swipe';

import URL from './urls';
import { Category } from '../../models';
import { translate as $t } from '../../helpers';

interface CategoryItemProps {
    // The category related to this item.
    category: Category;
}

export const CategoryListItem = React.forwardRef<HTMLTableRowElement, CategoryItemProps>(
    (props, ref) => {
        const { category } = props;

        const style = {
            backgroundColor: category.color,
        };

        return (
            <tr key={category.id} ref={ref}>
                <IfMobile>
                    <td className="swipeable-action swipeable-action-left">
                        <span>{$t('client.general.edit')}</span>
                        <span className="fa fa-edit" />
                    </td>
                </IfMobile>

                <td>
                    <div className="color-preview" style={style} />
                </td>

                <td>{category.label}</td>

                <IfNotMobile>
                    <td className="item-actions">
                        <ButtonLink
                            className="primary"
                            to={URL.edit(category.id)}
                            icon="edit"
                            aria={$t('client.category.edition')}
                        />
                        <ButtonLink
                            className="danger"
                            to={URL.delete(category.id)}
                            icon="trash"
                            aria={$t('client.category.deletion')}
                        />
                    </td>
                </IfNotMobile>

                <IfMobile>
                    <td className="swipeable-action swipeable-action-right">
                        <span className="fa fa-trash" />
                        <span>{$t('client.general.delete')}</span>
                    </td>
                </IfMobile>
            </tr>
        );
    }
);

export const SwipeableCategoryListItem = (props: CategoryItemProps) => {
    const history = useHistory();

    const { category } = props;
    const categoryId = category.id;

    const openEditionView = useCallback(() => {
        history.push(URL.edit(categoryId));
    }, [history, categoryId]);
    const openDeletionView = useCallback(() => {
        history.push(URL.delete(categoryId));
    }, [history, categoryId]);

    const ref = useTableRowSwipeDetection<HTMLTableRowElement>(openDeletionView, openEditionView);

    return <CategoryListItem ref={ref} {...props} />;
};
