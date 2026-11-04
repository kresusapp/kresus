import throttle from 'lodash.throttle';
import type * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assert } from '../../helpers';

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

interface Props {
    // Number of transactions before / after the ones to render, for fast scroll.
    // As the prop is used in a static function, the linter does not detect it is used.
    ballast: number;

    // The list of items to be rendered.
    items: any[];

    // Height of a single item in the list.
    itemHeight: number;

    // The space between the component and window's top.
    // As the prop is used in a static function, the linter does not detect it is used.
    heightAbove: number;

    // Function to be called for rendering all the items, with the signature:
    // (items: Array, firstItem: Number, lastItem: Number) -> [React elements]
    renderItems: (items: any[], first: number, last: number) => React.ReactNode[];

    // The list container html identifier
    containerId: string;
}

const InfiniteList = (props: Props) => {
    const [bounds, setBounds] = useState<{ first: number; last: number }>({
        first: 0,
        last: (window.innerHeight / props.itemHeight) | 0,
    });

    const container = useRef<HTMLElement | null>(null);

    const { items, containerId, renderItems, heightAbove, itemHeight, ballast } = props;
    const numItems = items.length;

    // Cheap to call, because it won't do anything if we haven't scrolled.
    const recomputeWindow = useCallback(() => {
        if (!container.current) {
            return;
        }

        // The height of the full list, if it were entirely rendered.
        const fullListH = numItems * itemHeight;

        // The maximum height of the top item, if the list were scrolled to the bottom.
        const maxTopItemH = Math.max(fullListH - container.current.clientHeight, 0);

        // The height of the top item, relative to the top of the list.
        const relativeScrollTop = Math.max(container.current.scrollTop - heightAbove, 0);

        // The height of the top item.
        //
        // Never compute a window past the end of the list: the items might have changed under the
        // hood (a search has been narrowed, etc.) while the list was scrolled further down than
        // the new list's height (i.e. relativeScrollTop is largely bigger than maxTopItemH), in
        // which case the browser is about to clamp the scroll position anyway.
        const topItemH = Math.min(relativeScrollTop, maxTopItemH);

        const bottomItemH = topItemH + container.current.clientHeight;
        const newFirstItem = Math.max((topItemH / itemHeight - ballast) | 0, 0);
        const newLastItem = Math.min(((bottomItemH / itemHeight) | 0) + ballast, numItems);

        // Avoid re-renders for small scroll events.
        setBounds(prev => {
            if (prev.first !== newFirstItem || prev.last !== newLastItem) {
                return { first: newFirstItem, last: newLastItem };
            }
            return prev;
        });
    }, [heightAbove, itemHeight, ballast, numItems]);

    // The throttled scroll handler must not be recreated on every change of `recomputeWindow`,
    // otherwise the throttling would be reset all the time. Yet, it must not call a stale
    // `recomputeWindow`, which would compute the window from outdated props (number of items,
    // height above…) and could leave the visible part of the list empty. Hence the indirection
    // through a ref.
    //
    // Using a reference makes us avoid having a dependency list, so we don't trigger the effect
    // depending on `handleScroll` below. We could use `useCallback`, but it's slightly less
    // efficient as it would evaluate `throttle()` on every render.
    const recomputeWindowRef = useRef(recomputeWindow);

    const handleScroll = useMemo(
        () =>
            throttle(() => {
                recomputeWindowRef.current();
            }, SCROLL_THROTTLING),
        []
    );

    useEffect(() => {
        recomputeWindowRef.current = recomputeWindow;

        // The items might change under the hood, after search has been
        // cleared out, etc. Remember that `recomputeWindow` is cheap to call
        // in general.
        recomputeWindow();
    }, [recomputeWindow]);

    // On mount only. Make sure to not include dependencies on handlers that
    // could be modified at any time.
    useEffect(() => {
        const target = document.getElementById(containerId);
        assert(!!target, 'container must have been mounted');
        // Ensure the top of the list is always visible when remounting the component.
        target.scrollTop = 0;
    }, [containerId]);

    // Reset the scroll handler every time it changes. In theory it should
    // remain constant, and the scrolled data should be what changes, but React
    // hooks don't make this easy to model.
    useEffect(() => {
        const target = document.getElementById(containerId);
        assert(!!target, 'container must have been mounted');
        container.current = target;
        container.current.addEventListener('scroll', handleScroll);
        return () => {
            assert(!!container.current, 'container must have been mounted');
            container.current.removeEventListener('scroll', handleScroll);
            // Don't let a trailing throttled call outlive the listener.
            handleScroll.cancel();
        };
    }, [containerId, handleScroll]);

    const { first: firstItem, last: lastItem } = bounds;

    const renderedItems = useMemo(() => {
        return renderItems(items, firstItem, lastItem);
    }, [renderItems, firstItem, lastItem, items]);

    if (items.length === 0) {
        return null;
    }

    const bufferPreH = itemHeight * firstItem;
    const bufferPostH = Math.max(itemHeight * (items.length - lastItem), 0);

    return (
        <tbody>
            <tr style={{ height: bufferPreH }} />
            {renderedItems}
            <tr style={{ height: bufferPostH }} />
        </tbody>
    );
};

export default InfiniteList;
