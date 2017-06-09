import React from 'react';
import PropTypes from 'prop-types';

const Well = props => {
    return (
        <div
          className="well"
          style={ { backgroundColor: props.backgroundColor } }>
            <span className="well-icon">
                <i className={ `fa fa-${props.icon}` } />
            </span>
            <span className="operation-amount">
                { props.content }
            </span><br />
            <span className="well-title">{ props.title }</span><br />
            <span className="well-sub">{ props.subtitle }</span>
        </div>
    );
};

Well.propTypes = {
    // A string representing the color of the background.
    backgroundColor: PropTypes.string.isRequired,

    // The string representing the icon to be diplayed.
    icon: PropTypes.string.isRequired,

    // The main title of the well.
    title: PropTypes.string.isRequired,

    // The subtitle of the well.
    subtitle: PropTypes.string.isRequired,

    // The content of the well.
    content: PropTypes.string.isRequired
};

export default Well;
