import { Actions, store } from '../../store';
import { translate as $t, has } from '../../helpers';

export default class Pair extends React.Component {

    constructor(props) {
        has(props, 'formatCurrency');
        super(props);
        this.handleMerge = this.handleMerge.bind(this);
    }

    handleMerge(e) {

        let older, younger;
        if (+this.props.a.dateImport < +this.props.b.dateImport) {
            [older, younger] = [this.props.a, this.props.b];
        } else {
            [older, younger] = [this.props.b, this.props.a];
        }

        Actions.mergeOperations(younger, older);
        e.preventDefault();
    }

    render() {

        return (
            <table className="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th className="col-xs-2">{ $t('client.similarity.date') }</th>
                        <th className="col-xs-3">{ $t('client.similarity.label') }</th>
                        <th className="col-xs-1">{ $t('client.similarity.amount') }</th>
                        <th className="col-xs-2">{ $t('client.similarity.category') }</th>
                        <th className="col-xs-1">{ $t('client.similarity.type') }</th>
                        <th className="col-xs-2">{ $t('client.similarity.imported_on') }</th>
                        <th className="col-xs-1">{ $t('client.similarity.merge') }</th>
                    </tr>
                </thead>
                <tbody>

                    <tr>
                        <td>{ this.props.a.date.toLocaleDateString() }</td>
                        <td>{ this.props.a.title }</td>
                        <td>{ this.props.formatCurrency(this.props.a.amount) }</td>
                        <td>{ store.getCategoryFromId(this.props.a.categoryId).title }</td>
                        <td>{ store.operationTypeToLabel(this.props.a.operationTypeID) }</td>
                        <td>{ new Date(this.props.a.dateImport).toLocaleString() }</td>
                        <td rowSpan={ 2 }>
                            <button className="btn btn-primary" onClick={ this.handleMerge }>
                                <span className="glyphicon glyphicon-resize-small"
                                  aria-hidden="true"
                                />
                            </button>
                        </td>
                    </tr>

                    <tr>
                        <td>{ this.props.b.date.toLocaleDateString() }</td>
                        <td>{ this.props.b.title }</td>
                        <td>{ this.props.formatCurrency(this.props.b.amount) }</td>
                        <td>{ store.getCategoryFromId(this.props.b.categoryId).title }</td>
                        <td>{ store.operationTypeToLabel(this.props.b.operationTypeID) }</td>
                        <td>{ new Date(this.props.b.dateImport).toLocaleString() }</td>
                    </tr>

                </tbody>
            </table>
        );
    }
}
