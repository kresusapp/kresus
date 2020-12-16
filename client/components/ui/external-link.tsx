import React, { ReactNode } from 'react';

export default (props: { href: string; children?: ReactNode }) => (
    <a href={props.href} rel="noopener noreferrer" target="_blank">
        {props.children}
    </a>
);
