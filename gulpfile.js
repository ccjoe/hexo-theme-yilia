var gulp = require('gulp');

/*================================================
=            Report Errors to Console            =
================================================*/

gulp.on('error', function(e) {
  throw(e);
});

/*=========================================
=            Clean dest folder            =
=========================================*/

var del = require('del');
gulp.task('del:dist', function (cb) {
  del([
    // './themes/yilia/source/css',
    './themes/yilia/source/js',
    './themes/yilia/source/img',
    './themes/yilia/source/fancybox'
    // here we use a globbing pattern to match everything inside the `mobile` folder
    // 'dist/mobile/**/*',
    // we don't want to clean this file though so we negate the pattern
    // '!dist/mobile/deploy.json'
  ], cb);
});

/*=========================================
=             For Build            =
=========================================*/
//处理js合并压缩语法相关 ---------------
var concat = require("gulp-concat");
var uglify = require("gulp-uglify"); 

gulp.task('deal-js', function () {
   return gulp.src('./themes/yilia/source/src/js/*.js') // 要压缩的js文件
    .pipe(uglify())  //使用uglify进行压缩,更多配置请参考：
    .pipe(gulp.dest('./themes/yilia/source/js'));
});


//处理图片 ---------------
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant'); //png图片压缩插件
var optipng = require('imagemin-optipng'); //png图片压缩插件
gulp.task('deal-img', function () {
    return gulp.src('./themes/yilia/source/src/img/*')
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            // svgoPlugins: [{removeViewBox: false}],
            // use: [pngquant()]
            use: [optipng({optimizationLevel: 3})]
        }))
        .pipe(gulp.dest('./themes/yilia/source/img'));
});


gulp.task('default', [
  // 'del:dist',
  'deal-js',
  'deal-img'
]);