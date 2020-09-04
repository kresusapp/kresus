import React from 'react';
import Tippy from '@tippyjs/react/headless';

import './popover.css';

function appendToBody() {
    return document.body;
}

export default function Popover(props) {
    let smallClass = props.small ? 'small' : '';
    let render = attrs => (
        <div className={`popover-content ${smallClass}`} {...attrs}>
            {props.content}
            <div className="popover-arrow" data-popper-arrow="" />
        </div>
    );
    return (
        <Tippy
            // Append the DOM component to the <body>, not the parent.
            appendTo={appendToBody}
            // Try to place the popover below by default...
            placement={'bottom'}
            popperOptions={{
                modifiers: {
                    name: 'flip',
                    options: {
                        // ... and then to the top, or to the left, or to the
                        // right, etc.
                        fallbackPlacements: ['top', 'left', 'right'],
                    },
                },
            }}
            visible={props.isOpen}
            onClickOutside={props.close}
            interactive={true}
            render={render}>
            {props.trigger}
        </Tippy>
    );
}
