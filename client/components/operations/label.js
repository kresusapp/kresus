import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { computeAttachmentLink } from './details';

import { translate as $t } from '../../helpers';
import { actions, get } from '../../store';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
const SMALL_TITLE_THRESHOLD = 4;

class LabelComponent_ extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editedValue: null
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

        const setCustomLabel = props.makeSetCustomLabel(this.props.customLabel);
        this.handleSetCustomLabel = setCustomLabel.bind(this);
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
            this.setState({
                editedValue: null
            }, () => target.blur());
        }
    }

    handleBlur() {
        if (this.state.editedValue === null)
            return;

        let label = this.state.editedValue.trim();

        // If the custom label is equal to the label, remove the custom label.
        if (label === this.getLabel()) {
            label = '';
        }

        let { customLabel } = this.props;
        if (label !== customLabel && (label || customLabel)) {
            this.handleSetCustomLabel(label);
        }

        this.setState({ editedValue: null });
    }

    getCustomLabel() {
        let { customLabel } = this.props;
        if (customLabel === null || !customLabel.trim().length) {
            return '';
        }
        return customLabel;
    }

    // Returns the label (or even the raw label if the label is too short).
    getLabel() {
        let { title, raw } = this.props;
        let label;
        if (title.length < SMALL_TITLE_THRESHOLD) {
            label = raw;
            if (title.length) {
                label += ` (${title})`;
            }
        } else {
            label = title;
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
        let label = this.state.editedValue !== null ?
                    this.state.editedValue :
                    this.getDefaultValue();

        let labelVisibility = 'hidden';
        let inputVisibility = '';
        if (this.props.readonlyOnSmallScreens) {
            labelVisibility = 'visible-xs-inline';
            inputVisibility = 'hidden-xs';
        }

        return (<div className="label-component-container">
            <span className={ `text-uppercase label-component ${labelVisibility}` }>
                { label }
            </span>
            <input
              className={ `form-control operation-label-input ${inputVisibility}` }
              type="text"
              value={ label }
              onChange={ this.handleChange }
              onFocus={ this.handleFocus }
              onKeyUp={ this.handleKeyUp }
              onBlur={ this.handleBlur }
              placeholder={ $t('client.operations.add_custom_label') }
            />
        </div>);
    }
}

LabelComponent_.propTypes = {
    // Whether to display the operation label if there is no custom label.
    displayLabelIfNoCustom: PropTypes.bool,

    // Whether the label is readonly on small screens.
    readonlyOnSmallScreens: PropTypes.bool
};

LabelComponent_.defaultProps = {
    displayLabelIfNoCustom: true,
    readonlyOnSmallScreens: false
};

function mapDispatch(component) {
    let newComponent = connect((state, props) => {
        let { customLabel, title, raw } = get.operationById(state, props.operationId);
        return {
            customLabel,
            title,
            raw,
        };
    }, (dispatch, props) => {
        return {
            makeSetCustomLabel: customLabel => label => (
                actions.setOperationCustomLabel(dispatch,
                                                props.operationId, label, customLabel)
            )
        };
    })(component);
    // Merge propTypes with common propTypes
    newComponent.propTypes = {
        ...component.propTypes,
        ...{
            // The id of the displayed operation.
            operationId: PropTypes.string
        }
    };
    return newComponent;
}

export const LabelComponent = mapDispatch(LabelComponent_);

const OperationListViewLabel_ = props => {

    // Add a link to the attached file, if there is any.
    let link;
    if (props.link !== null) {
        link = (
            <label
              className="input-group-addon box-transparent">
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={ props.link }
                  title={ $t('client.operations.attached_file') }>
                    <span
                      className="fa fa-file"
                      aria-hidden="true"
                    />
                </a>
            </label>
        );
    }
    const setCustomLabel = props.makeSetCustomLabel(props.customLabel);
    let label = (
        <LabelComponent
          customLabel={ props.customLabel }
          title={ props.title }
          raw={ props.raw }
          operationId={ props.operationId }
          setCustomLabel={ setCustomLabel }
          readonlyOnSmallScreens={ true }
        />
    );

    if (typeof link === 'undefined') {
        return label;
    }

    return (
        <div className="input-group">
            { link }
            { label }
        </div>
    );
};

const ConnectedOperationListViewLabel_ = connect((state, props) => {
    let { binary } = get.operationById(state, props.operationId);

    return {
        link: computeAttachmentLink(props.operationId, binary)
    };
})(OperationListViewLabel_);

ConnectedOperationListViewLabel_.propTypes = {
    // An operation id (can be null) from which we may retrieve a full
    // operation.
    operationId: PropTypes.string,
};

export const OperationListViewLabel = mapDispatch(ConnectedOperationListViewLabel_);
