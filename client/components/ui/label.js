import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

class LabelComponent extends React.Component {
    state = {
        value: null
    };

    handleChange = e => {
        this.setState({
            value: e.target.value
        });
    };

    handleFocus = event => {
        // Set the caret at the end of the text.
        let end = (event.target.value || '').length;
        event.target.selectionStart = end;
        event.target.selectionEnd = end;
    };

    handleKeyUp = event => {
        if (event.key === 'Enter') {
            event.target.blur();
        } else if (event.key === 'Escape') {
            let { target } = event;
            this.setState(
                {
                    value: null
                },
                () => target.blur()
            );
        }
    };

    handleBlur = () => {
        if (this.state.value === null) {
            return;
        }

        let label = this.state.value.trim();

        // If the custom label is equal to the label, remove the custom label.
        if (label === this.props.getLabel()) {
            label = '';
        }

        let { customLabel } = this.props.item;
        if (label !== customLabel && (label || customLabel)) {
            this.props.setCustomLabel(label);
        }

        this.setState({ value: null });
    };

    getCustomLabel() {
        let { customLabel } = this.props.item;
        if (customLabel === null || !customLabel.trim().length) {
            return '';
        }
        return customLabel;
    }

    getDefaultValue() {
        let label = this.getCustomLabel();
        if (!label && this.props.displayLabelIfNoCustom) {
            label = this.props.getLabel();
        }
        return label;
    }

    render() {
        let label = this.state.value !== null ? this.state.value : this.getDefaultValue();

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
                    className={`form-element-block custom-label-input ${inputVisibility}`}
                    type="text"
                    value={label}
                    onChange={this.handleChange}
                    onFocus={this.handleFocus}
                    onKeyUp={this.handleKeyUp}
                    onBlur={this.handleBlur}
                    placeholder={$t('client.general.add_custom_label')}
                />
            </div>
        );
    }
}

LabelComponent.propTypes /* remove-proptypes */ = {
    // The item from which to get the label.
    item: PropTypes.object.isRequired,

    // Whether to display the label if there is no custom label.
    displayLabelIfNoCustom: PropTypes.bool,

    // A function to set the custom label when modified.
    setCustomLabel: PropTypes.func.isRequired,

    // Whether the label is readonly on small screens.
    readonlyOnSmallScreens: PropTypes.bool,

    // A function that returns the displayed label.
    getLabel: PropTypes.func.isRequired
};

LabelComponent.defaultProps = {
    displayLabelIfNoCustom: true,
    readonlyOnSmallScreens: false
};

export default LabelComponent;
