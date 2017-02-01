import React from 'react';
import { connect } from 'react-redux';

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

        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.displayLabelIfNoCustom = true;
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
            event.target.value = this.getDefaultValue();
            event.target.blur();
        }
    }

    handleBlur(event) {
        let label = (event.target.value || '').trim();

        // If the custom label is equal to the label, remove the custom label.
        if (label === this.getLabel()) {
            label = '';
        }

        let { customLabel } = this.props.operation;
        if (label !== customLabel && (label || customLabel)) {
            this.props.setCustomLabel(label);
        }

        if (!label && this.displayLabelIfNoCustom) {
            event.target.value = this.getLabel();
        }
    }

    getCustomLabel() {
        let { customLabel } = this.props.operation;
        if (customLabel !== null && customLabel.trim().length) {
            return customLabel;
        }

        return '';
    }

    // Returns the label (or even the raw label is the label is too short).
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
        if (!label && this.displayLabelIfNoCustom) {
            label = this.getLabel();
        }
        return label;
    }

    render() {
        // Using the value inside the key will force React to re-render the
        // defaultValue.
        let key = `${this.props.operation.id}${this.getDefaultValue()}`;

        return (<div className="label-component-container">
            <span className="text-uppercase visible-xs-inline label-component">
                { this.getDefaultValue() }
            </span>
            <input
              className="form-control operation-label-input hidden-xs"
              type="text"
              defaultValue={ this.getDefaultValue() }
              key={ key }
              onFocus={ this.handleFocus }
              onKeyUp={ this.handleKeyUp }
              onBlur={ this.handleBlur }
              placeholder={ $t('client.operations.add_custom_label') }
            />
        </div>);
    }
}

function mapDispatch(component) {
    return connect(() => {
        // no state
        return {};
    }, (dispatch, props) => {
        return {
            setCustomLabel(label) {
                actions.setOperationCustomLabel(dispatch, props.operation, label);
            }
        };
    })(component);
}

class DetailedViewLabel_ extends LabelComponent {
    constructor(props) {
        super(props);
        this.displayLabelIfNoCustom = false;
    }
}

DetailedViewLabel_.propTypes = {
    operation: React.PropTypes.object.isRequired
};

export const DetailedViewLabel = mapDispatch(DetailedViewLabel_);

class OperationListViewLabel_ extends LabelComponent {
    render() {
        if (typeof this.props.link === 'undefined') {
            return super.render();
        }
        return (
            <div className="input-group">
                { this.props.link }
                { super.render() }
            </div>
        );
    }
}

OperationListViewLabel_.propTypes = {
    operation: React.PropTypes.object.isRequired,
    link: React.PropTypes.object
};

export const OperationListViewLabel = mapDispatch(OperationListViewLabel_);
