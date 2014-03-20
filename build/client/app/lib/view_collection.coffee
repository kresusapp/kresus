BaseView = require 'lib/base_view'

# View that display a collection of subitems
# used to DRY views
# Usage : new ViewCollection(collection:collection)
# Automatically populate itself by creating a itemView for each item
# in its collection

# can use a template that will be displayed alongside the itemViews

# itemView       : the Backbone.View to be used for items
# itemViewOptions : the options that will be passed to itemViews
# collectionEl : the DOM element's selector where the itemViews will
#                be displayed. Automatically falls back to el if null

module.exports = class ViewCollection extends BaseView

    itemview: null

    views: {}

    template: -> ''

    itemViewOptions: ->

    collectionEl: null

    # add 'empty' class to view when there is no subview
    onChange: ->
        @$el.toggleClass 'empty', _.size(@views) is 0

    # can be overriden if we want to place the subviews somewhere else
    appendView: (view) ->
        @$collectionEl.append view.el

    # bind listeners to the collection
    initialize: ->
        super
        @views = {}
        @listenTo @collection, "reset",   @onReset
        @listenTo @collection, "add",     @addItem
        @listenTo @collection, "remove",  @removeItem

        if not @collectionEl?
            collectionEl = el

    # if we have views before a render call, we detach them
    render: ->
        view.$el.detach() for id, view of @views
        super

    # after render, we reattach the views
    afterRender: ->
        @$collectionEl = $(@collectionEl)
        @appendView view.$el for id, view of @views
        @onReset @collection
        @onChange @views

    # destroy all sub views before remove
    remove: ->
        @onReset []
        super

    # event listener for reset
    onReset: (newcollection) ->
        view.remove() for id, view of @views
        newcollection.forEach @addItem

    # event listeners for add
    addItem: (model) =>
        options = _.extend {}, {model: model}, @itemViewOptions(model)
        view = new @itemview(options)
        @views[model.cid] = view.render()
        @appendView view
        @onChange @views

    # event listeners for remove
    removeItem: (model) =>
        @views[model.cid].remove()
        delete @views[model.cid]

        @onChange @views