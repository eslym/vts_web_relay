const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const proj = ts.createProject('./tsconfig.json');

gulp.task('build', function(){
    return proj.src()
        .pipe(sourcemaps.init())
        .pipe(proj())
        .js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib'));
});
