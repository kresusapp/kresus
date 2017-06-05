import should from 'should';

import { testMakeUrlPrefixRegExp } from '../server/config';

describe('makeUrlPrefix', () => testMakeUrlPrefixRegExp(it));
