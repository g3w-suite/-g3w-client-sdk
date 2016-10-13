var path = require('path');
var del = require('del');
var url = require('url');
//Gulp
var gulp   = require('gulp');
var concat = require('gulp-concat');
var streamify = require('gulp-streamify');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var flatten = require('gulp-flatten');
var useref = require('gulp-useref');
var filter = require('gulp-filter');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var chalk = require('chalk');
var watch = require('gulp-watch');
var cleanCSS = require('gulp-clean-css');
var gutil = require("gulp-util");
var less = require('gulp-less');
var jshint = require('gulp-jshint');
var browserify = require('browserify');
var watchify = require('watchify');
var stringify = require('stringify');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');


var production = false;

gulp.task('browserify', [], function(done) {
    var bundler = browserify('./sdk.js', {
      basedir: "./",
      paths: ["./"],
      standalone: 'g3wsdk',
      debug: !production,
      cache: {},
      packageCache: {}
    });
    /*if (!production) {
      bundler = watchify(bundler);
    }*/
    bundler.transform(stringify, {
      appliesTo: { includeExtensions: ['.html'] }
    });
    bundler.bundle()
    .on('error', function(err){
      console.log(err);
      //browserSync.notify(err.message, 3000);
      //browserSync.reload();
      this.emit('end');
      del(['.build/sdk.js']).then(function(){
        process.exit();
      });
    })
    .pipe(source('build.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpif(production, uglify().on('error', gutil.log)))
    .pipe(sourcemaps.write())
    .pipe(rename('sdk.js'))
    .pipe(gulp.dest('./build'));
});


gulp.task('build-sdk', ['browserify']);

gulp.task('default',['build-sdk']);



