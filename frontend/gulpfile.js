const gulp = require('gulp');
const clean = require('gulp-clean');
const webpack = require('webpack-stream');
const wp = require('webpack');
const render = require('gulp-handlebars-render');

gulp.task('env-prod', function (cb){
    process.env.NODE_ENV = 'production';
    cb();
});

gulp.task('js', function () {
    return gulp.src('src/main.ts')
        .pipe(webpack(require('./webpack.config'), wp))
        .pipe(gulp.dest('dist'));
});

gulp.task('html', function (){
    return gulp.src('src/index.hbs')
        .pipe(render({prod: process.env.NODE_ENV === 'production'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', gulp.parallel('html', 'js'));

gulp.task('prod:build', gulp.series('env-prod', 'build'));
gulp.task('prod:js', gulp.series('env-prod', 'js'));
gulp.task('prod:html', gulp.series('env-prod', 'html'));

gulp.task('pack', function (){
    return gulp.src(['dist/index.html', 'dist/*.js'])
        .pipe(gulp.dest('../backend/res/web'));
});

gulp.task('clean', function () {
    return gulp.src(['dist'], {read: false, allowEmpty:true})
        .pipe(clean());
});
