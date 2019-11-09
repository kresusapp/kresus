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
    condition: PropTypes.bool.isRequired
};

export default DisplayIf;

export const IfNotMobile = connect(state => {
    return {
        condition: !get.isSmallScreen(state)
    };
})(DisplayIf);

IfNotMobile.displayName = 'IfNotMobile';
