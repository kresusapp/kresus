import SelectableButtonComponent from './SelectableButtonComponent';
import {has} from '../Helpers';
//Global variables
import {Actions, store} from '../store';

export default class CategorySelectComponent extends React.Component {

    constructor(props) {
        has(props, 'operation');
        has(props, 'onSelectId');
        super(props);
    }

    render() {
        return <SelectableButtonComponent
            operation={this.props.operation}
            optionsArray={store.getCategories()}
            selectedId={() => this.props.operation.categoryId}
            idToLabel={(id) => store.categoryToLabel(id)}
            onSelectId={this.props.onSelectId.bind(this)} />
    }
}
