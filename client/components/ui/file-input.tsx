import React, {
    forwardRef,
    useCallback,
    useRef,
    useState,
    useImperativeHandle,
    ChangeEvent,
} from 'react';

import { translate as $t } from '../../helpers';

interface FileInputProps {
    // Callback receiving file input.
    onChange: (result: string | null) => void;
}

export interface FileInputRef {
    clear: () => void;
}

const FileInput = forwardRef<FileInputRef, FileInputProps>((props, ref) => {
    const [fileLabel, setFileLabel] = useState($t('client.general.no_file_selected'));

    const internalRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        clear() {
            if (internalRef.current) {
                internalRef.current.value = '';
            }

            setFileLabel($t('client.general.no_file_selected'));
        },
    }));

    const { onChange: onChangeProps } = props;

    const onChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = (event.currentTarget.files as FileList)[0];
            const fileReader = new FileReader();
            fileReader.onload = () => {
                onChangeProps(fileReader.result as string);
            };
            fileReader.readAsText(selectedFile);
            setFileLabel(selectedFile.name);
        },
        [onChangeProps]
    );

    return (
        <span className="file-input">
            <label className="btn">
                {$t('client.general.browse')}
                <input ref={internalRef} type="file" onChange={onChange} />
            </label>
            <output>{fileLabel}</output>
        </span>
    );
});

export default FileInput;
