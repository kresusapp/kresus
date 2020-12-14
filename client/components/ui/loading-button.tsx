import React from 'react';
import DisplayIf from './display-if';

import './loading-button.css';

interface LoadingButtonProps {
    // The callback to be called on click.
    onClick: () => Promise<void>;

    // Extra css classes.
    className?: string;

    // The label to be displayed on the button.
    label: string;

    // A boolean to tell whether the button is loading.
    isLoading: boolean;

    // A boolean to disable the button even when not loading.
    disabled?: boolean;
}

const LoadingButton = ({
    onClick,
    label,
    className = '',
    disabled = false,
    isLoading,
}: LoadingButtonProps) => {
    return (
        <button
            type="button"
            className={`btn loading-button ${className}`}
            disabled={isLoading || disabled}
            onClick={onClick}>
            <span>{label}</span>
            <DisplayIf condition={isLoading}>
                <span className="fa fa-spinner" />
            </DisplayIf>
        </button>
    );
};

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
