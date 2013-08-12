BaseView = require '../lib/base_view'


module.exports = class NavbarView extends BaseView

    template: require('./templates/navbar')

    el: 'div#navbar'

    events:
        "click .menu-position" : "chooseMenuPosition"

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveMenuPosition', @checkActive
        @listenTo window.collections.banks, 'change', @refreshOverallBalance

    refreshOverallBalance: ->
        
        sum = 0
        for bank in window.collections.banks.models
            if bank.get("amount")?
                sum += Number bank.get("amount")
        console.log "recalculating the balance: " + sum
        $("span#total-amount").html sum.money()

    chooseMenuPosition: (event) ->
        window.activeObjects.trigger "changeActiveMenuPosition", event.target

    checkActive: (him) ->
        @$(".menu-position").removeClass("active")
        $(him).parent().addClass("active")
