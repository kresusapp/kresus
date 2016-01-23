import {Actions, store} from '../../store';
import {has} from '../../helpers';

import SelectableButtonComponent from './SelectableButtonComponent';

export default class OperationTypeSelectComponent extends React.Component {

    constructor(props) {
        has(props, 'onSelectId');
        has(props, 'operation');
        super(props);
    }

    render() {
        return (
            <SelectableButtonComponent
                operation={ this.props.operation }
                optionsArray={ store.getOperationTypes() }
                selectedId={ () => this.props.operation.operationTypeID }
                idToLabel={ id => store.operationTypeToLabel(id) }
                onSelectId={ this.props.onSelectId.bind(this) }
            />
        );
    }
}
