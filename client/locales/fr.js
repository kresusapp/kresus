module.exports = {
    'KRESUS': 'KRESUS',
    'Reports': 'Rapports',
    'Charts': 'Graphiques',
    'Categories': 'Catégories',
    'Similarities': 'Doublons',
    'Settings': 'Préférences',
    'Banks': 'Banques',
    'Accounts': 'Comptes',

    'save': 'sauver',
    'cancel': 'annuler',
    'delete': 'supprimer',

    'Confirm deletion': 'Confirmer la suppression',
    'Dont delete': "Ne pas supprimer",

    'kresus-init-please-wait': "Veuillez patienter pendant l'initialisation de Kresus",
    'kresus-loading': "Kresus est en train de télécharger de la magie, accrochez-vous !",

    // When installing dependencies
    'Please wait during Kresus dependencies installation': "Merci de patienter pendant l'installation des dépendences de Kresus",
    'dependencies-install': "Dans quelques minutes, rechargez la page, et si Kresus ne s'affiche pas entièrement, merci de contacter un des mainteneurs de Kresus en lui indiquant le contenu de la fenêtre de debug ci-dessous.",

    // Categories
    'add a category': 'ajouter une catégorie',
    'CATEGORY NAME': 'NOM',
    'ACTION': 'ACTION',
    'none_category': 'Sans',
    'edit': 'éditer',
    'Dont replace': 'Ne pas remplacer',

    // Graphs
    'all': 'tout',
    'by category': 'par catégorie',
    'by category by month': 'par catégorie (mensuel)',
    'balance': 'balance',
    'differences (account)': 'rentrées et sorties (compte)',
    'differences (all)': 'rentrées et sorties (tous les comptes)',
    'By category': 'Par catégorie',
    'Amount': 'Montant',
    'Received': 'Reçu',
    'Paid': 'Payé',
    'Saved': 'Economisé',
    'Received / Paid / Saved over time': 'Reçu / Payé / Economisé au cours du temps',

    // OperationList
    'Full label:': 'Libellé complet :',
    'Amount:': 'Montant :',
    'Category:': 'Catégorie :',
    'Any category': "N'importe quelle catégorie",
    'Keywords': 'Mots-clés',
    'Category': 'Catégorie',
    'Amount: low': 'Montant : entre',
    'high': 'et',
    'Date: between': 'Période : entre',
    'and': 'et',
    'clear': 'réinitialiser',
    'Search': 'Recherche',
    'Ohnoes!': 'Oh non !',
    'no-account-set': "Il semblerait que vous n'ayez défini aucun compte ! Vous pouvez en définir un dans les Préférences.",
    'Last synchronization with your bank:': 'Dernière synchronisation avec votre banque :',
    'Synchronize now': 'Synchroniser maintenant',
    'Current Balance': 'Balance en cours',
    'As of': 'A la date du',
    'For this search': 'Recherche courante',
    'This month': 'Ce mois',
    'Transactions': 'Opérations',
    'Date': 'Date',
    'Operation': 'Opération',
    'download bill': 'Télécharger la facture associée',

    // Settings
    'Name': 'Nom',
    'Bank': 'Banque',
    'Website': 'Site régional',
    'ID': 'Identifiant',
    'Password': 'Mot de passe',
    'Save': 'Sauvegarder',
    'Configure a new bank access': 'Configurer un nouvel accès',
    'Duplicate threshold': 'Seuil de doublon',
    'duplicate_help': 'Deux opérations seront considérées comme étant des doublons dans la partie Doublons si celles-ci sont arrivées au cours de cette période temporelle (en heures).',
    'Bank accounts': 'Comptes bancaires',
    'Advanced (beta)': 'Avancé (beta)',

    // Similarities
    'No similar operations found.': "Aucune paire d'opérations similaires n'a été trouvée.",
    'similarities_help': "Il arrive que lors de l'import des opérations bancaires, certaines d'entre elles soient importées en double, par exemple quand la banque ajoute des informations sur une opération bancaires quelques jours après que celle-ci ait eu lieu. Cet écran vous montre les potentiels doublons (opérations qui ont le même montant sur une période temporelle donnée). Remarque : les catégories sont transférées lors de la suppression : si dans une paire de doublons A / B dans laquelle A a une catégorie et B n'en a pas, supprimer A réaffectera automatiquement sa catégorie à B.",

    // Parametred
    'erase_category': "Cela va supprimer la catégorie '%{title}'. S'il y a des opérations affectées à cette catégorie, vous pouvez les réaffecter à une catégorie existante à l'aide du menu déroulant (sinon, ces opérations n'auront plus de catégorie). Êtes-vous sûr de vouloir supprimer cette catégorie ?",
    'erase_account': "Cela va supprimer le compte '%{title}' et toutes les opérations bancaires qu'il contient. Si c'est le dernier compte lié à cette banque, le lien bancaire sera supprimé. Êtes-vous sûrs de vouloir supprimer ce compte ?",
    'erase_bank': "Cela va supprimer la banque nommée '%{name}', tous les comptes et toutes les opérations liées à cette banque. Êtes-vous sûrs de vouloir supprimer cette banque et tous ses comptes liés ?"
}
