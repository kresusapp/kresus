# -*- coding: utf-8 -*-
"""
Fake Woob module with capability CapBank.
"""
from __future__ import unicode_literals

import datetime
import random
import time
from decimal import Decimal

try:
    from woob.core.ouiboube import WoobBase
    from woob.capabilities.bank import Currency
    from woob.capabilities.bank import CapBank, Account, Transaction, NoAccountsException
    from woob.capabilities.base import empty
    from woob.exceptions import (
        ActionNeeded,
        AuthMethodNotImplemented,
        AppValidation,
        BrowserIncorrectPassword,
        BrowserPasswordExpired,
        BrowserQuestion,
        ModuleInstallError,
        ModuleLoadError
    )
    from woob.tools.backend import Module, BackendConfig
    from woob.tools.value import ValueBackendPassword, Value, ValueTransient
    from woob.browser.browsers import LoginBrowser, need_login
except ImportError:
    from weboob.core.ouiboube import WebNip as WoobBase
    from weboob.capabilities.bank import Currency
    from weboob.capabilities.bank import CapBank, Account, Transaction, NoAccountsException
    from weboob.capabilities.base import empty
    from weboob.exceptions import (
        ActionNeeded,
        AuthMethodNotImplemented,
        AppValidation,
        BrowserIncorrectPassword,
        BrowserPasswordExpired,
        BrowserQuestion,
        ModuleInstallError,
        ModuleLoadError
    )
    from weboob.tools.backend import Module, BackendConfig
    from weboob.tools.value import ValueBackendPassword, Value, ValueTransient
    from weboob.browser.browsers import LoginBrowser, need_login


__all__ = ['FakeBankModule']


class GenericException(Exception):
    """
    A generic exception that we could miss to catch.
    """
    pass # pylint: disable=unnecessary-pass


TriedImportError = False


CREDIT_CARD_ACCOUNT_ID = 'CREDITCARD@fakebank'

class FakeStateBrowser(LoginBrowser):
    """
    A Login browser which supports the export of the session.
    """

    def do_login(self):
        """Our fake user is always logged in."""

    def dump_state(self):
        """
        A method allowing to dump the state of the browser.
        """
        return {'password': self.password}

class FakeBrowser(LoginBrowser): # pylint: disable=too-few-public-methods
    """
    A Login browser which does not support the export of the session.
    """

    def do_login(self):
        """Our fake user is always logged in."""


class FakeBankModule(Module, CapBank):
    """
    A Fake Woob module relying on CapBank capability.
    """
    NAME = 'fakewoobbank'
    MAINTAINER = u'Phyks'
    EMAIL = 'phyks@phyks.me'
    VERSION = WoobBase.VERSION
    DESCRIPTION = u'Fake bank module'
    LICENSE = 'AGPLv3+'
    CONFIG = BackendConfig(
        ValueBackendPassword('login', label='Identifiant', masked=False),
        ValueBackendPassword('password', label='Code personnel'),
        Value('website', label='Type de compte', default='par',
              choices={'par': 'Particuliers',
                       'pro': 'Professionnels'},
              required=True),
        Value('foobar', label='Ce que vous voulez', required=False),
        Value('secret', label='Valeur top sikrète', required=True, masked=True),
        ValueTransient('code', label="Secret code 2fa"),
        ValueTransient('resume', label="App validation 2fa")
    )
    BROWSER = None

    def create_default_browser(self):
        """
        Create a fake browser with or without a session manager.
        """
        login = self.config['login'].get()
        if login == 'session':
            klass = FakeStateBrowser
        else:
            klass = FakeBrowser

        return self.create_browser(login, self.config['password'].get(), klass=klass)

    @staticmethod
    def random_errors(rate):
        """
        Generate random errors, at a given rate.

        :param rate: Rate at which errors should be generated.
        """
        n = random.randrange(100)

        # Once per module instanciation, try a 2% rate import error.
        global TriedImportError  # pylint: disable=global-statement
        if not TriedImportError:
            TriedImportError = True
            if n < 2:
                import NotExistingModule  # pylint: disable=import-error,import-outside-toplevel,unused-variable,unused-import

        # With a probability of rate%, raise an exception.
        if n >= rate:
            return

        possible_errors = [
            ActionNeeded,
            BrowserIncorrectPassword,
            BrowserPasswordExpired,
            NoAccountsException,
            ModuleInstallError,
            NotImplementedError,
            GenericException,
            ModuleLoadError('FakeWoobBank', 'Random error'),
            AuthMethodNotImplemented,
            Exception,
        ]

        raise possible_errors[random.randrange(len(possible_errors))]

    def maybe_generate_error(self, rate):
        """
        Generate an error according to login and random rate.

        If login is a specific login matching an error type
        (``invalidpassword``, ``actionneeded``, ``expiredpassword``),
        systematically trigger the matching error. If login is ``noerror``,
        never throw any error. In all other cases, throw a random error
        according to given rate.

        :param rate: Rate at which the errors should be generated.
        """
        login = self.config['login'].get()

        if login == 'invalidpassword':
            raise BrowserIncorrectPassword
        if login == 'actionneeded':
            raise ActionNeeded
        if login == 'expiredpassword':
            raise BrowserPasswordExpired
        if login == 'authmethodnotimplemented':
            raise AuthMethodNotImplemented
        if login == 'appvalidation' and self.config.get('resume', Value()).get() is None:
            raise AppValidation("Please confirm login!")
        if login == '2fa' and self.config.get('code', Value()).get() is None:
            raise BrowserQuestion(Value('code', label="Please enter some fake 2fa code!"))
        if login not in ['noerror', 'session', 'appvalidation', '2fa']:
            self.random_errors(rate)

    def do_login(self):
        """
        Simulates a login.
        """
        self.browser.do_login()

    @need_login
    def iter_accounts(self):
        """
        Generates accounts.
        """
        # Throw error from password value or random error
        self.maybe_generate_error(8)

        accounts = []

        first_account = Account()
        first_account.id = 'FR235711131719@fakebank'
        first_account.label = 'Compte chèque'
        first_account.currency = Currency.get_currency('42 €')
        first_account.iban = 'FR235711131719'
        first_account.balance = Decimal(random.uniform(0, 150)).quantize(Decimal('.01'))
        first_account.type = Account.TYPE_CHECKING
        accounts.append(first_account)

        second_account = Account()
        second_account.id = 'dollars@fakebank'
        second_account.label = 'Compte en dollars'
        second_account.currency = Currency.get_currency('$42')
        second_account.balance = Decimal(500.0)
        second_account.type = Account.TYPE_SAVINGS
        accounts.append(second_account)

        third_account = Account()
        third_account.id = 'livretA@fakebank'
        third_account.label = 'Livret A'
        third_account.balance = Decimal(0.0)
        third_account.type = Account.TYPE_SAVINGS
        accounts.append(third_account)

        fourth_account = Account()
        fourth_account.id = CREDIT_CARD_ACCOUNT_ID
        fourth_account.label = 'Debit Card'
        fourth_account.balance = Decimal(0.0)
        fourth_account.type = Account.TYPE_CARD
        accounts.append(fourth_account)

        return accounts

    def fill_account(self, account, fields):  # pylint: disable=no-self-use
        """
        Fills the empty fields of an account.
        """
        if 'iban' in fields and empty(account.iban):
            account.iban = 'Filled Iban'
        return account

    OBJECTS = {Account: fill_account}

    @staticmethod
    def generate_date(min_date, max_date):
        """
        Generate a date between given lower and upper bounds.

        :param min_date: The minimum date to be used. Instance of date.
        :param max_date: The maximum date to be used. Instance of date.
        """

        return datetime.datetime.fromtimestamp(
            random.randint(
                int(time.mktime(min_date.timetuple())),
                int(time.mktime(max_date.timetuple()))
            )
        )

    @staticmethod
    def generate_type():
        """
        Generate a random transaction type.
        """
        return random.choice([
            Transaction.TYPE_UNKNOWN,
            Transaction.TYPE_TRANSFER,
            Transaction.TYPE_ORDER,
            Transaction.TYPE_CHECK,
            Transaction.TYPE_DEPOSIT,
            Transaction.TYPE_PAYBACK,
            Transaction.TYPE_WITHDRAWAL,
            Transaction.TYPE_CARD,
            Transaction.TYPE_LOAN_PAYMENT,
            Transaction.TYPE_BANK,
            Transaction.TYPE_CASH_DEPOSIT,
            Transaction.TYPE_CARD_SUMMARY
        ])

    @staticmethod
    def generate_label(positive=False):
        """
        Generate a random label.
        """
        if positive:
            return random.choice([
                ('VIR Nuage Douillet', 'VIR Nuage Douillet REFERENCE Salaire'),
                ('Impots', 'Remboursement impots en votre faveur'),
                ('', 'VIR Pots de vin et magouilles pas claires'),
                ('Case départ', 'Passage par la case depart'),
                ('Assurancetourix',
                 'Remboursement frais médicaux pour plâtre généralisé')
            ])
        return random.choice([
            ('Café Moxka', 'Petit expresso rapido Café Moxka'),
            ('MerBnB', 'Paiement en ligne MerBNB'),
            ('Tabac Debourg', 'Bureau de tabac SARL Clopi Cloppa'),
            ('Rapide PSC', 'Paiement sans contact Rapide'),
            ('MacDollars PSC', 'Paiement sans contact Macdollars'),
            ('FNAK', 'FNAK CB blabla'),
            ('CB Sefaurat', 'Achat de parfum chez Sefaurat'),
            ('Polyprix CB', 'Courses chez Polyprix'),
            ('Croisement CB', 'Courses chez Croisement'),
            ('PRLV UJC', 'PRLV UJC'),
            ('CB Spotifaille', 'CB Spotifaille London'),
            ('Antiquaire', 'Antiquaire'),
            ('Le Perroquet Bourré', 'Le Perroquet Bourré SARL'),
            ('Le Vol de Nuit', 'Bar Le Vol De Nuit SARL'),
            ('Impots fonciers',
             'Prelevement impots fonciers reference 47839743892'),
            ('ESPA Carte Hassan Cehef', 'Paiement carte Hassan Cehef'),
            ('Indirect Energie', 'ESPA Indirect Energie SARL'),
            ('', 'VIR Mr Jean Claude Dusse'),
            ('Nuage Douillet', 'ESPA Abonnement Nuage Douillet'),
            ('Glagla Frigidaire', 'CB GLAGLA FRIGIDAIRE'),
            ('Digiticable', 'ESPA Digiticable'),
            ('NOGO Sport', 'CB NOGO Sport'),
            ('FramaHard', 'ESPA Don FramaHard'),
            ('Sergent Tchoutchou', 'CB online Sergent Tchoutchou'),
            ('RAeTP', 'CB Raleurs Ambulants et Traficoteurs Patentés')
        ])

    def generate_single_transaction(self):
        """
        Generate a fake transaction.
        """
        now = datetime.datetime.now()

        transaction = Transaction()
        transaction.type = self.generate_type()

        n = random.randrange(100)
        if n < 2:
            # with a 2% rate, generate a special transaction to test duplicates
            # (happening on 4th of current month).
            duplicate_date = datetime.datetime(now.year, now.month, 4)
            transaction.amount = Decimal(-300.0)
            transaction.label = "Loyer"
            transaction.raw = "Loyer habitation"
            transaction.date = self.generate_date(duplicate_date, duplicate_date)
            return transaction

        # Get transactions for the previous month.
        min_date = now - datetime.timedelta(days=30)

        transaction.date = self.generate_date(min_date, now)

        if n < 15:
            transaction.label, transaction.raw = self.generate_label(
                positive=True
            )
            transaction.amount = Decimal(
                random.randint(100, 800) + random.random()
            ).quantize(Decimal('.01'))
            return transaction

        if n < 30:
            transaction.rdate = transaction.date
        elif n < 60:
            transaction.rdate = None

        transaction.amount = Decimal(
            random.randint(-60, 0) + random.random()
        ).quantize(Decimal('.01'))
        transaction.label, transaction.raw = self.generate_label()
        transaction.type = self.generate_type()

        # Randomly set the date properties to date class instead of datetime.
        maybe_date_object = random.randrange(3)
        if maybe_date_object == 0:
            transaction.date = transaction.date.date()

        if maybe_date_object == 1 and transaction.rdate:
            transaction.rdate = transaction.rdate.date()

        return transaction

    @need_login
    def iter_history(self, account): # pylint: disable=unused-argument
        """
        Returns transactions with a debit date in the past.
        """
        # Throw error from password value or random error
        self.maybe_generate_error(5)

        transactions = []

        # Generate some transactions
        for _ in range(random.randrange(15)):
            transactions.append(self.generate_single_transaction())

        return transactions

    def iter_coming(self, account):
        """
        Return transactions with debit date later than today.
        """
        comings = []

        if account.id == CREDIT_CARD_ACCOUNT_ID:
            today = datetime.datetime.now()
            min_date = today + datetime.timedelta(days=1)
            max_date = today + datetime.timedelta(days=30)

            for transaction in self.iter_history(account):
                transaction.rdate = transaction.date
                transaction.date = self.generate_date(min_date, max_date)
                transaction.type = Transaction.TYPE_DEFERRED_CARD

                comings.append(transaction)

        return comings
