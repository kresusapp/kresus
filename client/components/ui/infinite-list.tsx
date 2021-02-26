import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import throttle from 'lodash.throttle';
import { assert } from '../../helpers';

// Throttling for the scroll event (ms)
const SCROLL_THROTTLING = 150;

interface Props {
    // Number of operations before / after the ones to render, for fast scroll.
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

    const recomputeWindow = useCallback(() => {
        if (!container.current) {
            return;
        }

        const { heightAbove, itemHeight, items, ballast } = props;

        const topItemH = Math.max(container.current.scrollTop - heightAbove, 0);
        const bottomItemH = topItemH + container.current.clientHeight;
        const newFirstItem = Math.max((topItemH / itemHeight - ballast) | 0, 0);
        const newLastItem = Math.min(((bottomItemH / itemHeight) | 0) + ballast, items.length);

        // Avoid re-renders for small scroll events.
        setBounds(prev => {
            if (prev.first !== newFirstItem || prev.last !== newLastItem) {
                return { first: newFirstItem, last: newLastItem };
            }
            return prev;
        });
    }, [setBounds, props]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleScroll = useCallback(
        throttle((e: Event) => {
            e.preventDefault();
            recomputeWindow();
        }, SCROLL_THROTTLING),
        [recomputeWindow]
    );

    const { containerId, itemHeight, items, renderItems } = props;

    useEffect(() => {
        // On mount.
        const target = document.getElementById(containerId);
        assert(!!target, 'container must have been mounted');
        container.current = target;

        container.current.addEventListener('scroll', handleScroll);

        // Ensure the top of the list is always visible when remounting the component.
        container.current.scrollTop = 0;

        return () => {
            // On unmount.
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
