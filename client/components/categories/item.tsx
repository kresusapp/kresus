import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { ButtonLink } from '../ui';
import { IfMobile, IfNotMobile } from '../ui/display-if';
import useSwipe from '../ui/use-swipe';

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
                    <td className="swipable-action swipable-action-left">
                        <span>{$t('client.category.edition')}</span>
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
                    <td className="swipable-action swipable-action-right">
                        <span className="fa fa-trash" />
                        <span>{$t('client.general.delete')}</span>
                    </td>
                </IfMobile>
            </tr>
        );
    }
);

const SwipableActionWidth = 100;

// Consider that at least half the swipable action must have been shown to take effect.
const meaningfulSwipeThreshold = SwipableActionWidth / 2;

export const SwipableCategoryListItem = (props: CategoryItemProps) => {
    const history = useHistory();

    const { category } = props;
    const categoryId = category.id;

    // No point to use a ref here, does not need to be kept on re-render.
    let swipeDelta = 0;

    const onSwipeStart = useCallback(
        (element: HTMLElement) => {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            swipeDelta = 0;

            element.classList.add('swiped');
        },
        [categoryId]
    );

    const onSwipeChange = useCallback(
        (element: HTMLElement, delta: number) => {
            // The swipable action is 100px wide so we set a maximum range of -100/100.
            // eslint-disable-next-line react-hooks/exhaustive-deps
            swipeDelta = Math.min(SwipableActionWidth, Math.max(-SwipableActionWidth, delta));

            // Whether the swipe will be effective or discarded because not meaningful enough.
            element.classList.toggle(
                'swiped-effective',
                Math.abs(swipeDelta) > meaningfulSwipeThreshold
            );

            // Default position is -100px, fully swiped to the right = 0px, fully swiped to the left = -200px, swiped to the left;
            // Decrease by 100 to align it with the default.
            const alignedDelta = swipeDelta - SwipableActionWidth;

            element.querySelectorAll<HTMLTableCellElement>('td').forEach(td => {
                td.style.translate = `${alignedDelta}px`;
            });
        },
        [categoryId]
    );

    const onSwipeEnd = useCallback(
        async (element: HTMLElement) => {
            element.classList.remove('swiped', 'swiped-effective');

            element.querySelectorAll<HTMLTableCellElement>('td').forEach(td => {
                // Reset translation
                td.style.translate = '';
            });

            if (!swipeDelta) {
                return;
            }

            if (swipeDelta > meaningfulSwipeThreshold) {
                // Swiped to the right: open category edition screen.
                history.push(URL.edit(categoryId));
            } else if (swipeDelta < -meaningfulSwipeThreshold) {
                // Swiped to the left: delete it.
                history.push(URL.delete(categoryId));
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
            swipeDelta = 0;
        },
        [history, categoryId]
    );

    const ref = useSwipe<HTMLTableRowElement>(onSwipeStart, onSwipeChange, onSwipeEnd);

    return <CategoryListItem ref={ref} {...props} />;
};
