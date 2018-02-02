import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';

const Entry = props => {
    return (
        <li>
            <NavLink to={props.path} activeClassName="active">
                <i className={`fa fa-${props.icon}`} />
                {props.children}
            </NavLink>
        </li>
    );
};

Entry.propTypes = {
    // The path to which the link directs.
    path: PropTypes.string.isRequired,
    // Icon to be displayed.
    icon: PropTypes.string.isRequired
};

export default Entry;
