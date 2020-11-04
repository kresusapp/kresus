import React, { useState, useImperativeHandle } from 'react';
import Tippy from '@tippyjs/react/headless';
import PropTypes from 'prop-types';

import './popover.css';

function appendToReactRoot() {
    return document.getElementById('app');
}

const Popover = React.forwardRef((props, ref) => {
    let [isOpen, setOpen] = useState(false);

    let close = () => setOpen(false);

    let trigger = React.cloneElement(props.trigger, {
        ...props.trigger.props,
        onClick: () => {
            setOpen(!isOpen);
        },
    });

    // Expose the close() function through a reference.
    useImperativeHandle(ref, () => ({
        close,
    }));

    let render = attrs => (
        <div className={`popover-content ${smallClass}`} {...attrs}>
            {props.content}
            <div className="popover-arrow" data-popper-arrow="" />
        </div>
    );

    let smallClass = props.small ? 'small' : '';
    return (
        <Tippy
            zIndex={800}
            // Append the DOM component to React's root, not the parent.
            appendTo={appendToReactRoot}
            // Try to place the popover below by default...
            placement={'bottom'}
            popperOptions={{
                modifiers: [
                    {
                        name: 'flip',
                        options: {
                            // ... and then to the top, or to the left, or to the
                            // right, etc.
                            fallbackPlacements: ['top', 'left', 'right'],
                        },
                    },
                ],
            }}
            visible={isOpen}
            onClickOutside={close}
            interactive={true}
            render={render}>
            {trigger}
        </Tippy>
    );
});

Popover.propTypes = {
    // DOM node that's used to open the popover.
    trigger: PropTypes.element.isRequired,

    // Content within the popover.
    content: PropTypes.node.isRequired,

    // Whether the popover is displayed in small form.
    small: PropTypes.bool,
};

export default Popover;
