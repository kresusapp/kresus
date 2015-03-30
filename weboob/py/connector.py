from weboob.core import WebNip

DATETIME_FORMAT = "%Y-%m-%dT%H:%M:%SZ"

class Connector(object):
    '''
    Connector is a tool that connects to common websites like bank website,
    phone operator website... and that grabs personal data from there.
    Credentials are required to make this operation.

    Technically, connectors are weboob backend wrappers.
    '''

    def __init__(self, connector, parameters):
        '''
        Constructor: initialize connector, set up the weboob backend.
        '''
        weboob = WebNip()
        self.backend = weboob.build_backend(connector, parameters)

    def get_balances(self):
        '''
        Grab results returned by connector after activation.

        Issue: connectors are blocking, they should not.
        '''
        results = []
        for account in self.backend.iter_accounts():
            results.append({
                "accountNumber": account.id,
                "label": account.label,
                "balance": unicode(account.balance)
            })
        return results

    def get_history(self):
        '''
        Return accounts history. It takes all the resutl it can scrap
        on the given website.
        '''
        results = []
        for account in self.backend.iter_accounts():
            try:
                for history in self.backend.iter_history(account):
                    results.append({
                        "account": account.id,
                        "amount": str(history.amount),
                        "date": history.date.strftime(DATETIME_FORMAT),
                        "rdate": history.rdate.strftime(DATETIME_FORMAT),
                        "label": unicode(history.label),
                        "raw": unicode(history.raw)
                    })
            except NotImplementedError:
                print "The account type has not been implemented by weboob."

        return results
