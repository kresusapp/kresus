exports.routes = (map) ->
	# Bank
	# index and show
	map.resources('banks', {only: ['index', 'show', 'destroy']});
	map.get('banks/getAccesses/:id', "banks#getAccesses");
	map.get('banks/getAccounts/:id', "banks#getAccounts");

	# BankAccess
	map.resources('bankaccesses', {except: ['new', 'edit']});
	map.get('bankaccesses/getAccounts/:id', "bankaccesses#getAccounts");

	# BankAccount
	map.resources('bankaccounts', {except: ['new', 'edit', 'update']});
	map.get('bankaccounts/getOperations/:id', "bankaccounts#getOperations");
	map.get('bankaccounts/retrieveOperations/:id', "bankaccounts#retrieveOperations");

	# BankAccess
	map.resources('bankoperations', {only: ['index', 'create']});
	map.post('bankoperations/query', "bankoperations#query");

	# BankAlerts
	map.resources('bankalerts', {except: ['new', 'edit']});
	map.get('bankalerts/getForBankAccount/:id', "bankalerts#getForBankAccount");