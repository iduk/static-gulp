'use strict'

const gulp = require('gulp')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')(require('sass'))
const Fiber = require('fibers')
const postcss = require('gulp-postcss')
const cssnano = require('gulp-cssnano')
const nested = require('postcss-nested')
const cssnext = require('postcss-cssnext')
const postcssGapProperties = require('postcss-gap-properties')
const autoprefixer = require('autoprefixer')
const maps = require('gulp-sourcemaps')
const del = require('del')
const imagemin = require('gulp-imagemin')
const extender = require('gulp-html-extend')
const browserSync = require('browser-sync').create()

const PATH = {
  root: 'src/',
  ASSETS: {
    js: 'src/assets/js/',
    css: 'src/assets/scss/',
    img: 'src/assets/images/',
    font: 'src/assets/fonts/',
  },
}
const PATH_DEST = {
  root: 'out/',
  ASSETS: {
    js: 'out/assets/js/',
    css: 'out/assets/css/',
    img: 'out/assets/images/',
    font: 'out/assets/fonts/',
  },
}

/* 
  Template Pages 
*/
function HtmlExtend() {
  return gulp
    .src(PATH.root + '*.html')
    .pipe(extender({ annotations: true, verbose: false }))
    .pipe(gulp.dest(PATH_DEST.root))
    .pipe(browserSync.stream())
}

/* JS - libraries */
function JsLibrary() {
  return gulp
    .src([
      // PATH.ASSETS.js + '**/*.js',
      './node_modules/@popperjs/core/dist/umd/popper.js',
      './node_modules/bootstrap/dist/js/bootstrap.js',
    ])
    .pipe(maps.init())
    .pipe(uglify())
    .pipe(maps.write('.'))
    .pipe(gulp.dest(PATH_DEST.ASSETS.js))
    .pipe(browserSync.stream())
}

/* JS - custom */
function JsBundle() {
  return gulp
    .src([PATH.ASSETS.js + '*.js'])
    .pipe(maps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(maps.write('.'))
    .pipe(gulp.dest(PATH_DEST.ASSETS.js))
    .pipe(browserSync.stream())
}

/*  SASS  */
function Sass() {
  let plugins = [
    nested(),
    cssnext(),
    postcssGapProperties(),
    autoprefixer({
      grid: true,
    }),
    // cssnano(),
  ]
  return gulp
    .src(PATH.ASSETS.css + '**/*.{scss,css}')
    .pipe(maps.init())
    .pipe(sass({ fiber: Fiber }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(maps.write('.'))
    .pipe(gulp.dest(PATH_DEST.ASSETS.css))
    .pipe(browserSync.stream())
}

/* 
  Image Compress 
*/
function ImgMin() {
  return gulp
    .src([PATH.ASSETS.img + '**/*'])
    .pipe(imagemin())
    .pipe(gulp.dest(PATH_DEST.ASSETS.img))
}

/* Copy Fonts */
function CopyFont() {
  return gulp
    .src(PATH.ASSETS.font + '**/*')
    .pipe(gulp.dest(PATH_DEST.ASSETS.font))
}

/* delete */
function Delete(done) {
  del([PATH_DEST.root]), done()
}

/* Server */
function reload(done) {
  browserSync.reload()
  done()
}

function watch() {
  browserSync.init({
    server: {
      baseDir: PATH_DEST.root,
    },
  })
  gulp.watch(PATH.ASSETS.css + '**/*.scss', Sass)
  gulp.watch(PATH.root + '**/*.html', HtmlExtend)
  gulp.watch(PATH.root + '**/*.js', JsLibrary)
  gulp.watch(PATH.root + '*.js', JsBundle)
  gulp.watch(PATH.root + '**/*.html', reload)
}

exports.watch = watch

const BUILD = gulp.parallel(
  HtmlExtend,
  Sass,
  JsLibrary,
  JsBundle,
  ImgMin,
  CopyFont,
  watch
)

const RESOURCES = gulp.parallel(Sass, JsLibrary, CopyFont, ImgMin)

gulp.task('default', BUILD)
gulp.task('dev', RESOURCES)
gulp.task('clean', Delete)
