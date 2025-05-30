import { useCallback, useEffect, useRef } from 'react';

import './swipeable-table.css';

// This selector matches the lateral menu and the content container.
// This define the furthest ancestor for which a swipe is considered OK.
// When a swipe ends, we check that it ended in the same ancestor as where
// it started. Ex: if it started in the content container but ended in the
// lateral menu, then we cancel the swipe event.
const appMainAncestorSelector = '#app > main > *';

// When a referenced element is swiped, triggers the event passed as
// `onSwipeStart`, `onSwipeChange`, `onSwipeEnd`.
// Returns the reference to be bound to the underlying element.
export function useSwipeDetection<T extends HTMLElement>(
    onSwipeStart: (element: T) => void,
    onSwipeChange: (element: T, delta: number) => void,
    onSwipeEnd: (element: T, cancelled: boolean) => void,
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
                let cancelled = event.type === 'touchcancel';

                // Consider the event as cancelled if the touch ended
                // on a different "main" ancestor than the start target.
                // Ex: touch started in content-container but ended in nav (menu).
                // The touchevent does not give the target where it ended, only
                // the coordinates from the touch, so we use elementFromPoint.
                if (!cancelled) {
                    const endTouch = event.changedTouches[0];
                    const endTarget = document.elementFromPoint(endTouch.pageX, endTouch.pageY);
                    const endTargetMainAncestor = endTarget
                        ? endTarget.closest(appMainAncestorSelector)
                        : null;
                    if (!endTargetMainAncestor) {
                        cancelled = true;
                    } else {
                        const startTargetMainAncestor =
                            ref.current.closest(appMainAncestorSelector);
                        if (
                            !startTargetMainAncestor ||
                            startTargetMainAncestor !== endTargetMainAncestor
                        ) {
                            cancelled = true;
                        }
                    }
                }

                onSwipeEnd(ref.current, cancelled);
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

const SwipeableActionWidth = 100;

// Consider that at least half the swipeable action must have been shown to take effect.
const meaningfulSwipeThreshold = SwipeableActionWidth / 2;

// When a referenced element is swiped, triggers the event passed as
// `onSwipedLeft`, `onSwipedRight`.
// Returns the reference to be bound to the underlying element.
export function useTableRowSwipeDetection<T extends HTMLTableRowElement>(
    onSwipedLeft: (element: T) => void,
    onSwipedRight: (element: T) => void,
    excludeSelector?: string
) {
    // No point to use a ref here, does not need to be kept on re-render.
    let swipeDelta = 0;

    const onSwipeStart = (element: HTMLElement) => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        swipeDelta = 0;

        element.classList.add('swiped');
    };

    const onSwipeChange = (element: HTMLElement, delta: number) => {
        // The swipeable action is 100px wide so we set a maximum range of -100/100.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        swipeDelta = Math.min(SwipeableActionWidth, Math.max(-SwipeableActionWidth, delta));

        // Whether the swipe will be effective or discarded because not meaningful enough.
        element.classList.toggle(
            'swiped-effective',
            Math.abs(swipeDelta) > meaningfulSwipeThreshold
        );

        // Default position is -100px, fully swiped to the right = 0px, fully swiped to the left = -200px, swiped to the left;
        // Decrease by 100 to align it with the default.
        const alignedDelta = swipeDelta - SwipeableActionWidth;

        element.querySelectorAll<HTMLTableCellElement>('td').forEach(td => {
            td.style.translate = `${alignedDelta}px`;
        });
    };

    const onSwipeEnd = async (element: HTMLElement, cancelled: boolean) => {
        element.classList.remove('swiped', 'swiped-effective');

        element.querySelectorAll<HTMLTableCellElement>('td').forEach(td => {
            // Reset translation
            td.style.translate = '';
        });

        if (!cancelled && swipeDelta) {
            if (swipeDelta > meaningfulSwipeThreshold) {
                onSwipedRight(element as T);
            } else if (swipeDelta < -meaningfulSwipeThreshold) {
                onSwipedLeft(element as T);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
        swipeDelta = 0;
    };

    const ref = useSwipeDetection<T>(onSwipeStart, onSwipeChange, onSwipeEnd, excludeSelector);

    return ref;
}
