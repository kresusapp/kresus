var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var coffee = require('gulp-coffee');
var g = require('gulp');
var reactify = require('reactify');
var rm = require('del');
var source = require('vinyl-source-stream');

g.task('default', ['b']);
g.task('b' /* build */, ['build-client', 'build-server']);

const BUILDDIR = 'build/';

g.task('build-client', function() {
    rm(BUILDDIR + 'client/');

    g.src('static/**/*')
     .pipe(g.dest(BUILDDIR + 'client/'))
    ;

    var bundler = browserify({
        entries: ['./client/main.js'],
        debug: true
    });

    bundler
     .transform(reactify)
     .bundle()
     .pipe(source('main.js'))
     .pipe(buffer())
     .pipe(g.dest(BUILDDIR + 'client/js'))
});

g.task('build-server', function() {
    rm([BUILDDIR + 'server/', 'server.js']);

    g.src('server/**/*.coffee')
     .pipe(coffee().on('error', console.log.bind(console)))
     .pipe(g.dest(BUILDDIR + 'server/'))
    ;
    g.src('server.coffee')
     .pipe(coffee().on('error', console.log.bind(console)))
     .pipe(g.dest(BUILDDIR))
    ;

    g.src('package.json')
     .pipe(g.dest(BUILDDIR))
    ;

    // Dev files
    g.src('tests/**/*.coffee')
     .pipe(coffee().on('error', console.log.bind(console)))
     .pipe(g.dest(BUILDDIR + 'tests/'))
    ;
    g.src('tests/**/*.json')
     .pipe(g.dest(BUILDDIR + 'tests/'))
    ;
});

g.task('w' /* watch */, ['build-client', 'build-server'], function() {
    g.watch(['client/**/*.js', 'static/**/*'], ['build-client']);
    g.watch(['server/**/*.coffee', 'server.coffee', 'tests/**/*'], ['build-server']);
});

