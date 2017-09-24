# -*- coding: utf-8 -*-
# Copyright(C) 2010-2013  Romain Bignon, Pierre Mazière
#
# This file is part of weboob.
#
# weboob is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# weboob is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with weboob. If not, see <http://www.gnu.org/licenses/>.
from __future__ import unicode_literals

import copy
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


# With 2% rate, import a non-existing module
n = random.randrange(100)
if n < 2:
    import NotExistingModule


class GenericException(Exception):
    """
    A generic exception that we could miss to catch.
    """
    pass


class FakeBankModule(Module, CapBank):
    NAME = 'fakeweboobbank'
    MAINTAINER = u'Phyks'
    EMAIL = 'phyks@phyks.me'
    VERSION = WebNip.VERSION
    DESCRIPTION = u'Fake bank module'
    LICENSE = 'AGPLv3+'
    CONFIG = BackendConfig(ValueBackendPassword('login',    label='Identifiant', masked=False),
                           ValueBackendPassword('password', label='Code personnel'),
                           Value('website', label='Type de compte', default='par',
                                 choices={'par': 'Particuliers',
                                          'pro': 'Professionnels'
                                         }),
                           Value('foobar', label='Whatever you want',
                                 default='')
                          )
    BROWSER = None

    def random_errors(self):
        for exc in [
                ActionNeeded,
                BrowserIncorrectPassword,
                BrowserPasswordExpired,
                NoAccountsException,
                ModuleInstallError,
                NotImplementedError,
                GenericException,
                Exception
        ]:
            # With 2% rate, raise an exception
            n = random.randrange(100)
            if n < 2:
                raise exc('Random error')
        # Raise a ModuleLoadError with 2% rate
        n = random.randrange(100)
        if n < 2:
            raise ModuleLoadError('FakeWeboobBank', 'Random error')

    def iter_accounts(self):
        # Throw random errors
        self.random_errors()

        accounts = []

        first_account = Account()
        first_account.id = 'FR235711131719@fakebank'
        first_account.label = 'Compte chèque'
        first_account.currency = Currency.get_currency('42 €')
        first_account.iban = 'FR235711131719'
        first_account.balance = random.uniform(0, 150)
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

    def generate_date(self, low_day, high_day, low_month, high_month):
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

    def generate_type(self):
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

    def generate_label(self, positive=False):
        if positive:
            return random.choice([
                ('VIR Nuage Douillet', 'VIR Nuage Douillet REFERENCE Salaire'),
                ('Impots', 'Remboursement impots en votre faveur'),
                ('', 'VIR Pots de vin et magouilles pas claires'),
                ('Case départ', 'Passage par la case depart'),
                ('Assurancetourix', 'Remboursement frais médicaux pour plâtre généralisé')
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
             'Prelevement impots fonciers numero reference 47839743892 client 43278437289'),
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

        transaction.date = self.generate_date(1, now.day, 1, now.month - 1)

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
            transaction.date = None
            transaction.rdate = None

        transaction.amount = Decimal(random.randint(-60, 0) + random.random())
        transaction.label, transaction.raw = self.generate_label()
        transaction.type = self.generate_type()
        return transaction

    def iter_history(self, account):
        # Throw random errors
        self.random_errors()

        transactions = []

        # Generate some transactions
        for _ in range(random.randrange(15)):
            transactions.append(self.generate_single_transaction())

        # Generate a duplicate operation
        n = random.randrange(100)
        if n > 70:
            # Create two transactions identical with one day between them
            duplicate_transaction = Transaction()
            duplicate_transaction.amount = Decimal(13.37)
            duplicate_transaction.label = 'This is a duplicate operation'
            duplicate_transaction.raw = 'This is a duplicate operation'
            duplicate_transaction.date = datetime.datetime.now()
            transactions.append(copy.copy(duplicate_transaction))
            duplicate_transaction.date -= datetime.timedelta(days=1)
            transactions.append(duplicate_transaction)

        # Sometimes generate a very old operation, probably older than the
        # oldest one, to trigger balance resync
        n = random.randrange(100)
        if n > 90:
            old_transaction = Transaction()
            old_transaction.label = 'Ye Olde Transaction'
            old_transaction.raw = 'Ye Olde Transaction - for #413 testing'
            old_transaction.amount = Decimal(42.12)
            old_transaction.date = datetime.datetime.strptime(
                '01/01/2000',
                '%d/%m/%Y'
            )
            transactions.append(old_transaction)

        return transactions
