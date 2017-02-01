import React from 'react';
import { connect } from 'react-redux';

import { assert, translate as $t } from '../../helpers';
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
    }

    placeholder() {
        assert(false, 'placeholder() must be implemented by the subclasses!');
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
            event.target.value = this.defaultValue();
            event.target.blur();
        }
    }

    handleBlur(event) {
        let label = event.target.value;
        if (label) {
            // If the new non empty label value is different from the current one, save it.
            if (label.trim() !== this.defaultValue() && label.trim().length) {
                this.props.setCustomLabel(label);
            }
        } else if (this.props.operation.customLabel && this.props.operation.customLabel.length) {
            // If the new customLabel value is empty and there was already one, unset it.
            this.props.setCustomLabel('');
        }
    }

    // Returns the customLabel if there's one, or the label (or even the raw
    // label is the label is too short).
    defaultValue() {
        let op = this.props.operation;

        let customLabel = op.customLabel;
        if (customLabel !== null && customLabel.trim().length) {
            return customLabel;
        }

        let label;
        if (op.title.length < SMALL_TITLE_THRESHOLD) {
            label = op.raw;
            if (op.title.length) {
                label += ` (${op.title})`;
            }
        } else {
            label = op.title;
        }
        return label;
    }

    render() {
        return (
            <input
              className="form-control operation-label-input"
              type="text"
              id={ this.props.operation.id }
              defaultValue={ this.defaultValue() }
              onFocus={ this.handleFocus }
              onKeyUp={ this.handleKeyUp }
              onBlur={ this.handleBlur }
              placeholder={ this.placeholder() }
            />
        );
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
    placeholder() {
        let customLabel = this.props.operation.customLabel;
        if (customLabel === null || customLabel.trim().length === 0) {
            return $t('client.operations.add_custom_label');
        }
        return customLabel;
    }
}

DetailedViewLabel_.propTypes = {
    operation: React.PropTypes.object.isRequired
};

export const DetailedViewLabel = mapDispatch(DetailedViewLabel_);

class OperationListViewLabel_ extends LabelComponent {
    placeholder() {
        return this.defaultValue();
    }

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
