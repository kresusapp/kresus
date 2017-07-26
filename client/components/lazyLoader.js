import React, { PureComponent } from 'react';

import { translate as $t } from '../helpers';

import Loading from './ui/loading';

// Wrapper around components for lazy loading
// Comes from https://reacttraining.com/react-router/web/guides/code-splitting
export default class LazyLoader extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            mod: null
        };
    }

    componentWillMount() {
        this.load(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.load !== this.props.load) {
            this.load(nextProps);
        }
    }

    load(props) {
        this.setState({
            mod: null
        });
        props.load(mod => {
            this.setState({
                // handle both es imports and cjs
                mod: mod.default ? mod.default : mod
            });
        });
    }

    render() {
        return (
            this.state.mod ?
            this.props.children(this.state.mod) :
            <Loading message={ $t('client.spinner.loading') } />
        );
    }
}
