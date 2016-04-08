#!/usr/bin/env python2
from weboob.core import Weboob

from weboob.core.modules import ModuleLoadError
from weboob.exceptions import BrowserIncorrectPassword, BrowserPasswordExpired
from weboob.tools.backend import Module
from weboob.capabilities.base import empty

import json
import os
import sys
import traceback

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
weboob_path = os.path.join('weboob', 'data')

with file(err_path) as f:
    j = json.loads(f.read())
    UNKNOWN_MODULE =     j["UNKNOWN_WEBOOB_MODULE"]
    INVALID_PASSWORD =   j["INVALID_PASSWORD"]
    EXPIRED_PASSWORD =   j["EXPIRED_PASSWORD"]
    GENERIC_EXCEPTION =  j["GENERIC_EXCEPTION"]
    INVALID_PARAMETERS = j['INVALID_PARAMETERS']

class Connector(object):
    '''
    Connector is a tool that connects to common websites like bank website,
    phone operator website... and that grabs personal data from there.
    Credentials are required to make this operation.

    Technically, connectors are weboob backend wrappers.
    '''

    @staticmethod
    def versionIs10():
        return Weboob.VERSION == "1.0"

    @staticmethod
    def versionIs11():
        return Weboob.VERSION == "1.1"

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
    def update():
        return Connector.weboob().update()

    def __init__(self, modulename, parameters):
        '''
        Create a Weboob handle and try to load the modules.
        '''
        self.weboob = Connector.weboob()

        # Careful: this is extracted from weboob's code.
        # Install the module if necessary and hide the progress.
        class DummyProgress:
            def progress(self, a, b):
                pass
        repositories = self.weboob.repositories
        minfo = repositories.get_module_info(modulename)
        if minfo is not None and not minfo.is_installed():
            repositories.install(minfo, progress=DummyProgress())

        # Calls the backend.
        self.backend = self.weboob.build_backend(modulename, parameters)

    def get_accounts(self):
        results = []
        for account in self.backend.iter_accounts():
            if Connector.versionIs11() and repr(account.iban) != "NotLoaded":
                results.append({
                    "accountNumber": account.id,
                    "label": account.label,
                    "balance": unicode(account.balance),
                    "iban": unicode(account.iban)
                })
            else:
                results.append({
                    "accountNumber": account.id,
                    "label": account.label,
                    "balance": unicode(account.balance)
                })
        return results

    def get_transactions(self):
        results = []
        for account in list(self.backend.iter_accounts()):
            try:
                for history in self.backend.iter_history(account):
                    results.append({
                        "account": account.id,
                        "amount": str(history.amount),
                        "date": history.date.strftime(DATETIME_FORMAT) if not empty(history.date) else u'',
                        "rdate": history.rdate.strftime(DATETIME_FORMAT) if not empty(history.rdate) else u'',
                        "label": unicode(history.label),
                        "raw": unicode(history.raw),
                        "type": history.type
                    })
            except NotImplementedError:
                print >> sys.stderr, "The account type has not been implemented by weboob."
        return results

    def fetch(self, which):
        results = {}
        try:
            if which == 'accounts':
                results['values'] = self.get_accounts()
            elif which == 'transactions':
                results['values'] = self.get_transactions()
        except ModuleLoadError:
            results['error_code'] = UNKNOWN_MODULE
        except BrowserIncorrectPassword:
            results['error_code'] = INVALID_PASSWORD
        except BrowserPasswordExpired:
            results['error_code'] = EXPIRED_PASSWORD
        except Module.ConfigError as e:
            results['error_code'] = INVALID_PARAMETERS
            results['error_content'] = unicode(e)
        except Exception as e:
            print >> sys.stderr, "Unknown error: %s" % unicode(e)
            _type, _value, _traceback = sys.exc_info()
            traceback.print_exception(_type, _value, _traceback)
            results['error_code'] = GENERIC_EXCEPTION
            results['error_content'] = unicode(e)
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
            print >> sys.stderr, "Is weboob installed? %s" % unicode(e)
            sys.exit(1)

    if command == 'update':
        try:
            Connector.update()
            sys.exit(0)
        except Exception as e:
            print >> sys.stderr, "Exception when updating weboob: %s" % unicode(e)
            sys.exit(1)

    if command not in ['accounts', 'transactions', 'debug-accounts', 'debug-transactions']:
        print >> sys.stderr, "Unknown command '%s'." % command
        sys.exit(1)

    # Maybe strip the debug prefix and enable debug accordingly.
    for c in ['accounts', 'transactions']:
        if command == 'debug-' + c:
            enable_weboob_debug()
            command = c

    if len(other_args) < 3:
        print >> sys.stderr, 'Missing arguments for accounts/transactions'
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
    print json.dumps(content, ensure_ascii=False).encode('utf-8')

