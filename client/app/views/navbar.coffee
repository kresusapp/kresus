BaseView = require '../lib/base_view'


module.exports = class NavbarView extends BaseView

    template: require('./templates/navbar')

    el: 'div#navbar'
    
    initialize: ->
        @listenTo window.collections.banks, "change", @refreshOverallBalance
        @listenTo window.collections.banks, 'destroy', @refreshOverallBalance
        @listenTo window.collections.banks, 'update', @refreshOverallBalance
        @listenTo window.collections.banks, 'reset', @refreshOverallBalance

    refreshOverallBalance: ->
        sum = window.collections.banks.getSum()
        console.log "recalculating the overall balance: " + sum
        $("span#total-amount").html sum.money()
