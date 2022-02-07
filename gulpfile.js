'use strict'

const gulp = require('gulp')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const Fiber = require('fibers')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const nested = require('postcss-nested')
const cssnext = require('postcss-cssnext')
const maps = require('gulp-sourcemaps')
const del = require('del')
const imagemin = require('gulp-imagemin')
const copy = require('gulp-copy')
const extender = require('gulp-html-extend')
const browserSync = require('browser-sync').create()

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
function HtmlExtend() {
  return gulp
    .src(PATH.root + '*.html')
    .pipe(extender({ annotations: true, verbose: false }))
    .pipe(gulp.dest(PATH_DEST.root))
    .pipe(browserSync.stream())
}

/* JS - libraries */
function jsLint() {
  return gulp
    .src([PATH.ASSETS.js + '*.js'])
    .pipe(uglify())
    .pipe(gulp.dest(PATH_DEST.ASSETS.js))
    .pipe(browserSync.stream())
}

/* JS - custom */
// gulp.task("customScripts", function () {
//   return gulp
//     .src([PATH.ASSETS.js + "*.js"])
//     .pipe(maps.init())
//     .pipe(concat("main.js"))
//     .pipe(uglify())
//     .pipe(rename({ suffix: ".min" }))
//     .pipe(maps.write("./maps"))
//     .pipe(gulp.dest(PATH_DEST.ASSETS.js))
// })

/*  SASS  */
function Sass() {
  let plugins = [nested(), cssnano(), autoprefixer({})]
  return gulp
    .src(PATH.ASSETS.css + '**/*.scss')
    .pipe(maps.init())
    .pipe(sass({ fiber: Fiber }).on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(maps.write('./map'))
    .pipe(gulp.dest(PATH_DEST.ASSETS.css))
    .pipe(browserSync.stream())
}

/* 
  Image Compress 
*/
function ImgMin() {
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
}

/* Copy Fonts */
function CopyFont() {
  return gulp.src(PATH.ASSETS.fonts).pipe(gulp.dest(PATH_DEST.ASSETS.fonts))
}

/* Clean */
function Clean(done) {
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
  gulp.watch(PATH.ASSETS.img, ImgMin)
  gulp.watch(PATH.ASSETS.css + '**/*.scss', Sass)
  gulp.watch(PATH.root + '**/*.html', HtmlExtend)
  gulp.watch(PATH.root + '**/*.js', jsLint)
  gulp.watch(PATH.root + '**/*.html', reload)
}
exports.watch = watch

const Build = gulp.parallel(HtmlExtend, Sass, jsLint, ImgMin, CopyFont, watch)

gulp.task('default', Build)
gulp.task('clean', Clean)
