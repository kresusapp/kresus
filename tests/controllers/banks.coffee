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

describe "Banks Controller", ->

    before helpers.cleanDBWithRequests
    before helpers.startApp
    after helpers.stopApp
    after helpers.cleanDBWithRequests

    describe "When I add banks", ->
        before helpers.cleanDB
        before (done) -> fixtures.load doctypeTarget: 'Bank', callback: done
        after helpers.cleanDB

        describe "When I GET /banks", ->

            @err = null
            @res = null
            @body = null

            before (done) =>
                client.get 'banks', (err, res, body) =>
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

            it "And there should be 4 banks with an ID, a name and a uuid", =>
                @body.length.should.equal 4

                for bank in @body.length
                    bank.should.have.properties ['id', 'name', 'uuid']

        describe "When I GET /banks/:bankID with an existing ID", ->

            @err = null
            @res = null
            @body = null
            @expectedBody = null

            before (done) =>
                client.get 'banks', (err, res, body) =>
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

            it "And the body should have ID, name and uuid properties", =>
                @body.should.have.properties ['id', 'name', 'uuid']

            it "And the body should be the same than the one in the list", =>
                @body.id.should.equal @expectedBody.id
                @body.name.should.equal @expectedBody.name
                @body.uuid.should.equal @expectedBody.uuid

        describe "When I GET /banks/:bankID with an unknown ID", ->

            @err = null
            @res = null
            @body = null

            before (done) =>
                client.get "banks/123", (err, res, body) =>
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

        describe "When I DELETE /banks/:bankID", ->
            it "The response should be a success"
            it "And the bank shouldn't be in the database anymore"
            it "And the bank's accesses shouldn't be in the database anymore"
            it "And the bank's accounts shouldn't be in the database anymore"
            it "And the bank's operations shouldn't be in the database anymore"

        describe "When I GET /banks/getAccesses/:bankID", ->
            it "The response should be a success"
            it "And there should be x bank accesses in the body"

        describe "When I GET /banks/getAccounts/:bankID", ->
            it "The response should be a success"
            it "And there should be x bank accounts in the body"

