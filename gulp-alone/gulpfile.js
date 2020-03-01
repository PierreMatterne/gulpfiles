const {watch, series, parallel} = require('gulp');
const {src, dest} = require('gulp');
// const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const browserSync = require('browser-sync');
const cleancss = require('gulp-clean-css');
const sass = require('gulp-sass');
const size = require('gulp-filesize');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const notify = require('gulp-notify');
const fileinclude = require('gulp-file-include');
const removeHtmlComments = require('gulp-remove-html-comments');
const jshint = require('gulp-jshint');
const plumber = require('gulp-plumber');



exports.default = startBroowserSync;





function css_ification() {
	console.log("CSS-ification");
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
	.pipe(notify("test" + size()));
}

function js_ification() {
	console.log("JS-ification");
	return src('./src/js/*.js') 
	.pipe(plumber({
		errorHandler: notify.onError("Erreur: <%= error.message %>")
	}))
	.pipe(jshint())
	.pipe(jshint.reporter('jshint-stylish'))
	.pipe(jshint.reporter('fail'))
	/*
	.pipe(babel({
		presets: ['es2015']
	}))
	*/
	.pipe(uglify())
	.pipe(rename({extname: '.min.js'}))
	.pipe(dest('./dist/js'))
	.pipe(size());
}

function html_ification() {
	console.log("HTML-ification");
	return src('./src/*.html') 
	.pipe(fileinclude({
		prefix: '@@',
		basepath: './src/includes/'
	}))
	.pipe(removeHtmlComments())
	/*
	.pipe(htmlmin({
		collapseWhitespace: true
	}))
	*/
	.pipe(dest('./dist'))
	.pipe(size());

}

function startBroowserSync() {
	browserSync.init({server: {baseDir: "./dist/"}});
}



// ignoreInitial : false => execute une fois la tache avant de watcher.
watch('./src/js/*.js', {ignoreInitial: false}, series(js_ification));
watch('./src/css/scss/**/*.scss', series(css_ification));
watch('./src/**/*.html', series(html_ification));
watch('./dist/*.html').on('change', browserSync.reload);
watch('./dist/css/*.css').on('change', browserSync.reload);
watch('./dist/js/**/*.js').on('change', browserSync.reload);
