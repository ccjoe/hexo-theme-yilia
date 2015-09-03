title: 基于gulp的构建流工具总结
date: 2015-09-01 16:19:44
tags: [gulp, grunt, build, nodejs, npm]
---
## 对Js的处理
### 压缩
### 合并
### JSX(react)

<!-- more -->

## 对Css的处理
### 压缩
### 合并
### Sass
### Less

## 对Image的处理
### PNG GIF JPG...

## 对html的处理
### html的压缩
```javascript
//处理html相关 ---------------
var minifyHtml = require("gulp-minify-html");
gulp.task('deal-html', function () {
   return gulp.src('./static/views/*.html') // 要压缩的html文件
    .pipe(minifyHtml()) //压缩
    .pipe(gulp.dest('./static/dist/html'));
});
```

### 对于嵌入模板引擎的html压缩

### 对于html里内置语法构建的处理 useref

## 对运行时处理

### 监听运行 
- BrowserSync 对指定目录启动一个web服务
```javascript
// 静态服务器 + 监听 scss/html 文件
var gulp        = require('gulp');
var Browsersync = require('browser-sync').create();
var sass        = require('gulp-sass');

gulp.task('serve', ['sass'], function() {

    Browsersync.init({
        notify: false,  //不显示在浏览器中的任何通知。
        logPrefix: 'BS',//改变控制台日志前缀
        server: ['dist', 'app'] //多个基目录
        browser: ["google chrome", "firefox"] // 在chrome、firefix下打开该站点
    });
    //gulp watch目录改变后调用方法
    //gulp.watch(dir, [gulpRegisterTask1, gulpRegisterTask2, ...])
    gulp.watch("app/scss/*.scss", ['sass']);
    gulp.watch("app/*.html").on('change', Browsersync.reload);
});

```

## 其它相关构建的处理
### SVG
### Font
```javascript
gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')({
    filter: '**/*.{eot,svg,ttf,woff,woff2}'
  }).concat('app/fonts/**/*'))
    .pipe(gulp.dest('dist/fonts'));
});
```
## 其它相关功能的处理
### 删除文件夹
### 缓存处理相关

### 按需加载插件 
```javascript
var $ = require('gulp-load-plugins')();
```

### browserify
> Browserify 可以让你使用类似于 node 的 require() 的方式来组织浏览器端的 Javascript 代码，通过预编译让前端 Javascript 可以直接使用 Node NPM 安装的一些库, 打包时会将包括很多层 require() 的情况也会一起被递归式的编译过来

```javascript
//browserify([files] [, opts])
browserify({
    entries: [sourceFile],      //opts.entries即[file]参数
    debug: true,                // add a source map inline to the end of the bundle.
    insertGlobals: true,
    cache: {},
    packageCache: {},
    fullPaths: true
})
```

__[使用 watchify 加速 browserify 编译](http://www.gulpjs.com.cn/docs/recipes/fast-browserify-builds-with-watchify/)__


参考列表：
[使用 watchify 加速 browserify 编译](http://www.gulpjs.com.cn/docs/recipes/fast-browserify-builds-with-watchify/)