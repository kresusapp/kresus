import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID, useKresusState, assert } from '../../helpers';
import * as CategoriesStore from '../../store/categories';
import * as BanksStore from '../../store/banks';

import ClearableInput from '../ui/clearable-input';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';
import DisplayIf, { IfNotMobile } from '../ui/display-if';
import { useGenericError } from '../../hooks';
import { formatCreateCategoryLabel, useOnCreateCategory } from './category-select';

const NO_TYPE_ID = null;
const NO_CAT = null;
const NO_LABEL = '';
const NULL_OPTION = '';

function typeNotFoundMessage() {
    return $t('client.transactions.no_type_found');
}

// Have a resettable combo list to pick type.
const BulkEditTypeSelect = (props: { onChange: (newType: string | null) => void }) => {
    const types = useKresusState(state => BanksStore.allTypes(state.banks));

    const typeOptions = types.map(type => ({
        value: type.name,
        label: $t(`client.${type.name}`),
    }));

    return (
        <FuzzyOrNativeSelect
            clearable={true}
            noOptionsMessage={typeNotFoundMessage}
            onChange={props.onChange}
            options={typeOptions}
            placeholder={$t('client.bulkedit.type_placeholder')}
            value={NULL_OPTION}
        />
    );
};

function categoryNotFoundMessage() {
    return $t('client.transactions.no_category_found');
}

// Have a resettable combo list to select a category.
const BulkEditCategorySelect = (props: { onChange: (categoryId: number | null) => void }) => {
    const dispatch = useDispatch();

    const categories = useKresusState(state => CategoriesStore.all(state.categories));

    const options = useMemo(() => {
        // Separate the none category from the others.
        const noneCategory = categories.find(cat => cat.id === NONE_CATEGORY_ID);
        assert(typeof noneCategory !== 'undefined', 'none category exists');
        const otherCategories = categories.filter(cat => cat.id !== NONE_CATEGORY_ID);
        return [
            {
                value: noneCategory.id,
                label: noneCategory.label,
            },
        ].concat(otherCategories.map(cat => ({ value: cat.id, label: cat.label })));
    }, [categories]);

    const [currentValue, setCurrentValue] = useState<number | null>(null);

    const propsOnChange = props.onChange;
    const onChange = useCallback(
        (newVal: string | null) => {
            const newValInt = newVal === null ? null : parseInt(newVal, 10);
            setCurrentValue(newValInt);
            propsOnChange(newValInt);
        },
        [setCurrentValue, propsOnChange]
    );

    const updateOnCreate = useCallback(
        (value: number | null) => {
            propsOnChange(value);
            setCurrentValue(value);
        },
        [setCurrentValue, propsOnChange]
    );

    const onCreateCategory = useOnCreateCategory(dispatch, updateOnCreate);

    const currentValueStr = currentValue === null ? NULL_OPTION : currentValue;

    return (
        <FuzzyOrNativeSelect
            clearable={true}
            noOptionsMessage={categoryNotFoundMessage}
            onChange={onChange}
            onCreate={onCreateCategory}
            formatCreateLabel={formatCreateCategoryLabel}
            options={options}
            placeholder={$t('client.bulkedit.category_placeholder')}
            value={currentValueStr}
        />
    );
};

const BulkEditComponent = (props: {
    // Whether the hide bulk edit details are displayed or not.
    inBulkEditMode: boolean;

    // List of filtered item ids currently showing.
    items: Set<number>;

    // Callback called whenever the user clicks the select-all toggle.
    setAllBulkEdit: (val: boolean) => void;

    // Whether the select-all checkbox is set.
    setAllStatus: boolean;
}) => {
    const { items, setAllBulkEdit } = props;

    const [type, setType] = useState<string | null>(NO_TYPE_ID);
    const [categoryId, setCategoryId] = useState<number | null>(NO_CAT);

    const [customLabel, setCustomLabel] = useState(NO_LABEL);

    const dispatch = useDispatch();
    const runApplyBulkEdit = useGenericError(
        useCallback(
            (newFields, transactions) =>
                dispatch(BanksStore.applyBulkEdit(newFields, transactions)),
            [dispatch]
        )
    );

    const handleApplyBulkEdit = useCallback(
        async (event: React.MouseEvent) => {
            event.preventDefault();

            const transactions = Array.from(items.values());

            const newFields: { type?: string; categoryId?: number; customLabel?: string } = {};
            if (type !== NO_TYPE_ID) {
                newFields.type = type;
            }
            if (categoryId !== NO_CAT) {
                newFields.categoryId = categoryId;
            }
            if (customLabel !== NO_LABEL) {
                newFields.customLabel = customLabel === '-' ? '' : customLabel;
            }

            await runApplyBulkEdit(newFields, transactions);
        },
        [items, runApplyBulkEdit, type, categoryId, customLabel]
    );

    const handleToggleSelectAll = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setAllBulkEdit(event.target.checked);
        },
        [setAllBulkEdit]
    );

    const isApplyEnabled =
        items.size > 0 &&
        (type !== NO_TYPE_ID || categoryId !== NO_CAT || customLabel !== NO_LABEL);

    const buttonLabel = isApplyEnabled
        ? $t('client.bulkedit.apply_now')
        : $t('client.bulkedit.apply_disabled');
    const clearableLabel = `'-' ${$t('client.bulkedit.clear_label')}`;

    return (
        <IfNotMobile>
            <DisplayIf condition={props.inBulkEditMode}>
                <tr>
                    <td>
                        <input
                            onChange={handleToggleSelectAll}
                            type="checkbox"
                            checked={props.setAllStatus}
                        />
                    </td>
                    <td>
                        <button
                            className="btn warning"
                            type="button"
                            disabled={!isApplyEnabled}
                            onClick={isApplyEnabled ? handleApplyBulkEdit : undefined}>
                            {buttonLabel}
                        </button>
                    </td>
                    <td>
                        <BulkEditTypeSelect onChange={setType} />
                    </td>
                    <td>
                        <ClearableInput
                            onChange={setCustomLabel}
                            id="keywords"
                            className="block"
                            placeholder={clearableLabel}
                        />
                    </td>
                    <td>{/* empty column for amount */}</td>
                    <td className="category">
                        <BulkEditCategorySelect onChange={setCategoryId} />
                    </td>
                </tr>
            </DisplayIf>
        </IfNotMobile>
    );
};

BulkEditComponent.displayName = 'BulkEditComponent';

export default BulkEditComponent;
