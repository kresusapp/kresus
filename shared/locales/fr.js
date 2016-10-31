module.exports = {

    client: {

        KRESUS: 'KRESUS',
        about: 'Kresus est un gestionnaire de finances personnelles qui vous permet de mieux comprendre quelles sont vos dépenses, en calculant des statistiques intéressantes sur vos opérations bancaires.',

        accountwizard: {
            title: 'Bienvenue !',
            content: 'Kresus est un gestionnaire de finances personnelles qui vous permet de mieux comprendre quelles sont vos dépenses, en calculant des statistiques intéressantes sur vos opérations bancaires. Pour commencer, veuillez remplir le formulaire ci-dessous :',
            import_title: 'Import',
            import: `Si vous avez exporté votre précédente instance de Kresus, vous pouvez également l'importer de nouveau en sélectionnant le fichier JSON créé lors de l'import.`,
            advanced: 'Options avancées'
        },

        amount_well: {
            current_search: 'Recherche courante',
            this_month: 'Ce mois'
        },

        category: {
            none: 'Sans catégorie',
            add: 'ajouter une catégorie',
            column_category_color: 'COULEUR',
            column_category_name: 'NOM',
            column_action: 'ACTION',
            dont_replace: 'Ne pas remplacer',
            erase: `Cela va supprimer la catégorie '%{title}'. S'il y a des opérations affectées à cette catégorie, vous pouvez les réaffecter à une catégorie existante à l'aide du menu déroulant (sinon, ces opérations n'auront plus de catégorie). Êtes-vous sûr de vouloir supprimer cette catégorie ?`,
            title: 'Catégories',
            label: 'Libellé'
        },

        editaccessmodal: {
            not_empty: 'Le mot de passe est obligatoire !',
            customFields_not_empty: 'Veuillez renseigner tous les champs personnalisés',
            title: 'Changer les informations de connexion du compte',
            body: 'Si votre mot de passe bancaire a changé, vous pouvez le changer ici afin que le lien de Kresus continue de fonctionner.',
            cancel: 'Annuler',
            save: 'Sauver'
        },

        confirmdeletemodal: {
            title: 'Demande de confirmation',
            confirm: 'Confirmer la suppression',
            dont_delete: 'Ne pas supprimer'
        },

        charts: {
            amount: 'Montant',
            balance: 'solde',
            by_category: 'par catégorie',
            differences_all: 'rentrées et sorties (tous les comptes)',
            spent: 'Dépensé',
            received: 'Reçu',
            saved: 'Économisé',
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
            save: 'sauver'
        },

        menu: {
            banks: 'Banques',
            categories: 'Catégories',
            charts: 'Graphiques',
            settings: 'Préférences',
            similarities: 'Doublons',
            sublists: 'Comptes',
            reports: 'Relevé',
            budget: 'Budget',
            support: 'Support',
            different_currencies: 'Devises différentes',
            about: {
                blog: 'Blog',
                forum_thread: 'Sujet sur le forum de Cozy',
                license: 'Licence',
                mailing_list: 'Liste de diffusion',
                official_site: 'Site web officiel',
                sources: 'Sources',
            }
        },

        operations: {
            amount: 'Montant',

            column_date: 'Date',
            column_name: 'Opération',
            column_amount: 'Montant',
            column_category: 'Catégorie',
            column_type: 'Type',

            current_balance: 'Solde en cours',
            as_of: 'À la date du',
            received: 'Reçus',
            spent: 'Dépensés',
            saved: 'Économisés',

            details: "Détails de l'opération",
            attached_file: 'Télécharger le fichier associé',
            edf_details: `Voir sa facture dans l'application EDF`,

            full_label: 'Libellé complet',
            category: 'Catégorie',

            last_sync: 'Dernière synchronisation avec votre banque :',
            sync_now: 'Synchroniser maintenant',

            title: 'Opérations',
            type: 'Type',
            custom_label: 'Libellé personnalisé :',
            add_custom_label: 'Ajouter un libellé personnalisé',

            delete_operation_button: "Supprimer l'opération",
            warning_delete: "Avant de supprimer l'opération par ce moyen, assurez-vous que celle-ci n'apparait pas dans la liste des doublons, vous pourrez la supprimer avec le bouton 'fusionner'.",
            are_you_sure: `Êtes-vous sur(e) de toujours vouloir supprimer l'opération %{label} (%{amount}) du %{date} ?`
        },

        budget: {
            title: 'Budget',
            amount: 'Montant',
            threshold: 'Seuil',
            remaining: 'Restant',
            period: 'Période',
            threshold_error: 'Le seuil doit être supérieur ou égal à 0'
        },

        search: {
            any_category: `N'importe quelle catégorie`,
            any_type: `N'importe quel type`,
            keywords: 'Mots-clés :',
            category: 'Catégorie :',
            type: 'Type :',
            amount_low: 'Montant : entre',
            and: 'et',
            date_low: 'Date : entre',
            clear: 'Vider',
            clearAndClose: 'Vider & fermer',
            title: 'Recherche'
        },

        settings: {
            column_account_name: 'Nom',
            unknown_field_type: 'Type de champ incorrect',
            website: 'Site internet',
            auth_type: `Type d'authentification`,
            birthday: `Date d'anniversaire`,
            birthdate: `Date d'anniversaire`,
            merchant_id: 'Identifiant de marchand',
            birthday_placeholder: 'JJMMAAAA',
            secret: 'Phrase secrète',
            secret_placeholder: 'Entrez votre phrase secrète ici',
            favorite_code_editor: 'Éditeur de code préféré',
            challengeanswer1: 'Challenge Answer 1',
            question1: 'Question 1',
            question2: 'Question 2',
            question3: 'Question 3',
            answer1: 'Réponse 1',
            answer2: 'Réponse 2',
            answer3: 'Réponse 3',
            bank: 'Banque',
            login: 'Identifiant',
            password: 'Mot de passe',
            new_bank_form_title: 'Configurer un nouvel accès',
            duplicate_threshold: 'Seuil de doublon',
            duplicate_help: 'Deux opérations seront considérées comme étant des doublons dans la partie Doublons si celles-ci sont arrivées au cours de cette période temporelle (en heures).',

            weboob_auto_update: 'Mettre à jour Weboob automatiquement',
            weboob_auto_merge_accounts: 'Fusionner automatiquement les comptes Weboob',
            weboob_enable_debug: 'Activer le journal de debogue de Weboob',
            weboob_version: 'Version de Weboob',

            update_weboob: 'Mettre Weboob à jour',
            go_update_weboob: 'Lancer la mise à jour',
            update_weboob_help: 'Cette procédure va mettre à jour Weboob sans le réinstaller entièrement. Cela peut prendre quelques minutes, durant lesquelles vous ne pourrez pas importer vos comptes et opérations. À utiliser quand mettre à jour ne synchronise plus vos opérations !',

            export_instance: `Exporter l'instance`,
            go_export_instance: 'Exporter',
            export_instance_help: `Cela va exporter l'instance entière au format JSON, dans un format qu'une autre instance de Kresus peut par la suite ré-importer. Cela n'enregistrera pas les mots de passe de vos accès bancaires, qui devront être définis après avoir importé manuellement l'instance.`,

            browse: 'Parcourir',
            import_instance: 'Importer une instance',
            go_import_instance: 'Importer',
            import_instance_help: `Cela va importer une instance déjà existante, exportée à l'aide du bouton ci-dessus. Aucune donnée ne sera fusionnée avec les données existantes, il est donc nécessaire de vous assurer que vous n'avez pas déjà des données présentes ; si besoin est, vous pouvez supprimer des données existantes à l'aide de l'application DataBrowser.`,
            no_file_selected: 'Aucun fichier sélectionné',

            title: 'Paramètres',

            tab_accounts: 'Comptes bancaires',
            tab_backup: 'Sauvegarde et restauration',
            tab_defaults: 'Paramètres par défaut',
            tab_emails: 'Emails',
            tab_weboob: 'Gestion de Weboob',

            erase_account: `Cela va supprimer le compte '%{title}' et toutes les opérations bancaires qu'il contient. Si c'est le dernier compte lié à cette banque, le lien bancaire sera supprimé. Êtes-vous sûr de vouloir supprimer ce compte ?`,
            erase_bank: `Cela va supprimer la banque nommée '%{name}', tous les comptes et toutes les opérations liées à cette banque. Êtes-vous sûr de vouloir supprimer cette banque et tous ses comptes liés ?`,
            missing_login_or_password: 'Le login et le mot de passe sont obligatoires',
            reset: 'Réinitialiser',
            submit: 'Sauvegarder',

            delete_account_button: 'Supprimer compte',
            delete_bank_button: 'Supprimer banque',
            reload_accounts_button: 'Mettre à jour les comptes',
            change_password_button: 'Mettre à jour les informations de connexion',
            add_bank_button: 'Ajouter une banque',
            set_default_account: 'Définir comme compte par défaut',
            add_operation: 'Ajouter une opération',
            resync_account_button: 'Resynchroniser le solde du compte',

            resync_account: {
                title: "Resynchroniser le solde du compte : %{title}",
                submit: "Resynchroniser",
                cancel: 'Annuler',
                make_sure: "Vous êtes sur le point de resynchroniser le solde de ce compte avec le site web de votre banque. Avant d'aller plus loin, assurez-vous que vous avez bien :",
                sync_operations: "importé toutes les opérations depuis le site web de votre banque",
                manage_duplicates: "supprimé les doublons",
                add_operation: "ajouté la ou les opérations manquantes",
                delete_operation: "supprimé la ou les operations en trop",
                are_you_sure: "Êtes vous sûr.e de vouloir continuer ?"
            },

            emails: {
                invalid_limit: 'La valeur de seuil est invalide',
                add_balance: 'Ajouter une notification sur le solde',
                add_transaction: 'Ajouter une notification sur opération',
                add_report: 'Ajouter un nouveau rapport',
                account: 'Compte',
                create: 'Créer',
                cancel: 'Annuler',
                details: 'Description',
                balance_title: 'Alertes sur solde',
                transaction_title: 'Alertes sur opérations',
                reports_title: 'Rapports',
                send_if_balance_is: 'Me prévenir si le solde est',
                send_if_transaction_is: `Me prévenir si le montant d'une opération est`,
                send_report: `M'envoyer un rapport`,
                greater_than: 'supérieur à',
                less_than: 'inférieur à',
                delete_alert: `supprimer l'alerte`,
                delete_report: 'supprimer le rapport',
                delete_alert_full_text: `Cela va supprimer l'alerte et vous ne recevrez plus les emails et notifications associés. Êtes-vous sûr de vouloir continuer ?`,
                delete_report_full_text: 'Cela va supprimer le rapport email et vous ne recevrez plus les emails associés. Êtes-vous sûr de vouloir continuer ?',
                daily: 'tous les jours',
                weekly: 'toutes les semaines',
                monthly: 'tous les mois'
            },

            default_chart_type: `Type d'opérations par défaut`,
            default_chart_period: 'Période par défaut'
        },

        similarity: {
            nothing_found: `Aucune paire d'opérations similaires n'a été trouvée.`,
            title: 'Doublons',
            help: `Qu'est-ce que c'est ? Il arrive lors de l'import des opérations bancaires que certaines d'entre elles soient importées en double, par exemple quand la banque ajoute des informations sur une opération bancaire quelques jours après que celle-ci a eu lieu. Cet écran vous montre les potentiels doublons (opérations qui ont le même montant sur une période temporelle donnée). Remarque : les catégories sont transférées lors de la suppression : si dans une paire de doublons A / B dans laquelle A a une catégorie et B n'en a pas, supprimer A réaffectera automatiquement sa catégorie à B.`,
            date: 'Date',
            label: `Libellé de l'opération`,
            amount: 'Montant',
            category: 'Catégorie',
            imported_on: 'Importé le',
            merge: 'Fusionner',
            type: 'Type',
            find_more: 'En trouver plus',
            find_fewer: 'En trouver moins',

            threshold_1: 'Deux opérations seront considérées comme étant des doublons possibles si la durée entre celles-ci est inférieure à un seuil temporel pré-défini, dont la valeur est actuellement définie à',
            hours: 'heures',
            threshold_2: 'Vous pouvez changer cette valeur dans la section Paramètres / Valeurs par défaut ou en cliquant sur les boutons adjacents pour trouver plus/moins de doublons',
        },

        sync: {
            no_password: `Aucun mot de passe n'est associé à ce compte, veuillez le définir dans les préférences et réessayer.`,
            wrong_password: 'Le mot de passe est incorrect, veuillez le mettre à jour dans les préférences.',
            first_time_wrong_password: 'Le mot de passe semble incorrect, veuillez réessayer.',
            invalid_parameters: 'Le format de votre login ou mot de passe semble être incorrect : %{content}',
            expired_password: 'Votre mot de passe a expiré. Veuillez le mettre à jour sur le site de votre banque et dans les préférences.',
            unknown_module: 'Votre banque utilise un module non supporté par Kresus (et Weboob). Essayez de mettre à jour Weboob ou contactez un mainteneur.',
            unknown_error: 'Erreur inattendue: %{content}'
        },

        type: {
            none: 'Aucun',
            unknown: 'Type inconnu',
            transfer: 'Virement',
            order: 'Prélèvement',
            check: 'Chèque',
            deposit: 'Dépôt',
            payback: 'Remboursement',
            withdrawal: 'Retrait',
            card: 'Carte',
            loan_payment: `Remboursement d'emprunt`,
            bankfee: 'Frais bancaire',
            cash_deposit: `Dépôt d'espèces`,
            card_summary: 'Carte (différé)',
            deferred_card: 'Débit différé'
        },

        units: {
            hours: 'heures',
        },

        addoperationmodal: {
            label: `Libellé de l'opération`,
            amount: 'Montant',
            category: 'Catégorie',
            cancel: 'Annuler',
            submit: 'Créer',
            add_operation: 'Créer une opération pour le compte %{account}',
            type: 'Type',
            date: 'Date',
            description: `Vous vous apprêtez à créer une opération pour le compte %{account}. Assurez-vous que votre compte est bien à jour avant de la créer. Si vous voulez supprimer une opération créée à tort, utilisez l'application databrowser.`
        },

        weboobinstallreadme: {
            title: 'Il vous manque Weboob en version 1.1 ou supérieure',
            content: `Afin de fonctionner, Kresus a besoin d'une dépendance unique, Weboob. Pour vous offrir la meilleure expérience possible, il est nécessaire que Weboob soit installé en version stable ou expérimentale (1.1 à ce jour). Si vous êtes hébergés par CozyCloud, cela devrait déjà avoir été installé pour vous et c'est une erreur ; merci de contacter un administrateur de CozyCloud pour leur en faire part sur contact@cozycloud.cc. Si vous êtes auto-hébergés, vous devriez installer Weboob manuellement, comme indiqué dans le fichier lisezmoi : `
        },

        datepicker: {
            monthsFull: {
                january: 'Janvier',
                february: 'Février',
                march: 'Mars',
                april: 'Avril',
                may: 'Mai',
                june: 'Juin',
                july: 'Juillet',
                august: 'Août',
                september: 'Septembre',
                october: 'Octobre',
                november: 'Novembre',
                december: 'Décembre'
            },
            monthsShort: {
                january: 'Jan',
                february: 'Fev',
                march: 'Mar',
                april: 'Avr',
                may: 'Mai',
                june: 'Juin',
                july: 'Juil',
                august: 'Aou',
                september: 'Sep',
                october: 'Oct',
                november: 'Nov',
                december: 'Déc'
            },
            weekdaysFull: {
                sunday: 'Dimanche',
                monday: 'Lundi',
                tuesday: 'Mardi',
                wednesday: 'Mercredi',
                thursday: 'Jeudi',
                friday: 'Vendredi',
                saturday: 'Samedi'
            },
            weekdaysShort: {
                sunday: 'Dim',
                monday: 'Lun',
                tuesday: 'Mar',
                wednesday: 'Mer',
                thursday: 'Jeu',
                friday: 'Ven',
                saturday: 'Sam'
            },
            today: "Aujourd'hui",
            clear: 'Effacer',
            close: 'Fermer',
            firstDay: '1',
            format: 'dd mmmm yyyy',
            formatSubmit: 'yyyy/mm/dd',
            labelMonthNext: 'Mois suivant',
            labelMonthPrev: 'Mois précédent',
            labelMonthSelect: 'Sélectionner un mois',
            labelYearSelect: 'Sélectionner une année'
        },

        spinner: {
            title: "Veuillez patienter...",

            balance_resync: "Resynchronisation de votre balance en cours…",
            create_account: "Connexion au site de votre banque et import des comptes et opérations en cours…",
            delete_account: "Suppression de votre compte et des données associées en cours…",
            generic: "Kresus est en train d'exécuter vos souhaits, à tout de suite !",
            import: 'Import de votre instance sauvegardée en cours…',
            sync: 'Récupération de vos dernières opérations en cours…',
        }
    },

    server: {
        alert: {
            operation: {
                title: 'Alerte sur transaction',
                lessThan: 'inférieur',
                greaterThan: 'supérieur',
                content: `Alerte : transaction "%{title}" du %{date} (compte %{account}) d'un montant de %{amount}, %{cmp} à %{limit}.`
            },
            balance: {
                title: 'Alerte sur solde de compte',
                lessThan: 'sous le',
                greaterThan: 'au dessus du',
                content: `Alerte : le solde sur le compte %{title} est %{cmp} seuil d'alerte de %{limit}, avec un solde de %{balance}.`
            }
        },

        email: {
            hello: 'Bonjour cher.e utilisateur.rice de Kresus,',
            signature: `Votre serviteur, Kresus.

(si vous souhaitez vous désinscrire de ces notifications ou modifier la fréquence à laquelle celles-ci arrivent, connectez-vous à votre Kresus et visitez l'onglet Préférences, puis Emails)
`,
            seeyoulater: {
                notifications: 'A bientôt pour de nouvelles notifications',
                report: 'A bientôt pour un autre rapport'
            },
            report: {
                daily: 'quotidien',
                weekly: 'hebdomadaire',
                monthly: 'mensuel',
                subject: 'Votre rapport bancaire %{frequency}',
                pre: `
Voici votre rapport bancaire du %{today}, tout droit sorti du four.

Solde de vos comptes :`,
                last_sync: 'synchronisé pour la dernière fois le',
                new_operations: 'Nouvelles opérations importées durant cette période :',
                no_new_operations: `Aucune nouvelle opération n'a été importée au cours de cette période.`
            },
            fetch_error: {
                subject: 'Erreur de récupération des opérations bancaires',
                UNKNOWN_WEBOOB_MODULE: `Le module weboob est inconnu`,
                NO_PASSWORD: 'Le mot de passe est absent',
                INVALID_PASSWORD: 'Le mot de passe est invalide',
                EXPIRED_PASSWORD: 'Le mot de passe a expiré',
                INVALID_PARAMETERS: 'Les paramètres de connexion sont invalides',
                GENERIC_EXCEPTION: 'Erreur inconnue',
                text: `Kresus a détecté les erreurs suivantes lors de la récuperation des operations des comptes attachés à la banque %{bank}: \n%{error} (%{message}).\n`,
                pause_poll: "Veuillez noter qu'aucun import d'opération automatique ne sera tenté tant que vous n'avez pas corrigé les problèmes de connexion."
            }
        },
        notification: {
            new_operation: `Kresus: %{smart_count} nouvelle operation importée |||| Kresus: %{smart_count} nouvelles operations importées`
        }
    }
};
