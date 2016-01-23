import {has, assert, translate as $t} from '../../helpers';
import { Actions } from '../../store';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
const SMALL_TITLE_THRESHOLD = 4;

class LabelComponent extends React.Component {
    constructor(props) {
        has(props, 'operation');
        super(props);
        this.state = {
            editMode: false
        };
    }

    buttonLabel() {
        assert(false, "buttonLabel() must be implemented by the subclasses!");
    }

    dom() {
        return this.refs.customlabel.getDOMNode();
    }

    switchToEditMode() {
        this.setState({ editMode: true }, () => {
            this.dom().focus();
            // Set the cursor at the end
            this.dom().selectionStart = (this.dom().value || '').length;
        });
    }
    switchToStaticMode() {
        this.setState({ editMode: false });
    }

    onBlur() {
        let customLabel = this.dom().value;
        if (customLabel) {
            // If the new non empty customLabel value is different from the current one, save it.
            if (customLabel.trim() !== this.defaultValue() && customLabel.trim().length) {
                Actions.SetCustomLabel(this.props.operation, customLabel);
                // Be optimistic
                this.props.operation.customLabel = customLabel;
            }
        } else if (this.props.operation.customLabel && this.props.operation.customLabel.length) {
                // If the new customLabel value is empty and there was already one, unset it.
                Actions.SetCustomLabel(this.props.operation, '');
                // Be optimistic
                this.props.operation.customLabel = null;
            }
        this.switchToStaticMode();
    }

    onKeyUp(e) {
        if (e.key === 'Enter') {
            this.onBlur();
        } else if (e.key === 'Escape') {
            this.switchToStaticMode();
        }
    }

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
                <button
                  className="form-control text-left btn-transparent"
                  id={this.props.operation.id}
                  onClick={this.switchToEditMode.bind(this)}>
                    {this.buttonLabel()}
                </button>
            );
        }
        return (
            <input className="form-control"
              type="text"
              ref='customlabel'
              id={this.props.operation.id}
              defaultValue={this.defaultValue()}
              onBlur={this.onBlur.bind(this)}
              onKeyUp={this.onKeyUp.bind(this)}
            />
        );
    }
}

export class DetailedViewLabelComponent extends LabelComponent {
    constructor(props) {
        has(props, 'operation');
        super(props);
    }

    buttonLabel() {
        let customLabel = this.props.operation.customLabel;
        if (customLabel === null || customLabel.trim().length === 0) {
            return (
                <em className="text-muted">
                    {$t('client.operations.add_custom_label')}
                </em>
            );
        }
        return <div className="label-button">{customLabel}</div>;
    }
}

export class OperationListViewLabelComponent extends LabelComponent {
    constructor(props) {
        has(props, 'operation');
        has(props, 'link');
        super(props);
    }

    buttonLabel() {
        return <div className="label-button text-uppercase">{this.defaultValue()}</div>;
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

