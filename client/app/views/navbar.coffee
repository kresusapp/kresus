BaseView = require '../lib/base_view'


module.exports = class NavbarView extends BaseView

    template: require('./templates/navbar')

    el: 'div#navbar'

    events:
        "click .menu-position" : "chooseMenuPosition"

    initialize: ->
        @listenTo window.activeObjects, 'changeActiveMenuPosition', @checkActive

    chooseMenuPosition: (event) ->
        window.activeObjects.trigger "changeActiveMenuPosition", event.target

    checkActive: (him) ->
        @$(".menu-position").removeClass("active")
        $(him).parent().addClass("active")
