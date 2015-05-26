import React from 'react';

import NewBankForm from './NewBankForm';
import T from './Translated';

export default class MainAccountWizard extends React.Component {

    render() {
        return (
            <div>
                <h1>
                    <T k='accountwizard.title'>Welcome!</T>
                </h1>

                <p><T k='accountwizard.content'>
                Kresus is a personal finance manager to allows you to have a
                better understanding of what your main expenses are, by
                computing useful statistics about your bank transactions. To
                start, please set up a bank account below:
                </T></p>

                <NewBankForm expanded={true} />
            </div>
       );
    }

};
