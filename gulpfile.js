const gulp = require('gulp');
const Builder = require('systemjs-builder');
const del = require('del');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const typescript = require('gulp-typescript');
const htmlreplace = require('gulp-html-replace');
const replace = require('gulp-replace');

const tscConfig = require('./tsconfig.json');
  
// clean the contents of the distribution directory
gulp.task('clean', function () {
  return del('dist/**/*');
});

gulp.task('build-app', function () {
  return gulp
    .src('app/**/*.ts')
    .pipe(typescript(tscConfig.compilerOptions))
	//.pipe(concat('app.min.js'))
	.pipe(uglify())
    .pipe(gulp.dest('dist/app'));
});

gulp.task('copy:libs', function() {
  return gulp.src([
      'node_modules/core-js/client/shim.min.js',
      'node_modules/zone.js/dist/zone.js',
      'node_modules/reflect-metadata/Reflect.js',
      'node_modules/systemjs/dist/system.src.js'
    ])
    .pipe(concat('vendors.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('dist/lib'))
});

gulp.task('copy:assets', function() {
  return gulp.src(['app/**/*', 'styles.css', '!app/**/*.ts'], { base : './' })
    .pipe(gulp.dest('dist'))
});
  
gulp.task('bundle-angular', function() {
  // optional constructor options
  // sets the baseURL and loads the configuration file
  var builder = new Builder('', 'systemjs.config.js');

  return builder
    .bundle('app/main.js - [app/**/*.js]', 'dist/angular/angular.bundle.js', { minify: true})
    .then(function() {
      console.log('Building Angular dependecies complete');
    })
    .catch(function(err) {
      console.log('Build error');
      console.log(err);
    });
});

gulp.task('html', function() {
  gulp.src('index.html')
    .pipe(htmlreplace({
      'vendor': 'lib/vendors.min.js',
      'angular': 'angular/angular.bundle.js',
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('systemjs', function() {
  gulp.src('systemjs.config.js')
    .pipe(replace('node_modules/', 'angular'))
    .pipe(gulp.dest('dist'));
});

// TypeScript compile
gulp.task('compile', ['clean', 'build-app', 'html', 'systemjs', 'copy:assets', 'copy:libs', 'bundle-angular']);

gulp.task('build', ['compile']);
gulp.task('default', ['build']);