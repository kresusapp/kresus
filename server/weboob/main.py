#!/usr/bin/env python

"""
Weboob main Python wrapper

This file is a wrapper around Weboob, which is spawned by Kresus backend and
prints fetched data as a JSON export on stdout, so that it could be imported
easily in Kresus' NodeJS backend.

..note:: Useful environment variables are

    - ``WEBOOB_DIR`` to specify the path to the root Weboob folder (with
    modules and Weboob code)
    - ``KRESUS_DIR`` to specify the path to Kresus data dir.

Commands are read on standard input. Available commands are:
    * ``version`` to get the Weboob version.
    * ``test`` to test Weboob is installed and a working connector can be
    built.
    * ``update`` to update Weboob modules.
    * ``accounts BANK LOGIN PASSWORD EXTRA_CONFIG`` to get accounts from bank
    ``BANK`` using the provided credentials and the given extra
    configuration options for the Weboob module (passed as a JSON string).
    * ``operations BANK LOGIN PASSWORD EXTRA_CONFIG`` to get a list of
    operations from bank ``BANK`` using the provided credentials and given
    extra configuration options.
"""

from __future__ import print_function, unicode_literals
from builtins import str

import collections
import gc
import json
import logging
import os
import shlex
import shutil
import sys
import traceback

from datetime import datetime

if 'WEBOOB_DIR' in os.environ and os.path.isdir(os.environ['WEBOOB_DIR']):
    sys.path.append(os.environ['WEBOOB_DIR'])

from weboob.capabilities.base import empty
from weboob.core import Weboob
from weboob.exceptions import (
    BrowserIncorrectPassword,
    BrowserPasswordExpired,
    NoAccountsException,
    ModuleLoadError
)
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
    if os.environ.get('NODE_ENV', 'production') == 'production':
        # Only output colored logging if not running in production.
        handler.setFormatter(createColoredFormatter(sys.stderr, fmt))

    logging.getLogger('').addHandler(handler)


class DummyProgress(object):

    """
    Dummy progressbar, to hide it when installing the module.

    .. note:: Taken from Weboob code.
    """

    def progress(self, *args, **kwargs):
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
        Update Weboob modules.
        """
        try:
            self.weboob.update(progress=DummyProgress())
        except:
            # Try to remove the data directory, to see if it changes a thing.
            # This is especially useful when a new version of Weboob is
            # published and/or the keyring changes.
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
        # Install the module if required.
        repositories = self.weboob.repositories
        minfo = repositories.get_module_info(modulename)
        if minfo is not None and not minfo.is_installed():
            repositories.install(minfo, progress=DummyProgress())

        # Initialize the backend.
        login = parameters['login']
        self.backends[modulename][login] = self.weboob.build_backend(
            modulename,
            parameters
        )

    def delete_backend(self, modulename, login=None):
        """
        Delete a created backend for the given module.

        :param modulename: The name of the module from which backend should be
        deleted.
        :param login: An optional login to delete only a specific backend.
        Otherwise delete all the backends from the given module name.
        """
        def _deinit_backend(backend):
            """
            Deinitialize a given Weboob loaded backend object.
            """
            # This code comes directly from Weboob core code. As we are
            # building backends on our side, we are responsible for
            # deinitialization.
            with backend:
                backend.deinit()

        try:
            # Deinit matching backend objects and remove them from loaded
            # backends dict.
            if login:
                _deinit_backend(self.backends[modulename][login])
                del self.backends[modulename][login]
            else:
                for backend in self.backends:
                    _deinit_backend(backend[modulename])
                del self.backends[modulename]
            gc.collect()  # Force GC collection, better than nothing.
        except KeyError:
            logging.warn(
                'No matching backends for module %s and login %s.',
                modulename, login
            )

    def get_all_backends(self):
        """
        Get all the available built backends.

        :returns: A list of backends.
        """
        backends = []
        for modules_backends in self.backends.values():
            backends.extend(modules_backends.values())
        return backends

    def get_bank_backends(self, modulename):
        """
        Get all the built backends for a given bank module.

        :param modulename: The name of the module from which the backend should
        be created.
        :returns: A list of backends.
        """
        if modulename in self.backends:
            return self.backends[modulename].values()
        else:
            logging.warn(
                'No matching built backends for bank module %s.',
                modulename
            )
            return []

    def get_backend(self, modulename, login):
        """
        Get a specific backend associated to a specific login with a specific
        bank module.

        :param modulename: The name of the module from which the backend should
        be created.
        :param login: The login to further filter on the available backends.
        :returns: A list of backends (with a single item).
        """
        if not modulename:
            # Module name is mandatory in this case.
            logging.error('Missing bank module name.')
            return []

        if modulename in self.backends and login in self.backends[modulename]:
            return [self.backends[modulename][login]]
        else:
            logging.warn(
                'No matching built backends for bank module %s with login %s.',
                modulename, login
            )
            return []

    def get_backends(self, modulename=None, login=None):
        """
        Get a list of backends matching criterions.

        :param modulename: The name of the module from which the backend should
        be created.
        :param login: The login to further filter on the available backends. If
        passed, ``modulename`` cannot be empty.
        :returns: A list of backends.
        """
        if login:
            # If login is provided, only return backends matching the
            # module name and login (at most one).
            return self.get_backend(modulename, login)
        elif modulename:
            # If only modulename is provided, returns all matching
            # backends.
            return self.get_bank_backends(modulename)
        else:
            # Just return all available backends.
            return self.get_all_backends()

    def get_accounts(self, modulename=None, login=None):
        """
        Fetch accounts data from Weboob.

        :param modulename: The name of the module from which data should be
        fetched. Optional, if not provided all available backends are used.

        :param login: The login to further filter on the available backends.
        Optional, if not provided all matching backends are used.

        :returns: A list of dicts representing the available accounts.
        """
        results = []
        backends = self.get_backends(modulename, login)
        for backend in backends:
            for account in backend.iter_accounts():
                iban = None
                if not empty(account.iban):
                    iban = account.iban
                currency = None
                if not empty(account.currency):
                    currency = str(account.currency)
                results.append({
                    "accountNumber": account.id,
                    "label": account.label,
                    "balance": str(account.balance),
                    "iban": iban,
                    "currency": currency
                })
        return results

    def get_operations(self, modulename=None, login=None):
        """
        Fetch operations data from Weboob.

        :param modulename: The name of the module from which data should be
        fetched. Optional, if not provided all available backends are used.

        :param login: The login to further filter on the available backends.
        Optional, if not provided all matching backends are used.

        :returns: A list of dicts representing the available operations.
        """
        results = []
        backends = self.get_backends(modulename, login)
        for backend in backends:
            for account in list(backend.iter_accounts()):
                # Get operations for all accounts available.
                try:
                    history = backend.iter_history(account)
                except NotImplementedError:
                    logging.error(
                        ("This account type has not been implemented by"
                         "weboob: %s"),
                        account.id
                    )

                # Build an operation dict for each operation.
                for line in history:
                    # Handle date
                    if line.rdate:
                        # Use date of the payment (real date) if available.
                        date = line.rdate
                    elif line.date:
                        # Otherwise, use debit date, on the bank statement.
                        date = line.date
                    else:
                        # Wow, this should never happen.
                        logging.error(
                            "No known date property in operation line: %s.",
                            str(line.raw)
                        )
                        date = datetime.now()

                    title = str(line.label) if line.label else str(line.raw)
                    isodate = date.isoformat()
                    results.append({
                        "account": account.id,
                        "amount": str(line.amount),
                        "raw": str(line.raw),
                        "type": line.type,
                        "date": isodate,
                        "title": title
                    })
        return results

    def fetch(self, which, modulename=None, login=None):
        """
        Wrapper to fetch data from the Weboob connector.

        This wrapper fetches the required data from Weboob and returns it. It
        handles the translation between Weboob exceptions and Kresus error
        codes stored in the JSON response.

        :param which: The type of data to fetch. Can be either ``accounts`` or
        ``operations``.

        :param modulename: The name of the module from which data should be
        fetched. Optional, if not provided all available backends are used.

        :param login: The login to further filter on the available backends.
        Optional, if not provided all matching backends are used.

        :returns: A dict of the fetched data, in a ``values`` keys. Errors are
        described under ``error_code``, ``error_short`` and ``error_content``
        keys.
        """
        results = {}
        try:
            if which == 'accounts':
                results['values'] = self.get_accounts(modulename, login)
            elif which == 'operations':
                results['values'] = self.get_operations(modulename, login)
            else:
                raise Exception('Invalid fetch command.')
        except NoAccountsException:
            results['error_code'] = NO_ACCOUNTS
        except ModuleLoadError:
            results['error_code'] = UNKNOWN_MODULE
        except BrowserPasswordExpired:
            results['error_code'] = EXPIRED_PASSWORD
        except BrowserIncorrectPassword:
            # This `except` clause is not in alphabetic order and cannot be.
            # This is due to the fact that BrowserPasswordExpired inherits from
            # BrowserIncorrectPassword in Weboob 1.3.
            results['error_code'] = INVALID_PASSWORD
        except Module.ConfigError as e:
            results['error_code'] = INVALID_PARAMETERS
            results['error_content'] = str(e)
        except Exception as e:
            trace = traceback.format_exc()
            err_content = "%s\n%s" % (str(e), trace)
            logging.error("Unknown error: %s", err_content)
            results['error_code'] = GENERIC_EXCEPTION
            results['error_short'] = str(e)
            results['error_content'] = err_content
        return results


if __name__ == '__main__':
    # Build a Weboob connector.
    try:
        weboob_connector = Connector(
            weboob_data_path=os.path.join(
                os.environ.get('KRESUS_DIR', '.'),
                'weboob-data'
            )
        )
    except:
        logging.error(
            "Is weboob installed? Unknown exception raised: %s",
            traceback.format_exc()
        )
        sys.exit(1)

    # Parse command from standard input.
    stdin = shlex.split(sys.stdin.readline())
    command, other_args = stdin[0], stdin[1:]

    # Handle the command and output the expected result on standard output, as
    # JSON encoded string.
    if command == 'test':
        # Do nothing, just check we arrived so far.
        pass
    elif command == 'version':
        # Return Weboob version.
        obj = {
            'values': weboob_connector.version()
        }
        print(json.dumps(obj))
    elif command == 'update':
        # Update Weboob modules.
        try:
            weboob_connector.update()
        except Exception as e:
            logging.error("Exception when updating weboob: %s", str(e))
            sys.exit(1)
    elif command in ['accounts', 'operations']:
        # Fetch accounts.
        if len(other_args) < 3:
            # Check all the arguments are passed.
            logging.error('Missing arguments for %s command.', command)
            sys.exit(1)

        # TODO
        # Maybe strip the debug prefix and enable debug accordingly.
        #for c in ['accounts', 'operations']:
        #    if command == 'debug-' + c:
        #        enable_weboob_debug()
        #        command = c

        # Format parameters for the Weboob connector.
        bank_module = other_args[0]

        try:
            custom_fields = json.loads(other_args[3])
        except IndexError:
            custom_fields = []
        except ValueError:
            logging.error('Invalid JSON custom fields: %s.', other_args[3])
            sys.exit(1)

        params = {
            'login': other_args[1],
            'password': other_args[2],
        }
        for f in custom_fields:
            params[f["name"]] = f["value"]

        # Create a Weboob backend, fetch data and delete the module.
        weboob_connector.create_backend(bank_module, params)
        content = weboob_connector.fetch(command)
        weboob_connector.delete_backend(bank_module, login=params['login'])

        # Output the fetched data as JSON.
        print(json.dumps(content))
    else:
        # Unknown commands, send an error.
        logging.error("Unknown command '%s'.", command)
        sys.exit(1)
