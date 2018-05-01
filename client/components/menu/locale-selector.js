import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

const LocaleSelector = props => {
    let handleChange = e => {
        props.setLocale(e.target.value);
    };

    return (
        <select
            className="locale-selector"
            onChange={handleChange}
            defaultValue={props.currentLocale}>
            <option value="fr">FR</option>
            <option value="en">EN</option>
        </select>
    );
};

export default connect(
    state => {
        return {
            currentLocale: get.setting(state, 'locale')
        };
    },
    dispatch => {
        return {
            setLocale: locale => actions.setSetting(dispatch, 'locale', locale)
        };
    }
)(LocaleSelector);
