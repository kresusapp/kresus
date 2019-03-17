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

Commands are parsed from ``argv``. Available commands are:
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

import json
import logging
import os
import shutil
import sys
import traceback
import argparse
import io

from copy import deepcopy
from datetime import datetime
from requests import ConnectionError

# Ensure unicode is also defined in python 3.
try:
    unicode = unicode # pylint: disable=redefined-builtin, invalid-name
except NameError:
    unicode = str # pylint: disable=invalid-name

def fail(error_code, error_short, error_long):
    """
    Log error, return error JSON on stdin and exit with non-zero error code.

    :param error_code: Kresus-specific error code. See ``shared/errors.json``.
    :param error_short: Short error string description.
    :param error_long:  Long error string description.
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
    AUTH_METHOD_NYI = ERRORS['AUTH_METHOD_NYI']
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


# Put the weboob path at the top of the current python path.
if 'WEBOOB_DIR' in os.environ and os.path.isdir(os.environ['WEBOOB_DIR']):
    sys.path.insert(0, os.environ['WEBOOB_DIR'])

# Import Weboob core
try:
    from weboob.capabilities.base import empty
    from weboob.capabilities.bank import Transaction
    from weboob.core import Weboob
    from weboob.core.repositories import IProgress
    from weboob.exceptions import (
        ActionNeeded,
        AuthMethodNotImplemented,
        BrowserIncorrectPassword,
        BrowserPasswordExpired,
        NoAccountsException,
        ModuleInstallError,
        ModuleLoadError
    )
    from weboob.tools.backend import Module
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


class DictStorage(object):
    """
    This class mocks the Weboob Storage class.
    """
    def __init__(self, obj):
        self.values = deepcopy(obj)

    def load(self, *args, **kwargs):
        """
        The load method is meaningless when a 'dict' storage is used.
        """
        pass

    def save(self, *args, **kwargs):
        """
        The save method is meaningless when a 'dict' storage is used.
        """
        pass

    def set(self, *args):
        """
        This method allows to set a value at a given path in the storage.
        :param: ('path', 'to', 'the', 'value', value)
        sets self.values['path']['to']['the']['value'] = value
        """
        value = self.values
        # Loop over elements of path.
        for arg in args[:-2]:
            value = value.setdefault(arg, {})

        # Finally, set value at the right path.
        value[args[-2]] = args[-1]

    def delete(self, *args):
        """
        This method allows to delete a value at a given path in the storage.
        :param: ('path', 'to', 'the', 'value')
        deletes self.values['path']['to']['the']['value']
        """
        value = self.values
        # Loop over elements of path.
        for arg in args[:-1]:
            # Check element in path exists.
            try:
                value = value[arg]
            except KeyError:
                # If not, end the process.
                return
        # Finally, delete element at the right path.
        value.pop(args[-1], None)

    def get(self, *args, **kwargs):
        """
        This method allows to get a value at a given path in the storage.
        :param: ('path', 'to', 'the', 'value')
        :param default: The default value to be returned if the path does not exist.
        returns self.values['path']['to']['the']['value']
        """
        value = self.values
        # Loop over elements of path.
        for arg in args:
            # Check element in path exists.
            try:
                value = value[arg]
            except KeyError:
                # If not, return the default value.
                return kwargs.get('default')

        return value

    def dump(self):
        """
        Returns the full storage.
        """
        return self.values


class DummyProgress(IProgress):
    """
    Dummy progressbar, to hide messages displayed when installing modules.
    """

    def progress(self, percent, message):
        """
        Do not display progress.
        """
        pass

    def error(self, message):
        """
        Display error messages.
        """
        logging.error(message)
        return True

    def prompt(self, message):  # pylint: disable=no-self-use
        """
        Ignore prompt messages.
        """
        logging.info(message)
        return True


class KresusEncoder(WeboobEncoder):
    """
    JSON Encoder which serializes bytes (cookies for sessions) in python 3.
    """
    def default(self, o):  # pylint: disable=method-hidden
        if isinstance(o, bytes):
            return o.decode('utf-8')
        return super(KresusEncoder, self).default(o)


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
        self.backend = None
        self.storage = None

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

    def create_backend(self, modulename, parameters, session):
        """
        Create a Weboob backend for a given module, ready to be used to fetch
        data.

        :param modulename: The name of the module from which backend should be
        created.
        :param parameters: A dict of parameters to pass to the module. It
        should at least contain ``login`` and ``password`` fields, but can
        contain additional values depending on the module.
        :param session: an object representing the browser state.
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

        # Initialize the Storage.
        self.storage = DictStorage(session)

        # Initialize the backend.
        self.backend = self.weboob.build_backend(
            modulename,
            parameters,
            storage=self.storage
        )

    def delete_backend(self):
        """
        Delete a created backend for the given module.
        """
        if self.backend:
            with self.backend:
                self.backend.deinit()

        self.backend = None
        self.storage = None

    def get_accounts(self):
        """
        Fetch accounts data from Weboob.

        :param backend: The Weboob built backend to fetch data from.

        :returns: A list of dicts representing the available accounts.
        """
        results = []
        with self.backend:
            for account in list(self.backend.iter_accounts()):
                # The minimum dict keys for an account are :
                # 'id', 'label', 'balance' and 'type'
                # Retrieve extra information for the account.
                account = self.backend.fillobj(account, ['iban', 'currency'])

                iban = None
                if not empty(account.iban):
                    iban = account.iban
                currency = None
                if not empty(account.currency):
                    currency = unicode(account.currency)

                results.append({
                    'accountNumber': account.id,
                    'title': account.label,
                    'balance': account.balance,
                    'iban': iban,
                    'currency': currency,
                    'type': account.type,
                })

        return results

    def get_operations(self):
        """
        Fetch operations data from Weboob.

        :param backend: The Weboob built backend to fetch data from.

        :returns: A list of dicts representing the available operations.
        """
        results = []
        with self.backend:
            for account in list(self.backend.iter_accounts()):
                # Get all operations for this account.
                nyi_methods = []
                operations = []

                try:
                    operations += list(self.backend.iter_history(account))
                except NotImplementedError:
                    nyi_methods.append('iter_history')

                try:
                    operations += [
                        op for op in self.backend.iter_coming(account)
                        if op.type in [
                            Transaction.TYPE_DEFERRED_CARD,
                            Transaction.TYPE_CARD_SUMMARY
                        ]
                    ]
                except NotImplementedError:
                    nyi_methods.append('iter_coming')

                for method_name in nyi_methods:
                    logging.error(
                        ('%s not implemented for this account: %s.'),
                        method_name,
                        account.id
                    )

                # Build an operation dict for each operation.
                for operation in operations:
                    title = None
                    if not empty(operation.label):
                        title = unicode(operation.label)

                    raw = None
                    if not empty(operation.raw):
                        raw = unicode(operation.raw)
                    elif title:
                        raw = title

                    if raw and not title:
                        title = raw

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
                            raw or "no label"
                        )
                        date = datetime.now()

                    isodate = date.isoformat()
                    debit_date = operation.date.isoformat()

                    results.append({
                        'account': account.id,
                        'amount': operation.amount,
                        'raw': raw,
                        'type': operation.type,
                        'date': isodate,
                        'debit_date': debit_date,
                        'title': title
                    })

        return results

    def fetch(self, which):
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
        described under ``error_code``, ``error_short`` and ``error_message``
        keys.
        """
        results = {}
        try:
            if which == 'accounts':
                results['values'] = self.get_accounts()
            elif which == 'operations':
                results['values'] = self.get_operations()
            else:
                raise Exception('Invalid fetch command.')

        except NoAccountsException:
            results['error_code'] = NO_ACCOUNTS
        except ModuleLoadError:
            results['error_code'] = UNKNOWN_MODULE
        except BrowserPasswordExpired:
            results['error_code'] = EXPIRED_PASSWORD
        except AuthMethodNotImplemented:
            results['error_code'] = AUTH_METHOD_NYI
        except ActionNeeded as exc:
            # This `except` clause is not in alphabetic order and cannot be,
            # because BrowserPasswordExpired and AuthMethodNotImplemented
            # (above) inherits from it in Weboob 1.4.
            results['error_code'] = ACTION_NEEDED
            results['error_message'] = unicode(exc)
        except BrowserIncorrectPassword:
            # This `except` clause is not in alphabetic order and cannot be,
            # because BrowserPasswordExpired (above) inherits from it in
            # Weboob 1.3.
            results['error_code'] = INVALID_PASSWORD
        except Module.ConfigError as exc:
            results['error_code'] = INVALID_PARAMETERS
            results['error_message'] = unicode(exc)
        except ConnectionError as exc:
            results['error_code'] = CONNECTION_ERROR
            results['error_message'] = unicode(exc)
        except Exception as exc:
            fail(
                GENERIC_EXCEPTION,
                'Unknown error: %s.' % unicode(exc),
                traceback.format_exc()
            )

        # Return session information for future use.
        results['session'] = self.storage.dump()

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
            is_prod=is_prod
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
            'username': options.login,
            'password': password,
        }

        if options.field is not None:
            for name, value in options.field:
                if not name:
                    fail_unset_field('Name of custom field')
                if not value:
                    fail_unset_field('Value of custom field')
                params[name] = value

        # Session management.
        session = os.environ.get('KRESUS_WEBOOB_SESSION', '{}')

        try:
            session = json.loads(session)
        except ValueError:
            logging.error('Invalid session stringified JSON, resetting the session.')
            session = dict()

        # Create a Weboob backend, fetch data and delete the module.
        try:
            weboob_connector.create_backend(bank_module, params, session)
        except Module.ConfigError:
            fail(
                INVALID_PARAMETERS,
                "Unable to load module %s." % bank_module,
                traceback.format_exc()
            )

        except ModuleLoadError:
            fail(
                UNKNOWN_MODULE,
                "Unable to load module %s." % bank_module,
                traceback.format_exc()
            )

        content = weboob_connector.fetch(command)
        weboob_connector.delete_backend()

        # Output the fetched data as JSON.
        print(json.dumps(content, cls=KresusEncoder))
        sys.exit()


if __name__ == '__main__':
    main()
