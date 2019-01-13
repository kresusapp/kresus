import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

const ThemesSection = connect(
    state => {
        return {
            themes: get.themes(state),
            currentTheme: get.setting(state, 'theme')
        };
    },
    dispatch => {
        return {
            changeTheme(theme) {
                actions.setTheme(dispatch, theme);
            }
        };
    }
)(props => {
    let handleThemeChange = event => props.changeTheme(event.target.value);

    let maybeWarning = null;
    if (props.themes.length < 2) {
        maybeWarning = <p className="alerts warning">{$t('client.settings.themes.none')}</p>;
    }

    let options = props.themes.map(t => {
        return (
            <option value={t} key={t}>
                {t}
            </option>
        );
    });

    return (
        <form className="settings-form settings-container">
            {maybeWarning}

            <p>
                <label>{$t('client.settings.themes.choose')}</label>

                <select
                    className="form-element-block"
                    defaultValue={props.currentTheme}
                    onChange={handleThemeChange}>
                    {options}
                </select>
            </p>
        </form>
    );
});

export default ThemesSection;
