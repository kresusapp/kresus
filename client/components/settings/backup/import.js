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
    }

    handleImport(e) {

        let $importFile = document.getElementById('importFile');
        if (!$importFile || !$importFile.files || !$importFile.files.length) {
            alert($t('client.settings.no_file_selected'));
            e.preventDefault();
            return;
        }

        let fileReader = new FileReader;
        fileReader.onload = e => {
            let asText = e.target.result;
            let asJSON;
            try {
                asJSON = JSON.parse(asText);
                this.props.importInstance(asJSON);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    alert('JSON file to import isnt valid!');
                } else {
                    alert(`Unexpected error: ${err.message}`);
                }
            }
        };
        fileReader.readAsText($importFile.files[0]);

        $importFile.value = '';
        this.refs.fileName.value = '';
        e.preventDefault();
        return;
    }

    handleChange(e) {
        this.refs.fileName.value = e.target.value;
    }

    render() {
        return (
            <div className="input-group import-file">
                <input
                  type="text"
                  className="form-control"
                  readOnly={ true }
                  ref="fileName"
                />

                <span className="input-group-btn">
                    <div className="btn btn-primary btn-file">
                        { $t('client.settings.browse') }
                        <input type="file" name="importFile" id="importFile"
                          onChange={ this.handleChange }
                        />
                    </div>
                </span>

                <span className="input-group-btn">
                    <button
                      id="importInstance"
                      className="btn btn-primary"
                      onClick={ this.handleImport }>
                        { $t('client.settings.go_import_instance') }
                    </button>
                </span>
            </div>
        );
    }
}

let Export = connect(state => {
    return {};
}, dispatch => {
    return {
        importInstance(content) { actions.importInstance(dispatch, content); }
    };
})(ImportModule);

export default Export;
