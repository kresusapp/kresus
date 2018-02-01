# -*- coding: utf-8 -*-
"""
Fake Weboob module with capability CapBank.
"""
from __future__ import unicode_literals

import datetime
import random
import time
from decimal import Decimal

from weboob.core.ouiboube import WebNip
from weboob.capabilities.bank import Currency
from weboob.capabilities.bank import CapBank, Account, Transaction
from weboob.exceptions import (
    ActionNeeded,
    BrowserIncorrectPassword,
    BrowserPasswordExpired,
    NoAccountsException,
    ModuleInstallError,
    ModuleLoadError
)
from weboob.tools.backend import Module, BackendConfig
from weboob.tools.value import ValueBackendPassword, Value

__all__ = ['FakeBankModule']


class GenericException(Exception):
    """
    A generic exception that we could miss to catch.
    """
    pass


TriedImportError = False


class FakeBankModule(Module, CapBank):
    """
    A Fake Weboob module relying on CapBank capability.
    """
    NAME = 'fakeweboobbank'
    MAINTAINER = u'Phyks'
    EMAIL = 'phyks@phyks.me'
    VERSION = WebNip.VERSION
    DESCRIPTION = u'Fake bank module'
    LICENSE = 'AGPLv3+'
    CONFIG = BackendConfig(
        ValueBackendPassword('login', label='Identifiant', masked=False),
        ValueBackendPassword('password', label='Code personnel'),
        Value('website', label='Type de compte', default='par',
              choices={'par': 'Particuliers',
                       'pro': 'Professionnels'},
              required=True),
        Value('trucmuche', label='Ce que vous voulez', default='')
    )
    BROWSER = None

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
                import NotExistingModule  # pylint: disable=import-error,unused-variable

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
            ModuleLoadError('FakeWeboobBank', 'Random error'),
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
        if login != 'noerror':
            self.random_errors(rate)

    def iter_accounts(self):
        # Throw error from password value or random error
        self.maybe_generate_error(8)

        accounts = []

        first_account = Account()
        first_account.id = 'FR235711131719@fakebank'
        first_account.label = 'Compte chèque'
        first_account.currency = Currency.get_currency('42 €')
        first_account.iban = 'FR235711131719'
        first_account.balance = Decimal(random.uniform(0, 150))
        accounts.append(first_account)

        second_account = Account()
        second_account.id = 'livretA@fakebank'
        second_account.label = 'Livret A'
        second_account.currency = Currency.get_currency('$42')
        second_account.balance = Decimal(500.0)
        accounts.append(second_account)

        third_account = Account()
        third_account.id = 'PEL@fakebank'
        third_account.label = 'Plan Epargne Logement'
        third_account.balance = Decimal(0.0)
        accounts.append(third_account)

        return accounts

    @staticmethod
    def generate_date(low_day, high_day, low_month, high_month):
        """
        Generate a date between given lower and upper bounds.

        :param low_day: Day for the lower bound.
        :param high_day: Day for the upper bound.
        :param low_month: Month for the lower bound.
        :param high_month: Month for the upper bound.
        """
        year = datetime.datetime.now().year
        low = datetime.datetime.strptime(
            '%d/%d/%d' % (low_day, low_month, year),
            '%d/%m/%Y'
        )
        high = datetime.datetime.strptime(
            '%d/%d/%d' % (high_day, high_month, year),
            '%d/%m/%Y'
        )
        return datetime.datetime.fromtimestamp(
            random.randint(
                int(time.mktime(low.timetuple())),
                int(time.mktime(high.timetuple()))
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
            Transaction.TYPE_CARD_SUMMARY,
            Transaction.TYPE_DEFERRED_CARD
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
            # with a 2% rate, generate a special operation to test duplicates
            # (happening on 4th of current month).
            transaction.amount = Decimal(-300.0)
            transaction.label = "Loyer"
            transaction.raw = "Loyer habitation"
            transaction.date = self.generate_date(4, 4, now.month, now.month)
            return transaction

        transaction.date = self.generate_date(1, min(now.day, 28), 1, max(1, now.month - 1))

        if n < 15:
            transaction.label, transaction.raw = self.generate_label(
                positive=True
            )
            transaction.amount = Decimal(
                random.randint(100, 800) + random.random()
            )
            return transaction

        if n < 30:
            transaction.rdate = transaction.date
        elif n < 60:
            transaction.rdate = None

        transaction.amount = Decimal(random.randint(-60, 0) + random.random())
        transaction.label, transaction.raw = self.generate_label()
        transaction.type = self.generate_type()
        return transaction

    def iter_history(self, account):
        # Throw error from password value or random error
        self.maybe_generate_error(5)

        transactions = []

        # Generate some transactions
        for _ in range(random.randrange(15)):
            transactions.append(self.generate_single_transaction())

        return transactions
