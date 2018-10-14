import React from 'react';
import PropTypes from 'prop-types';

const Well = props => {
    return (
        <div className={`well ${props.className}`}>
            <span className="well-icon">
                <i className={`fa fa-${props.icon}`} />
            </span>
            <span className="operation-amount">{props.content}</span>
            <br />
            <span className="well-title">{props.title}</span>
            <br />
            <span className="well-sub">{props.subtitle}</span>
        </div>
    );
};

Well.propTypes = {
    // The CSS class to be applied to the well.
    className: PropTypes.string.isRequired,

    // The icon name to be added in the well.
    icon: PropTypes.string.isRequired,

    // The content to be displayed.
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    // The title of the well.
    title: PropTypes.string.isRequired,

    // The subtitle of the well.
    subtitle: PropTypes.string.isRequired
};

export default Well;
