import React, { useCallback } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router';

export interface TabDescriptor {
    name: string;
    component: () => React.ReactNode;
}

const TabsContainer = (props: {
    // A map of tabs to display where the key is the tab identifier and the value
    // is the tab's name and component.
    tabs: Map<string, TabDescriptor>;

    // The default tab.
    defaultTab: string;

    // The selected tab.
    selectedTab?: string;
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const onChange = useCallback(
        (event: React.ChangeEvent<HTMLSelectElement>) => {
            const newPath = event.target.value;
            // Only modify current path if necessary
            if (location.pathname !== newPath) {
                navigate(newPath);
            }
        },
        [location, navigate]
    );

    const tabsLinks = [];
    const tabsOptions = [];
    for (const [path, tab] of props.tabs) {
        tabsLinks.push(
            <li key={path}>
                <NavLink to={path}>{tab.name}</NavLink>
            </li>
        );

        tabsOptions.push(
            <option key={path} value={path}>
                {tab.name}
            </option>
        );
    }

    const currentTab = props.tabs.get(location.pathname);
    if (!currentTab) {
        return <Navigate to={props.defaultTab} replace={true} />;
    }

    return (
        <>
            <div className="tabs-container-selector">
                <ul>{tabsLinks}</ul>
                <select
                    className="form-element-block"
                    value={props.selectedTab}
                    onChange={onChange}>
                    {tabsOptions}
                </select>
            </div>
            <div className="tab-content">{currentTab.component()}</div>
        </>
    );
};

TabsContainer.displayName = 'TabsContainer';

export default TabsContainer;
