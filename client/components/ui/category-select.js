import React from 'react';

import { store } from '../../store';
import { has } from '../../helpers';

import ButtonSelect from './button-select';

export default class CategorySelect extends React.Component {

    constructor(props) {
        has(props, 'operation');
        has(props, 'onSelectId');
        super(props);
        this.handleSelectId = this.props.onSelectId.bind(this);
    }

    render() {
        let getThisCategoryId = () => this.props.operation.categoryId;
        let getCategoryTitle = id => store.getCategoryFromId(id).title;
        return (
            <ButtonSelect
              operation={ this.props.operation }
              optionsArray={ store.getCategories() }
              selectedId={ getThisCategoryId }
              idToLabel={ getCategoryTitle }
              onSelectId={ this.handleSelectId }
            />
        );
    }
}
