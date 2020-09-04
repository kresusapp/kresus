import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Popover from './popover';
import FormToolbar from './form-toolbar';
import { translate as $t } from '../../helpers';

function Popform(props) {
    let cancelText = props.cancelText || $t('client.popconfirm.cancel');
    let confirmText = props.confirmText || $t('client.popconfirm.confirm');

    let [isOpen, setOpen] = useState(false);

    let trigger = React.cloneElement(props.trigger, {
        ...props.trigger.props,
        onClick: () => {
            setOpen(!isOpen);
        },
    });

    let close = () => setOpen(false);

    let onConfirm = () => {
        props.onConfirm();
        close();
    };

    let confirmClass = props.confirmClass ? props.confirmClass : '';

    return (
        <Popover
            small={props.small}
            isOpen={isOpen}
            close={close}
            trigger={trigger}
            content={
                <>
                    {props.children}
                    <FormToolbar>
                        <button className="btn" onClick={close}>
                            {cancelText}
                        </button>
                        <button className={`btn ${confirmClass}`} onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </FormToolbar>
                </>
            }
        />
    );
}

Popform.propTypes = {
    // Element to show as the trigger that will show the popconfirm.
    trigger: PropTypes.element.isRequired,

    // The function that will get called when confirming.
    onConfirm: PropTypes.func.isRequired,

    // Text to show for the cancel button.
    cancelText: PropTypes.string,

    // Text to show for the confirm button.
    confirmText: PropTypes.string,

    // CSS class names for the confirm button.
    confirmClass: PropTypes.string,

    // Should this popover be small (e.g. confirm box) or rather large?
    small: PropTypes.bool,
};

export { Popform };

export default props => <Popform small={true} confirmClass="danger" {...props} />;
