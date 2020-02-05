import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { translate as $t, NONE_CATEGORY_ID } from '../../helpers';
import { get, actions } from '../../store';

import ClearableInput from '../ui/clearable-input';
import FuzzyOrNativeSelect from '../ui/fuzzy-or-native-select';
import { IfNotMobile } from '../ui/display-if';

const NO_TYPE_ID = null;
const NO_CAT = null;
const NO_LABEL = '';
const NULL_OPTION = '';

// have a resetable combo list to pick type.
const BulkEditTypeSelect = connect(state => {
    return { types: get.types(state) };
})(props => {
    let typeOptions = props.types.map(type => ({
        value: type.name,
        label: $t(`client.${type.name}`)
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

function typeNotFoundMessage() {
    return $t('client.operations.no_type_found');
}

// have a resetable combo list to select a category.
const BulkEditCategorySelect = connect(state => {
    let categories = get.categories(state);
    return {
        categories
    };
})(props => {
    let noneCategory = props.categories.find(cat => cat.id === NONE_CATEGORY_ID);
    let categories = props.categories.filter(cat => cat.id !== NONE_CATEGORY_ID);

    let options = [
        {
            value: noneCategory.id,
            label: noneCategory.label
        }
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

function categoryNotFoundMessage() {
    return $t('client.operations.no_category_found');
}

class BulkEditComponent extends React.Component {
    state = {
        type: NO_TYPE_ID,
        categoryId: NO_CAT,
        customLabel: NO_LABEL
    };

    handleApplyBulkEdit = event => {
        event.preventDefault();

        let { type, categoryId, customLabel } = this.state;
        let { items } = this.props;
        let operations = Object.keys(items)
            .filter(id => items[id])
            .map(Number);
        let newOp = {};
        if (type !== NO_TYPE_ID) {
            newOp.type = type;
        }
        if (categoryId !== NO_CAT) {
            newOp.categoryId = categoryId;
        }
        if (customLabel !== NO_LABEL) {
            newOp.customLabel = customLabel === '-' ? '' : customLabel;
        }
        this.props.runApplyBulkEdit(newOp, operations);
    };

    handleToggleSelectAll = event => {
        this.props.setAllBulkEdit(event.target.checked);
    };

    refKeywordsInput = React.createRef();

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
        const isEnabled =
            Object.keys(this.props.items)
                .map(k => {
                    return this.props.items[k];
                })
                .some(x => x) &&
            (this.state.type !== NO_TYPE_ID ||
                this.state.categoryId !== NO_CAT ||
                this.state.customLabel !== NO_LABEL);
        const buttonLabel = isEnabled
            ? $t('client.bulkedit.apply_now')
            : $t('client.bulkedit.apply_disabled');
        const clearableLable = `'-' ${$t('client.bulkedit.clear_label')}`;
        return (
            <IfNotMobile>
                <tr style={null} className="" hidden={!this.props.displayBulkEditDetails}>
                    <td>
                        <input
                            onChange={this.handleToggleSelectAll}
                            type="checkbox"
                            value="select-all"
                        />
                    </td>
                    <td>
                        <button
                            className="btn warning"
                            type="button"
                            disabled={!isEnabled}
                            onClick={isEnabled ? this.handleApplyBulkEdit : null}>
                            {buttonLabel}
                        </button>
                    </td>
                    <td>
                        <BulkEditTypeSelect onChange={this.handleTypeChange} />
                    </td>
                    <td>
                        <ClearableInput
                            ref={this.refKeywordsInput}
                            onChange={this.handleLabelChange}
                            id="keywords"
                            className="block"
                            placeholder={clearableLable}
                        />
                    </td>
                    <td>{/* empty column for amount */}</td>
                    <td className="category">
                        <BulkEditCategorySelect onChange={this.handleCategoryChange} />
                    </td>
                </tr>
            </IfNotMobile>
        );
    }
}

const ConnectedBulkEditComponent = connect(null, dispatch => {
    return {
        runApplyBulkEdit(newOp, operations) {
            actions.runApplyBulkEdit(dispatch, newOp, operations);
        }
    };
})(BulkEditComponent);

ConnectedBulkEditComponent.displayName = 'ConnectedBulkEditComponent';

ConnectedBulkEditComponent.propTypes = {
    // toggle hide bulk edit details
    displayBulkEditDetails: PropTypes.bool.isRequired,

    // list of filetered items currently showing
    items: PropTypes.object.isRequired,

    // toggle all action
    setAllBulkEdit: PropTypes.func.isRequired
};

export default ConnectedBulkEditComponent;
