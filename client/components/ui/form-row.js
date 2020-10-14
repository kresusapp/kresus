import React from 'react';
import PropTypes from 'prop-types';

import './form-row.css';
import DisplayIf from './display-if';
import { translate as $t } from '../../helpers';

function FormRow(props) {
    let maybeHelp = props.help ? (
        <div className="help">
            <p className="help-text">{props.help}</p>
        </div>
    ) : null;

    // Add an extra id property to the child.
    let input = React.cloneElement(props.input, { ...props.input.props, id: props.inputId });

    let inlineClassName = props.inline ? ' form-row-inline' : '';

    return (
        <div className={`form-row ${inlineClassName}`}>
            <label htmlFor={props.inputId}>
                <span className="label-text">{props.label}</span>
                <DisplayIf condition={!!props.optional}>
                    <span>&nbsp;{$t('client.form-row.optional')}</span>
                </DisplayIf>
            </label>

            <div className="input">{input}</div>

            {maybeHelp}
        </div>
    );
}

FormRow.propTypes = {
    // A label to be displayed next to the form's field.
    label: PropTypes.node.isRequired,

    // An input identifier to be used for the label.
    inputId: PropTypes.string.isRequired,

    // The actual input field; must accept an id field.
    input: PropTypes.node.isRequired,

    // A facultative help message.
    help: PropTypes.node,

    // Should the form label be displayed next to the form input on mobile?
    inline: PropTypes.bool,

    // Whether we display "optional" next to the label.
    optional: PropTypes.bool,
};

export default FormRow;
