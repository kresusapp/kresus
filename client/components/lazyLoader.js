import { PureComponent } from 'react';

import { assert } from '../helpers';

/*
 * Wrapper around components for lazy loading
 * Adapted from https://reacttraining.com/react-router/web/guides/code-splitting
 *
 * IMPORTANT: This LazyLoader can handle only a single component. This means it
 * won't work if you update the `load` prop after building it. This is enforced
 * by assert.
 */
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
        assert(nextProps.load === this.props.load);
    }

    load(props) {
        props.load(mod => {
            this.setState({
                // handle both ES imports and CommonJS
                mod: mod.default ? mod.default : mod
            });
        });
    }

    render() {
        return this.state.mod ? this.props.children(this.state.mod) : null;
    }
}
