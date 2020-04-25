import React from 'react';
import moment from 'moment';

import { capitalize } from '../../helpers';

const MonthYearSeparator = props => {
    return (
        <tr className="month-year-separator">
            <td colSpan={props.colspan}>
                {capitalize(moment(new Date(props.year, props.month, 1)).format('MMMM YYYY'))}
            </td>
        </tr>
    );
};

export default MonthYearSeparator;
