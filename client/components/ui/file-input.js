import React from 'react';
import PropTypes from 'prop-types';

import { translate as $t } from '../../helpers';

class FileInput extends React.Component {
    state = {
        fileLabel: $t('client.general.no_file_selected'),
    };

    refInput = React.createRef();

    handleChange = event => {
        const selectedFile = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.onload = () => {
            this.props.onChange(fileReader.result);
        };
        fileReader.readAsText(selectedFile);
        this.setState({ fileLabel: selectedFile.name });
    };

    clear() {
        this.refInput.current.value = null;
        this.setState({ fileLabel: $t('client.general.no_file_selected') });
    }

    render() {
        return (
            <span className="file-input">
                <label className="btn">
                    {$t('client.general.browse')}
                    <input ref={this.refInput} type="file" onChange={this.handleChange} />
                </label>
                <output>{this.state.fileLabel}</output>
            </span>
        );
    }
}

FileInput.propTypes = {
    // Callback receiving the validated text input.
    onChange: PropTypes.func.isRequired,
};

export default FileInput;
