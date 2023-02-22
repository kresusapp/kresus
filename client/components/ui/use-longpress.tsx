import React, { useCallback, useEffect, useRef } from 'react';

// Duration of a long press in ms. Max 465.
// See https://hg.mozilla.org/mozilla-central/rev/faee29a2448b3ce50a23bae2c9ca194511dc6efd
const LONG_PRESS_DURATION = 400;

// When a referenced element is pressed for long, triggers the action passed as
// `onLongPress`. Returns the reference to be bound to the underlying element.
export default function useLongPress<T extends Element>(onLongPress: () => void) {
    const timer = useRef<number | undefined>();
    const pressStart = useRef(0);

    const ref = React.createRef<T>();

    const onContextMenu = useCallback((event: Event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const onPressEnd = useCallback(
        (event: Event) => {
            // Prevent clicks from happenning after a long press.
            if (
                event.type === 'touchend' &&
                Date.now() - pressStart.current > LONG_PRESS_DURATION
            ) {
                event.preventDefault();
            }

            if (event.target) {
                event.target.removeEventListener('touchend', onPressEnd);
                event.target.removeEventListener('touchmove', onPressEnd);
                event.target.removeEventListener('touchcancel', onPressEnd);
                event.target.removeEventListener('contextmenu', onContextMenu);
            }

            window.clearTimeout(timer.current);
            timer.current = undefined;
            pressStart.current = 0;
        },
        [onContextMenu]
    );

    const onPressStart = useCallback(
        (event: Event) => {
            window.clearTimeout(timer.current);
            pressStart.current = Date.now();
            timer.current = window.setTimeout(onLongPress, LONG_PRESS_DURATION);

            if (event.target) {
                event.target.addEventListener('touchend', onPressEnd);
                event.target.addEventListener('touchmove', onPressEnd);
                event.target.addEventListener('touchcancel', onPressEnd);
                event.target.addEventListener('contextmenu', onContextMenu);
            }
        },
        [onLongPress, onPressEnd, onContextMenu]
    );

    // On mount.
    useEffect(() => {
        if (!ref.current) {
            return;
        }

        const elem = ref.current;

        elem.addEventListener('touchstart', onPressStart);

        return () => {
            // On unmount.
            elem.removeEventListener('touchstart', onPressStart);
            elem.removeEventListener('touchend', onPressEnd);
            elem.removeEventListener('touchmove', onPressEnd);
            elem.removeEventListener('touchcancel', onPressEnd);
            elem.removeEventListener('contextmenu', onContextMenu);
        };
    }, [ref, onPressStart, onPressEnd, onContextMenu]);

    return ref;
}
