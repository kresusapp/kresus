import { connect } from 'react-redux';
import { get } from '../../store';
import PropTypes from 'prop-types';

const DisplayIf = props => {
    if (props.condition) {
        return props.children;
    }
    return null;
};

DisplayIf.propTypes = {
    // The condition to render the node.
    condition: PropTypes.bool.isRequired,

    // The node to be rendered when condition is true.
    children: PropTypes.node.isRequired,
};

export default DisplayIf;

export const IfNotMobile = connect(state => {
    return {
        condition: !get.isSmallScreen(state),
    };
})(DisplayIf);

IfNotMobile.displayName = 'IfNotMobile';
