import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { actions } from '../../../store';
import { translate as $t } from '../../../helpers';

const ImportModule = props => {

    let fileNameInput = null;
    let fileInput = null;

    const handleImport = e => {
        if (!fileInput.files || !fileInput.files.length) {
            alert($t('client.settings.no_file_selected'));
            e.preventDefault();
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = fileEvent => {
            try {
                props.importInstance(JSON.parse(fileEvent.target.result));
            } catch (err) {
                if (err instanceof SyntaxError) {
                    alert($t('client.settings.import_invalid_json'));
                } else {
                    alert(`Unexpected error: ${err.message}`);
                }
            }
        };
        fileReader.readAsText(fileInput.files[0]);

        fileInput.value = '';
        fileNameInput.value = '';
        e.preventDefault();
    };

    const handleChange = e => {
        fileNameInput.value = e.target.value;
    };

    let refFileNameInput = input => {
        fileNameInput = input;
    };
    let refFileInput = input => {
        fileInput = input;
    };

    return (
        <div className="input-group import-file">
            <input
              type="text"
              className="form-control"
              readOnly={ true }
              ref={ refFileNameInput }
            />

            <span className="input-group-btn">
                <div className="btn btn-primary btn-file">
                    { $t('client.settings.browse') }
                    <input
                      type="file"
                      name="importFile"
                      ref={ refFileInput }
                      onChange={ handleChange }
                    />
                </div>
            </span>

            <span className="input-group-btn">
                <button
                  className="btn btn-primary"
                  onClick={ handleImport }>
                    { $t('client.settings.go_import_instance') }
                </button>
            </span>
        </div>
    );
};

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
