import React from 'react';

export default props => (
    <a href={props.href} rel="noopener noreferrer" target="_blank">
        {props.children}
    </a>
);
