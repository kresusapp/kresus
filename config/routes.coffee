exports.routes = (map) ->
	# Bank
	# index and show
	map.resources('banks', {only: ['index', 'show']});
	map.get('banks/getAccesses/:id', "banks#getAccesses");

	# BankAccess
	map.resources('bankaccesses', {except: ['new', 'edit']});
	map.get('bankaccesses/getAccounts/:id', "bankaccesses#getAccounts");

	# BankAccount
	map.resources('bankaccounts', {except: ['new', 'edit', 'update']});
	map.get('bankaccounts/getOperations/:id', "bankaccounts#getOperations");

	# BankAccess
	map.resources('bankoperations', {only: ['index']});