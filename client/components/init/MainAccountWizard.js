import {translate as $t} from '../../helpers';

import NewBankForm from '../shared/NewBankForm';
import ImportModule from '../shared/ImportModule';
import WeboobParameters from '../shared/WeboobParameters';

export default class MainAccountWizard extends React.Component {

    render() {
        return (
            <div className="wizard panel panel-default">
                <div className="panel-heading">
                    <h1 className="panel-title">
                        {$t('client.accountwizard.title')}
                    </h1>
                </div>
                <div className="panel-body">
                    <p>
                        {$t('client.accountwizard.content')}
                    </p>

                    <ul className="nav nav-tabs">
                        <li className="active">
                            <a href="#bank_form" data-toggle="tab">
                                {$t('client.settings.new_bank_form_title')}
                            </a>
                        </li>
                        <li>
                            <a href="#import" data-toggle="tab">
                                {$t('client.accountwizard.import_title')}
                            </a>
                        </li>
                        <li>
                            <a href="#advanced" data-toggle="tab">
                                {$t('client.accountwizard.advanced')}
                            </a>
                        </li>
                    </ul>

                    <div className="tab-content">
                        <div className="tab-pane active" id="bank_form">
                            <NewBankForm expanded={true} />
                        </div>
                        <div className="tab-pane" id="import">
                            <p>
                                {$t('client.accountwizard.import')}
                            </p>
                            <ImportModule/>
                        </div>
                        <div className="tab-pane" id="advanced">
                            <WeboobParameters />
                        </div>
                    </div>
                </div>
            </div>
       );
    }

};
