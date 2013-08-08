fs     = require 'fs'
{exec} = require 'child_process'

option '-f' , '--file [FILE*]' , 'test file to run'
option ''   , '--dir [DIR*]'   , 'directory where to grab test files'
option '-d' , '--debug'        , 'run node in debug mode'
option '-b' , '--debug-brk'    , 'run node in --debug-brk mode (stops on first line)'

options =  # defaults, will be overwritten by command line options
    file        : no
    dir         : no
    debug       : no
    'debug-brk' : no


# Grab test files of a directory
walk = (dir, fileList) ->
    list = fs.readdirSync(dir)
    if list
        for file in list
            if file
                filename = dir + '/' + file
                stat = fs.statSync(filename)
                if stat and stat.isDirectory()
                    walk(filename, fileList)
                else if filename.substr(-6) == "coffee"
                    fileList.push(filename)
    return fileList


task 'tests', 'run server tests, ./test is parsed by default, otherwise use -f or --dir', (opts) ->
    options   = opts
    testFiles = []
    if options.dir
        dirList   = options.dir
        testFiles = walk(dir, testFiles) for dir in dirList
    if options.file
        testFiles  = testFiles.concat(options.file)
    if not(options.dir or options.file)
        testFiles = walk("test", [])
    runTests testFiles
    
task 'tests:client', 'run client tests through mocha', (opts) ->
    options     = opts
    uiTestFiles = walk("client/test", [])
    runTests uiTestFiles


runTests = (fileList) ->
    command = "mocha " + fileList.join(" ") + " "
    if options['debug-brk']
        command += "--debug-brk --forward-io --profile "
    if options.debug
        command += "--debug --forward-io --profile "
    command += " --reporter spec --require should --compilers coffee:coffee-script --colors"
    exec command, (err, stdout, stderr) ->
        if err
            console.log "Running mocha caught exception: \n" + err
        console.log stdout


task "xunit", "", ->
    process.env.TZ = "Europe/Paris"
    command = "mocha "
    command += " --require should --compilers coffee:coffee-script -R xunit > xunit.xml"
    exec command, (err, stdout, stderr) ->
        console.log stdout


task "xunit:client", "", ->
    process.env.TZ = "Europe/Paris"
    command = "mocha client/test/*"
    command += " --require should --compilers coffee:coffee-script -R xunit > xunitclient.xml"
    exec command, (err, stdout, stderr) ->
        console.log stdout

