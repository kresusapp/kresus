async = require 'async'
BankCategory = require '../models/bankcategory'
BankOperation = require '../models/bankoperation'

module.exports.index = (req, res) ->
    BankCategory.all (err, cats) ->
        if err?
            console.error 'when retrieving categories:' + err.toString()
            res.status(500).send(error: 'Server error while retrieving categories')
            return
        res.status(200).send(cats)
    true

module.exports.create = (req, res) ->
    cat = req.body

    # Missing parameters
    if not cat.title?
        res.status(400).send(error: 'Missing title in category')
        return

    # Create function, factored out as used two times
    _create = (cat) ->
        BankCategory.create cat, (err, ccat) ->
            if err?
                console.error 'when creating category: ' + err.toString()
                res.status(500).send(error:'Server error when creating category')
                return
            res.status(200).send(ccat)

    # Missing parent category
    if cat.parentId?
        BankCategory.byId cat.parentId, (err, found) =>
            if err?
                console.error 'when retrieving parent category: ' + err.toString()
                res.status(500).send(error: 'Server error when retrieving categories')
                return
            if not found?
                res.status(404).send(error: 'Parent category not found')
                return
            _create cat
        return

    _create cat
    true

module.exports.loadCategory = (req, res, next, id) ->
    BankCategory.find id, (err, category) =>
        if err?
            console.error 'when loading a category: ' + err.toString()
            res.status(500).send(error: "Server error when loading a category")
            return

        if not category?
            res.status(404).send(error: "Category not found")
            return

        @category = category
        next()

module.exports.update = (req, res) ->
    cat = req.body

    # missing parameters
    if not cat.title?
        res.status(400).send(error: 'Missing parameter title')
        return

    @category.updateAttributes cat, (err) ->
        if err?
            console.error 'when updating a category: ' + err.toString()
            res.status(500).send(error: 'Server error when updating category')
            return
        res.send 200

module.exports.delete = (req, res) ->
    replaceby = req.body.replaceByCategoryId

    if not replaceby?
        res.status(400).send(error: 'Missing parameter replaceby')
        return

    former = @category

    next = () ->
        BankOperation.allByCategory former.id, (err, ops) ->
            if err?
                console.error 'when finding all operations by category: ' + err.toString()
                res.status(500).send(error: 'Server error when deleting category')
                return

            attr =
                categoryId: replaceby

            updateOne = (op, cb) ->
                op.updateAttributes attr, cb

            async.each ops, updateOne, (err) ->
                if err?
                    console.error 'when updating some operations categories: ' + err.toString()
                    res.status(500).send(error: 'Server error when updating new category')
                    return

                former.destroy (err) ->
                    if err?
                        console.error 'when deleting the category: ' + err.toString()
                        res.status(500).send(error: 'Server error when deleting category')
                        return

                    res.status(200)

    # check that the replacement category actually exists
    if replaceby.toString() != '-1'
        console.log 'replacing by another category'
        BankCategory.find replaceby, (err, rcat) ->
            if err?
                console.error 'when finding replacement category: ' + err.toString()
                res.status(404).send(error: 'replacement category not found')
                return
            next()
    else
        console.log 'replacing by none'
        next()
