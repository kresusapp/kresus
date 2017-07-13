#!/usr/bin/env python
from __future__ import print_function
import os
import json
import shutil
import sys
import traceback

if 'WEBOOB_DIR' in os.environ and os.path.isdir(os.environ['WEBOOB_DIR']):
    sys.path.append(os.environ['WEBOOB_DIR'])

from weboob.core import Weboob

from weboob.exceptions import BrowserIncorrectPassword, \
        BrowserPasswordExpired, \
        NoAccountsException, \
        ModuleLoadError

from weboob.tools.backend import Module
from weboob.capabilities.base import empty

from datetime import datetime

def enable_weboob_debug():
    import logging
    from weboob.tools.log import createColoredFormatter

    logging.getLogger('').setLevel(logging.DEBUG)

    fmt = '%(asctime)s:%(levelname)s:%(name)s:%(filename)s:%(lineno)d:%(funcName)s %(message)s'

    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(createColoredFormatter(sys.stderr, fmt))

    logging.getLogger('').addHandler(handler)

DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%SZ"

# cwd is /build/server
err_path = os.path.join('shared', 'errors.json')

if 'KRESUS_DIR' in os.environ:
    weboob_path = os.path.join(os.environ['KRESUS_DIR'], 'weboob-data')
else:
    weboob_path = os.path.join('weboob', 'data')

with open(err_path, 'r') as f:
    j = json.load(f)
    UNKNOWN_MODULE =     j["UNKNOWN_WEBOOB_MODULE"]
    INVALID_PASSWORD =   j["INVALID_PASSWORD"]
    EXPIRED_PASSWORD =   j["EXPIRED_PASSWORD"]
    GENERIC_EXCEPTION =  j["GENERIC_EXCEPTION"]
    INVALID_PARAMETERS = j['INVALID_PARAMETERS']
    NO_ACCOUNTS =        j['NO_ACCOUNTS']

# Careful: this is extracted from weboob's code.
# Install the module if necessary and hide the progress.
class DummyProgress:
    def progress(self, a, b):
        pass

class Connector(object):
    '''
    Connector is a tool that connects to common websites like bank website,
    phone operator website... and that grabs personal data from there.
    Credentials are required to make this operation.

    Technically, connectors are weboob backend wrappers.
    '''

    @staticmethod
    def version():
        return Weboob.VERSION

    @staticmethod
    def versionIs10():
        return Connector.version() == "1.0"

    @staticmethod
    def weboob():
        if not os.path.isdir(weboob_path):
            os.makedirs(weboob_path)
        if Connector.versionIs10():
            # In 1.0, datadir := workdir, if workdir is given.
            return Weboob(workdir=weboob_path)
        # In 1.1, datadir is a separate argument.
        return Weboob(workdir=weboob_path, datadir=weboob_path)

    @staticmethod
    def test():
        Connector.weboob()

    @staticmethod
    def update(retry=False):
        try:
            return Connector.weboob().update(progress=DummyProgress())
        except Exception as e:
            if retry:
                raise e

            # Try to remove the data directory, to see if it changes a thing.
            shutil.rmtree(weboob_path)
            os.makedirs(weboob_path)
            Connector.update(retry=True)

    def __init__(self, modulename, parameters):
        '''
        Create a Weboob handle and try to load the modules.
        '''
        self.weboob = Connector.weboob()

        repositories = self.weboob.repositories
        minfo = repositories.get_module_info(modulename)
        if minfo is not None and not minfo.is_installed():
            repositories.install(minfo, progress=DummyProgress())

        # Calls the backend.
        self.backend = self.weboob.build_backend(modulename, parameters)

    def get_accounts(self):
        results = []
        for account in self.backend.iter_accounts():

            acc = {
                "accountNumber": account.id,
                "label": account.label,
                "balance": str(account.balance),
            }

            if hasattr(account, 'iban') and not empty(account.iban):
                acc["iban"] = str(account.iban)

            if hasattr(account, 'currency') and not empty(account.currency):
                acc["currency"] = str(account.currency)

            results.append(acc)

        return results

    def get_transactions(self):
        results = []

        for account in list(self.backend.iter_accounts()):
            try:
                for line in self.backend.iter_history(account):

                    op = {
                        "account": account.id,
                        "amount": str(line.amount),
                        "raw": str(line.raw),
                        "type": line.type
                    }

                    # Handle missing information.
                    if hasattr(line, 'rdate') and not empty(line.rdate):
                        op["date"] = line.rdate
                    elif hasattr(line, 'date') and not empty(line.date):
                        op["date"] = line.date
                    else:
                        # Wow, this should never happen.
                        print("No known date property in transaction line: %s" % str(op["raw"]), file=sys.stderr)
                        op["date"] = datetime.now()

                    op["date"] = op["date"].strftime(DATETIME_FORMAT)

                    if hasattr(line, 'label') and not empty(line.label):
                        op["title"] = str(line.label)
                    else:
                        op["title"] = op["raw"]

                    results.append(op)

            except NotImplementedError:
                print("The account type has not been implemented by weboob: %s" % account.id, file=sys.stderr)

        return results

    def fetch(self, which):
        results = {}
        try:
            if which == 'accounts':
                results['values'] = self.get_accounts()
            elif which == 'transactions':
                results['values'] = self.get_transactions()
        except NoAccountsException:
            results['error_code'] = NO_ACCOUNTS
        except ModuleLoadError:
            results['error_code'] = UNKNOWN_MODULE
        except BrowserIncorrectPassword:
            results['error_code'] = INVALID_PASSWORD
        except BrowserPasswordExpired:
            results['error_code'] = EXPIRED_PASSWORD
        except Module.ConfigError as e:
            results['error_code'] = INVALID_PARAMETERS
            results['error_content'] = str(e)
        except Exception as e:
            trace = traceback.format_exc()
            err_content = "%s\n%s" % (str(e), trace)
            print("Unknown error: %s" % err_content, file=sys.stderr)
            results['error_code'] = GENERIC_EXCEPTION
            results['error_short'] = str(e)
            results['error_content'] = err_content
        return results

if __name__ == '__main__':
    """
    Possible arguments:
    - test
    - update
    - accounts bankuuid login password customFields?
    - transactions bankuuid login password customFields?
    """

    command = None
    other_args = []
    for l in sys.stdin:
        if command is None:
            command = l.strip()
            continue
        other_args.append(l.strip())

    if command == 'test':
        try:
            Connector.test()
            sys.exit(0)
        except Exception as e:
            print("Is weboob installed? %s" % str(e), file=sys.stderr)
            sys.exit(1)

    if command == 'update':
        try:
            Connector.update()
            sys.exit(0)
        except Exception as e:
            print("Exception when updating weboob: %s" % str(e),
                  file=sys.stderr)
            sys.exit(1)

    if command == 'version':
        obj = {}
        obj['values'] = Connector.version()
        print(json.dumps(obj, ensure_ascii=False))
        sys.exit(0)

    if command not in ['accounts', 'transactions', 'debug-accounts', 'debug-transactions']:
        print("Unknown command '%s'." % command, file=sys.stderr)
        sys.exit(1)

    # Maybe strip the debug prefix and enable debug accordingly.
    for c in ['accounts', 'transactions']:
        if command == 'debug-' + c:
            enable_weboob_debug()
            command = c

    if len(other_args) < 3:
        print('Missing arguments for accounts/transactions', file=sys.stderr)
        sys.exit(1)

    bankuuid = other_args[0]
    login = other_args[1]
    password = other_args[2]
    custom_fields = None
    if len(other_args) == 4:
        custom_fields = other_args[3]

    # Format parameters for the Weboob connector.
    params = {
        'login': login,
        'password': password,
    }

    if custom_fields is not None:
        custom_fields = json.loads(custom_fields)
        for f in custom_fields:
            params[f["name"]] = f["value"]

    content = Connector(bankuuid, params).fetch(command)
    print(json.dumps(content, ensure_ascii=False))

