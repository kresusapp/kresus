import React, { useCallback } from 'react';

import { useKresusDispatch, useKresusState, getUnusedCategories } from '../../store';
import * as CategoriesStore from '../../store/categories';
import * as UiStore from '../../store/ui';
import { notify, translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { Popconfirm, ButtonLink } from '../ui';
import { IfMobile, IfNotMobile } from '../ui/display-if';

import URL from './urls';
import { CategoryListItem, SwipeableCategoryListItem } from './item';

import './categories.css';

export default () => {
    const isSmallScreen = useKresusState(state => UiStore.isSmallScreen(state.ui));
    const categories = useKresusState(state => CategoriesStore.allButNone(state.categories));
    const unusedCategories = useKresusState(state => getUnusedCategories(state));
    const dispatch = useKresusDispatch();

    const createDefaultCategories = useCallback(async () => {
        try {
            await dispatch(CategoriesStore.createDefault()).unwrap();
            notify.success($t('client.category.add_default_success'));
        } catch (e) {
            notify.error($t('client.category.add_default_failure'));
        }
    }, [dispatch]);

    const deleteUnusedCategories = useCallback(async () => {
        return dispatch(
            CategoriesStore.batchDestroy(
                unusedCategories.map(cat => ({ id: cat.id, replaceById: NONE_CATEGORY_ID }))
            )
        );
    }, [dispatch, unusedCategories]);

    const Item = isSmallScreen ? SwipeableCategoryListItem : CategoryListItem;

    const items = categories.map(cat => <Item category={cat} key={cat.id} />);

    const numUnused = unusedCategories.length;
    let deleteUnusedButtonLabel;
    if (numUnused === 0) {
        deleteUnusedButtonLabel = $t('client.category.no_unused_categories');
    } else {
        deleteUnusedButtonLabel = $t('client.category.delete_unused', {
            // eslint-disable-next-line camelcase
            smart_count: numUnused,
        });
    }

    return (
        <div className="categories">
            <p className="actions">
                <ButtonLink
                    to={URL.new}
                    aria={$t('client.category.add')}
                    label={$t('client.category.add')}
                    icon="plus-circle"
                />

                <button className="btn" aria-label="add default" onClick={createDefaultCategories}>
                    <span className={'fa fa-plus-circle'} />
                    <span>{$t('client.category.add_default')}</span>
                </button>

                <Popconfirm
                    onConfirm={deleteUnusedCategories}
                    trigger={
                        <button
                            className="btn danger"
                            aria-label="delete unused"
                            disabled={numUnused === 0}>
                            <span className={'fa fa-trash'} />
                            <span>{deleteUnusedButtonLabel}</span>
                        </button>
                    }>
                    <p>{$t('client.deleteunusedcategories.explanation')}</p>
                    <ul>
                        {unusedCategories.map(c => (
                            <li key={c.id}>{c.label}</li>
                        ))}
                    </ul>
                    <p>{$t('client.deleteunusedcategories.question')}</p>
                </Popconfirm>
            </p>

            <div className="swipeable-table-wrapper">
                <table className="striped swipeable-table">
                    <thead>
                        <tr>
                            <IfMobile>
                                <th className="swipeable-action swipeable-action-left" />
                            </IfMobile>
                            <th className="category-color">{$t('client.category.color')}</th>
                            <th>{$t('client.category.name')}</th>
                            <IfNotMobile>
                                <th className="category-action">{$t('client.category.action')}</th>
                            </IfNotMobile>
                            <IfMobile>
                                <th className="swipeable-action swipeable-action-right" />
                            </IfMobile>
                        </tr>
                    </thead>
                    <tbody>{items}</tbody>
                </table>
            </div>
        </div>
    );
};
