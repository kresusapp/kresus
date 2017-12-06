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
        this.fallbackCheckTimer = null;
        this.fallbackTimout = null;
    }

    isStyleSheetLoaded() {
        return Array.from(document.styleSheets).some(sheet => {
            return sheet.href.endsWith(`themes-${this.props.theme}-bundle.css`);
        });
    }

    onLoadHandler() {
        if (this.fallbackCheckTimer) {
            window.clearInterval(this.fallbackCheckTimer);
        }

        if (this.fallbackTimout) {
            window.clearTimeout(this.fallbackTimout);
        }

        this.props.setThemeLoaded(this.props.theme, true);
        if (this.props.onLoad) {
            this.props.onLoad(true);
        }
    }

    onErrorHandler() {
        if (this.fallbackCheckTimer) {
            window.clearInterval(this.fallbackCheckTimer);
        }

        if (this.fallbackTimout) {
            window.clearTimeout(this.fallbackTimout);
        }

        this.props.setThemeLoaded(this.props.theme, false);
        if (this.props.onLoad) {
            this.props.onLoad(false);
        }
    }

    componentDidMount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.addEventListener('load', this.onLoadHandler);
        element.addEventListener('error', this.onErrorHandler);

        if (this.fallbackCheckTimer) {
            window.clearInterval(this.fallbackCheckTimer);
        }

        if (this.fallbackTimout) {
            window.clearTimeout(this.fallbackTimout);
        }
    }

    componentWillUnmount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.removeEventListener('load', this.onLoadHandler);
        element.removeEventListener('error', this.onErrorHandler);

        if (this.fallbackCheckTimer) {
            window.clearInterval(this.fallbackCheckTimer);
        }

        if (this.fallbackTimout) {
            window.clearTimeout(this.fallbackTimout);
        }
    }

    componentWillUpdate() {
        if (this.fallbackCheckTimer) {
            window.clearInterval(this.fallbackCheckTimer);
        }

        if (this.fallbackTimout) {
            window.clearTimeout(this.fallbackTimout);
        }

        this.fallbackCheckTimer = window.setInterval(() => {
            if (this.isStyleSheetLoaded()) {
                this.onLoadHandler();
            }
        }, 500);

        this.fallbackTimout = window.setTimeout(() => {
            if (this.isStyleSheetLoaded()) {
                this.onLoadHandler();
            } else {
                this.onErrorHandler();
            }
        }, 30000);
    }

    render() {
        const refLink = element => {
            this.element = element;
        };

        return (
            <link rel="stylesheet" href={`themes-${this.props.theme}-bundle.css`} ref={refLink} />
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
            setThemeLoaded: (theme, loaded) => {
                actions.finishThemeLoad(dispatch, theme, loaded);
            }
        };
    }
)(ThemeLink);

export default ThemeLoaderTag;
