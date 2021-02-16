import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

const ButtonLink = (props: {
    // URL the button links to.
    to: string;

    // Accessible label for the button.
    aria: string;

    // FontAwesome icon identifier (without the fa- prefix).
    icon?: string;

    // Text label of the button.
    label?: string;

    // Extra class name for the button.
    className?: string;
}) => {
    const history = useHistory();

    const { to } = props;
    const handleClick = useCallback(() => {
        history.push(to);
    }, [history, to]);

    const { aria, label, icon, className } = props;
    const iconComponent = icon ? <span className={`fa fa-${icon}`} /> : null;
    const additionalClass = className ? ` ${className}` : '';
    const labelContainer = label ? <span>{label}</span> : null;

    return (
        <button className={`btn ${additionalClass}`} aria-label={aria} onClick={handleClick}>
            {iconComponent}
            {labelContainer}
        </button>
    );
};

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
