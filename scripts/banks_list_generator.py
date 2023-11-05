#!/usr/bin/python3

'''
A simple script to generate the banks.json file for Kresus.
'''

import argparse
import json
import os
import sys

# Import Woob core
if 'WOOB_DIR' in os.environ and os.path.isdir(os.environ['WOOB_DIR']):
    WOOB_DIR = os.environ['WOOB_DIR']
    sys.path.insert(0, os.environ['WOOB_DIR'])
else:
    print('"WOOB_DIR" env variable must be set.', file=sys.stderr)
    sys.exit(1)

from woob.core import WoobBase
from woob.core.modules import ModuleLoadError
from woob.tools.backend import BackendConfig
from woob.tools.value import Value, ValueBackendPassword, ValueTransient

class MockModule(object):
    def __init__(self, name, description, config, backend="", no_credentials=False):
        self.name = name
        self.description = description
        self.config = config
        self.backend = backend
        self.no_credentials = no_credentials


# Officially deprecated modules. They are listed for backwards compatibility
# and to allow the user to look at their past transactions.
DEPRECATED_MODULES = [
    MockModule('wellsfargo', 'Wells Fargo', BackendConfig(Value('login'), ValueBackendPassword('password'))),
    MockModule('citelis', 'City Bank', BackendConfig(Value('login'), ValueBackendPassword('password'))),
    MockModule('alloresto', 'Allo Resto', BackendConfig(Value('login'), ValueBackendPassword('password'))),
    MockModule('paypal', 'Paypal', BackendConfig(Value('login'), ValueBackendPassword('password'))),
    MockModule('netfinca', 'Netfinca', BackendConfig(Value('login'), ValueBackendPassword('password'))),

    # Barclays is now Milleis
    MockModule('barclays', 'Barclays', BackendConfig(Value('login'), ValueBackendPassword('password'))),

    # Aviva is now abeilleassurances
    MockModule('aviva', 'Aviva', BackendConfig(Value('login'), ValueBackendPassword('password'))),

    # Bolden was stroke off
    MockModule('bolden', 'Bolden', BackendConfig(Value('login'), ValueBackendPassword('password'))),
]

# The known modules to be ignored either because they are only called by another module,
# or because they are deprecated.
IGNORE_MODULE_LIST = [
    's2e',
    'linebourse',
    'groupama',
    'lendosphere',
    'wiseed',
    'bnporc'
] + [m.name for m in DEPRECATED_MODULES]

MANUAL_MODULES = [
    MockModule(
        'manual',
        'Manual Bank',
        BackendConfig(
            Value('login'),
            ValueBackendPassword('password'),
            Value(
                'currency',
                label='Currency',
                choices = {
                    'EUR': 'Euro',
                    'USD': 'Dollar'
                },
                default='EUR',
                required=True
            )
        ),
        backend='manual',
        no_credentials=True
    )
]

MOCK_MODULES = [
    MockModule('demo', 'Demo bank', BackendConfig(
        Value('login'), ValueBackendPassword('password')), backend='demo'),
]

NEEDS_PLACEHOLDER = ['secret', 'birthday']

# List of transient fields in case the module does not use `ValueTransient`
IGNORE_FIELDS_LIST = ['otp', 'enable_twofactors', 'captcha_response', 'request_information', 'resume']

# Theses sites are now aliases to other sites.
# We keep them instead of using the aliases and deduplicating
# the values because the labels still use the deprecated URL,
# which is confusing.
BANQUE_POPULAIRE_DEPRECATED_WEBSITES = [
    'www.ibps.alsace.banquepopulaire.fr',
    'www.ibps.atlantique.banquepopulaire.fr',
    'www.ibps.bretagnenormandie.cmm.banquepopulaire.fr',
    'www.ibps.cotedazure.banquepopulaire.fr',
    'www.ibps.loirelyonnais.banquepopulaire.fr',
    'www.ibps.lorrainechampagne.banquepopulaire.fr',
    'www.ibps.massifcentral.banquepopulaire.fr',
    'www.ibps.ouest.banquepopulaire.fr',
    'www.ibps.provencecorse.banquepopulaire.fr',
    'www.ibps.sudouest.creditmaritime.groupe.banquepopulaire.fr'
]


def print_error(text):
    print(text, file=sys.stderr)


def ignore_select_field(module_name, field_val):
    return module_name == 'banquepopulaire' and field_val in BANQUE_POPULAIRE_DEPRECATED_WEBSITES


def ignore_parent_config(parent):
    # every creditdunord child presets the website in its Browser
    # implementation, so no need to offer a way to select another site (which
    # would be ignored anyways).
    return parent == 'creditdunord'


def format_kresus(backend, module, is_deprecated=False, module_loader=None):
    '''
    Export the bank module to kresus format
    name : module.description
    uuid: module.name
    backend: backend
    customFields: [
        name:
        type:
    ]
    '''

    kresus_module = {
        'name': module.description,
        'uuid': module.name,
        'backend': backend,
        'deprecated': is_deprecated
    }

    if getattr(module, "no_credentials", False):
        kresus_module['noCredentials'] = True

    # If the module is deprecated, just dump it.
    if is_deprecated:
        return kresus_module

    fields = []

    config = module.config.items()
    for key, value in config:
        # Kresus does not expect login and password to be part of the custom fields, it is then not necessary to add them to the file.
        if key in ('login', 'username', 'password'):
            continue

        # We don't want transient items (mainly used for 2FA).
        if isinstance(value, ValueTransient):
            continue

        optional = not value.required and key not in ['website', 'auth_type']

        if optional and key in IGNORE_FIELDS_LIST:
            print_error('Skipping optional key "%s" for module "%s".' % (key, module.name))
            continue

        field = {
            'name': key
        }

        if optional:
            field['optional'] = True

        if value.choices:
            field['type'] = 'select'
            if value.default:
                field['default'] = value.default
            choices = []

            try:
                for k, label in value.choices.items():
                    if not ignore_select_field(module.name, k):
                        choices.append(dict(label=label, value=k))
            except AttributeError:
                # Handle the case where the choices would not be a dict, but a list.
                for k in value.choices:
                    if not ignore_select_field(module.name, k):
                        choices.append(dict(label=k, value=k))

            choices.sort(key=lambda choice: choice["value"])
            field['values'] = choices
        else:
            if value.masked:
                field['type'] = 'password'
            else:
                field['type'] = 'text'

        if key in NEEDS_PLACEHOLDER:
            field['placeholderKey'] = 'client.settings.%s_placeholder' % key

        fields.append(field)

    if fields:
        fields.sort(key=lambda field: field["name"])
        kresus_module['customFields'] = fields

    return kresus_module


class ModuleManager(WoobBase):
    def __init__(self, modules_path_arg):
        self.modules_path = modules_path_arg
        super(ModuleManager, self).__init__(modules_path=self.modules_path)

    def list_bank_modules(self):
        module_list = []
        for module_name in sorted(self.modules_loader.iter_existing_module_names()):
            if module_name in IGNORE_MODULE_LIST:
                print_error('Ignoring module "%s" as per request.' % module_name)
                continue

            try:
                module = self.load_module_and_full_config(module_name)
            except ModuleLoadError as err:
                print_error('Could not import module "%s". Import raised:' % err.module)
                print_error('\t%s' % err)
                continue

            if not module.has_caps('CapBank'):
                continue

            if 'login' not in module.config and 'username' not in module.config:
                print_error('Ignoring module "%s". It does not have login.' % module_name)
                continue

            if 'password' not in module.config:
                print_error('Ignoring module "%s". It does not have password.' % module_name)
                continue

            module_list.append(module)
        return module_list

    def load_module_and_full_config(self, module_name):
        """
        Loads the module with slug 'module_name' and retrieves the full config object, including
        when the module extends another one.
        """
        module = self.modules_loader.get_or_load_module(module_name)

        # Allow configuring a module with the configuration of its parents, if
        # it does not already have this config key.
        if hasattr(module.klass, 'PARENT'):
            parent = self.load_module_and_full_config(module.klass.PARENT)
            for key in parent.config.keys():
                if key in module.config:
                    continue
                if ignore_parent_config(parent.name):
                    continue
                module.config[key] = parent.config[key]

        return module

    def format_list_modules(self):
        return [format_kresus('woob', module) for module in self.list_bank_modules()]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generates the banks.json for Kresus')
    parser.add_argument('-o', '--output', help='The file to write the output of the command.', default=None)
    parser.add_argument('-i', '--ignore-fakemodules', help="Don't add the fakemodules to the list (default: false)", default=False, action='store_true')

    options = parser.parse_args()

    modules_path = os.path.join(WOOB_DIR, 'modules')
    if not os.path.isdir(modules_path):
        print_error('Unknown woob directory %s' % modules_path)
        sys.exit(1)

    modules_manager = ModuleManager(modules_path)

    content = []

    if options.ignore_fakemodules:
        content += modules_manager.format_list_modules()
    else:
        # First add the fakewoob modules.
        fake_modules_path = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),
            '..', 'server', 'providers', 'woob', 'py', 'fakemodules'))
        fake_modules_manager = ModuleManager(fake_modules_path)
        content += fake_modules_manager.format_list_modules()

        # Then the mock modules.
        content += [format_kresus(module.backend, module) for module in MOCK_MODULES]

    # Add the manual modules.
    content += [format_kresus(module.backend, module) for module in MANUAL_MODULES]

    # Add metadata for the deprecated modules
    content += [format_kresus('woob', module, is_deprecated=True) for module in DEPRECATED_MODULES]

    data = json.dumps(content, ensure_ascii=False, indent=4, separators=(',', ': '), sort_keys=True).encode('utf-8')

    output_file = options.output
    if output_file:
        try:
            with open(os.path.abspath(output_file), 'wb') as f:
                f.write(data)
        except IOError as err:
            print_error('Failed to open output file: %s' % err)
            sys.exit(1)
    else:
        print(data)
