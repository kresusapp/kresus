import React from 'react';
import { DriverAccount } from './account';
import { DriverCurrency } from './currency';
import { assert } from '../../helpers';
import { Driver, DriverType, DriverValueType, NoDriver } from './base';

export * from './base';

function checkDriver(type: string): DriverType {
    switch (type) {
        case 'none':
            return DriverType.None;
        case 'account':
            return DriverType.Account;
        case 'currency':
            return DriverType.Currency;
        default:
            assert(false, 'unknown driver value');
    }
}

export function getDriver(driverTypeStr: string, driverValue: DriverValueType | null): Driver {
    const driverType = checkDriver(driverTypeStr);
    if (!driverType || driverType === DriverType.None) {
        return NoDriver;
    }
    assert(driverValue !== null, 'driver value must be set in getDriver');
    return DriverFactory[driverType](driverValue);
}

export const DriverContext = React.createContext(NoDriver);

const DriverFactory: Record<DriverType, (value: string) => Driver> = {
    [DriverType.None]: () => NoDriver,
    [DriverType.Account]: (value: string) => {
        const accountId = Number.parseInt(value, 10);
        return new DriverAccount(accountId);
    },
    [DriverType.Currency]: (value: string) => {
        return new DriverCurrency(value);
    },
};

export const isAccountDriver = (driver: Driver): driver is DriverAccount => {
    return driver.type === DriverType.Account;
};
