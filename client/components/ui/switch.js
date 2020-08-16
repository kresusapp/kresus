import React from 'react';
import PropTypes from 'prop-types';

function Switch(props) {
    let onChange = ev => {
        // TODO maybe require to cancelDefault?
        props.onChange(ev.target.checked);
    };

    let extraClasses = props.className ? props.className : '';

    return (
        <input
            id={props.id}
            type="checkbox"
            className={`switch ${extraClasses}`}
            onChange={onChange}
            aria-label={props.ariaLabel}
            checked={props.checked}
        />
    );
}

Switch.propTypes = {
    // Function called when the value changes: function(checked: bool)
    onChange: PropTypes.func.isRequired,

    // Aria label for screen readers.
    ariaLabel: PropTypes.string.isRequired,

    // Controlled value.
    checked: PropTypes.bool.isRequired,

    // Additional CSS classes.
    className: PropTypes.string,

    // An html id, for labels.
    id: PropTypes.string,
};

export default Switch;
