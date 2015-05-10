var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var coffee = require('gulp-coffee');
var lint = require('gulp-coffeelint');
var g = require('gulp');
var concat = require('gulp-concat');
var babelify = require('babelify');
var rm = require('del');
var source = require('vinyl-source-stream');

g.task('default', ['b']);
g.task('b' /* build */, ['build-client', 'build-server']);


const BUILDDIR = 'build/';


g.task('client-remove-dir', function() {
    return rm(BUILDDIR + 'client/');
});

g.task('client-bundle-css', function() {
    return g.src('client/css/**/*')
     .pipe(concat('main.css'))
     .pipe(g.dest(BUILDDIR + 'client/css'));
});

g.task('client-copy-static', function() {
    return g.src('static/**/*')
     .pipe(g.dest(BUILDDIR + 'client/'));
    ;
});

g.task('client-bundle-vendor', function() {
    return g.src('client/vendor/**/*')
     .pipe(concat('vendor.js'))
     .pipe(g.dest(BUILDDIR + 'client/js'));
});

g.task('build-client',
       ['client-remove-dir', 'client-copy-static', 'client-bundle-vendor', 'client-bundle-css'],
      function() {

    var bundler = browserify({
        entries: ['./client/main.js'],
        debug: true
    });

    return bundler
     .transform(babelify.configure({
        optional: ['runtime']
     }))
     .bundle()
        .on('error', function(err) {
            console.error('Bundle error: ' + err.toString());
            this.end();
        })
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

g.task('clean', function() {
  rm(BUILDDIR);
});

g.task('lint', function() {
  g
  .src(['server/**/*.coffee', 'server.coffee'])
  .pipe(lint())
  .pipe(lint.reporter())
  ;
});

g.task('w' /* watch */, ['build-client', 'build-server'], function() {
    g.watch(['client/**/*.js', 'static/**/*'], ['build-client']);
    g.watch(['server/**/*.coffee', 'server.coffee', 'tests/**/*'], ['build-server']);
});

