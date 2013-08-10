BaseView = require '../lib/base_view'


module.exports = class AppView extends BaseView

    template: require('./templates/app')

    el: 'body.application'

    afterRender: ->
    	$('.content-right-column').niceScroll()

