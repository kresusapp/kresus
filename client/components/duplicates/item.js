import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../store';
import { translate as $t, formatDate } from '../../helpers';

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
        let firstItem = this.props.a;
        let secondItem = this.props.b;

        if (+secondItem.dateImport > +firstItem.dateImport) {
            [firstItem, secondItem] = [secondItem, firstItem];
        }

        if (this.state.switchOps) {
            [firstItem, secondItem] = [secondItem, firstItem];
        }

        this.props.merge(firstItem, secondItem);
    };

    render() {
        let firstItem = this.props.a;
        let secondItem = this.props.b;
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

        let firstItemCustomLabel = null;
        if (firstItem.customLabel) {
            firstItemCustomLabel = <span>({firstItem.customLabel})</span>;
        }
        let secondItemCustomLabel = null;
        if (secondItem.customLabel) {
            secondItemCustomLabel = <span>({secondItem.customLabel})</span>;
        }

        return (
            <div key={`dpair-${firstItem.id}-${secondItem.id}`} className="duplicate">
                <div>
                    <div>
                        <h3>
                            {firstItem.title}&nbsp;{firstItemCustomLabel}
                        </h3>
                        <p>
                            {formatDate.toShortString(firstItem.date)}
                            &nbsp; ({$t('client.similarity.imported_on')}{' '}
                            {formatDate.toLongString(firstItem.dateImport)})
                        </p>
                    </div>
                    <div className="details">
                        <p>
                            <span className="label">{$t('client.similarity.category')}:</span>
                            {firstItemCat.title}
                        </p>
                        <p>
                            <span className="label">{$t('client.similarity.type')}:</span>
                            {$t(`client.${firstItem.type}`)}
                        </p>
                    </div>
                </div>
                <button className="btn btn-default switch" onClick={this.handleSwitch}>
                    <span className="fa fa-retweet" />
                </button>
                <div>
                    <div>
                        <h3>
                            {secondItem.title}&nbsp;{secondItemCustomLabel}
                        </h3>
                        <p>
                            {formatDate.toShortString(secondItem.date)}
                            &nbsp; ({$t('client.similarity.imported_on')}{' '}
                            {formatDate.toLongString(secondItem.dateImport)})
                        </p>
                    </div>
                    <div className="details">
                        <p>
                            <span className="label">{$t('client.similarity.category')}:</span>
                            {secondItemCat.title}
                        </p>
                        <p>
                            <span className="label">{$t('client.similarity.type')}:</span>
                            {$t(`client.${secondItem.type}`)}
                        </p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={this.handleMerge}>
                    <span className="fa fa-compress" aria-hidden="true" />
                    <span>
                        {$t('client.similarity.amount')}: &nbsp;
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
        let categoryA = get.categoryById(state, ownProps.a.categoryId);
        let categoryB = get.categoryById(state, ownProps.b.categoryId);

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
