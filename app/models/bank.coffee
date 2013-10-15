module.exports = (compound, Bank) ->

    Bank.all = (callback) ->
        Bank.request "all", callback

    Bank.destroyAll = (callback) ->
        Bank.requestDestroy "all", callback

    Bank.createAccess = (params, callback) ->
        BankAccess = compound.models.BankAccess
        params.bank = @
        BankAccess.create params, callback

    Bank.all (err, banks) ->
        if err or (banks?.length == 0)
            # if there aren't any banks
            Bank.create {name: "Société Générale", uuid: "societegenerale"}, (err) ->
                if not err
                    Bank.create {name: "La Banque Postale", uuid: "bp"}, (err) ->
                        if not err
                            Bank.create {name: "Crédit Coopératif", uuid: "creditcooperatif"}
