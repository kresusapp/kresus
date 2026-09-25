import { translate as $t } from '../../helpers';
import { useKresusState } from '../../store';
import * as UiStore from '../../store/ui';

import LoadingMessage from './loading';
import UserActionForm from './user-action';

import './overlay.css';
import { useEffect } from 'react';

// An overlay component, when we want to show something on screen on top of the
// previous content, without fiddling with the history state.

const Overlay = () => {
    const reason = useKresusState(state => UiStore.getProcessingReason(state.ui));
    const action = useKresusState(state => UiStore.userActionRequested(state.ui));

    useEffect(() => {
        // Automatically process an `AppValidation`.
        if (!reason && action && action.fields === null) {
            action.finish({});
        }
    }, [reason, action]);

    let child: React.JSX.Element;
    // Note that both processingReason and action may be set at the same time:
    // for instance, after confirming a user action, a long request might be
    // sent to the server and trigger the processingReason spinner screen. In
    // particular, it's important to keep the checks here in this order, so the
    // processingReason screen is still being displayed "on top of" a user
    // action.
    if (reason) {
        const message = reason.extra ? (
            <div>
                <p>{$t(reason.reasonTranslationKey)}</p>
                {reason.extra.map((msg, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: doesn't get re-rendered.
                    <p key={`extra-${index}`}>{msg}</p>
                ))}
            </div>
        ) : (
            $t(reason.reasonTranslationKey)
        );
        child = <LoadingMessage message={message} />;
    } else if (action) {
        child = <UserActionForm action={action} />;
    } else {
        return null;
    }

    return <div id="content-overlay">{child}</div>;
};

Overlay.displayName = 'Overlay';

export default Overlay;

export { LoadingMessage };
