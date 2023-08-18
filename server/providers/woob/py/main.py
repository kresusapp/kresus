#!/usr/bin/env python
"""
Woob main Python wrapper

This file is a wrapper around Woob, which is spawned by Kresus backend and
prints fetched data as a JSON export on stdout, so that it could be imported
easily in Kresus' NodeJS backend.

..note:: Useful environment variables are

    - ``WOOB_DIR`` to specify the path to the root Woob folder (with
    modules and Woob code)
    - ``KRESUS_DIR`` to specify the path to Kresus data dir.
    - ``WOOB_SOURCES_LIST`` to specify a Woob sources.list to use instead
    of the default one.

Commands are parsed from ``argv``. Available commands are:
    * ``version`` to get the Woob version.
    * ``test`` to test Woob is installed and a working connector can be
    built.
    * ``update`` to update Woob modules.
    * ``accounts --module BANK --login LOGIN EXTRA_CONFIG`` to get accounts
    from bank ``BANK`` using the provided credentials and the given extra
    configuration options for the Woob module (passed as --field NAME VALUE,
    NAME being the name of the field and VALUE its value). The password is
    passed by the environment variable ``KRESUS_WOOB_PWD``.
    * ``transactions --module BANK --login LOGIN EXTRA_CONFIG`` to get a list of
    transactions from bank ``BANK`` using the provided credentials and given
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
from datetime import datetime, date
from requests import ConnectionError, HTTPError # pylint: disable=redefined-builtin

# Ensure unicode is also defined in python 3.
try:
    unicode = unicode # pylint: disable=redefined-builtin,invalid-name,self-assigning-variable
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
    if error_long is None:
        error_message = error_short
    else:
        error_message = "%s\n%s" % (error_short, error_long)

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
    '..', '..', '..', 'shared', 'errors.json'
)
with open(ERRORS_PATH, 'r') as f:
    ERRORS = json.load(f)
    ACTION_NEEDED = ERRORS['ACTION_NEEDED']
    AUTH_METHOD_NYI = ERRORS['AUTH_METHOD_NYI']
    UNKNOWN_MODULE = ERRORS['UNKNOWN_WOOB_MODULE']
    INVALID_PASSWORD = ERRORS['INVALID_PASSWORD']
    EXPIRED_PASSWORD = ERRORS['EXPIRED_PASSWORD']
    GENERIC_EXCEPTION = ERRORS['GENERIC_EXCEPTION']
    INVALID_PARAMETERS = ERRORS['INVALID_PARAMETERS']
    NO_ACCOUNTS = ERRORS['NO_ACCOUNTS']
    WOOB_NOT_INSTALLED = ERRORS['WOOB_NOT_INSTALLED']
    INTERNAL_ERROR = ERRORS['INTERNAL_ERROR']
    NO_PASSWORD = ERRORS['NO_PASSWORD']
    CONNECTION_ERROR = ERRORS['CONNECTION_ERROR']
    BROWSER_QUESTION = ERRORS['BROWSER_QUESTION']
    REQUIRES_INTERACTIVE = ERRORS['REQUIRES_INTERACTIVE']
    WAIT_FOR_2FA = ERRORS['WAIT_FOR_2FA']


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


# Put the Woob path at the top of the current python path.
if 'WOOB_DIR' in os.environ and os.path.isdir(os.environ['WOOB_DIR']):
    sys.path.insert(0, os.environ['WOOB_DIR'])

# Import Woob core, and maintain compatibility with the old Weboob name.
#
# Also import classes which have changed names under the same variable name, so
# as to be able to use a single name in our code.

try:
    from woob.core import Woob
    from woob.tools.json import WoobEncoder
    from woob.capabilities.base import empty
    from woob.capabilities.bank import Transaction, NoAccountsException
    from woob.core.repositories import IProgress
    from woob.exceptions import (
        ActionNeeded,
        AuthMethodNotImplemented,
        BrowserIncorrectPassword,
        BrowserPasswordExpired,
        BrowserQuestion,
        ModuleInstallError,
        ModuleLoadError,
        DecoupledValidation,
        NeedInteractiveFor2FA
    )
    from woob.tools.backend import Module
    from woob.tools.log import createColoredFormatter
except ImportError as first_exc:
    try:
        from weboob.core import Weboob as Woob
        from weboob.tools.json import WeboobEncoder as WoobEncoder
        from weboob.capabilities.base import empty
        from weboob.capabilities.bank import Transaction, NoAccountsException
        from weboob.core.repositories import IProgress
        from weboob.exceptions import (
            ActionNeeded,
            AuthMethodNotImplemented,
            BrowserIncorrectPassword,
            BrowserPasswordExpired,
            BrowserQuestion,
            ModuleInstallError,
            ModuleLoadError,
            DecoupledValidation,
            NeedInteractiveFor2FA
        )
        from weboob.tools.backend import Module
        from weboob.tools.log import createColoredFormatter
    except ImportError as exc:
        fail(
            WOOB_NOT_INSTALLED,
            ('Is woob correctly installed? Unknown exception raised:\n%s\n%s.' %
             (unicode(first_exc), unicode(exc))),
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


class DictStorage():
    """
    This class mocks the Woob Storage class.
    """
    def __init__(self, obj):
        self.values = deepcopy(obj)

    def load(self, *args, **kwargs):
        """
        The load method is meaningless when a 'dict' storage is used.
        """
        pass # pylint: disable=unnecessary-pass

    def save(self, *args, **kwargs):
        """
        The save method is meaningless when a 'dict' storage is used.
        """
        pass # pylint: disable=unnecessary-pass

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
        pass # pylint: disable=unnecessary-pass

    def error(self, message): # pylint: disable=no-self-use
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


class KresusEncoder(WoobEncoder): # pylint: disable=all
    """
    JSON Encoder which serializes bytes (cookies for sessions) in python 3.
    """
    def default(self, o):
        if isinstance(o, bytes):
            return o.decode('utf-8')
        return super(KresusEncoder, self).default(o)


class Connector():
    """
    Connector is a tool that connects to common websites like bank website,
    phone operator website... and that grabs personal data from there.
    Credentials are required to make this work.

    Technically, connectors are woob backend wrappers.
    """

    @staticmethod
    def version():
        """
        Get the version of the installed Woob.
        """
        return Woob.VERSION

    def __init__(self, woob_data_path, fakemodules_path, sources_list_content, is_prod):
        """
        Create a Woob instance.

        :param woob_data_path: Woob path to use.
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

        if not os.path.isdir(woob_data_path):
            os.makedirs(woob_data_path)

        # Set woob data directory and sources.list file.
        self.woob_data_path = woob_data_path
        self.woob_backup_path = os.path.normpath('%s.bak' % woob_data_path)
        self.write_woob_sources_list()

        # Create a Woob object.
        self.woob = Woob(workdir=woob_data_path, datadir=woob_data_path)
        self.backend = None
        self.storage = None

        # To make development more pleasant, always copy the fake modules in
        # non-production modes.
        if not is_prod:
            self.copy_fakemodules()

        # Update the woob repos only if new repos are included.
        if self.needs_update:
            self.update()

    def copy_fakemodules(self):
        """
        Copies the fake modules files into the default fakemodules user-data
        directory.

        When Woob updates modules, it might want to write within the
        fakemodules directory, which might not be writable by the current user.
        To prevent this, first copy the fakemodules directory in a directory we
        have write access to, and then use that directory in the sources list
        file.
        """
        fakemodules_src = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fakemodules')
        if os.path.isdir(self.fakemodules_path):
            shutil.rmtree(self.fakemodules_path)
        shutil.copytree(fakemodules_src, self.fakemodules_path)

    def write_woob_sources_list(self):
        """
        Ensure the Woob sources.list file contains the required entries from
        Kresus.
        """
        sources_list_path = os.path.join(self.woob_data_path, 'sources.list')

        # Determine the new content of the sources.list file.
        new_sources_list_content = []
        if self.sources_list_content is not None:
            new_sources_list_content = self.sources_list_content
        else:
            # Default content of the sources.list file.
            new_sources_list_content = [
                unicode('https://updates.woob.tech/%(version)s/main/'),
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

    def backup_data_dir(self):
        """
        Backups modules.
        """
        # shutil.copytree expects the destination path to not exist.
        if os.path.isdir(self.woob_backup_path):
            shutil.rmtree(self.woob_backup_path)

        shutil.copytree(self.woob_data_path, self.woob_backup_path)

    def restore_data_dir(self):
        """
        Restores modules to their initial path.
        """
        if os.path.isdir(self.woob_backup_path):
            # Ensure the target directory is clean.
            if os.path.isdir(self.woob_data_path):
                shutil.rmtree(self.woob_data_path)
            # Replace the invalid data with the backup.
            shutil.move(os.path.join(self.woob_backup_path),
                    self.woob_data_path)

    def clean_data_dir_backup(self):
        """
        Cleans the backup.
        """
        if os.path.isdir(self.woob_backup_path):
            shutil.rmtree(self.woob_backup_path)

    def update(self):
        """
        Update Woob modules.
        """
        self.copy_fakemodules()

        # Woob has an offending print statement when it "Rebuilds index",
        # which happen at every run if the user has a local repository. We need
        # to silence it, hence the temporary redirect of stdout.
        sys.stdout = open(os.devnull, "w")

        # Create the backup before doing anything.
        self.backup_data_dir()

        try:
            self.woob.update(progress=DummyProgress())
        except (ConnectionError, HTTPError) as exc:
            # Do not delete the repository if there is a connection error or the repo has problems.
            raise exc
        except Exception:
            # Try to remove the data directory, to see if it changes a thing.
            # This is especially useful when a new version of Woob is
            # published and/or the keyring changes.
            shutil.rmtree(self.woob_data_path)
            os.makedirs(self.woob_data_path)

            # Recreate the Woob object as the directories are created
            # on creating the Woob object.
            self.woob = Woob(workdir=self.woob_data_path,
                                 datadir=self.woob_data_path)

            # Rewrite sources.list file
            self.write_woob_sources_list()

            # Retry update
            try:
                self.woob.update(progress=DummyProgress())
            except Exception as exc:
                # If it still fails, just restore the previous state.
                self.restore_data_dir()
                # Re-throw the exception so that the user is warned of the problem.
                raise exc
        finally:
            # Restore stdout
            sys.stdout = sys.__stdout__
            # Clean the backup.
            self.clean_data_dir_backup()

    def create_backend(self, modulename, parameters, session):
        """
        Create a Woob backend for a given module, ready to be used to fetch
        data.

        :param modulename: The name of the module from which backend should be
        created.
        :param parameters: A dict of parameters to pass to the module. It
        should at least contain ``login`` and ``password`` fields, but can
        contain additional values depending on the module.
        :param session: an object representing the browser state.
        """
        # Install the module if required.
        repositories = self.woob.repositories
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
        self.backend = self.woob.build_backend(
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
        Fetch accounts data from Woob.

        :param backend: The Woob built backend to fetch data from.

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
                    'vendorAccountId': account.id,
                    'label': account.label,
                    'balance': account.balance,
                    'iban': iban,
                    'currency': currency,
                    'type': account.type,
                })

        return results

    def get_transactions(self, from_date=None):
        """
        Fetch transactions data from Woob.

        :param from_date: The date until (in the past) which the transactions should be fetched.
        Optional, if not provided all transactions are returned.

        :returns: A list of dicts representing the available transactions.
        """
        results = []
        with self.backend:
            for account in list(self.backend.iter_accounts()):
                # Get all transactions for this account.
                nyi_methods = []
                transactions = []

                try:
                    for hist_tr in self.backend.iter_history(account):
                        transactions.append(hist_tr)

                        # Ensure all the dates are datetime objects, so that we can compare them.
                        tr_date = hist_tr.date
                        if isinstance(tr_date, date):
                            tr_date = datetime(tr_date.year, tr_date.month, tr_date.day)

                        tr_rdate = hist_tr.rdate
                        if isinstance(tr_rdate, date):
                            tr_rdate = datetime(tr_rdate.year, tr_rdate.month, tr_rdate.day)

                        if tr_rdate and tr_rdate > tr_date:
                            tr_date = tr_rdate

                        if from_date and tr_date and tr_date < from_date:
                            logging.debug(
                                'Stopped fetch because transaction date (%s) is before from_date (%s)',
                                tr_date.isoformat(),
                                from_date.isoformat()
                            )
                            break

                except NotImplementedError:
                    nyi_methods.append('iter_history')

                try:
                    transactions += [
                        tr for tr in self.backend.iter_coming(account)
                        if tr.type in [
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

                # Build a transaction dict for each transaction.
                for t in transactions:
                    label = None
                    if not empty(t.label):
                        label = unicode(t.label)

                    raw_label = None
                    if not empty(t.raw):
                        raw_label = unicode(t.raw)
                    elif label:
                        raw_label = label

                    if raw_label and not label:
                        label = raw_label

                    # Handle date
                    if t.rdate:
                        # Use date of the payment (real date) if available.
                        tr_date = t.rdate
                    elif t.date:
                        # Otherwise, use debit date, on the bank statement.
                        tr_date = t.date
                    else:
                        logging.error(
                            'No known date property in transaction line: %s.',
                            raw_label or "no label"
                        )
                        tr_date = datetime.now()

                    isodate = tr_date.isoformat()
                    debit_date = t.date.isoformat()

                    results.append({
                        'account': account.id,
                        'amount': t.amount,
                        'rawLabel': raw_label,
                        'type': t.type,
                        'date': isodate,
                        'debit_date': debit_date,
                        'label': label
                    })

        return results

    def fetch(self, which, from_date=None):
        """
        Wrapper to fetch data from the Woob connector.

        This wrapper fetches the required data from Woob and returns it. It
        handles the translation between Woob exceptions and Kresus error
        codes stored in the JSON response.

        :param which: The type of data to fetch. Can be either ``accounts`` or
        ``transactions``.

        :param from_date: The date until (in the past) which the transactions should be fetched.
        Optional, if not provided all transactions are returned.

        :returns: A dict of the fetched data, in a ``values`` keys. Errors are
        described under ``error_code``, ``error_short`` and ``error_message``
        keys.
        """
        results = {}
        try:
            if which == 'accounts':
                results['values'] = self.get_accounts()
            elif which == 'transactions':
                results['values'] = self.get_transactions(from_date)
            else:
                raise Exception('Invalid fetch command.')

        except NoAccountsException as exc:
            results['error_code'] = NO_ACCOUNTS
            results['error_message'] = unicode(exc)
        except ModuleLoadError as exc:
            results['error_code'] = UNKNOWN_MODULE
            results['error_message'] = unicode(exc)
        except BrowserPasswordExpired as exc:
            results['error_code'] = EXPIRED_PASSWORD
            results['error_message'] = unicode(exc)
        except BrowserQuestion as question:
            results['action_kind'] = "browser_question"
            # Fields are Woob Value()s: has fields id/label?/description.
            results['fields'] = [{"id": f.id, "label": f.label} for f in question.fields]
        except AuthMethodNotImplemented as exc:
            results['error_code'] = AUTH_METHOD_NYI
            results['error_message'] = unicode(exc)
        except ActionNeeded as exc:
            # This `except` clause is not in alphabetic order and cannot be,
            # because BrowserPasswordExpired and AuthMethodNotImplemented
            # (above) inherits from it in Woob 1.4.
            results['error_code'] = ACTION_NEEDED
            results['error_message'] = unicode(exc)
        except BrowserIncorrectPassword as exc:
            # This `except` clause is not in alphabetic order and cannot be,
            # because BrowserPasswordExpired (above) inherits from it in
            # Woob 1.3.
            results['error_code'] = INVALID_PASSWORD
            results['error_message'] = unicode(exc)
        except NeedInteractiveFor2FA as exc:
            results['error_code'] = REQUIRES_INTERACTIVE
            results['error_message'] = unicode(exc)
        except DecoupledValidation as validation:
            results['action_kind'] = "decoupled_validation"
            results['message'] = unicode(validation.message)
            results['fields'] = []
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
                        choices=['test', 'version', 'transactions', 'accounts'],
                        help='The command to be executed by the script')
    parser.add_argument('--module', help="The Woob module name.")
    parser.add_argument('--login', help="The login for the access.")
    parser.add_argument('--field', nargs=2, action='append',
                        help="Custom fields. Can be set several times.",
                        metavar=('NAME', 'VALUE'))
    parser.add_argument('--fromDate', help="An optional datetime (UNIX timestamp in seconds) until "
                        "which the transactions fetch must happen.")
    parser.add_argument('--debug', action='store_true',
                        help="If set, the debug mode is activated.")
    parser.add_argument('--interactive', action='store_true',
                        help="If set, this is an interactive update with the user.")
    parser.add_argument('--resume', action='store_true',
                        help="If set, will resume with 2fa.")
    parser.add_argument(
        '--update', action='store_true',
        help=("If set, the repositories will be updated prior to command "
              "accounts or transactions.")
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
            "KRESUS_DIR must be set to use Woob.",
            traceback.format_exc()
        )

    sources_list_content = None
    if (
            'WOOB_SOURCES_LIST' in os.environ and
            os.path.isfile(os.environ['WOOB_SOURCES_LIST'])
    ):
        # Read the new content from the sources.list provided as env
        # variable.
        with io.open(os.environ['WOOB_SOURCES_LIST'], encoding="utf-8") as fh:
            sources_list_content = fh.read().splitlines()

    # Build a Woob connector.
    try:
        woob_connector = Connector(
            woob_data_path=os.path.join(kresus_dir, 'woob-data'),
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
            WOOB_NOT_INSTALLED,
            ('Is woob installed? Unknown exception raised: %s.' %
             unicode(exc)),
            traceback.format_exc()
        )

    # Handle the command and output the expected result on standard output, as
    # JSON encoded string.
    command = options.command
    if command == 'version':
        # Return Woob version.
        obj = {
            'values': woob_connector.version()
        }
        print(json.dumps(obj))
        sys.exit()

    if options.update:
        # Update Woob modules.
        try:
            woob_connector.update()
        except ConnectionError as exc:
            fail(
                CONNECTION_ERROR,
                'Exception when updating woob: %s.' % unicode(exc),
                traceback.format_exc()
            )
        except Exception as exc:
            fail(
                GENERIC_EXCEPTION,
                'Exception when updating woob: %s.' % unicode(exc),
                traceback.format_exc()
            )

    if command == 'test':
        # Do nothing, just check we arrived so far.
        print(json.dumps({}))
        sys.exit()

    if command in ['accounts', 'transactions']:
        if not options.module:
            fail_unset_field('Module')

        if not options.login:
            fail_unset_field('Login')

        password = os.environ.get('KRESUS_WOOB_PWD', None)

        if not password:
            fail_unset_field('Password', error_type=NO_PASSWORD)

        # Format parameters for the Woob connector.
        bank_module = options.module

        params = {
            'login': options.login,
            'username': options.login,
            'password': password
        }

        if options.interactive:
            params['request_information'] = True

        if options.resume:
            params['resume'] = True

        if options.fromDate:
            params['from_date'] = datetime.fromtimestamp(float(options.fromDate))

        if options.field is not None:
            for name, value in options.field:
                if not name:
                    fail_unset_field('Name of custom field')
                if value:
                    params[name] = value
                else:
                    logging.warning('No value specified for custom field %s', name)

        # Session management.
        session = os.environ.get('KRESUS_WOOB_SESSION', '{}')

        try:
            session = json.loads(session)
        except ValueError:
            logging.error('Invalid session stringified JSON, resetting the session.')
            session = dict()

        # Create a Woob backend, fetch data and delete the module.
        try:
            woob_connector.create_backend(bank_module, params, session)
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

        content = woob_connector.fetch(command, params.get('from_date'))
        woob_connector.delete_backend()

        # Output the fetched data as JSON.
        print(json.dumps(content, cls=KresusEncoder))
        sys.exit()


if __name__ == '__main__':
    main()
