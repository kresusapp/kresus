should = require 'should'
Client = require('request-json').JsonClient
path = require 'path'
fixtures = require 'cozy-fixtures'

fixtures.setDefaultValues
    dirPath: path.resolve __dirname, '../fixtures/'
    silent: true
    removeBeforeLoad: false # we clean the DB before tests

helpers = require '../helpers'
helpers.options =
    serverHost: 'localhost'
    serverPort: '8888'
client = new Client "http://#{helpers.options.serverHost}:#{helpers.options.serverPort}/"

describe "Bank Accounts Controller", ->

    before helpers.cleanDBWithRequests
    before helpers.startApp
    after helpers.stopApp
    after helpers.cleanDBWithRequests

    describe.skip "When I add bank accounts", ->
        before helpers.cleanDB
        before (done) -> fixtures.load doctypeTarget: 'BankAccount', callback: done
        after helpers.cleanDB

        describe.skip "When I GET /bankaccounts", ->

            @err = null
            @res = null
            @body = null

            before (done) =>
                client.get 'bankaccounts', (err, res, body) =>
                    @err = err
                    @res = res
                    @body = body
                    done()

            it "The response should be a success", =>
                should.not.exist @err
                should.exist @res
                should.exist @body

                @res.should.have.property 'statusCode'
                @res.statusCode.should.equal 200
                @body.should.be.an.Array

            #it "And there should be 4 banks with an ID, a name and a uuid", =>
            #    @body.length.should.equal 4

            #    for bank in @body.length
            #        bank.should.have.properties ['id', 'name', 'uuid']

        describe.skip "When I GET /bankaccounts/:bankAccountID with an existing ID", ->

            @err = null
            @res = null
            @body = null
            @expectedBody = null

            before (done) =>
                client.get 'bankAccounts', (err, res, body) =>
                    @expectedBody = body[0]
                    client.get "banks/#{@expectedBody.id}", (err, res, body) =>
                        @err = err
                        @res = res
                        @body = body
                        done()

            it "The response should be a success", =>
                should.not.exist @err
                should.exist @res
                should.exist @body

                @res.should.have.property 'statusCode'
                @res.statusCode.should.equal 200
                @body.should.be.an.Object

            #it "And the body should have ID, name and uuid properties", =>
            #    @body.should.have.properties ['id', 'name', 'uuid']

            #it "And the body should be the same than the one in the list", =>
            #    @body.id.should.equal @expectedBody.id
            #    @body.name.should.equal @expectedBody.name
            #    @body.uuid.should.equal @expectedBody.uuid

        describe "When I GET /bankaccounts/:bankAccountID with an unknown ID", ->

            @err = null
            @res = null
            @body = null

            before (done) =>
                client.get "bankaccounts/123", (err, res, body) =>
                    @err = err
                    @res = res
                    @body = body
                    done()

            it "The response should be an error", =>
                should.not.exist @err
                should.exist @res
                should.exist @body
                @res.should.have.property 'statusCode'
                @res.statusCode.should.equal 404
                @body.should.have.property 'error'

        describe "When I DELETE /bankaccounts/:bankID", ->
            it "The response should be a success"
            it "And the bank account shouldn't be in the database anymore"
            it "And the bank account's operations shouldn't be in the database anymore"

        describe "When I GET /bankaccounts/getOperations/:bankAccountID", ->
            it "The response should be a success"
            it "And there should be x bank operations in the body"

        describe "When I GET /banks/retrieveOperations/:bankAccountID", ->
            it "The response should be a success"
            it "And there should be x bank accounts in the body"