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
        this.fallbackTimer = null;
    }

    onLoadHandler() {
        if (this.fallbackTimer) {
            window.clearTimeout(this.fallbackTimer);
        }

        this.props.setThemeLoaded(true, this.props.theme);
        if (this.props.onLoad) {
            this.props.onLoad(true);
        }
    }

    onErrorHandler() {
        if (this.fallbackTimer) {
            window.clearTimeout(this.fallbackTimer);
        }

        this.props.setThemeLoaded(false, this.props.theme);
        if (this.props.onLoad) {
            this.props.onLoad(false);
        }
    }

    componentDidMount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.addEventListener('load', this.onLoadHandler);
        element.addEventListener('error', this.onErrorHandler);

        if (this.fallbackTimer) {
            window.clearTimeout(this.fallbackTimer);
        }
    }

    componentWillUnmount() {
        const element = ReactDOM.findDOMNode(this.element);
        element.removeEventListener('load', this.onLoadHandler);
        element.removeEventListener('error', this.onErrorHandler);

        if (this.fallbackTimer) {
            window.clearTimeout(this.fallbackTimer);
        }
    }

    componentWillUpdate() {
        if (this.fallbackTimer) {
            window.clearTimeout(this.fallbackTimer);
        }

        this.fallbackTimer = window.setTimeout(() => {
            const isStyleSheetLoaded = Array.from(document.styleSheets).some(sheet => {
                return sheet.href.endsWith(`themes/${this.props.theme}/bundle.css`);
            });

            if (isStyleSheetLoaded) {
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
            setThemeLoaded: (loaded, theme) => {
                actions.finishThemeLoad(dispatch, loaded, theme);
            }
        };
    }
)(ThemeLink);

export default ThemeLoaderTag;
