should = require 'should'
path = require 'path'
fixtures = require 'cozy-fixtures'

fixtures.setDefaultValues
    dirPath: path.resolve __dirname, '../fixtures/'
    silent: true
    removeBeforeLoad: false # we clean the DB before tests

helpers = require '../helpers'
client = helpers.getClient()

describe "Bank Alerts Controller", ->

    before helpers.cleanDBWithRequests
    before helpers.startApp
    after helpers.stopApp
    after helpers.cleanDBWithRequests

    describe "When I add bank alerts", ->

        describe "When I retrieve them", ->
            it "The response should be a success"
            it "There should be x bank alerts"

        describe "When I retrieve one of them", ->
            it "The response should be a success"
            it "The alert should have the correct values"

        describe "When I update one of them", ->
            it "The response should be a success"
            it "The alert in the database should be updated"

        describe "When I destroy one of them", ->
            it "The response should be a success"
            it "The alert shouldn't be in the database anymore"

        describe "When I retrieve the alerts for a given bank account", ->
            it "The response should be a success"
            it "There should be x bank alerts"

    describe "When I create a bank alert", ->
        it "The response should be a success"
        it "It should be in the database"

