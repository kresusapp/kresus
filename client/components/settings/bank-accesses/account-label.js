import { connect } from 'react-redux';

import { actions } from '../../../store';
import LabelComponent from '../../ui/label';

const formatIBAN = function(iban) {
    return iban.replace(/(.{4})(?!$)/g, '$1\xa0');
};

class AccountLabelComponent extends LabelComponent {}

export default connect(null, (dispatch, props) => {
    return {
        setCustomLabel(label) {
            actions.updateAccount(dispatch, props.item.id, {
                customLabel: label
            });
        },
        getLabel() {
            let a = props.item;
            let label = a.iban ? `${a.title} (IBAN\xa0:\xa0${formatIBAN(a.iban)})` : a.title;

            return label.trim();
        }
    };
})(AccountLabelComponent);
