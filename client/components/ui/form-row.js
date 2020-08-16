import React from 'react';

import './form-row.css';
import DisplayIf from './display-if';
import { translate as $t } from '../../helpers';

function FormRow(props) {
    let maybeHelp = props.help ? (
        <div className="help">
            <div className="help-text">{props.help}</div>
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

export default FormRow;
