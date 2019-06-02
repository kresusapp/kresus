import { connect } from 'react-redux';

import { actions } from '../../store';
import LabelComponent from '../ui/label';

// If the length of the short label (of an operation) is smaller than this
// threshold, the raw label of the operation will be displayed in lieu of the
// short label, in the operations list.
// TODO make this a parameter in settings
const SMALL_LABEL_THRESHOLD = 4;

export default connect(
    null,
    (dispatch, props) => {
        return {
            setCustomLabel(label) {
                actions.setOperationCustomLabel(dispatch, props.item, label);
            },

            getLabel() {
                let op = props.item;
                let label;
                if (op.label.length < SMALL_LABEL_THRESHOLD) {
                    label = op.rawLabel;
                    if (op.label.length) {
                        label += ` (${op.label})`;
                    }
                } else {
                    label = op.label;
                }
                return label.trim();
            }
        };
    }
)(LabelComponent);
