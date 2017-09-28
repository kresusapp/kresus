import React from 'react';
import { connect } from 'react-redux';

// Global variables
import { actions } from '../../../store';
import { translate as $t } from '../../../helpers';

const ImportModule = props => {
    const handleImport = e => {
        let filename = e.target.value.split('\\').pop();

        if (window.confirm($t('client.settings.confirm_import', { filename }))) {
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

            fileReader.readAsText(e.target.files[0]);
        }

        e.target.value = '';
    };

    return (
        <div>
            <input type="file" className="hidden-file-input" id="import" onChange={handleImport} />
            <label htmlFor="import" className="btn btn-primary">
                {$t('client.settings.go_import_instance')}
            </label>
        </div>
    );
};

const Export = connect(
    () => {
        return {};
    },
    dispatch => {
        return {
            importInstance(content) {
                actions.importInstance(dispatch, content);
            }
        };
    }
)(ImportModule);

export default Export;
