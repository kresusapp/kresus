import { useCallback, useEffect, useRef } from 'react';

import { handleSyncError, handleFirstSyncError, genericErrorHandler } from './errors';
import { notify, translate } from './helpers';

// Return a wrapped callback that calls onError with the caught error, when
// there's one.
// Don't forget to wrap the callback and onError in useCallback!
export const useCatchError = (
    func: (...args: any[]) => Promise<void>,
    onError: (err: Error) => void
) => {
    return useCallback(
        async (...params) => {
            try {
                await func(...params);
                return true;
            } catch (err) {
                onError(err);
                return false;
            }
        },
        [func, onError]
    );
};

// Return a wrapped callback that calls notify with the given message and
// accompanying error, when there's one.
// Don't forget to wrap the callback in useCallback!
export const useNotifyError = (errorKey: string, callback: (...args: any[]) => Promise<void>) => {
    const onError = useCallback(
        error => {
            notify.error(translate(errorKey, { error: error.message }));
        },
        [errorKey]
    );
    return useCatchError(callback, onError);
};

// Automatically wraps the callback so it catches synchronization errors.
// Don't forget to wrap the callback in useCallback!
export const useSyncError = (callback: (...args: any[]) => Promise<void>) => {
    return useCatchError(callback, handleSyncError);
};

export const useFirstSyncError = (callback: (...args: any[]) => Promise<void>) => {
    return useCatchError(callback, handleFirstSyncError);
};

export const useGenericError = (callback: (...args: any[]) => Promise<void>) => {
    return useCatchError(callback, genericErrorHandler);
};

// useEffect that triggers only on update (and not on mount).
// Thanks https://stackoverflow.com/a/61612292.
export const useEffectUpdate = (effect: () => void, dependencies: any[]) => {
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (!isFirstRender.current) {
            effect();
        }
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        isFirstRender.current = false;
    }, []);
};

// A hook that allows tracking when a property fails the shallow-equal
// comparison test.
// Quite useful in debugging situations when trying to identify why something
// has triggered a re-rendering.
export const useCompareWithPrev = (itemName: string, item: any) => {
    const prev = useRef<any>();
    useEffect(() => {
        if (prev.current !== item) {
            /* eslint-disable-next-line no-console */
            console.log('new version of', itemName);
            prev.current = item;
        }
    }, [item, itemName]);
};
