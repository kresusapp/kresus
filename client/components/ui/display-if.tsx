import React from 'react';
import { useKresusState } from '../../helpers';
import { get } from '../../store';

const DisplayIf = (props: {
    condition: boolean;
    children: React.ReactNode | React.ReactNode[];
}) => {
    if (props.condition) {
        return <>{props.children}</>;
    }
    return null;
};

DisplayIf.displayName = 'DisplayIf';

export default DisplayIf;

export const IfNotMobile = (props: { children: React.ReactNode | React.ReactNode[] }) => {
    const condition = useKresusState(state => !get.isSmallScreen(state));
    return <DisplayIf condition={condition}>{props.children}</DisplayIf>;
};

IfNotMobile.displayName = 'IfNotMobile';
