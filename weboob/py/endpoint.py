from weboob.core.modules import ModuleLoadError
from weboob.exceptions import BrowserIncorrectPassword

from connector import Connector

import sys, json

class BaseBankHandler(object):
    '''
    Base class to handle utility methods.
    '''

    def __init__(self, login, password, website = None):
        self.login = login
        self.password = password
        self.website = website

    def load_from_connector(self, name):
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
            results[name] = self.get_content(connector)
        except ModuleLoadError:
            raise Exception("Could not load module: %s" % name)
        except BrowserIncorrectPassword:
            raise Exception("Wrong credentials")
        except Exception as e:
            raise Exception("Unexpected Weboob error: %s" % unicode(e))

        return results


class BankHandler(BaseBankHandler):
    """
    This handler is dedicated to retrieve data from bank accounts.
    """

    def get_content(self, connector):
        return connector.get_balances()

    def post(self, name):
        """
        Grab data about all accounts from a given bank identifier.

        Bank type is given as URL parameter, credentials are given in body.
        For available bank type check: http://weboob.org/modules
        """
        return self.load_from_connector(name)


class BankHistoryHandler(BaseBankHandler):
    """
    This handler is dedicated to retrieve transaction history of bank accounts.
    """

    def get_content(self, connector):
        return connector.get_history()

    def post(self, name):
        """
        Grab history of all accounts from a given bank identifier.

        Bank type is given as URL parameter, credentials are given in body.
        For available bank type check: http://weboob.org/modules
        """
        return self.load_from_connector(name)

# Arguments format: {'account' | 'history'} bankuuid login password maybe_website

args = []
requested_content = None
for l in sys.stdin:
    if requested_content is None:
        requested_content = l.strip()
        continue
    args.append(l.strip())

if len(args) < 3:
    print('missing arguments')
    quit()

bankuuid = args[0]
id = args[1]
password = args[2]
website = None
if len(args) == 4:
    website = args[3]

content = None
if requested_content == 'account':
    content = BankHandler(id, password, website).post(bankuuid)
elif requested_content == 'history':
    content = BankHistoryHandler(id, password, website).post(bankuuid)

assert(content is not None)
print json.dumps(content, ensure_ascii=False).encode('utf-8')
