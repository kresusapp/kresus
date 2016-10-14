import React from 'react';

import { connect } from 'react-redux';

import { translate as $t } from '../../helpers';
import { get } from '../../store';

import TypesSelect from './types-select';
import DatePicker from '../ui/date-picker';


const operationProperties = [
    {
        name: 'title',
        tests: [
            '$ct',
            '$nct',
            '$eq',
            '$neq'
        ]
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
        this.state = this.initialState();
        this.handleSelectProperty = this.handleSelectProperty.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectType = this.handleSelectType.bind(this);
        this.handleSelectTestPredicate = this.handleSelectTestPredicate.bind(this);
        this.handleSelectDate = this.handleSelectDate.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        // Reference callbacks
        this.refSelectProperty = this.refSelectProperty.bind(this);
        this.refSelectType = this.refSelectType.bind(this);
        this.handleSelectTestPredicate = this.handleSelectTestPredicate.bind(this);
        this.refInput = this.refInput.bind(this);
    }

    initialState() {
        return {
            property: operationProperties[0].name,
            testPredicate: operationProperties[0].tests[0]
        };
    }

    handleSelectProperty() {
        this.setState({ property: this.propertySelect.value });
    }

    handleSelectTestPredicate() {
        this.setState({ predicate: this.refSelectTestPredicate.value });
    }

    handleSelectDate(value) {
        this.setState({ value });
    }

    handleInputChange() {
        this.setState({ value: this.input.value });
    }

    refSelectType(node) {
        this.typeSelect = node;
    }

    refSelectTestPredicate(node) {
        this.testPredicateSelect = node;
    }

    refSelectProperty(node) {
        this.propertySelect = node;
    }

    refInput(node) {
        this.input = node;
    }

    handleSelectType() {
        this.setState({ value: this.typeSelect.getValue() });
    }

    handleSubmit() {
        let rule = {
            property: this.state.property,
            testPredicate: this.testPredicateSelect.value,
            value: this.input.value
        }
        console.log(rule)
    }

    render() {
        let propertiesOptions = operationProperties.map( prop => {
            return (
                <option key={ `property-${prop.name}` } value={ `${prop.name}` }>
                    { $t(`client.rules.properties.${prop.name}`) }
                </option>
            );
        });
        let property = this.state.property;
        let testOptions = '';
        if (property) {
            testOptions = operationProperties.find( prop => prop.name === property).tests.map(test => {
                return (
                    <option key={ `test-${test}` } value={ `${test}` }>
                        { $t(`client.rules.tests.${test}`) }
                    </option>
                );
            })
        }
        let input;
        switch (property) {
            case 'type':
                input = (
                    <TypesSelect
                      defaultValue=''
                      onChange={ this.handleSelectType }
                      htmlId="type-select"
                      ref={ this.typeSelect }
                    />
                );
                break;
            case 'date':
                input = (
                    <DatePicker
                        
                      onSelect={ this.handleSelectDate }
                    />
                );
                break;
            case 'value':
                input = (
                    <input className="form-control" type="number"
                      onChange={ this.handleInputChange } ref={ this.refInput }
                      defaultValue={ 0 }
                    />
                );
                break;
            case 'title':
                input = (
                    <input className="form-control" type="text"
                      onChange={ this.handleInputChange } ref={ this.refInput }
                      defaultValue=""
                    />
                );
                break;
            default:
                input = '';
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
                                <select id="properties" ref={ this.refSelectProperty } className="form-control"
                                  onChange={ this.handleSelectProperty }
                                  defaultValue={ this.state.property }>
                                    { propertiesOptions }
                                </select>
                                <select id="type-rule" className="form-control"
                                    ref={ this.refSelectTestPredicate }
                                    onChange={ this.handleSelectTestPredicate }>
                                    { testOptions }
                                </select>
                                { input }
                            </div>
                        </div>
                    </div>
                    <div className="form-group pull-right">
                        <button className="btn btn-submit" onClick={ this.handleSubmit }>
                            <i className="fa fa-plus"/>
                        </button>
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
