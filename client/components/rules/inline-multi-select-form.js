import React from 'react';

import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';


class InlineMultiSelectForm extends React.Component {
}

InlineMultiSelectForm.propTypes = {
    // Content of the first select.
    // [<option>option</option>]
    firstSelect: React.PropTypes.array
}
