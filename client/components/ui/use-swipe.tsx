import { useCallback, useEffect, useRef } from 'react';

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
    let delta = 0;

    const onContextMenu = useCallback((event: Event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const onTouchMove = useCallback(
        (event: TouchEvent) => {
            if (!ref.current) {
                return;
            }

            event.preventDefault();

            const newDelta = event.touches[0].clientX - initialXPosition;
            if (newDelta !== delta) {
                onSwipeChange(ref.current, delta);
                // eslint-disable-next-line react-hooks/exhaustive-deps
                delta = newDelta;
            }
        },
        [ref, onSwipeChange]
    );

    const onTouchEnd = useCallback(
        (event: TouchEvent) => {
            if (!ref.current) {
                return;
            }

            event.preventDefault();

            onSwipeEnd(ref.current);

            if (event.target instanceof HTMLElement) {
                event.target.removeEventListener('touchend', onTouchEnd);
                event.target.removeEventListener('touchcancel', onTouchEnd);
                event.target.removeEventListener('touchmove', onTouchMove);
                event.target.removeEventListener('contextmenu', onContextMenu);
            }
        },
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

            event.preventDefault();

            // eslint-disable-next-line react-hooks/exhaustive-deps
            initialXPosition = event.touches[0].clientX;

            // eslint-disable-next-line react-hooks/exhaustive-deps
            delta = 0;

            onSwipeStart(ref.current);

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
