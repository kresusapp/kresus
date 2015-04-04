from weboob.core.modules import ModuleLoadError
from weboob.exceptions import BrowserIncorrectPassword

from connector import Connector

import sys

def EnsurePrint(wat):
    try:
        print wat
        return wat
    except:
        wat = unicode(wat).encode('utf-8')
        print wat

class BaseBankHandler(object):
    '''
    Base class to handle utility methods.
    '''

    def __init__(self, login, password, website = None):
        self.login = login
        self.password = password
        self.website = website

    def load_from_connector(self, name, method_name):
        '''
        Load given connector (name) and apply the given method on it.
        Supported method: get_accounts and get_history.

        Expected fields:

        * login
        * password
        * website (optional)
        '''
        params_connector = {
            'login': self.login,
            'password': self.password,
        }

        if self.website is not None:
            params_connector['website'] = self.website

        try:
            connector = Connector(name, params_connector)
            results = {}
            callback = getattr(connector, method_name)
            results[name] = callback()
        except ModuleLoadError:
            raise Exception("Could not load module: %s" % name)
        except BrowserIncorrectPassword:
            raise Exception("Wrong credentials")
        except Exception as e:
            EnsurePrint(unicode(e))
            raise Exception("Something went wrong (weboob modules should "
                            "probably be updated)")

        return results


class BankHandler(BaseBankHandler):
    """
    This handler is dedicated to retrieve data from bank accounts.
    """

    def post(self, name):
        """
        Grab data about all accounts from a given bank identifier.

        Bank type is given as URL parameter, credentials are given in body.
        For available bank type check: http://weboob.org/modules
        """

        return self.load_from_connector(name, 'get_balances')


class BankHistoryHandler(BaseBankHandler):
    """
    This handler is dedicated to retrieve transaction history of bank accounts.
    """


    def post(self, name):
        """
        Grab history of all accounts from a given bank identifier.

        Bank type is given as URL parameter, credentials are given in body.
        For available bank type check: http://weboob.org/modules
        """
        return self.load_from_connector(name, 'get_history')
