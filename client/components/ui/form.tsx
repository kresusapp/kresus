import React, { useCallback } from 'react';

import DisplayIf from './display-if';
import { translate as $t } from '../../helpers';

import './form.css';

interface FormProps {
    // Function to be called once the form has been submitted.
    onSubmit?: () => Promise<void> | void;

    // Should the form be centered by having a left offset?
    center?: boolean;

    // Optional CSS class name.
    className?: string;

    children: React.ReactNode[] | React.ReactNode;
}

const Form = (props: FormProps) => {
    const { onSubmit: propsOnSubmit } = props;

    const onSubmit = useCallback(
        event => {
            event.preventDefault();
            if (propsOnSubmit) {
                return propsOnSubmit();
            }
        },
        [propsOnSubmit]
    );

    const classes: string[] = [];
    if (props.center) {
        classes.push('form-center');
    }
    if (props.className) {
        classes.push(props.className);
    }
    const className = classes.join(' ');

    return (
        <form className={className} onSubmit={onSubmit}>
            {props.children}
        </form>
    );
};

interface FormInputProps {
    // A single component to be used as the input, in the form.
    children: JSX.Element;

    // The HTML id used to connect the label and the input component.
    id: string;

    // The label to attach to the input.
    label: string;

    // Should this form input be marked as optional, next to its label?
    optional?: boolean;

    // On small screens, should the input be placed to the right of the label,
    // instead of on its own line?
    inline?: boolean;

    // An optional component to display below the input itself.
    help?: JSX.Element | string;
}

Form.Input = (props: FormInputProps) => {
    const child = React.Children.only(props.children);

    // Add an extra id property to the child.
    const input = React.cloneElement(child, { ...child.props, id: props.id });

    const className = props.inline ? ' inline' : '';

    return (
        <div className={`form-input${className}`}>
            <label htmlFor={props.id}>
                <span className="label-text">{props.label}</span>
                <DisplayIf condition={!!props.optional}>
                    <span>&nbsp;{$t('client.form-row.optional')}</span>
                </DisplayIf>
            </label>

            <div className="input">{input}</div>

            <DisplayIf condition={!!props.help}>
                <div className="form-help">
                    <p className="help-text">{props.help}</p>
                </div>
            </DisplayIf>
        </div>
    );
};

Form.Toolbar = (props: { children: React.ReactNode; align?: 'left' | 'right' }) => {
    let classes = '';
    if (props.align === 'right') {
        classes += ' right';
    } else if (props.align === 'left') {
        classes += ' left';
    }
    return <p className={`form-toolbar${classes}`}>{props.children}</p>;
};

export default Form;
