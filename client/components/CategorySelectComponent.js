import {Actions, store} from '../store';
import {has} from '../helpers';

import SelectableButtonComponent from './SelectableButtonComponent';

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
