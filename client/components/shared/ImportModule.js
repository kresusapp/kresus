// Global variables
import { Actions } from '../../store';
import { translate as $t } from '../../helpers';

export default class ImportModule extends React.Component {

    onImportInstance(e) {

        let $importFile = document.getElementById('importFile');
        if (!$importFile || !$importFile.files || !$importFile.files.length) {
            alert('No file selected');
            e.preventDefault();
            return;
        }

        let fileReader = new FileReader;
        fileReader.onload = err => {
            let asText = err.target.result;
            let asJSON;
            try {
                asJSON = JSON.parse(asText);
                Actions.importInstance({
                    content: asJSON
                });
            } catch (jsonParseError) {
                if (jsonParseError instanceof SyntaxError) {
                    alert('JSON file to import isnt valid!');
                } else {
                    alert(`Unexpected error: ${jsonParseError.message}`);
                }
            }
        };
        fileReader.readAsText($importFile.files[0]);

        $importFile.value = '';

        e.preventDefault();
        return;
    }

    render() {
        return (
            <div className="input-group import-file">
                <input type="text" className="form-control" readOnly />
                <span className="input-group-btn">
                    <div className="btn btn-primary btn-file">
                        Browse <input type="file" name="importFile" id="importFile" />
                    </div>
                </span>

                <span className="input-group-btn">
                    <button
                      id="importInstance"
                      className="btn btn-primary"
                      onClick={ this.onImportInstance.bind(this) }>
                        { $t('client.settings.go_import_instance') }
                    </button>
                </span>
            </div>
        );
    }
}
