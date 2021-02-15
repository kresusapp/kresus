import { useCallback } from 'react';

import { handleSyncError, handleFirstSyncError } from './errors';
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
