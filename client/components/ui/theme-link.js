import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

class ThemeLink extends React.Component {
    element = null;
    fallbackInterval = null;
    fallbackTimeout = null;

    refLink = element => {
        this.element = element;
    };

    isStyleSheetLoaded() {
        return Array.from(document.styleSheets).some(sheet => {
            return sheet.href && sheet.href.endsWith(`themes-${this.props.theme}-bundle.css`);
        });
    }

    clearTimers() {
        if (this.fallbackInterval) {
            window.clearInterval(this.fallbackInterval);
        }
        if (this.fallbackTimeout) {
            window.clearTimeout(this.fallbackTimeout);
        }
        this.fallbackInterval = null;
        this.fallbackTimeout = null;
    }

    onLoadHandler = () => {
        this.clearTimers();

        this.props.setThemeLoaded(this.props.theme, true);
        if (this.props.onLoad) {
            this.props.onLoad(true);
        }
    };

    onErrorHandler = () => {
        this.clearTimers();

        this.props.setThemeLoaded(this.props.theme, false);
        if (this.props.onLoad) {
            this.props.onLoad(false);
        }
    };

    componentDidMount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.addEventListener('load', this.onLoadHandler);
        element.addEventListener('error', this.onErrorHandler);
        this.clearTimers();
    }

    componentWillUnmount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.removeEventListener('load', this.onLoadHandler);
        element.removeEventListener('error', this.onErrorHandler);
        this.clearTimers();
    }

    componentDidUpdate() {
        this.clearTimers();

        this.fallbackInterval = window.setInterval(() => {
            if (this.isStyleSheetLoaded()) {
                this.onLoadHandler();
            }
        }, 500);

        this.fallbackTimeout = window.setTimeout(() => {
            if (this.isStyleSheetLoaded()) {
                this.onLoadHandler();
            } else {
                this.onErrorHandler();
            }
        }, 30000);
    }

    render() {
        return (
            <link
                rel="stylesheet"
                href={`themes-${this.props.theme}-bundle.css`}
                ref={this.refLink}
            />
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
