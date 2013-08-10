BaseView = require '../lib/base_view'


module.exports = class NavbarView extends BaseView

    template: require('./templates/navbar')

    el: 'div#navbar'
