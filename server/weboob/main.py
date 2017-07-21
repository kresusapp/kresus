#!/usr/bin/env python
from __future__ import print_function, unicode_literals
"""
Weboob main Python wrapper

This file is a wrapper around Weboob, which is spawned by Kresus backend and
prints fetched data as a JSON export on stdout, so that it could be imported
easily in Kresus NodeJS backend.

..note:: Useful environment variables are ``WEBOOB_DIR`` to specify the path to
the root Weboob folder (with modules and Weboob code) and ``KRESUS_DIR`` to
specify the path to Kresus data dir.
"""
from builtins import str

import collections
import gc
import json
import logging
import os
import shutil
import sys
import traceback

from datetime import datetime

if 'WEBOOB_DIR' in os.environ and os.path.isdir(os.environ['WEBOOB_DIR']):
    sys.path.append(os.environ['WEBOOB_DIR'])

from weboob.core import Weboob
from weboob.exceptions import (
    BrowserIncorrectPassword,
    BrowserPasswordExpired,
    NoAccountsException,
    ModuleLoadError
)
from weboob.capabilities.base import empty
from weboob.tools.backend import Module
from weboob.tools.log import createColoredFormatter

# Load errors description
ERRORS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),  # This script directory
    '..', 'shared', 'errors.json'
)
with open(ERRORS_PATH, 'r') as f:
    ERRORS = json.load(f)
    UNKNOWN_MODULE = ERRORS["UNKNOWN_WEBOOB_MODULE"]
    INVALID_PASSWORD = ERRORS["INVALID_PASSWORD"]
    EXPIRED_PASSWORD = ERRORS["EXPIRED_PASSWORD"]
    GENERIC_EXCEPTION = ERRORS["GENERIC_EXCEPTION"]
    INVALID_PARAMETERS = ERRORS['INVALID_PARAMETERS']
    NO_ACCOUNTS = ERRORS['NO_ACCOUNTS']


def enable_weboob_debug():
    """
    Enable Weboob debug logging output.
    """
    logging.getLogger('').setLevel(logging.DEBUG)

    fmt = '%(asctime)s:%(levelname)s:%(name)s:%(filename)s:%(lineno)d:%(funcName)s %(message)s'

    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(createColoredFormatter(sys.stderr, fmt))

    logging.getLogger('').addHandler(handler)


class DummyProgress(object):
    """
    Dummy progressbar, to hide it when installing the module.

    .. note:: Taken from Weboob code.
    """
    def progress(self, _, __):
        pass


class Connector(object):
    """
    Connector is a tool that connects to common websites like bank website,
    phone operator website... and that grabs personal data from there.
    Credentials are required to make this operation.

    Technically, connectors are weboob backend wrappers.
    """
    @staticmethod
    def version():
        """
        Get the version of the installed Weboob.
        """
        return Weboob.VERSION

    def __init__(self, weboob_data_path):
        """
        Create a Weboob instance.

        :param weboob_data_path: Weboob path to use.
        """
        if not os.path.isdir(weboob_data_path):
            os.makedirs(weboob_data_path)

        self.weboob_data_path = weboob_data_path
        self.weboob = Weboob(workdir=weboob_data_path,
                             datadir=weboob_data_path)
        self.backends = collections.defaultdict(dict)

    def update(self):
        """
        Update Weboob modules
        """
        try:
            return self.weboob.update(progress=DummyProgress())
        except:
            # Try to remove the data directory, to see if it changes a thing.
            # This is especially useful when a new version of Weboob is
            # published and the keyring changes.
            shutil.rmtree(self.weboob_data_path)
            os.makedirs(self.weboob_data_path)
            # Retry update
            self.weboob.update(progress=DummyProgress())

    def create_backend(self, modulename, parameters):
        """
        Create a Weboob backend for a given module, ready to be used to fetch
        data.

        :param modulename: The name of the module from which backend should be
        created.
        :param parameters: A dict of parameters to pass to the module. It
        should at least contain ``login`` and ``password`` fields, but can
        contain additional values depending on the module.
        """
        # Install the module if required
        repositories = self.weboob.repositories
        minfo = repositories.get_module_info(modulename)
        if minfo is not None and not minfo.is_installed():
            repositories.install(minfo, progress=DummyProgress())
        # Initialize the backend
        login = parameters['login']
        self.backends[modulename][login] = self.weboob.build_backend(
            modulename,
            parameters
        )

    def delete_backend(self, modulename, login=None):
        """
        Delete a created backend for the given module

        :param modulename: The name of the module from which backend should be
        deleted.
        :param login: An optional login to delete only a specific backend.
        Otherwise delete all the backends from the given module name.
        """
        def _deinit_backend(backend):
            """
            Deinitialize a given Weboob loaded backend object.
            """
            with backend:
                backend.deinit()

        try:
            # Deinit the backend object and remove it from loaded backends dict
            if login:
                _deinit_backend(self.backends[modulename][login])
                del self.backends[modulename][login]
            else:
                _deinit_backend(self.backends[modulename])
                del self.backends[modulename]
            gc.collect()  # Force GC collection, better than nothing
        except KeyError:
            logging.debug(
                'No matching backends for module %s and login %s.',
                modulename, login
            )

    def get_accounts(self):
        """
        TODO
        """
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
        """
        TODO
        """
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
                        print(
                            ("No known date property in transaction line: %s" %
                             str(op["raw"])),
                            file=sys.stderr)
                        op["date"] = datetime.now()

                    op["date"] = op["date"].isoformat()

                    if hasattr(line, 'label') and not empty(line.label):
                        op["title"] = str(line.label)
                    else:
                        op["title"] = op["raw"]

                    results.append(op)

            except NotImplementedError:
                print(
                    ("The account type has not been implemented by weboob: %s" %
                     account.id),
                    file=sys.stderr
                )

        return results

    def fetch(self, which):
        """
        TODO
        """
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
    # Build a Weboob connector
    try:
        weboob_connector = Connector(
            weboob_data_path=os.path.join(
                os.environ.get('KRESUS_DIR', '.'),
                'weboob-data'
            )
        )
    except Exception as e:
        print(("Is weboob installed? Unknown exception raised: %s" %
               traceback.format_exc(e)),
              file=sys.stderr)
        sys.exit(1)

    # Parse command from standard input
    command = [x.strip() for x in sys.stdin.readline().split(' ')]
    command, other_args = command[0], command[1:]

    # Handle the command and output the expected result on standard output, as
    # JSON encoded string
    if command == 'test':
        # Do nothing, just check we arrived so far
        pass
    elif command == 'version':
        # Return Weboob version
        obj = {
            'values': weboob_connector.version()
        }
        print(json.dumps(obj))
    elif command == 'update':
        try:
            weboob_connector.update()
        except Exception as e:
            print("Exception when updating weboob: %s" % str(e),
                  file=sys.stderr)
            sys.exit(1)
    elif False:
        # TODO
        # Maybe strip the debug prefix and enable debug accordingly.
        for c in ['accounts', 'transactions']:
            if command == 'debug-' + c:
                enable_weboob_debug()
                command = c

        if len(other_args) < 3:
            print('Missing arguments for accounts/transactions', file=sys.stderr)
            sys.exit(1)

        bankuuid = other_args[0]
        custom_fields = None
        if len(other_args) == 4:
            custom_fields = other_args[3]

        # Format parameters for the Weboob connector.
        params = {
            'login': other_args[1],
            'password': other_args[2],
        }

        if custom_fields is not None:
            custom_fields = json.loads(custom_fields)
            for f in custom_fields:
                params[f["name"]] = f["value"]

        content = Connector(bankuuid, params).fetch(command)
        print(json.dumps(content))
    else:
        # Unknown commands, send an error
        print("Unknown command '%s'." % command, file=sys.stderr)
        sys.exit(1)
