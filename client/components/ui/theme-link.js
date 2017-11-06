import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

class ThemeLink extends React.Component {
    constructor(props) {
        super(props);
        this.element = null;
        this.onLoadHandler = this.onLoadHandler.bind(this);
        this.onErrorHandler = this.onErrorHandler.bind(this);
    }

    onLoadHandler() {
        this.props.setThemeLoaded(true);
        if (this.props.onLoad) {
            this.props.onLoad(true);
        }
    }

    onErrorHandler() {
        this.props.setThemeLoaded(false);
        if (this.props.onLoad) {
            this.props.onLoad(false);
        }
    }

    componentDidMount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.addEventListener('load', this.onLoadHandler);
        element.addEventListener('error', this.onErrorHandler);
    }

    componentWillUnmount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.removeEventListener('load', this.onLoadHandler);
        element.removeEventListener('error', this.onErrorHandler);
    }

    render() {
        const refLink = element => {
            this.element = element;
        };

        return (
            <link rel="stylesheet" href={`themes/${this.props.theme}/bundle.css`} ref={refLink} />
        );
    }
}

ThemeLink.propTypes = {
    // The user's theme identifier.
    theme: PropTypes.string.isRequired,

    // A callback to call when the theme has been loaded
    onLoad: PropTypes.func
};

const ThemeLoaderTag = connect(
    state => {
        return {
            theme: get.setting(state, 'theme')
        };
    },
    dispatch => {
        return {
            setThemeLoaded: loaded => {
                actions.finishThemeLoad(dispatch, loaded);
            }
        };
    }
)(ThemeLink);

export default ThemeLoaderTag;
