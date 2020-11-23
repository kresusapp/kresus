import React, { useState, useImperativeHandle, ReactNode, ReactElement, useCallback } from 'react';
import Tippy from '@tippyjs/react/headless';

import './popover.css';

function appendToBody() {
    return document.body;
}

interface PopoverProps {
    // DOM node that's used to open the popover.
    trigger: ReactElement;

    // Content within the popover.
    content: ReactNode;

    // Whether the popover is displayed in small form.
    small?: boolean;
}

interface ExposedMethods {
    close: () => void;
}

const Popover = React.forwardRef<ExposedMethods, PopoverProps>((props, ref) => {
    const [isOpen, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), [setOpen]);

    const trigger = React.cloneElement(props.trigger, {
        ...props.trigger.props,
        onClick: () => {
            setOpen(!isOpen);
        },
    });

    // Expose the close() function through a reference.
    useImperativeHandle(ref, () => ({
        close,
    }));

    const { content, small } = props;
    const render = useCallback(
        attrs => {
            const smallClass = small ? 'small' : '';

            return (
                <>
                    <div className={`popover-content ${smallClass}`} {...attrs}>
                        {content}
                    </div>
                    <div className="popover-arrow" data-popper-arrow="" />
                </>
            );
        },
        [content, small]
    );

    return (
        <Tippy
            zIndex={800}
            // Append the DOM component to the <body>, not the parent.
            appendTo={appendToBody}
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
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: document.querySelector('#app > main'),
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

export default Popover;
