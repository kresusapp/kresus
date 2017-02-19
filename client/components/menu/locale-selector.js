import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';

class LocaleSelector extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.setLocale(e.target.value);
    }

    render() {
        if (!this.props.standalone) {
            return <div />;
        }

        return (
            <div className="pull-right locale-selector">
                <select
                  className="form-control"
                  onChange={ this.handleChange }
                  defaultValue={ this.props.currentLocale } >
                    <option value="fr">FR</option>
                    <option value="en">EN</option>
                </select>
            </div>
        );
    }
}

export default connect(state => {
    return {
        standalone: get.boolSetting(state, 'standalone-mode'),
        currentLocale: get.setting(state, 'locale')
    };
}, dispatch => {
    return {
        setLocale: locale => actions.setSetting(dispatch, 'locale', locale)
    };
})(LocaleSelector);
