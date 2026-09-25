import { translate as $t } from '../../../helpers';
import ExportModule from './export';
import ImportModule from './import';

const BackupSection = () => {
    return (
        <>
            <h3>{$t('client.settings.export_instance')}</h3>
            <p>{$t('client.settings.export_instance_help')}</p>
            <ExportModule />

            <hr />

            <ImportModule />
        </>
    );
};

BackupSection.displayName = 'BackupSection';

export default BackupSection;
