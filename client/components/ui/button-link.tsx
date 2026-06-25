import React, { useCallback } from 'react';
import { useNavigate } from 'react-router';

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
    const navigate = useNavigate();

    const { to } = props;
    const handleClick = useCallback(() => {
        navigate(to);
    }, [navigate, to]);

    const { aria, label, icon, className } = props;
    const iconComponent = icon ? <span className={`fa fa-${icon}`} /> : null;
    const additionalClass = className ? ` ${className}` : '';
    const labelContainer = label ? <span>{label}</span> : null;

    return (
        <button
            type="button"
            className={`btn ${additionalClass}`}
            aria-label={aria}
            onClick={handleClick}>
            {iconComponent}
            {labelContainer}
        </button>
    );
};

ButtonLink.displayName = 'ButtonLink';

export default ButtonLink;
