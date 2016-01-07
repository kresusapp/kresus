module.exports = {

    client: {

        KRESUS: 'KRESUS',

        accountwizard: {
            title: 'Bienvenue !',
            content: "Kresus est un gestionnaire de finances personnelles qui vous permet de mieux comprendre quelles sont vos dépenses, en calculant des statistiques intéressantes sur vos opérations bancaires. Pour commencer, veuillez remplir le formulaire ci-dessous :",
            import: "Si vous avez exporté votre précédente instance de Kresus, vous pouvez également l'importer de nouveau en sélectionnant le fichier JSON créé lors de l'import.",
        },

        amount_well: {
            current_search: 'Recherche courante',
            this_month: 'Ce mois',
        },

        category: {
            none: 'Sans',
            add: 'ajouter une catégorie',
            column_category_name: 'NOM',
            column_action: 'ACTION',
            dont_replace: 'Ne pas remplacer',
            erase: "Cela va supprimer la catégorie '%{title}'. S'il y a des opérations affectées à cette catégorie, vous pouvez les réaffecter à une catégorie existante à l'aide du menu déroulant (sinon, ces opérations n'auront plus de catégorie). Êtes-vous sûr de vouloir supprimer cette catégorie ?",
            title: 'Catégories',
            label: 'Libellé'
        },

        editaccessmodal: {
            not_empty: "Le mot de passe est obligatoire !",
            customFields_not_empty: "Veuillez renseigner tous les champs personnalisés",
            title: "Changer les informations de connexion du compte",
            body: "Si votre mot de passe bancaire a changé, vous pouvez le changer ici afin que le lien de Kresus continue de fonctionner.",
            cancel: "Annuler",
            save: "Sauver",
        },

        confirmdeletemodal: {
            title: 'Demande de confirmation',
            confirm: 'Confirmer la suppression',
            dont_delete: "Ne pas supprimer",
        },

        charts: {
            Amount: 'Montant',
            balance: 'balance',
            by_category: 'par catégorie',
            differences_all: 'rentrées et sorties (tous les comptes)',
            Paid: 'Payé',
            Received: 'Reçu',
            Saved: 'Économisé',
            title: 'Graphiques',

            type: 'Type',
            all_types: 'Les deux',
            positive: 'Revenus',
            negative: 'Dépenses',

            period: 'Période',
            all_periods: 'Tout le temps',
            current_month: 'Mois courant',
            last_month: 'Mois précédent',
            three_months: 'Trois derniers mois',
            six_months: 'Six derniers mois',

            unselect_all_categories: 'Désélectionner toutes les catégories',
            select_all_categories: 'Sélectionner toutes les catégories'
        },

        general: {
            cancel: 'annuler',
            delete: 'supprimer',
            edit: 'éditer',
            save: 'sauver',
        },

        loadscreen: {
            title: "Merci de patienter pendant l'installation des dépendances de Kresus",
            prolix1: "Kresus est en train d'installer les dépendances. Cela peut prendre jusqu'à 10 minutes sur des serveurs plus lents.",
            prolix2: "Si vous êtes auto-hébergés, pensez à lire le fichier",
            prolix3: "pour vous assurer que toutes les dépendences requises sont installées sur votre machine. Si vous êtes sur l'infrastructure CozyCloud, votre machine devrait déjà être configurée.",
            prolix4: "Cette page va automatiquement se recharger dans un moment. Si vous restez bloqués dessus au bout de 10 minutes, n'hésitez pas à écrire un message sur le",
            prolix5: "Merci pour votre patience."
        },

        menu: {
            banks: 'Banques',
            categories: 'Catégories',
            charts: 'Graphiques',
            settings: 'Préférences',
            similarities: 'Doublons',
            sublists: 'Comptes',
            reports: 'Rapports',
        },

        operations: {
            amount: 'Montant :',

            column_date: 'Date',
            column_name: 'Opération',
            column_amount: 'Montant',
            column_category: 'Catégorie',
            column_type: 'Type',

            current_balance: 'Balance en cours',
            as_of: 'À la date du',
            received: 'Reçu',
            paid: 'Payé',
            saved: 'Économisé',

            attached_file: 'Télécharger le fichier associé',
            edf_details: 'Voir sa facture dans l\'application EDF',

            full_label: 'Libellé complet :',
            category: 'Catégorie :',

            last_sync: 'Dernière synchronisation avec votre banque :',
            sync_now: 'Synchroniser maintenant',
            syncing: 'Récupération de vos dernières opérations en cours…',

            title: 'Opérations',
            type: 'Type :',
            custom_label: 'Libellé personnalisé :',
            add_custom_label: 'Ajouter un libellé personnalisé',
        },

        search: {
            any_category: "N'importe quelle catégorie",
            any_type: "N'importe quel type",
            keywords: "Mots-clés :",
            category: 'Catégorie :',
            type: 'Type :',
            amount_low: 'Montant : entre',
            and: 'et',
            date_low: 'Date : entre',
            clear: 'Vider',
            clearAndClose: 'Vider & fermer',
            title: 'Recherche',
        },

        settings: {
            column_account_name: 'Nom',
            unknown_field_type: 'Type de champ incorrect',
            website: 'Site internet',
            auth_type: "Type d'autentification",
            birthday: "Date d'anniversaire",
            birthdate: "Date d'anniversaire",
            merchant_id: "Identifiant de marchant",
            birthday_placeholder: "JJMMAAAA",
            secret: "Phrase secrète",
            secret_placeholder: "Entrez votre phrase secrète ici",
            favorite_code_editor: "Editeur de code préféré",
            challengeanswer1: "Challenge Answer 1",
            question1: "Question 1",
            question2: "Question 2",
            question3: "Question 3",
            answer1: "Réponse 1",
            answer2: "Réponse 2",
            answer3: "Réponse 3",
            bank: 'Banque',
            login: 'Identifiant',
            password: 'Mot de passe',
            new_bank_form_title: 'Configurer un nouvel accès',
            duplicate_threshold: 'Seuil de doublon',
            duplicate_help: 'Deux opérations seront considérées comme étant des doublons dans la partie Doublons si celles-ci sont arrivées au cours de cette période temporelle (en heures).',

            weboob_auto_update: "Mettre à jour Weboob automatiquement",
            weboob_auto_merge_accounts: "Fusionner automatiquement les comptes Weboob",

            reinstall_weboob: 'Réinstaller Weboob',
            go_reinstall_weboob: "Lancer la réinstallation",
            reinstall_weboob_help: "Cette procédure va entièrement réinstaller Weboob. Cela peut prendre quelques minutes, durant lesquelles vous ne pourrez pas importer vos comptes et opérations. À n'utiliser qu'en dernier recours !",

            update_weboob: 'Mettre Weboob à jour',
            go_update_weboob: "Lancer la mise à jour",
            update_weboob_help: "Cette procédure va mettre à jour Weboob sans le réinstaller entièrement. Cela peut prendre quelques minutes, durant lesquelles vous ne pourrez pas importer vos comptes et opérations. À utiliser quand mettre à jour ne synchronise plus vos opérations !",

            export_instance: "Exporter l'instance",
            go_export_instance: "Exporter",
            export_instance_help: "Cela va exporter l'instance entière au format JSON, dans un format qu'une autre instance de Kresus peut par la suite ré-importer. Cela n'enregistrera pas les mots de passe de vos accès bancaires, qui devront être définis après avoir importé manuellement l'instance.",

            import_instance: "Importer une instance",
            go_import_instance: "Importer",
            import_instance_help: "Cela va importer une instance déjà existante, exportée à l'aide du bouton ci-dessus. Aucune donnée ne sera fusionnée avec les données existantes, il est donc nécessaire de vous assurer que vous n'avez pas déjà des données présentes ; si besoin est, vous pouvez supprimer des données existantes à l'aide de l'application DataBrowser.",

            title: 'Paramètres',

            tab_accounts: 'Comptes bancaires',
            tab_about: 'À propos',
            tab_backup: 'Sauvegarde et restauration',
            tab_defaults: 'Paramètres par défaut',
            tab_emails: 'Emails',
            tab_weboob: 'Gestion de Weboob',

            erase_account: "Cela va supprimer le compte '%{title}' et toutes les opérations bancaires qu'il contient. Si c'est le dernier compte lié à cette banque, le lien bancaire sera supprimé. Êtes-vous sûrs de vouloir supprimer ce compte ?",
            erase_bank: "Cela va supprimer la banque nommée '%{name}', tous les comptes et toutes les opérations liées à cette banque. Êtes-vous sûrs de vouloir supprimer cette banque et tous ses comptes liés ?",
            missing_login_or_password: "Le login et le mot de passe sont obligatoires",
            submit: 'Sauvegarder',

            delete_account_button: "Supprimer compte",
            delete_bank_button: "Supprimer banque",
            reload_accounts_button: "Mettre à jour les comptes",
            change_password_button: "Mettre à jour les informations de connexion",
            add_bank_button: "Ajouter une banque",
            set_default_account: "Définir comme compte par défaut",
            add_operation: "Ajouter une opération",

            emails: {
                invalid_limit: "La valeur de seuil est invalide",
                add_balance: "Ajouter une notification sur le solde",
                add_transaction: "Ajouter une notification sur opération",
                add_report: "Ajouter un nouveau rapport",
                account: "Compte",
                create: "Créer",
                cancel: "Annuler",
                details: "Description",
                balance_title: "Alertes sur solde",
                transaction_title: "Alertes sur opérations",
                reports_title: "Rapports",
                send_if_balance_is: "Me prévenir si le solde est",
                send_if_transaction_is: "Me prévenir si le montant d'une opération est",
                send_report: "M'envoyer un rapport à la fréquence suivante :",
                greater_than: "supérieur à",
                less_than: "inférieur à",
                delete_alert: "supprimer l'alerte",
                delete_report: "supprimer le rapport",
                delete_alert_full_text: "Cela va supprimer l'alerte et vous ne recevrez plus les emails et notifications associés. Êtes-vous sûrs de vouloir continuer ?",
                delete_report_full_text: "Cela va supprimer le rapport email et vous ne recevrez plus les emails associés. Êtes-vous sûrs de vouloir continuer ?",
                daily: "tous les jours",
                weekly: "toutes les semaines",
                monthly: "tous les mois",
            },

            default_chart_type: "Graphiques : type d'opérations par défaut",
            default_chart_period: "Graphiques : période par défaut",
        },

        similarity: {
            nothing_found: "Aucune paire d'opérations similaires n'a été trouvée.",
            title: "Doublons",
            help: "Il arrive lors de l'import des opérations bancaires que certaines d'entre elles soient importées en double, par exemple quand la banque ajoute des informations sur une opération bancaire quelques jours après que celle-ci a eu lieu. Cet écran vous montre les potentiels doublons (opérations qui ont le même montant sur une période temporelle donnée). Remarque : les catégories sont transférées lors de la suppression : si dans une paire de doublons A / B dans laquelle A a une catégorie et B n'en a pas, supprimer A réaffectera automatiquement sa catégorie à B.",
            date: "Date",
            label: "Libellé de l'opération",
            amount: "Montant",
            category: "Catégorie",
            imported_on: "Importé le",
            merge: "Fusionner",
            type: "Type",
        },

        sync: {
            no_password: "Aucun mot de passe n'est associé à ce compte, veuillez le définir dans les préférences et réessayer svp.",
            wrong_password: "Le mot de passe est incorrect, veuillez le mettre à jour dans les préférences svp.",
            first_time_wrong_password: "Le mot de passe semble incorrect, veuillez l'entrer une nouvelle fois svp.",
            invalid_parameters: "Le format de votre login ou mot de passe semble être incorrect : %{content}",
            expired_password: "Votre mot de passe a expiré. Veuillez le mettre à jour sur le site de votre banque et dans les préférences svp.",
            unknown_module: "Votre banque utilise un module non supporté par Kresus (et Weboob). Essayez de mettre à jour Weboob ou contactez un mainteneur.",
            unknown_error: "Erreur inattendue: %{content}",
        },

        type: {
            none: "Aucun",
            unknown: "Inconnu",
            transfer: "Virement",
            order: "Prélèvement",
            check: "Chèque",
            deposit: "Dépot",
            payback: "Remboursement",
            withdrawal: "Retrait",
            card: "Carte",
            loan_payment: "Remboursement d'emprunt",
            bankfee: "Frais bancaire",
            cash_deposit: "Dépôt d'éspèces",
        },

        addoperationmodal: {
            label: "Libellé de l'opération",
            amount: "Montant",
            category: "Catégorie",
            cancel: "Annuler",
            submit: "Créer",
            add_operation: "Créer un opération pour le compte ",
            type: "Type",
            date: "Date",
            description: "Vous vous apprétez à créer une opéraion pour le compte %{account}. Assurez-vous que votre compte est bien à jour avant de la créer. Si vous voulez supprimer une operation créée à tord, utilisez l'application databrowser."
        }
    },

    server: {

    }
}
