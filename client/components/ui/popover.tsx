import React, {
    useState,
    useImperativeHandle,
    ReactNode,
    ReactElement,
    useCallback,
    useEffect,
} from 'react';
import Tippy, { TippyProps } from '@tippyjs/react/headless';

import './popover.css';

function appendToBody() {
    return document.body;
}

// Retrieve the type of the first parameter of TippyProps.render.
type Attrs = Parameters<NonNullable<TippyProps['render']>>[0];

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

    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                close();
                // Remove the listener when hiding the popover.
                document.removeEventListener('keydown', onKeyDown);
            }
        },
        [close]
    );

    // Expose the close() function through a reference.
    useImperativeHandle(ref, () => ({
        close,
    }));

    const { content, small } = props;
    const render = useCallback(
        (attrs: Attrs) => {
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

    useEffect(() => {
        // Add the listener when the popover is displayed.
        if (isOpen) {
            document.addEventListener('keydown', onKeyDown);
        }
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [onKeyDown, isOpen]);

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
