import { has, translate as $t } from '../../helpers';

import ColorPicker from '../ui/color-picker';

export default class CreateForm extends React.Component {
    constructor(props) {
        has(props, 'onSave');
        has(props, 'onCancel');
        // Facultative: previousValue, previousColor
        super(props);
        this.handleSave = this.handleSave.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    selectLabel() {
        this.refs.label.getDOMNode().select();
    }

    clearLabel() {
        this.refs.label.getDOMNode().value = '';
    }

    handleSave(e) {
        let label = this.refs.label.getDOMNode().value.trim();
        let color = this.refs.color.getValue();
        if (!label || !color)
            return false;
        return this.props.onSave(e, label, color);
    }

    handleKeyUp(e) {
        if (e.key === 'Enter') {
            return this.handleSave(e);
        }
        return true;
    }

    render() {
        let previousColor = this.props.previousColor;
        let previousValue = this.props.previousValue || '';
        return (
            <tr>
                <td>
                    <ColorPicker defaultValue={ previousColor } ref="color" />
                </td>
                <td>
                    <input type="text" className="form-control"
                      placeholder={ $t('client.category.label') }
                      defaultValue={ previousValue } onKeyUp={ this.handleKeyUp }
                      ref="label"
                    />
                </td>
                <td>
                    <div className="btn-group btn-group-justified" role="group">
                        <a
                          className="btn btn-success"
                          role="button"
                          onClick={ this.handleSave }>
                            { $t('client.general.save') }
                        </a>
                        <a
                          className="btn btn-danger"
                          role="button"
                          onClick={ this.props.onCancel }>
                            { $t('client.general.cancel') }
                        </a>
                    </div>
                </td>
            </tr>
        );
    }
}
