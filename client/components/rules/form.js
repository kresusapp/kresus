import React from 'react';

import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

const operationProperties = [
    {
        name: 'title',
        tests: [
            '$ct',
            '$nct',
            '$eq',
            '$neq'
        ],
        type: 'text'
    },
    {
        name: 'value',
        tests: [
            '$eq',
            '$neq',
            '$ge',
            '$gt',
            '$le',
            '$lt'
        ]
        
    },
    {
        name: 'type',
        tests: [
            '$eq',
            '$neq'
        ]
    },
    {
        name: 'date',
        tests: [
            '$eq',
            '$neq',
            '$ge',
            '$gt',
            '$le',
            '$lt'
        ]
    }
];


class RulesCreationForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            property: operationProperties[0].name
        }
        this.handleSelectProperty = this.handleSelectProperty.bind(this);
    }

    handleSelectProperty() {
        this.setState({ property: this.refs.properties.value });
    }

    render() {
        console.log(this.state);
        let propertiesOptions = operationProperties.map( prop => {
            console.log(prop);
            return (
                <option key={ `property-${prop.name}` } value={ `${prop.name}` }>
                    { $t(`client.rules.properties.${prop.name}`) }
                </option>
            );
        });
        let property = this.state.property;
        let checkTypeOptions = '';
        if (property) {
            checkTypeOptions = operationProperties.find( prop => prop.name === property).tests.map(test => {
                return (
                    <option key={ `test-${test}` } value={ `${test}` }>
                        { $t(`client.rules.${test}`) }
                    </option>
                );
            })
        }

        console.log(propertiesOptions);
        return (
            <div className="top-panel panel panel-default">
                <div className="panel-heading">
                    <h3 className="title panel-title">
                        { $t('client.rules.new_rule_form_title') }
                    </h3>
                </div>
                <div className="panel-body">
                    <div className="panel panel-body">
                        <div className="form-inline">
                            <div className="form-group">
                                <label htmlFor="properties">
                                    { $t('client.rules.if') }
                                </label>
                                <select id="properties" ref="properties" className="form-control col-md-2"
                                  onChange={ this.handleSelectProperty }
                                  defaultValue={ this.state.property }>
                                    { propertiesOptions }
                                </select>
                            </div>
                            <select id="type-rule" className="form-control col-md-2">
                                { checkTypeOptions }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const Export = connect(state => {
    let categories = get.categories(state);

    return {
        categories
    }
})(RulesCreationForm);

export default Export;
