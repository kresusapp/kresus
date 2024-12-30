import { useCallback, useEffect, useRef } from 'react';

import './swipable-table.css';

// When a referenced element is swiped, triggers the event passed as
// `onSwipeStart`, `onSwipeChange`, `onSwipeEnd`.
// Returns the reference to be bound to the underlying element.
export default function useSwipe<T extends HTMLElement>(
    onSwipeStart: (element: T) => void,
    onSwipeChange: (element: T, delta: number) => void,
    onSwipeEnd: (element: T) => void,
    excludeSelector?: string
) {
    const ref = useRef<T>(null);

    // Do not use useState here, those variables should not cause re-render. Arguably useRef could
    // be used but we do not need to keep the values on re-render.
    let initialXPosition = 0;
    let initialYPosition = 0;
    let deltaX = 0;
    let started = false;

    const onContextMenu = useCallback((event: Event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const onTouchMove = useCallback(
        (event: TouchEvent) => {
            if (!ref.current) {
                return;
            }

            const newDeltaX = event.touches[0].clientX - initialXPosition;
            const newDeltaY = event.touches[0].clientY - initialYPosition;

            // Until the move is not mainly lateral (ie. moved more on the X axis than on the Y axis),
            // ignore it.
            if (!started && Math.abs(newDeltaY) >= Math.abs(newDeltaX)) {
                return;
            }

            if (!started) {
                onSwipeStart(ref.current);
            }

            if (newDeltaX !== deltaX) {
                onSwipeChange(ref.current, deltaX);
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
            started = true;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            deltaX = newDeltaX;
        },
        [ref, onSwipeChange]
    );

    const onTouchEnd = useCallback(
        (event: TouchEvent) => {
            if (!ref.current) {
                return;
            }

            if (started) {
                onSwipeEnd(ref.current);
            }

            if (event.target instanceof HTMLElement) {
                event.target.removeEventListener('touchend', onTouchEnd);
                event.target.removeEventListener('touchcancel', onTouchEnd);
                event.target.removeEventListener('touchmove', onTouchMove);
                event.target.removeEventListener('contextmenu', onContextMenu);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ref, onTouchMove, onContextMenu, onSwipeEnd]
    );

    const onTouchStart = useCallback(
        (event: TouchEvent) => {
            if (!ref.current) {
                return;
            }

            // Some elements (scrollable labels for example needs to remain scrollable).
            if (
                excludeSelector &&
                event.target instanceof HTMLElement &&
                (event.target.matches(excludeSelector) || event.target.closest(excludeSelector))
            ) {
                return;
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
            started = false;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            initialXPosition = event.touches[0].clientX;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            initialYPosition = event.touches[0].clientY;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            deltaX = 0;

            // Do not fire the swipe start event yet, it will be done on the first
            // meaningful move.

            if (event.target instanceof HTMLElement) {
                event.target.addEventListener('touchend', onTouchEnd);
                event.target.addEventListener('touchcancel', onTouchEnd);
                event.target.addEventListener('touchmove', onTouchMove);
                event.target.addEventListener('contextmenu', onContextMenu);
            }
        },
        [ref, onSwipeStart, onTouchMove, onTouchEnd, onContextMenu]
    );

    // On mount.
    useEffect(() => {
        if (!(ref.current instanceof HTMLElement)) {
            return;
        }

        const elem = ref.current;

        elem.addEventListener('touchstart', onTouchStart);

        return () => {
            // On unmount.
            elem.removeEventListener('touchstart', onTouchStart);
            elem.removeEventListener('touchmove', onTouchMove);
            elem.removeEventListener('touchend', onTouchEnd);
            elem.removeEventListener('touchcancel', onTouchEnd);
            elem.removeEventListener('contextmenu', onContextMenu);
        };
    }, [ref, onTouchStart, onTouchMove, onTouchEnd, onContextMenu]);

    return ref;
}
