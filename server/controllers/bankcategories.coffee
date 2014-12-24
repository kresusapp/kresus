BankCategory = require '../models/bankcategory'

module.exports.index = (req, res) ->
    BankCategory.all (err, cats) ->
        if err?
            console.error 'when retrieving categories:' + err.toString()
            res.send 500, error: 'Server error while retrieving categories'
            return
        res.send 200, cats
    true

module.exports.create = (req, res) ->
    cat = req.body

    # Missing parameters
    if not cat.title?
        res.send 400, error: 'Missing title in category'
        return

    # Create function, factored out as used two times
    _create = (cat) ->
        BankCategory.create cat, (err, ccat) ->
            if err?
                console.error 'when creating category: ' + err.toString()
                res.send 500, 'Server error when creating category'
                return
            res.send 200, ccat

    # Missing parent category
    if cat.parentId?
        BankCategory.byId cat.parentId, (err, found) =>
            if err?
                console.error 'when retrieving parent category: ' + err.toString()
                res.send 500, error: 'Server error when retrieving categories'
                return
            if not found?
                res.send 404, error: 'Parent category not found'
                return
            _create cat
        return

    _create cat
    true

module.exports.loadCategory = (req, res, next, id) ->
    BankCategory.find id, (err, category) =>
        if err?
            console.error 'when loading a category: ' + err.toString()
            res.send 500, error: "Server error when loading a category"
            return

        if not category?
            res.send 404, error: "Category not found"
            return

        @category = category
        next()

module.exports.update = (req, res) ->
    cat = req.body

    # missing parameters
    if not cat.title?
        res.send 400, error: 'Missing parameter'
        return

    @category.updateAttributes cat, (err) ->
        if err?
            console.error 'when updating a category: ' + err.toString()
            res.send 500, error: 'Server error when updating category'
            return
        res.send 200
