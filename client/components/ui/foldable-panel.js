import React from 'react';
import PropTypes from 'prop-types';

class FoldablePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: props.initiallyExpanded
        };

        this.handleToggleExpand = this.handleToggleExpand.bind(this);
    }

    handleToggleExpand() {
        this.setState({ expanded: !this.state.expanded });
    }

    render() {
        let { expanded } = this.state;
        let { top, iconTitle, children, title } = this.props;

        return (
            <div className={ `${top ? 'top-panel' : ''} panel panel-default` }>
                <div
                  className="panel-heading clickable"
                  onClick={ this.handleToggleExpand }>
                    <h3 className="title panel-title">
                        { title }
                    </h3>

                    <div className="panel-options">
                        <span
                          className={ `option-legend fa fa-${expanded ?
                          'minus' : 'plus'}-square` }
                          aria-label="add"
                          title={ iconTitle }
                        />
                    </div>
                </div>
                <div
                  className="panel-body"
                  hidden={ !expanded }>
                    { children }
                </div>
            </div>
        );
    }
}

FoldablePanel.propTypes = {
    // A boolean saying if the panel should or not be expanded at first render
    initiallyExpanded: PropTypes.bool,

    // The title of the panel
    title: PropTypes.string.isRequired,

    // The title to be displayed on hover the +/- icon
    iconTitle: PropTypes.string,

    // Tells wether the panel is the top element of the containing div.
    top: PropTypes.bool
};

FoldablePanel.defaultProps = {
    initiallyExpanded: false,
    top: true
};

export default FoldablePanel;
