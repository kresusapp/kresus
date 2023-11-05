import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import throttle from 'lodash.throttle';
import { assert } from '../../helpers';

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

interface Props {
    // Number of transactions before / after the ones to render, for fast scroll.
    // As the prop is used in a static function, the linter does not detect it is used.
    // eslint-disable-next-line react/no-unused-prop-types
    ballast: number;

    // The list of items to be rendered.
    items: any[];

    // Height of a single item in the list.
    itemHeight: number;

    // The space between the component and window's top.
    // As the prop is used in a static function, the linter does not detect it is used.
    // eslint-disable-next-line react/no-unused-prop-types
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

    const container = useRef<HTMLElement>();

    const { items, containerId, renderItems, heightAbove, itemHeight, ballast } = props;
    const numItems = items.length;

    // Cheap to call, because it won't do anything if we haven't scrolled.
    const recomputeWindow = useCallback(() => {
        if (!container.current) {
            return;
        }

        const topItemH = Math.max(container.current.scrollTop - heightAbove, 0);
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
    }, [setBounds, heightAbove, itemHeight, ballast, numItems]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleScroll = useCallback(
        throttle((e: Event) => {
            e.preventDefault();
            recomputeWindow();
        }, SCROLL_THROTTLING),
        [recomputeWindow]
    );

    useEffect(() => {
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
