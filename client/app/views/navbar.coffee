BaseView = require '../lib/base_view'


module.exports = class NavbarView extends BaseView

    template: require('./templates/navbar')

    el: 'div#navbar'

    events:
        "click .menu-position" : "chooseMenuPosition"

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveMenuPosition', @checkActive
        @listenTo window.collections.banks, 'change', @refreshOverallBalance
        @listenTo window.collections.banks, 'destroy', @refreshOverallBalance

    refreshOverallBalance: ->
        sum = window.collections.banks.getSum()
        #console.log "recalculating the balance: " + sum
        $("span#total-amount").html sum.money()

    chooseMenuPosition: (event) ->
        window.activeObjects.trigger "changeActiveMenuPosition", event.target

    checkActive: (him) ->
        @$(".menu-position").removeClass("active")
        $(him).parent().addClass("active")
