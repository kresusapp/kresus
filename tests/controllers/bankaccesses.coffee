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

describe "Bank Accesses Controller", ->

    before helpers.cleanDBWithRequests
    before helpers.startApp
    after helpers.stopApp
    after helpers.cleanDBWithRequests

    describe "When I add bank accesses", ->
        before helpers.cleanDB
        before (done) -> fixtures.load doctypeTarget: 'BankAccess', callback: done
        after helpers.cleanDB

        describe "When I GET /bankaccesses", ->

            @err = null
            @res = null
            @body = null

            before (done) =>
                client.get 'bankaccesses', (err, res, body) =>
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

            # TODO: unskip test when fixtures is ready
            it.skip "And there should be 4 bank accesses with an ID, a bank, a login and a password", =>
                @body.length.should.equal 4

                for bankAccess in @body.length
                    bankAccess.should.have.properties ['id', 'bank', 'login', 'password']

        # TODO: unskip test when fixtures is ready
        describe.skip "When I GET /bankaccesses/:bankAccessID with an existing ID", ->

            @err = null
            @res = null
            @body = null
            @expectedBody = null

            before (done) =>
                client.get 'bankaccesses', (err, res, body) =>
                    @expectedBody = body[0]
                    client.get "bankaccesses/#{@expectedBody.id}", (err, res, body) =>
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

            it "And the body should have ID, name and uuid properties", =>
                @body.should.have.properties ['id', 'name', 'uuid']

            it "And the body should be the same than the one in the list", =>
                @body.id.should.equal @expectedBody.id
                @body.name.should.equal @expectedBody.name
                @body.uuid.should.equal @expectedBody.uuid

        describe "When I GET /bankaccesses/:bankAccessID with an unknown ID", ->

            @err = null
            @res = null
            @body = null

            before (done) =>
                client.get "bankaccesses/123", (err, res, body) =>
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

        describe.skip "When I POST /bankaccesses", ->
            it "The response should be a success"
            it "And the bank access should be in the database"

        describe.skip "When I PUT /bankaccesses/:bankAccessID", ->
            it "The response should be a success"
            it "And the bank access should be updated in the database"

        describe.skip "When I DELETE /bankaccesses/:bankAccessID", ->
            it "The response should be a success"
            it "And the bank access shouldn't be in the database anymore"
            it "And the bank access' accounts shouldn't be in the database anymore"
            it "And the bank access' operations shouldn't be in the database anymore"

        describe.skip "When I GET /bankaccesses/getAccounts/:bankAccessID", ->
            it "The response should be a success"
            it "And there should be x bank accounts in the body"