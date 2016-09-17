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

        this.state = {
            editMode: false
        };

        this.handleClickEditMode = this.handleClickEditMode.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    buttonLabel() {
        assert(false, 'buttonLabel() must be implemented by the subclasses!');
    }

    dom() {
        return this.refs.customlabel;
    }

    handleClickEditMode() {
        this.setState({ editMode: true }, () => {
            // Focus and set the cursor at the end
            this.dom().focus();
            this.dom().selectionStart = (this.dom().value || '').length;
        });
    }

    switchToStaticMode() {
        this.setState({ editMode: false });
    }

    handleBlur() {
        let label = this.dom().value;
        if (label) {
            // If the new non empty label value is different from the current one, save it.
            if (label.trim() !== this.defaultValue() && label.trim().length) {
                this.props.setCustomLabel(label);
            }
        } else if (this.props.operation.customLabel && this.props.operation.customLabel.length) {
            // If the new customLabel value is empty and there was already one, unset it.
            this.props.setCustomLabel('');
        }
        this.switchToStaticMode();
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') {
            this.handleBlur();
        } else if (e.key === 'Escape') {
            this.switchToStaticMode();
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
        if (!this.state.editMode) {
            return (
                <div >
                    <span className="text-uppercase visible-xs-inline label-button">
                        { this.defaultValue() }
                    </span>
                    <button
                      className="form-control text-left btn-transparent hidden-xs"
                      id={ this.props.operation.id }
                      onClick={ this.handleClickEditMode }
                      onFocus={ this.handleClickEditMode }>
                        { this.buttonLabel() }
                    </button>
                </div>

            );
        }
        return (
            <input className="form-control"
              type="text"
              ref="customlabel"
              id={ this.props.operation.id }
              defaultValue={ this.defaultValue() }
              onBlur={ this.handleBlur }
              onKeyUp={ this.handleKeyUp }
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
    buttonLabel() {
        let customLabel = this.props.operation.customLabel;
        if (customLabel === null || customLabel.trim().length === 0) {
            return (
                <em className="text-muted">
                    { $t('client.operations.add_custom_label') }
                </em>
            );
        }
        return <div className="label-button">{ customLabel }</div>;
    }
}

DetailedViewLabel_.propTypes = {
    operation: React.PropTypes.object.isRequired
};

export const DetailedViewLabel = mapDispatch(DetailedViewLabel_);

class OperationListViewLabel_ extends LabelComponent {
    buttonLabel() {
        return (
            <div className="label-button text-uppercase">
                { this.defaultValue() }
            </div>
        );
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
