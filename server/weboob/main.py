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
    - ``WEBOOB_SOURCES_LIST`` to specify a Weboob sources.list to use instead
    of the default one.

Commands are read on standard input. Available commands are:
    * ``version`` to get the Weboob version.
    * ``test`` to test Weboob is installed and a working connector can be
    built.
    * ``update`` to update Weboob modules.
    * ``accounts --module BANK --login LOGIN EXTRA_CONFIG`` to get accounts from bank
    ``BANK`` using the provided credentials and the given extra
    configuration options for the Weboob module (passed as --field NAME VALUE, NAME being the name
    of the field and VALUE its value). The password is passed by the environment variable
    ``KRESUS_WEBOOB_PWD``.
    * ``operations --module BANK --login LOGIN EXTRA_CONFIG`` to get a list of
    operations from bank ``BANK`` using the provided credentials and given
    extra configuration options (passed as for ``account`` command).
"""

from __future__ import print_function, unicode_literals

import collections
import gc
import json
import logging
import os
import shutil
import sys
import traceback
import argparse
import io

from datetime import datetime
from itertools import chain
from requests import ConnectionError


def fail(error_code, error_short, error_long):
    """
    Log error, return error JSON on stdin and exit with non-zero error code.

    :param error_code: Kresus-specific error code. See ``shared/errors.json``.
    :param error_content: Error string.
    """
    error_message = None
    if error_long is not None:
        error_message = "%s\n%s" % (error_short, error_long)
    else:
        error_message = error_short

    error_object = {
        'error_code': error_code,
        'error_short': error_short,
        'error_message': error_message
    }

    print(json.dumps(error_object))
    sys.exit(1)


# Load errors description
ERRORS_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),  # This script directory
    '..', 'shared', 'errors.json'
)
with open(ERRORS_PATH, 'r') as f:
    ERRORS = json.load(f)
    ACTION_NEEDED = ERRORS['ACTION_NEEDED']
    UNKNOWN_MODULE = ERRORS['UNKNOWN_WEBOOB_MODULE']
    INVALID_PASSWORD = ERRORS['INVALID_PASSWORD']
    EXPIRED_PASSWORD = ERRORS['EXPIRED_PASSWORD']
    GENERIC_EXCEPTION = ERRORS['GENERIC_EXCEPTION']
    INVALID_PARAMETERS = ERRORS['INVALID_PARAMETERS']
    NO_ACCOUNTS = ERRORS['NO_ACCOUNTS']
    WEBOOB_NOT_INSTALLED = ERRORS['WEBOOB_NOT_INSTALLED']
    INTERNAL_ERROR = ERRORS['INTERNAL_ERROR']
    NO_PASSWORD = ERRORS['NO_PASSWORD']
    CONNECTION_ERROR = ERRORS['CONNECTION_ERROR']


def fail_unset_field(field, error_type=INVALID_PARAMETERS):
    """
    Wrapper around ``fail`` for the specific case where a required field is not
    set.

    :param field: The name of the required field.
    :param error_type: A possibility to overload the type of error thrown.
        Defaults to ``INVALID_PARAMETERS``.
    """
    fail(
        error_type,
        '%s shall be set to a non empty string' % field,
        None
    )


# Import Weboob core
if 'WEBOOB_DIR' in os.environ and os.path.isdir(os.environ['WEBOOB_DIR']):
    sys.path.append(os.environ['WEBOOB_DIR'])

try:
    from weboob.capabilities.base import empty
    from weboob.core import Weboob
    from weboob.exceptions import (
        ActionNeeded,
        BrowserIncorrectPassword,
        BrowserPasswordExpired,
        NoAccountsException,
        ModuleInstallError,
        ModuleLoadError
    )
    from weboob.tools.backend import Module
    from weboob.tools.compat import unicode
    from weboob.tools.log import createColoredFormatter
    from weboob.tools.json import WeboobEncoder
except ImportError as exc:
    fail(
        WEBOOB_NOT_INSTALLED,
        ('Is weboob correctly installed? Unknown exception raised: %s.' %
         unicode(exc)),
        traceback.format_exc()
    )


def init_logging(level, is_prod):
    """
    Initialize loggers.

    :param level: Minimal severity to log.
    :param is_prod: whether we're running in production or not.
    """
    root_logger = logging.getLogger()

    root_logger.setLevel(level)

    handler = logging.StreamHandler(sys.stderr)
    fmt = (
        '%(asctime)s:%(levelname)s:%(name)s:%(filename)s:'
        '%(lineno)d:%(funcName)s %(message)s'
    )

    # Only output colored logging if not running in production.
    if is_prod:
        handler.setFormatter(logging.Formatter(fmt))
    else:
        handler.setFormatter(createColoredFormatter(sys.stderr, fmt))

    root_logger.addHandler(handler)


class DummyProgress(object):

    """
    Dummy progressbar, to hide it when installing the module.

    .. note:: Taken from Weboob code.
    """

    def progress(self, *args, **kwargs):
        """
        Do not display progress
        """
        pass

    def prompt(self, message):  # pylint: disable=no-self-use
        """
        Ignore prompt
        """
        logging.info(message)
        return True


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

    def __init__(self, weboob_data_path, fakemodules_path, sources_list_content, is_prod):
        """
        Create a Weboob instance.

        :param weboob_data_path: Weboob path to use.
        :param fakemodules_path: Path to the fake modules directory in user
        data.
        :param sources_list_content: Optional content of the sources.list file,
        as an array of lines, or None if not present.
        :param is_prod: whether we're running in production or not.
        """
        # By default, consider we don't need to update the repositories.
        self.needs_update = False

        self.fakemodules_path = fakemodules_path
        self.sources_list_content = sources_list_content

        if not os.path.isdir(weboob_data_path):
            os.makedirs(weboob_data_path)

        # Set weboob data directory and sources.list file.
        self.weboob_data_path = weboob_data_path
        self.write_weboob_sources_list()

        # Create a Weboob object.
        self.weboob = Weboob(workdir=weboob_data_path,
                             datadir=weboob_data_path)
        self.backends = collections.defaultdict(dict)

        # To make development more pleasant, always copy the fake modules in
        # non-production modes.
        if not is_prod:
            self.copy_fakemodules()

        # Update the weboob repos only if new repos are included.
        if self.needs_update:
            self.update()

    def copy_fakemodules(self):
        """
        Copies the fake modules files into the default fakemodules user-data
        directory.

        When Weboob updates modules, it might want to write within the
        fakemodules directory, which might not be writable by the current
        user. To prevent this, first copy the fakemodules directory in
        a directory we have write access to, and then use that directory
        in the sources list file.
        """
        fakemodules_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fakemodules')
        if os.path.isdir(self.fakemodules_path):
            shutil.rmtree(self.fakemodules_path)
        shutil.copytree(fakemodules_src, self.fakemodules_path)

    def write_weboob_sources_list(self):
        """
        Ensure the Weboob sources.list file contains the required entries from
        Kresus.
        """
        sources_list_path = os.path.join(self.weboob_data_path, 'sources.list')

        # Determine the new content of the sources.list file.
        new_sources_list_content = []
        if self.sources_list_content is not None:
            new_sources_list_content = self.sources_list_content
        else:
            # Default content of the sources.list file.
            new_sources_list_content = [
                unicode('https://updates.weboob.org/%(version)s/main/'),
                unicode('file://%s' % self.fakemodules_path)
            ]

        # Read the content of existing sources.list, if it exists.
        original_sources_list_content = []
        if os.path.isfile(sources_list_path):
            with io.open(sources_list_path, encoding="utf-8") as fh:
                original_sources_list_content = fh.read().splitlines()

        # Update the source.list content and update the repository, only if the
        # content has changed.
        if set(original_sources_list_content) != set(new_sources_list_content):
            with io.open(sources_list_path, 'w', encoding="utf-8") as sources_list_file:
                sources_list_file.write('\n'.join(new_sources_list_content))
            self.needs_update = True

    def update(self):
        """
        Update Weboob modules.
        """
        self.copy_fakemodules()

        # Weboob has an offending print statement when it "Rebuilds index",
        # which happen at every run if the user has a local repository. We need
        # to silence it, hence the temporary redirect of stdout.
        sys.stdout = open(os.devnull, "w")
        try:
            self.weboob.update(progress=DummyProgress())
        except ConnectionError as exc:
            # Do not delete the repository if there is a connection error.
            raise exc
        except Exception:
            # Try to remove the data directory, to see if it changes a thing.
            # This is especially useful when a new version of Weboob is
            # published and/or the keyring changes.
            shutil.rmtree(self.weboob_data_path)
            os.makedirs(self.weboob_data_path)

            # Recreate the Weboob object as the directories are created
            # on creating the Weboob object.
            self.weboob = Weboob(workdir=self.weboob_data_path,
                                 datadir=self.weboob_data_path)

            # Rewrite sources.list file
            self.write_weboob_sources_list()

            # Retry update
            self.weboob.update(progress=DummyProgress())
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__

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
        if (
                minfo is not None and not minfo.is_installed() and
                not minfo.is_local()
        ):
            # We cannot install a locally available module, this would
            # result in a ModuleInstallError.
            try:
                repositories.install(minfo, progress=DummyProgress())
            except ModuleInstallError:
                fail(
                    GENERIC_EXCEPTION,
                    "Unable to install module %s." % modulename,
                    traceback.format_exc()
                )

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
            logging.warning(
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

        logging.warning(
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

        logging.warning(
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

        if modulename:
            # If only modulename is provided, returns all matching
            # backends.
            return self.get_bank_backends(modulename)

        # Just return all available backends.
        return self.get_all_backends()

    @staticmethod
    def get_accounts(backend):
        """
        Fetch accounts data from Weboob.

        :param backend: The Weboob built backend to fetch data from.

        :returns: A list of dicts representing the available accounts.
        """
        results = []
        for account in list(backend.iter_accounts()):
            # The minimum dict keys for an account are :
            # 'id', 'label', 'balance' and 'type'
            # Retrieve extra information for the account.
            account = backend.fillobj(account, ['iban', 'currency'])

            iban = None
            if not empty(account.iban):
                iban = account.iban
            currency = None
            if not empty(account.currency):
                currency = unicode(account.currency)

            results.append({
                'accountNumber': account.id,
                'title': account.label,
                'balance': unicode(account.balance),
                'iban': iban,
                'currency': currency,
                'type': account.type,
            })
        return results

    @staticmethod
    def get_operations(backend):
        """
        Fetch operations data from Weboob.

        :param backend: The Weboob built backend to fetch data from.

        :returns: A list of dicts representing the available operations.
        """
        results = []

        def safe_iterator(func):
            """
            Builds a function returning an iterator over the transactions
            """
            def iterator(account, *args, **kwargs):
                """
                Returns an iterator for the given account
                """
                try:
                    return func(account, *args, **kwargs)
                except NotImplementedError:
                    logging.error(
                        ('%s has not been implemented for '
                         'this account: %s.'),
                        func.__name__,
                        account.id
                    )
                    return []
            return iterator

        @safe_iterator
        def iter_history(backend, account):
            """
            Iterates over the history
            """
            return backend.iter_history(account)

        @safe_iterator
        def iter_coming(backend, account):
            """
            Iterates over the coming transactions
            """
            return backend.iter_coming(account)

        for account in list(backend.iter_accounts()):

            # Get all operations for this account.
            operations = chain(
                iter_history(backend, account),
                iter_coming(backend, account)
            )

            # Build an operation dict for each operation.
            for operation in operations:
                # Handle date
                if operation.rdate:
                    # Use date of the payment (real date) if available.
                    date = operation.rdate
                elif operation.date:
                    # Otherwise, use debit date, on the bank statement.
                    date = operation.date
                else:
                    logging.error(
                        'No known date property in operation line: %s.',
                        unicode(operation.raw)
                    )
                    date = datetime.now()

                if operation.label:
                    title = unicode(operation.label)
                else:
                    title = unicode(operation.raw)

                isodate = date.isoformat()
                debit_date = operation.date.isoformat()

                results.append({
                    'account': account.id,
                    'amount': unicode(operation.amount),
                    'raw': unicode(operation.raw),
                    'type': operation.type,
                    'date': isodate,
                    'debit_date': debit_date,
                    'title': title
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
            results['values'] = []
            backends = self.get_backends(modulename, login)

            if which == 'accounts':
                fetch_function = self.get_accounts
            elif which == 'operations':
                fetch_function = self.get_operations
            else:
                raise Exception('Invalid fetch command.')

            for backend in backends:
                with backend:  # Acquire lock on backend
                    results['values'].extend(fetch_function(backend))

        except NoAccountsException:
            results['error_code'] = NO_ACCOUNTS
        except ModuleLoadError:
            results['error_code'] = UNKNOWN_MODULE
        except BrowserPasswordExpired:
            results['error_code'] = EXPIRED_PASSWORD
        except ActionNeeded as exc:
            # This `except` clause is not in alphabetic order and cannot be,
            # because BrowserPasswordExpired (above) inherits from it in
            # Weboob 1.4.
            results['error_code'] = ACTION_NEEDED
            results['error_content'] = unicode(exc)
        except BrowserIncorrectPassword:
            # This `except` clause is not in alphabetic order and cannot be,
            # because BrowserPasswordExpired (above) inherits from it in
            # Weboob 1.3.
            results['error_code'] = INVALID_PASSWORD
        except Module.ConfigError as exc:
            results['error_code'] = INVALID_PARAMETERS
            results['error_content'] = unicode(exc)
        except ConnectionError as exc:
            results['error_code'] = CONNECTION_ERROR
            results['error_content'] = unicode(exc)
        except Exception as exc:
            fail(
                GENERIC_EXCEPTION,
                'Unknown error: %s.' % unicode(exc),
                traceback.format_exc()
            )
        return results


def main():
    """
    Guess what? It's the main function!
    """

    parser = argparse.ArgumentParser(description='Process CLI arguments for Kresus')

    parser.add_argument('command',
                        choices=['test', 'version', 'operations', 'accounts'],
                        help='The command to be executed by the script')
    parser.add_argument('--module', help="The weboob module name.")
    parser.add_argument('--login', help="The login for the access.")
    parser.add_argument('--field', nargs=2, action='append',
                        help="Custom fields. Can be set several times.",
                        metavar=('NAME', 'VALUE'))
    parser.add_argument('--debug', action='store_true',
                        help="If set, the debug mode is activated.")
    parser.add_argument(
        '--update', action='store_true',
        help=("If set, the repositories will be updated prior to command "
              "accounts or operations.")
    )

    # Parse command from standard input.
    options = parser.parse_args()

    # Handle logging
    is_prod = os.environ.get('NODE_ENV', 'production') == 'production'
    if options.debug:
        init_logging(logging.DEBUG, is_prod)
    else:
        init_logging(logging.WARNING, is_prod)

    kresus_dir = os.environ.get('KRESUS_DIR', None)
    if kresus_dir is None:
        fail(
            INTERNAL_ERROR,
            "KRESUS_DIR must be set to use the weboob cli tool.",
            traceback.format_exc()
        )

    sources_list_content = None
    if (
            'WEBOOB_SOURCES_LIST' in os.environ and
            os.path.isfile(os.environ['WEBOOB_SOURCES_LIST'])
    ):
        # Read the new content from the sources.list provided as env
        # variable.
        with io.open(os.environ['WEBOOB_SOURCES_LIST'], encoding="utf-8") as fh:
            sources_list_content = fh.read().splitlines()

    # Build a Weboob connector.
    try:
        weboob_connector = Connector(
            weboob_data_path=os.path.join(kresus_dir, 'weboob-data'),
            fakemodules_path=os.path.join(kresus_dir, 'fakemodules'),
            sources_list_content=sources_list_content,
            is_prod=is_prod,
        )
    except ConnectionError as exc:
        fail(
            CONNECTION_ERROR,
            'The connection seems down: %s' % unicode(exc),
            traceback.format_exc()
        )
    except Exception as exc:
        fail(
            WEBOOB_NOT_INSTALLED,
            ('Is weboob installed? Unknown exception raised: %s.' %
             unicode(exc)),
            traceback.format_exc()
        )

    # Handle the command and output the expected result on standard output, as
    # JSON encoded string.
    command = options.command
    if command == 'version':
        # Return Weboob version.
        obj = {
            'values': weboob_connector.version()
        }
        print(json.dumps(obj))
        sys.exit()

    if options.update:
        # Update Weboob modules.
        try:
            weboob_connector.update()
        except ConnectionError as exc:
            fail(
                CONNECTION_ERROR,
                'Exception when updating weboob: %s.' % unicode(exc),
                traceback.format_exc()
            )
        except Exception as exc:
            fail(
                GENERIC_EXCEPTION,
                'Exception when updating weboob: %s.' % unicode(exc),
                traceback.format_exc()
            )

    if command == 'test':
        # Do nothing, just check we arrived so far.
        print(json.dumps({}))
        sys.exit()

    if command in ['accounts', 'operations']:
        if not options.module:
            fail_unset_field('Module')

        if not options.login:
            fail_unset_field('Login')

        password = os.environ.get('KRESUS_WEBOOB_PWD', None)

        if not password:
            fail_unset_field('Password', error_type=NO_PASSWORD)

        # Format parameters for the Weboob connector.
        bank_module = options.module

        params = {
            'login': options.login,
            'password': password,
        }

        if options.field is not None:
            for name, value in options.field:
                if not name:
                    fail_unset_field('Name of custom field')
                if not value:
                    fail_unset_field('Value of custom field')
                params[name] = value

        # Create a Weboob backend, fetch data and delete the module.
        try:
            weboob_connector.create_backend(bank_module, params)
        except Module.ConfigError as exc:
            fail(
                INVALID_PARAMETERS,
                "Unable to load module %s." % bank_module,
                traceback.format_exc()
            )

        except ModuleLoadError as exc:
            fail(
                UNKNOWN_MODULE,
                "Unable to load module %s." % bank_module,
                traceback.format_exc()
            )

        content = weboob_connector.fetch(command)
        weboob_connector.delete_backend(bank_module, login=params['login'])

        # Output the fetched data as JSON.
        print(json.dumps(content, cls=WeboobEncoder))
        sys.exit()


if __name__ == '__main__':
    main()
