module.exports = {

    KRESUS: 'KRESUS',

    accounts: {
        title: 'Comptes',
    },

    amount_well: {
        current_search: 'Recherche courante',
        this_month: 'Ce mois',
    },

    banks: {
        title: 'Banques',
    },

    category: {
        none: 'Sans',
        add: 'ajouter une catégorie',
        column_category_name: 'NOM',
        column_action: 'ACTION',
        dont_replace: 'Ne pas remplacer',
        erase: "Cela va supprimer la catégorie '%{title}'. S'il y a des opérations affectées à cette catégorie, vous pouvez les réaffecter à une catégorie existante à l'aide du menu déroulant (sinon, ces opérations n'auront plus de catégorie). Êtes-vous sûr de vouloir supprimer cette catégorie ?",
        title: 'Catégories',
    },

    confirmdeletemodal: {
        title: 'Demande de confirmation',
        confirm: 'Confirmer la suppression',
        dont_delete: "Ne pas supprimer",
    },

    charts: {
        Amount: 'Montant',
        balance: 'balance',
        By_category: 'Par catégorie',
        by_category: 'par catégorie',
        by_category_by_month: 'par catégorie (mensuel)',
        differences_account: 'rentrées et sorties (compte)',
        differences_all: 'rentrées et sorties (tous les comptes)',
        Paid: 'Payé',
        Received: 'Reçu',
        Received_Paid_Saved_over_time: 'Reçu / Payé / Economisé au cours du temps',
        Saved: 'Economisé',
        title: 'Graphiques',
    },

    general: {
        cancel: 'annuler',
        delete: 'supprimer',
        edit: 'éditer',
        save: 'sauver',
    },

    loadscreen: {
        title: "Merci de patienter pendant l'installation des dépendences de Kresus",
        prolix: "Dans quelques minutes, rechargez la page, et si Kresus ne s'affiche pas entièrement, merci de contacter un des mainteneurs de Kresus en lui indiquant le contenu de la fenêtre de debug ci-dessous.",
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

        current_balance: 'Balance en cours',
        as_of: 'A la date du',
        received: 'Reçu',
        paid: 'Payé',
        saved: 'Economisé',

        download_bill: 'Télécharger la facture associée',
        full_label: 'Libellé complet :',
        category: 'Catégorie',
        kresus_init_title: "Veuillez patienter pendant l'initialisation de Kresus",
        kresus_init_content: "Kresus est en train de télécharger de la magie, accrochez-vous !",

        last_sync: 'Dernière synchronisation avec votre banque :',
        sync_now: 'Synchroniser maintenant',

        no_account_set_title: 'Oh non !',
        no_account_set_content: "Il semblerait que vous n'ayez défini aucun compte ! Vous pouvez en définir un dans les Préférences.",

        title: 'Opérations',
    },

    search: {
        any_category: "N'importe quelle catégorie",
        keywords: "Mots-clés :",
        category: 'Catégorie :',
        amount_low: 'Montant : entre',
        and: 'et',
        date_low: 'Date : entre',
        clear: 'vider',
        title: 'Recherche',
    },

    settings: {
        column_account_name: 'Nom',
        website: 'Site régional',
        bank: 'Banque',
        login: 'Identifiant',
        password: 'Mot de passe',
        new_bank_form_title: 'Configurer un nouvel accès',
        duplicate_threshold: 'Seuil de doublon',
        duplicate_help: 'Deux opérations seront considérées comme étant des doublons dans la partie Doublons si celles-ci sont arrivées au cours de cette période temporelle (en heures).',
        reinstall_weboob: 'Réinstaller Weboob',
        title: 'Paramètres',
        tab_accounts: 'Comptes bancaires',
        tab_advanced: 'Avancés (beta)',
        erase_account: "Cela va supprimer le compte '%{title}' et toutes les opérations bancaires qu'il contient. Si c'est le dernier compte lié à cette banque, le lien bancaire sera supprimé. Êtes-vous sûrs de vouloir supprimer ce compte ?",
        erase_bank: "Cela va supprimer la banque nommée '%{name}', tous les comptes et toutes les opérations liées à cette banque. Êtes-vous sûrs de vouloir supprimer cette banque et tous ses comptes liés ?",
        submit: 'Sauvegarder'
    },

    similarity: {
        nothing_found: "Aucune paire d'opérations similaires n'a été trouvée.",
        title: "Doublons",
        help: "Il arrive que lors de l'import des opérations bancaires, certaines d'entre elles soient importées en double, par exemple quand la banque ajoute des informations sur une opération bancaires quelques jours après que celle-ci ait eu lieu. Cet écran vous montre les potentiels doublons (opérations qui ont le même montant sur une période temporelle donnée). Remarque : les catégories sont transférées lors de la suppression : si dans une paire de doublons A / B dans laquelle A a une catégorie et B n'en a pas, supprimer A réaffectera automatiquement sa catégorie à B.",
    },
}
