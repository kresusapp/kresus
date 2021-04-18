import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { get, actions } from '../../../store';
import { LOCALE } from '../../../../shared/settings';
import { useKresusState } from '../../../helpers';

const LocaleSelector = (props: { id?: string; className?: string }) => {
    const currentLocale = useKresusState(state => get.setting(state, LOCALE));

    const dispatch = useDispatch();
    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            return actions.setSetting(dispatch, LOCALE, e.target.value);
        },
        [dispatch]
    );

    const className = `locale-selector ${props.className || ''}`;
    return (
        <select
            id={props.id}
            className={className}
            onChange={onChange}
            defaultValue={currentLocale}>
            <option value="fr">Français</option>
            <option value="en">English</option>
        </select>
    );
};

LocaleSelector.displayName = 'LocaleSelector';

export default LocaleSelector;
