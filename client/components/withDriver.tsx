import React, { /* useCallback,*/ useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useParams } from 'react-router-dom';
import { GlobalState } from '../store';
import { getDriver } from './drivers';
// import { useKresusState } from '../helpers';

interface ViewParams {
    driver: string;
    value: string;
}

const mapState = (state: GlobalState) => ({ banks: state.banks });

const connector = connect(mapState);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default (Component: React.Component) => {
    return connector((props: PropsFromRedux) => {
        const params = useParams<ViewParams>();
        const currentDriver = useMemo(() => getDriver(params.driver, params.value), [
            params.driver,
            params.value,
        ]);
        /*
        const currentView = useKresusState(useCallback(state => {
            console.log('->update driver');
            return currentDriver.getView(state.banks);
        }, [params.driver, params.value]));
        */

        const currentView = useMemo(() => {
            return currentDriver.getView(props.banks);
        }, [currentDriver, props.banks]);

        return <Component currentView={currentView} {...props} />;
    });
};
