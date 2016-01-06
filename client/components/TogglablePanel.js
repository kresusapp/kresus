import { has } from '../helpers';

export default class TogglablePanel extends React.Component {
    constructor(props) {
        has(props, 'title');
        has(props, 'body');
        super(props);
        this.state = { showDetails: false };
        this.handleOnclick = this.handleOnclick.bind(this);
    }

    handleOnclick() {
        this.setState({
            showDetails: !this.state.showDetails
        });
    }

    render() {
        let body;
        if (!this.state.showDetails) {
            body = <div className="transition-expand"/>;
        } else {
            body = (
                <div className="panel-body transition-expand" >
                    { this.props.body }
                </div>
            );
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading clickable" onClick={ this.handleOnclick }>
                    <h5 className="panel-title">
                        { this.props.title }
                        <span className={ `pull-right fa fa-${this.state.showDetails ?
                          'minus' : 'plus'}-square` } aria-hidden="true"></span>
                    </h5>
                </div>
                { body }
            </div>
        );
    }
}
