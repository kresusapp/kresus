import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import URL from '../../urls';
import { translate as $t } from '../../helpers';

import DisplayIf from '../ui/display-if';

import './dropdown.css';

interface DropdownContentProps {
    // DOM id.
    id: string;
    onKeydown: (event: KeyboardEvent) => void;
    onClick: () => void;
    children: React.ReactNode[] | React.ReactNode;
}

const DropdownContent = (props: DropdownContentProps) => {
    useEffect(() => {
        document.addEventListener('keydown', props.onKeydown);
        return () => {
            document.removeEventListener('keydown', props.onKeydown);
        };
    }, [props.onKeydown]);

    return (
        <div id={props.id} onClick={props.onClick}>
            {props.children}
        </div>
    );
};

const DropdownMenu = () => {
    const [show, setShow] = useState(false);

    const handleHide = useCallback(() => {
        setShow(false);
    }, [setShow]);

    const handleToggle = useCallback(() => {
        setShow(!show);
    }, [setShow, show]);

    const handleKeydown = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleHide();
            }
        },
        [handleHide]
    );

    return (
        <div className="settings-dropdown">
            <button className="fa fa-cogs" onClick={handleToggle} />
            <DisplayIf condition={show}>
                <DropdownContent
                    id="dropdown-overlay"
                    onKeydown={handleKeydown}
                    onClick={handleHide}>
                    <nav className="settings-dropdown-menu">
                        <ul>
                            <li>
                                <NavLink to={URL.dashboard.url()}>
                                    <span className="fa fa-dashboard" />
                                    {$t('client.menu.dashboard')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.categories.pattern}>
                                    <span className="fa fa-list-ul" />
                                    {$t('client.menu.categories')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.accesses.pattern}>
                                    <span className="fa fa-bank" />
                                    {$t('client.settings.tab_accesses')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.rules.pattern}>
                                    <span className="fa fa-magic" />
                                    {$t('client.settings.tab_rules')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.recurringTransactions.pattern}>
                                    <span className="fa fa-calendar" />
                                    {$t('client.menu.recurring-transactions')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.settings.url('emails')}>
                                    <span className="fa fa-envelope" />
                                    {$t('client.settings.tab_alerts')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.settings.url('backup')}>
                                    <span className="fa fa-save" />
                                    {$t('client.settings.tab_backup')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.settings.url('admin')}>
                                    <span className="fa fa-sliders" />
                                    {$t('client.settings.tab_admin')}
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to={URL.settings.url('customization')}>
                                    <span className="fa fa-paint-brush" />
                                    {$t('client.settings.tab_customization')}
                                </NavLink>
                            </li>
                        </ul>
                        <ul>
                            <li>
                                <NavLink to={URL.about.url()}>
                                    <span className="fa fa-question" />
                                    {$t('client.menu.about')}
                                </NavLink>
                            </li>
                        </ul>
                    </nav>
                </DropdownContent>
            </DisplayIf>
        </div>
    );
};

DropdownMenu.displayName = 'DropdownMenu';

export default DropdownMenu;
