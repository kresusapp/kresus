import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';
import { actions } from '../../store';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
const SMALL_TITLE_THRESHOLD = 4;

class LabelComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editedValue: null
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    handleChange(e) {
        this.setState({
            editedValue: e.target.value
        });
    }

    handleFocus(event) {
        // Set the caret at the end of the text.
        let end = (event.target.value || '').length;
        event.target.selectionStart = end;
        event.target.selectionEnd = end;
    }

    handleKeyUp(event) {
        if (event.key === 'Enter') {
            event.target.blur();
        } else if (event.key === 'Escape') {
            let { target } = event;
            this.setState(
                {
                    editedValue: null
                },
                () => target.blur()
            );
        }
    }

    handleBlur() {
        if (this.state.editedValue === null) {
            return;
        }

        let label = this.state.editedValue.trim();

        // If the custom label is equal to the label, remove the custom label.
        if (label === this.getLabel()) {
            label = '';
        }

        let { customLabel } = this.props.operation;
        if (label !== customLabel && (label || customLabel)) {
            this.props.setCustomLabel(label);
        }

        this.setState({ editedValue: null });
    }

    getCustomLabel() {
        let { customLabel } = this.props.operation;
        if (customLabel === null || !customLabel.trim().length) {
            return '';
        }
        return customLabel;
    }

    // Returns the label (or even the raw label if the label is too short).
    getLabel() {
        let op = this.props.operation;
        let label;
        if (op.title.length < SMALL_TITLE_THRESHOLD) {
            label = op.raw;
            if (op.title.length) {
                label += ` (${op.title})`;
            }
        } else {
            label = op.title;
        }
        return label.trim();
    }

    getDefaultValue() {
        let label = this.getCustomLabel();
        if (!label && this.props.displayLabelIfNoCustom) {
            label = this.getLabel();
        }
        return label;
    }

    render() {
        let label =
            this.state.editedValue !== null ? this.state.editedValue : this.getDefaultValue();

        let labelVisibility = 'hidden';
        let inputVisibility = '';
        if (this.props.readonlyOnSmallScreens) {
            labelVisibility = 'visible-xs-inline';
            inputVisibility = 'hidden-xs';
        }

        return (
            <div className="label-component-container">
                <span className={`text-uppercase label-component ${labelVisibility}`}>{label}</span>
                <input
                    className={`form-control operation-label-input ${inputVisibility}`}
                    type="text"
                    value={label}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onKeyUp={this.handleKeyUp}
                    onBlur={this.handleBlur}
                    placeholder={$t('client.operations.add_custom_label')}
                />
            </div>
        );
    }
}

LabelComponent.propTypes /* remove-proptypes */ = {
    // The operation from which to get the label.
    operation: PropTypes.object.isRequired,

    // Whether to display the operation label if there is no custom label.
    displayLabelIfNoCustom: PropTypes.bool,

    // A function to set the custom label when modified.
    setCustomLabel: PropTypes.func.isRequired,

    // Whether the label is readonly on small screens.
    readonlyOnSmallScreens: PropTypes.bool
};

LabelComponent.defaultProps = {
    displayLabelIfNoCustom: true,
    readonlyOnSmallScreens: false
};

export default connect(null, (dispatch, props) => {
    return {
        setCustomLabel(label) {
            actions.setOperationCustomLabel(dispatch, props.operation, label);
        }
    };
})(LabelComponent);
