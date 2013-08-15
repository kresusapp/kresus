BaseView = require '../lib/base_view'


module.exports = class AppView extends BaseView

    template: require('./templates/mockup_balance')

    el: 'body.application'

    afterRender: ->
        $('.content-right-column').niceScroll()
