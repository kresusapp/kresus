import React from 'react';
import { Link } from 'react-router-dom';

import './back-link.css';

function BackLink(props: {
    // The target URL to which we should go back to.
    to: string;

    // Children must be text node and contain the content of the link.
    children: string;

    // Callback called on click
    onClick?: () => void;
}) {
    return (
        <Link className="backlink" to={props.to} onClick={props.onClick}>
            <span className="fa fa-chevron-left" />
            <span className="link">{props.children}</span>
        </Link>
    );
}

BackLink.displayName = 'BackLink';

export default BackLink;
