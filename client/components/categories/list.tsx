import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { get, actions, GlobalState } from '../../store';
import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { Popconfirm, ButtonLink } from '../ui';

import URL from './urls';
import ListItem from './item';

import './categories.css';
import { Category } from '../../models';

export default () => {
    const categories = useSelector<GlobalState, Category[]>(state => get.categoriesButNone(state));
    const unusedCategories = useSelector<GlobalState, Category[]>(state =>
        get.unusedCategories(state)
    );
    const dispatch = useDispatch();

    const createDefaultCategories = useCallback(() => actions.createDefaultCategories(dispatch), [
        dispatch,
    ]);

    const deleteCategory = useCallback(
        (id: number) => {
            return actions.deleteCategory(dispatch, id, NONE_CATEGORY_ID);
        },
        [dispatch]
    );

    const deleteUnusedCategories = useCallback(async () => {
        return Promise.all(unusedCategories.map(({ id }) => deleteCategory(id)));
    }, [unusedCategories, deleteCategory]);

    const items = categories.map(cat => <ListItem category={cat} key={cat.id} />);

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
                    <h3>{$t('client.deleteunusedcategoriesmodal.title')}</h3>
                    <p>{$t('client.deleteunusedcategoriesmodal.explanation')}</p>
                    <ul>
                        {unusedCategories.map(c => (
                            <li key={c.id}>{c.label}</li>
                        ))}
                    </ul>
                    <p>{$t('client.deleteunusedcategoriesmodal.question')}</p>
                </Popconfirm>
            </p>

            <table className="striped">
                <thead>
                    <tr>
                        <th className="category-color">{$t('client.category.color')}</th>
                        <th>{$t('client.category.name')}</th>

                        <th className="category-action">{$t('client.category.action')}</th>
                    </tr>
                </thead>
                <tbody>{items}</tbody>
            </table>
        </div>
    );
};
