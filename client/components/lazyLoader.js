import { Component } from 'react';

import { assert } from '../helpers';

/*
 * Wrapper around components for lazy loading
 * Adapted from https://reacttraining.com/react-router/web/guides/code-splitting
 *
 * IMPORTANT: This LazyLoader can handle only a single component. This means it
 * won't work if you update the `load` prop after building it. This is enforced
 * by assert.
 */
export default class LazyLoader extends Component {
    state = { mod: null };

    shouldComponentUpdate(prevProps) {
        assert(prevProps.load === this.props.load);
        return true;
    }

    load() {
        this.props.load(mod => {
            this.setState({
                // handle both ES imports and CommonJS
                mod: mod.default ? mod.default : mod
            });
        });
    }

    render() {
        if (this.state.mod !== null) {
            return this.props.children(this.state.mod);
        }
        this.load();
        return null;
    }
}
