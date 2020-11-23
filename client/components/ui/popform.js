import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Popover from './popover';
import Form from './form';
import { translate as $t } from '../../helpers';

function Popform(props) {
    let popover = useRef(null);

    let cancelText = props.cancelText || $t('client.popconfirm.cancel');
    let confirmText = props.confirmText || $t('client.popconfirm.confirm');

    let close = () => popover.current.close();
    let onConfirm = () => {
        props.onConfirm();
        close();
    };

    let confirmClass = props.confirmClass ? props.confirmClass : '';

    return (
        <Popover
            ref={popover}
            small={props.small}
            trigger={props.trigger}
            content={
                <>
                    {props.children}
                    <Form.Toolbar>
                        <button className="btn" onClick={close}>
                            {cancelText}
                        </button>
                        <button className={`btn ${confirmClass}`} onClick={onConfirm}>
                            {confirmText}
                        </button>
                    </Form.Toolbar>
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

    // The elements wrapped by this component.
    children: PropTypes.node,
};

export { Popform };

export default props => <Popform small={true} confirmClass="danger" {...props} />;
