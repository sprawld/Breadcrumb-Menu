var gulp = require('gulp'),
	sass = require('gulp-sass');
	autoprefixer = require('gulp-autoprefixer'),
	minifyCss = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat');

gulp.task('js', function() {
	return gulp.src(['./src/*.js'])
		.pipe(uglify())
		.pipe(gulp.dest('./dist/'));
});

  
gulp.task('sass', function() {
	return gulp.src('./src/*.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false }))
		.pipe(gulp.dest('./src/'));
});

gulp.task('css',['sass'],function() {
	return gulp.src(['./src/normalize.css','./src/menu.css'])
		.pipe(concat('menu.css'))
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('watch',function() {
	gulp.watch('./src/*.scss',['sass','css']);
	gulp.watch('./src/*.js',['js']);
});

gulp.task('default',['sass','js','css']);
