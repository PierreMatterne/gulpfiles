// Import `src` and `dest` from gulp for use in the task.
const { src, dest } = require('gulp');
const gulp = require('gulp');
const { series, parallel } = require('gulp');

// Import Gulp plugins.
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');

// MES TRUCS HABITUELS
const browserSync = require('browser-sync');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleancss = require('gulp-clean-css');
const sass = require('gulp-sass');
const size = require('gulp-filesize');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const notify = require('gulp-notify');
const fileinclude = require('gulp-file-include');
const removeHtmlComments = require('gulp-remove-html-comments');
const jshint = require('gulp-jshint');

// =========================================================================

// TRANSORMATION CSS
function css_ification() {
	console.log("--- CSS-ification ---");
	return src('./src/css/scss/**/*.scss')
	.pipe(plumber({
		errorHandler: notify.onError("Erreur: <%= error.message %>")
	}))
	.pipe(sass()) 
	.pipe(autoprefixer({
		browsers: ['last 2 versions'],
		cascade: false
	}))
	.pipe(cleancss())
	.pipe(dest('./dist/css'))
	.pipe(size())
	// .pipe(notify("fin de test"))
	.pipe(browserSync.stream());
}

// TRANSORMATION JS
function js_ification() {
	console.log("--- JS-ification ---");
	return src('./src/js/*.js') 
	.pipe(plumber({
		errorHandler: notify.onError("Erreur: <%= error.message %>")
	}))
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'))
	.pipe(jshint.reporter('fail'))
	// ===== BABEL =======================
	// celui-ci n'affiche pas d'erreur et semble fonctionner
	.pipe(babel({
		babelrc: false,
		presets: ['@babel/preset-env'],
	}))
	// Celui-ci devrait aussi fonctionner
	  /*
	  .pipe(babel({
    	presets: [
    	['@babel/env', {
    		modules: false
    	}]
    	]
    }))
    */
    // ===== /BABEL ======================
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(dest('./dist/js'))
    .pipe(size())
    .pipe(browserSync.reload({stream:true}));
}

// TRANSORMATION HTML
function html_ification() {
	console.log("--- HTML-ification ---");
	return src('./src/*.html') 
	.pipe(plumber({
		errorHandler: notify.onError("Erreur: <%= error.message %>")
	}))
	.pipe(fileinclude({
		prefix: '@@',
		basepath: './src/includes/'
	}))
	.pipe(removeHtmlComments())
  /*
  // to minify. Not useful with wordpress
  .pipe(htmlmin({
    collapseWhitespace: true
  }))
  */
  .pipe(dest('./dist'))
  .pipe(size())
  .pipe(browserSync.reload({stream:true}));
}

// =========================================================================

// ===============================
// WATCH and BrowserSync FUNCTIONS
// ===============================

// BrowserSync Start
function startBroowserSync() {
	browserSync.init({
		server: {
			baseDir: "./dist/"
		},
		port: 3000
	});
}

// Watch wich files
function watchFiles() {
	gulp.watch("./src/css/**/*", css_ification);
	gulp.watch("./src/js/**/*", js_ification);
	gulp.watch(
		[
		"./src/includes/**/*.html",
		"./src/*.html",
		], html_ification
		);
}

// The WATCH function
function watch() {
	startBroowserSync();
	watchFiles();
}

// =========================================================================

// ===================================
// THE MANY RUNNABLE TASKS
// ===================================

/** BUILD
* Run ONCE, pick all file from SRC and put them in DIST after changes
*/
exports.build = series(css_ification, html_ification, js_ification);

/** WATCH
* Run and watch change on SRC file.
*/
exports.watch = watch;

/** DEFAULT
* when you only type "gulp" on the command line
*/
function showNoTask(done) {
	console.log('"No default taks. Use "gulp build" or "gulp watch".');
	done();
}
exports.default = showNoTask;

// =========================================================================