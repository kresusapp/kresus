import React from 'react';

// Global variables
import {Actions} from '../store';

import T from './Translated';

export default class ImportModule extends React.Component {

    onImportInstance(e) {

        let $importFile = document.getElementById('importFile');
        if (!$importFile || !$importFile.files || !$importFile.files.length) {
            alert('Need to select a file!');
            e.preventDefault();
            return;
        }

        let fileReader = new FileReader;
        fileReader.onload = (e) => {
            let asText = e.target.result;
            let asJSON;
            try {
                asJSON = JSON.parse(asText);
            } catch(e) {
                alert('JSON file to import isnt valid!');
            }
            Actions.ImportInstance({
                content: asJSON
            });
        }
        fileReader.readAsText($importFile.files[0]);

        $importFile.value = '';

        e.preventDefault();
        return;
    }

    render() {
        return (
            <div className="row">
                <input
                    type="file"
                    name="importFile"
                    id="importFile"
                    className="col-xs-9" />
                <button
                    id="importInstance"
                    className="btn btn-primary col-xs-3"
                    onClick={this.onImportInstance.bind(this)}>
                            <T k='settings.go_import_instance'>Import</T>
                </button>
            </div>
        );
    }
}
