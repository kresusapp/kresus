import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import ClearableInput from '../ui/clearable-input';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';
import DisplayIf, { IfNotMobile } from '../ui/display-if';

const NO_TYPE_ID = null;
const NO_CAT = null;
const NO_LABEL = '';
const NULL_OPTION = '';

function typeNotFoundMessage() {
    return $t('client.operations.no_type_found');
}

// Have a resetable combo list to pick type.
const BulkEditTypeSelect = connect(state => {
    return { types: get.types(state) };
})(props => {
    let typeOptions = props.types.map(type => ({
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
});

function categoryNotFoundMessage() {
    return $t('client.operations.no_category_found');
}

// Have a resetable combo list to select a category.
const BulkEditCategorySelect = connect(state => {
    let categories = get.categories(state);
    return {
        categories,
    };
})(props => {
    let noneCategory = props.categories.find(cat => cat.id === NONE_CATEGORY_ID);
    let categories = props.categories.filter(cat => cat.id !== NONE_CATEGORY_ID);

    let options = [
        {
            value: noneCategory.id,
            label: noneCategory.label,
        },
    ].concat(categories.map(cat => ({ value: cat.id, label: cat.label })));

    return (
        <FuzzyOrNativeSelect
            clearable={true}
            noOptionsMessage={categoryNotFoundMessage}
            onChange={props.onChange}
            options={options}
            placeholder={$t('client.bulkedit.category_placeholder')}
            value={NULL_OPTION}
        />
    );
});

class BulkEditComponent extends React.Component {
    state = {
        type: NO_TYPE_ID,
        categoryId: NO_CAT,
        customLabel: NO_LABEL,
    };

    handleApplyBulkEdit = event => {
        event.preventDefault();

        let { type, categoryId, customLabel } = this.state;

        let operations = Array.from(this.props.items.values());

        let newFields = {};
        if (type !== NO_TYPE_ID) {
            newFields.type = type;
        }
        if (categoryId !== NO_CAT) {
            newFields.categoryId = categoryId;
        }
        if (customLabel !== NO_LABEL) {
            newFields.customLabel = customLabel === '-' ? '' : customLabel;
        }

        this.props.runApplyBulkEdit(newFields, operations);
    };

    handleToggleSelectAll = event => {
        this.props.setAllBulkEdit(event.target.checked);
    };
    handleLabelChange = customLabel => {
        this.setState({ customLabel });
    };
    handleCategoryChange = categoryId => {
        this.setState({ categoryId });
    };
    handleTypeChange = type => {
        this.setState({ type });
    };

    render() {
        const isApplyEnabled =
            this.props.items.size > 0 &&
            (this.state.type !== NO_TYPE_ID ||
                this.state.categoryId !== NO_CAT ||
                this.state.customLabel !== NO_LABEL);

        const buttonLabel = isApplyEnabled
            ? $t('client.bulkedit.apply_now')
            : $t('client.bulkedit.apply_disabled');
        const clearableLabel = `'-' ${$t('client.bulkedit.clear_label')}`;

        return (
            <IfNotMobile>
                <DisplayIf condition={this.props.inBulkEditMode}>
                    <tr>
                        <td>
                            <input
                                onChange={this.handleToggleSelectAll}
                                type="checkbox"
                                checked={this.props.setAllStatus}
                            />
                        </td>
                        <td>
                            <button
                                className="btn warning"
                                type="button"
                                disabled={!isApplyEnabled}
                                onClick={isApplyEnabled ? this.handleApplyBulkEdit : null}>
                                {buttonLabel}
                            </button>
                        </td>
                        <td>
                            <BulkEditTypeSelect onChange={this.handleTypeChange} />
                        </td>
                        <td>
                            <ClearableInput
                                onChange={this.handleLabelChange}
                                id="keywords"
                                className="block"
                                placeholder={clearableLabel}
                            />
                        </td>
                        <td>{/* empty column for amount */}</td>
                        <td className="category">
                            <BulkEditCategorySelect onChange={this.handleCategoryChange} />
                        </td>
                    </tr>
                </DisplayIf>
            </IfNotMobile>
        );
    }
}

const ConnectedBulkEditComponent = connect(null, dispatch => {
    return {
        runApplyBulkEdit(newOp, operations) {
            actions.runApplyBulkEdit(dispatch, newOp, operations);
        },
    };
})(BulkEditComponent);

ConnectedBulkEditComponent.displayName = 'ConnectedBulkEditComponent';

ConnectedBulkEditComponent.propTypes = {
    // Whether the hide bulk edit details are displayed or not.
    inBulkEditMode: PropTypes.bool.isRequired,

    // List of filtered items currently showing.
    items: PropTypes.object.isRequired,

    // Callback called whenever the user clicks the select-all toggle.
    setAllBulkEdit: PropTypes.func.isRequired,

    // Whether the select-all checkbox is set.
    setAllStatus: PropTypes.bool.isRequired,
};

export default ConnectedBulkEditComponent;
