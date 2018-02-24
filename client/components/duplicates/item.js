import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t } from '../../helpers';

import OperationLine from './operation-line.js';

class DuplicateItem extends React.Component {
    state = {
        switchOps: false
    };

    handleSwitch = () => {
        this.setState({
            switchOps: !this.state.switchOps
        });
    };

    handleMerge = () => {
        let firstItem = this.props.operationA;
        let secondItem = this.props.operationB;

        if (+secondItem.dateImport > +firstItem.dateImport) {
            [firstItem, secondItem] = [secondItem, firstItem];
        }

        if (this.state.switchOps) {
            [firstItem, secondItem] = [secondItem, firstItem];
        }

        this.props.merge(firstItem, secondItem);
    };

    render() {
        let firstItem = this.props.operationA;
        let secondItem = this.props.operationB;
        let firstItemCat = this.props.categoryA;
        let secondItemCat = this.props.categoryB;

        if (+secondItem.dateImport > +firstItem.dateImport) {
            [firstItem, secondItem] = [secondItem, firstItem];
            [firstItemCat, secondItemCat] = [secondItemCat, firstItemCat];
        }

        if (this.state.switchOps) {
            [firstItem, secondItem] = [secondItem, firstItem];
            [firstItemCat, secondItemCat] = [secondItemCat, firstItemCat];
        }

        return (
            <div key={`dpair-${firstItem.id}-${secondItem.id}`} className="duplicate">
                <OperationLine
                    title={firstItem.title}
                    customLabel={firstItem.customLabel}
                    date={firstItem.date}
                    dateImport={firstItem.dateImport}
                    categoryTitle={firstItemCat.title}
                    type={firstItem.type}
                />
                <button
                    className="btn btn-default switch"
                    onClick={this.handleSwitch}
                    title={$t('client.similarity.switch')}>
                    <span className="fa fa-retweet" />
                </button>
                <OperationLine
                    title={secondItem.title}
                    customLabel={secondItem.customLabel}
                    date={secondItem.date}
                    dateImport={secondItem.dateImport}
                    categoryTitle={secondItemCat.title}
                    type={secondItem.type}
                />
                <button className="btn btn-primary" onClick={this.handleMerge}>
                    <span className="fa fa-compress" aria-hidden="true" />
                    <span>
                        {$t('client.similarity.amount')}&nbsp;
                        {this.props.formatCurrency(firstItem.amount)}
                    </span>
                    <span className="merge-title">
                        &nbsp;/&nbsp;
                        {$t('client.similarity.merge')}
                    </span>
                </button>
            </div>
        );
    }
}

const Export = connect(
    (state, ownProps) => {
        let categoryA = get.categoryById(state, ownProps.operationA.categoryId);
        let categoryB = get.categoryById(state, ownProps.operationB.categoryId);

        return {
            categoryA,
            categoryB
        };
    },
    dispatch => {
        return {
            merge: (toKeep, toRemove) => {
                actions.mergeOperations(dispatch, toKeep, toRemove);
            }
        };
    }
)(DuplicateItem);

export default Export;
