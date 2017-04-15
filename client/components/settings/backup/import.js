import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { actions } from '../../../store';
import { translate as $t } from '../../../helpers';

class ImportModule extends React.Component {

    constructor(props) {
        super(props);
        this.handleImport = this.handleImport.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.fileNameInput = null;
        this.fileInput = null;
    }

    handleImport(e) {
        if (!this.fileInput.files || !this.fileInput.files.length) {
            alert($t('client.settings.no_file_selected'));
            e.preventDefault();
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = fileEvent => {
            try {
                this.props.importInstance(JSON.parse(fileEvent.target.result));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    alert($t('client.settings.import_invalid_json'));
                } else {
                    alert(`Unexpected error: ${err.message}`);
                }
            }
        };
        fileReader.readAsText(this.fileInput.files[0]);

        this.fileInput.value = '';
        this.fileNameInput.value = '';
        e.preventDefault();
    }

    handleChange(e) {
        this.fileNameInput.value = e.target.value;
    }

    render() {
        let fileNameInputCb = input => {
            this.fileNameInput = input;
        };
        let fileInputCb = input => {
            this.fileInput = input;
        };

        return (
            <div className="input-group import-file">
                <input
                  type="text"
                  className="form-control"
                  readOnly={ true }
                  ref={ fileNameInputCb }
                />

                <span className="input-group-btn">
                    <div className="btn btn-primary btn-file">
                        { $t('client.settings.browse') }
                        <input
                          type="file"
                          name="importFile"
                          ref={ fileInputCb }
                          onChange={ this.handleChange }
                        />
                    </div>
                </span>

                <span className="input-group-btn">
                    <button
                      className="btn btn-primary"
                      onClick={ this.handleImport }>
                        { $t('client.settings.go_import_instance') }
                    </button>
                </span>
            </div>
        );
    }
}

const Export = connect(() => {
    return {};
}, dispatch => {
    return {
        importInstance(content) {
            actions.importInstance(dispatch, content);
        }
    };
})(ImportModule);

export default Export;
