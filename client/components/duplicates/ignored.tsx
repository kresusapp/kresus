import { Fragment, useContext } from 'react';

import { translate as $t } from '../../helpers';

import URL from '../../urls';
import { DriverContext } from '../drivers';
import { BackLink } from '../ui';

import PairsList, { usePairsByAccount } from './pairs';

const IgnoredDuplicates = () => {
    const driver = useContext(DriverContext);
    const pairsByAccount = usePairsByAccount(driver, true);

    return (
        <Fragment>
            <p className="duplicates-ignored-link">
                <BackLink to={URL.duplicates.url(driver)}>
                    {$t('client.similarity.back_to_duplicates')}
                </BackLink>
            </p>

            <div>
                <p>{$t('client.similarity.ignored_duplicates_desc')}</p>

                <PairsList
                    pairsByAccount={pairsByAccount}
                    ignored={true}
                    emptyMessage={$t('client.similarity.no_ignored_duplicates')}
                />
            </div>
        </Fragment>
    );
};

IgnoredDuplicates.displayName = 'IgnoredDuplicates';

export default IgnoredDuplicates;
