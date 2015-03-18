from lib import BankHandler

import sys, json

if len(sys.argv) < 4:
    print('missing arguments')
    quit()

bankuuid = sys.argv[1]
id = sys.argv[2]
password = sys.argv[3]

website = None
if len(sys.argv) == 5:
    website = sys.argv[4]

accounts = BankHandler(id, password, website).post(bankuuid)
print json.dumps(accounts)
