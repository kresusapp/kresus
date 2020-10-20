import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './back-link.css';

function BackLink(props) {
    return (
        <Link className="backlink" to={props.to}>
            <span className="fa fa-chevron-left" />
            <span className="link">{props.children}</span>
        </Link>
    );
}

BackLink.propTypes = {
    // The target URL to which we should go back to.
    to: PropTypes.string.isRequired,

    // Children must be text node and contain the content of the link.
    children: PropTypes.string.isRequired,
};

export default BackLink;
