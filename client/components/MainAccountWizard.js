import {translate as $t} from '../helpers';

import NewBankForm from './NewBankForm';
import ImportModule from './ImportModule';

export default class MainAccountWizard extends React.Component {

    render() {
        return (
            <div>
                <h1>
                    {$t('client.accountwizard.title')}
                </h1>

                <p>
                    {$t('client.accountwizard.content')}
                </p>

                <NewBankForm expanded={true} />

                <p>
                    {$t('client.accountwizard.import')}
                    <ImportModule/>
                </p>
            </div>
       );
    }

};
