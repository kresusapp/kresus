import React from 'react';
import { useHistory } from 'react-router-dom';

export default props => {
    const history = useHistory();

    let handleClick = () => {
        history.push(props.to);
    };

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
