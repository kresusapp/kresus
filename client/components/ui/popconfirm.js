import React, { useState } from 'react';

import Popover from './popover';
import FormToolbar from './form-toolbar';
import { translate as $t } from '../../helpers';

export default function Popconfirm(props) {
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

    return (
        <Popover
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
                        <button className="btn danger" onClick={props.onConfirm}>
                            {confirmText}
                        </button>
                    </FormToolbar>
                </>
            }
        />
    );
}
