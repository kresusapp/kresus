from weboob.core.modules import ModuleLoadError
from weboob.exceptions import BrowserIncorrectPassword, BrowserPasswordExpired
from weboob.tools.backend import Module

from connector import Connector

import sys, json

with file('../iso/errors.json') as f:
    j = json.loads(f.read())
    UNKNOWN_MODULE =     j["UNKNOWN_WEBOOB_MODULE"]
    INVALID_PASSWORD =   j["INVALID_PASSWORD"]
    EXPIRED_PASSWORD =   j["EXPIRED_PASSWORD"]
    GENERIC_EXCEPTION =  j["GENERIC_EXCEPTION"]
    INVALID_PARAMETERS = j['INVALID_PARAMETERS']


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

        results = {}
        try:
            connector = Connector(name, params_connector)
            results[name] = self.get_content(connector)
        except ModuleLoadError:
            results['error_code'] = UNKNOWN_MODULE
        except BrowserIncorrectPassword:
            results['error_code'] = INVALID_PASSWORD
        except BrowserPasswordExpired:
            results['error_code'] = EXPIRED_PASSWORD
        except Module.ConfigError as e:
            results['error_code'] = INVALID_PARAMETERS
            results['error_content'] = unicode(e)
        except Exception as e:
            print >> sys.stderr, "Unknown error of type %s" % str(type(e))
            results['error_code'] = GENERIC_EXCEPTION
            results['error_content'] = unicode(e)

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
