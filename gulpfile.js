'use strict'

const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const cssmin = require('gulp-cssmin')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const nested = require('postcss-nested')
const sugarss = require('sugarss')
const maps = require('gulp-sourcemaps')
const del = require('del')
const browserSync = require('browser-sync').create()
const imagemin = require('gulp-imagemin')
const copy = require('gulp-copy')
const extender = require('gulp-html-extend')
const sass = require('gulp-sass')(require('sass'))

const PATH = {
  root: 'src/',
  ASSETS: {
    js: 'src/assets/js/',
    css: 'src/assets/scss/',
    img: 'src/assets/images/',
    fonts: 'src/assets/fonts/',
  },
}
const PATH_DEST = {
  root: 'out/',
  ASSETS: {
    js: 'out/assets/js/',
    css: 'out/assets/css/',
    img: 'out/assets/images/',
    fonts: 'out/assets/fonts/',
  },
}

/* 
  Template Pages 
*/
gulp.task('extend', function () {
  return gulp
    .src(PATH.root + '*.html')
    .pipe(extender({ annotations: true, verbose: false }))
    .pipe(gulp.dest(PATH_DEST.root))
})

/* JS - libraries */
gulp.task('libScripts', function () {
  return gulp
    .src([PATH.ASSETS.js + '*.js'])
    .pipe(uglify())
    .pipe(gulp.dest(PATH_DEST.ASSETS.js))
})

/* JS - custom */
gulp.task('customScripts', function () {
  return gulp
    .src([PATH.ASSETS.js + '*.js'])
    .pipe(maps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(maps.write('.'))
    .pipe(gulp.dest(PATH_DEST.ASSETS.js))
})

/* 
  SCSS/CSS 
*/

gulp.task('compileSass', function () {
  // let plugins = [nested]
  return (
    gulp
      .src([PATH.ASSETS.css + '**/*.scss'])
      .pipe(maps.init())
      .pipe(sass().on('error', sass.logError))
      // 오류 node-sass 설치해봐야됨
      // .pipe(postcss(plugins, { parser: sugarss }))
      .pipe(maps.write('.'))
      .pipe(gulp.dest(PATH_DEST.ASSETS.css))
      .pipe(browserSync.stream({ match: '**/*.css' }))
  )
})

/* 
  Image Compress 
*/
gulp.task('compressImages', function () {
  return gulp
    .src([PATH.ASSETS.img + '*'])
    .pipe(
      imagemin([
        imagemin.gifsicle({
          interlaced: true,
        }),
        imagemin.optipng({
          optimizationLevel: 5,
        }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: true,
            },
            {
              cleanupIDs: false,
            },
          ],
        }),
      ])
    )
    .pipe(gulp.dest(PATH_DEST.ASSETS.img))
})

/* 
  Copy Fonts 
*/
gulp.task('copy', function () {
  return gulp.src(PATH.ASSETS.fonts).pipe(gulp.dest(PATH_DEST.ASSETS.fonts))
})

gulp.task('clean', function (done) {
  del([PATH_DEST.root]), done()
})

/* 
  BUILD START
*/

gulp.task(
  'build',
  gulp.series(
    'extend',
    'copy',
    'libScripts',
    'customScripts',
    'compileSass',
    'compressImages'
  ),
  function () {
    return gulp
      .src(
        [
          PATH_DEST.root + '**/*.html',
          PATH_DEST.root + '**/*.ico',
          PATH_DEST.fonts + '**/*.*',
          PATH_DEST.ASSETS.img + '**/*.*',
        ],
        {
          base: './',
        }
      )
      .pipe(babel())
      .pipe(gulp.dest(PATH_DEST.root))
  }
)

/*
  WATCH
*/
gulp.task('watchFiles', function () {
  browserSync.init({
    server: PATH_DEST.root,
    baseDir: './',
    open: true,
  }),
    gulp.watch(PATH.ASSETS.css + '**/*.scss', gulp.series('compileSass'))
  gulp.watch(
    PATH.ASSETS.js + '**/*.js',
    gulp.series('libScripts', 'customScripts')
  )
  gulp.watch(PATH.root + '**/*.html', gulp.series('extend'))
  gulp.watch('**/*.html').on('change', browserSync.reload)
})

/* gulp default */
gulp.task('default', gulp.parallel('clean', 'build', 'watchFiles'))
/* gulp dev */
gulp.task('dev', gulp.parallel('clean', 'build'))
