import React from 'react';
import { useKresusState } from '../../helpers';
import * as UiStore from '../../store/ui';

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
    const condition = useKresusState(state => !UiStore.isSmallScreen(state.ui));
    return <DisplayIf condition={condition}>{props.children}</DisplayIf>;
};

IfNotMobile.displayName = 'IfNotMobile';
