import React from 'react';
import { connect } from 'react-redux';

import { translate as $t } from '../../../helpers';
import { get, actions } from '../../../store';

import LocaleSelector from './locale-selector';

const CustomizationOptions = connect(
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

    let themes = null;
    if (props.themes.length < 2) {
        themes = <p className="alerts warning">{$t('client.settings.customization.no_themes')}</p>;
    } else {
        let options = props.themes.map(t => {
            return (
                <option value={t} key={t}>
                    {t}
                </option>
            );
        });
        themes = (
            <p>
                <label htmlFor="theme-selector">
                    {$t('client.settings.customization.choose_theme')}
                </label>
                <select
                    id="theme-selector"
                    className="form-element-block"
                    defaultValue={props.currentTheme}
                    onChange={handleThemeChange}>
                    {options}
                </select>
            </p>
        );
    }

    return (
        <form className="settings-form settings-container">
            <p>
                <label htmlFor="locale-selector">
                    {$t('client.settings.customization.locale')}
                </label>
                <LocaleSelector className="form-element-block" id="locale-selector" />
            </p>

            {themes}
        </form>
    );
});

export default CustomizationOptions;
