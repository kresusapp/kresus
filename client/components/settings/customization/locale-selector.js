import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../../store';
import { LOCALE } from '../../../../shared/settings';

class LocaleSelector extends React.Component {
    handleChange = e => {
        this.props.setLocale(e.target.value);
    };

    render() {
        let className = `locale-selector ${this.props.className || ''}`;
        let id = this.props.id || '';
        return (
            <select
                id={id}
                className={className}
                onChange={this.handleChange}
                defaultValue={this.props.currentLocale}>
                <option value="fr">Français</option>
                <option value="en">English</option>
            </select>
        );
    }
}

export default connect(
    state => {
        return {
            currentLocale: get.setting(state, LOCALE),
        };
    },
    dispatch => {
        return {
            setLocale: locale => actions.setSetting(dispatch, LOCALE, locale),
        };
    }
)(LocaleSelector);
