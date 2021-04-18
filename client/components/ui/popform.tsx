import React, { useCallback, useRef } from 'react';

import Popover, { PopoverRef } from './popover';
import Form from './form';
import { assert, translate as $t } from '../../helpers';

interface PopformShorthandProps {
    // Element to show as the trigger that will show the popconfirm.
    trigger: React.ReactElement;

    // The function that will get called when confirming.
    onConfirm: () => void;

    // Text to show for the cancel button.
    cancelText?: string;

    // Text to show for the confirm button.
    confirmText?: string;

    // The elements wrapped by this component.
    children: React.ReactNode | React.ReactNode[];

    // CSS class names for the confirm button.
    confirmClass?: string;
}

interface PopformProps extends PopformShorthandProps {
    // Should this popover be small (e.g. confirm box) or rather large?
    small: boolean;
}

function Popform(props: PopformProps) {
    const popover = useRef<PopoverRef>(null);

    const cancelText = props.cancelText || $t('client.popconfirm.cancel');
    const confirmText = props.confirmText || $t('client.popconfirm.confirm');

    const close = useCallback(() => {
        assert(popover.current !== null, 'popover has been set up');
        popover.current.close();
    }, []);

    const { onConfirm: propsOnConfirm } = props;
    const onConfirm = useCallback(() => {
        propsOnConfirm();
        close();
    }, [propsOnConfirm, close]);

    const confirmClass = props.confirmClass ? props.confirmClass : '';

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

Popform.displayName = 'PopForm';

export { Popform };

const Popconfirm = (props: PopformShorthandProps) => (
    <Popform small={true} confirmClass={props.confirmClass || 'danger'} {...props} />
);

Popconfirm.displayName = 'Popconfirm';

export default Popconfirm;
