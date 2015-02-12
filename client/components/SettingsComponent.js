/** @jsx React.DOM */

// Constants
var Events = require('../Events');
var debug = require('../Helpers').debug;

// Global variables
var store = require('../store');
var flux = require('../flux/dispatcher');

var SettingsComponent = module.exports = React.createClass({

    getInitialState: function() {
        return {
            showing: 'preferences',
            // settings
            duplicateThreshold: store.getSetting('duplicateThreshold')
        }
    },

    componentDidMount: function() {
    },

    componentWillUnmount: function() {
    },

    _show: function(which) {
        return function() {
            this.setState({
                showing: which
            });
        }.bind(this);
    },

    _onChange: function(e) {
        var val = this.refs.duplicateThreshold.getDOMNode().value;
        flux.dispatch({
            type: Events.user.changed_setting,
            key: 'duplicateThreshold',
            value: val
        });
        this.setState({
            duplicateThreshold: val
        });
        return true;
    },

    render: function() {

        var self = this;
        function MaybeActive(name) {
            return self.state.showing === name ? 'active' : '';
        }

        var Tab = <form className="form-horizontal">
                    <div className="form-group">
                        <label htmlFor="duplicateThreshold" className="col-xs-4 control-label">Duplicate threshold</label>
                        <div className="col-xs-8">
                            <input id="duplicateThreshold" ref="duplicateThreshold" type="number" className="form-control"
                                min="0" step="1"
                                value={this.state.duplicateThreshold} onChange={this._onChange} />
                        </div>
                    </div>
                  </form>;

        return (
            <div>
                <div className="top-panel panel panel-default">
                    <div className="panel-heading">
                        <h3 className="title panel-title">Settings</h3>
                    </div>

                    <div className="panel-body">
                        <ul className="col-xs-3 nav nav-pills nav-stacked pull-left">
                            <li role="presentation" className={MaybeActive('preferences')}><a href="#" onClick={this._show('preferences')}>Preferences</a></li>
                            <li role="presentation" className={MaybeActive('accounts')}><a href="#" onClick={this._show('accounts')}>Bank accounts</a></li>
                            <li role="presentation" className={MaybeActive('reports')}><a href="#" onClick={this._show('reports')}>Email reports</a></li>
                        </ul>

                        <div className="col-xs-9">
                            {Tab}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

