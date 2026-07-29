import { translate as $t } from '../../helpers';

export const LoadingMessage = (props: {
    // Message indicating why we're doing background loading (and the UI is
    // frozen).
    message?: string | React.JSX.Element;

    inline?: boolean;
}) => {
    const message = props.message || $t('client.spinner.generic');

    return (
        <div className={`loading-message-base ${props.inline ? 'inline' : ''}`}>
            <svg
                className="spinner"
                width="11em"
                height="11em"
                viewBox="0 0 66 66"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle
                    className="path"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    cx="33"
                    cy="33"
                    r="30"
                />
            </svg>
            <div>{message}</div>
        </div>
    );
};

LoadingMessage.displayName = 'LoadingMessage';

const LoadingMessageWithTitle = (props: {
    // Message indicating why we're doing background loading (and the UI is
    // frozen).
    message?: string | React.JSX.Element;
}) => {
    const message = props.message || $t('client.spinner.generic');

    return (
        <div className="loading-message">
            <h3>{$t('client.spinner.title')}</h3>
            <LoadingMessage message={message} />
        </div>
    );
};

LoadingMessageWithTitle.displayName = 'LoadingMessageWithTitle';

export default LoadingMessageWithTitle;
