import SelectableButtonComponent from './SelectableButtonComponent';
import {has} from '../Helpers';
//Global variables
import {Actions, store} from '../store';

export default class OperationTypeSelectComponent extends React.Component {

    constructor(props) {
        has(props, 'onSelectId');
        has(props, 'operation');
        super(props);
    }

    render() {
        return <SelectableButtonComponent
            operation={this.props.operation}
            optionsArray={store.getOperationTypes()}
            selectedId={() => this.props.operation.type}
            idToLabel={ (id) => store.operationTypeToLabel(id)}
            onSelectId={this.props.onSelectId.bind(this)} />
    }
}
