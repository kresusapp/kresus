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
                let themeLink = document.getElementById('theme');
                let url = themeLink.getAttribute('href').replace(/themes\/[^/]+\//, `themes/${theme}/`);
                themeLink.setAttribute('href', url);
                actions.setSetting(dispatch, 'theme', theme);
            }
        };
    })(props => {
        let handleThemeChange = event => props.changeTheme(event.target.value);

        let options = props.themes.map(t => {
            return (
                <option
                  value={ t }
                  key={ t }>
                    { t }
                </option>
            );
        });

        return (
            <form className="top-panel">
                <div className="form-group">
                    <div className="row">
                        <label
                          className="col-xs-4 control-label">
                            { $t('client.settings.choose_theme') }
                        </label>
                        <div className="col-xs-8">
                            <select
                              defaultValue={ props.currentTheme }
                              onChange={ handleThemeChange }>
                                { options }
                            </select>
                        </div>
                    </div>
                </div>
            </form>
        );
    }
);

export default ThemesSection;
