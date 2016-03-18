import React from 'react';

import { store } from '../../store';
import { has } from '../../helpers';

import ButtonSelect from './button-select';

export default class OperationTypeSelectComponent extends React.Component {

    constructor(props) {
        has(props, 'onSelectId');
        has(props, 'operation');
        super(props);
        this.handleSelectId = this.props.onSelectId.bind(this);
    }

    render() {
        let getThisTypeId = () => this.props.operation.operationTypeID;
        let getTypeLabel = id => store.operationTypeToLabel(id);
        return (
            <ButtonSelect
              operation={ this.props.operation }
              optionsArray={ store.getOperationTypes() }
              selectedId={ getThisTypeId }
              idToLabel={ getTypeLabel }
              onSelectId={ this.handleSelectId }
            />
        );
    }
}
