title: 构建基于MVC架构的NodeJs应用
date: 2015-07-09 15:47:44
tags: [nodejs, webapp, mvc]
---

示例需要用到的相关：
> mongodb mongoskin nodejs doT.js
> MVC - MODEL VIEW CTRL

## 创建一个简单的web服务示例:

```javascript
//app-mvc.js part
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-type': 'text/plain'});
    res.end('hello world\n');
}).listen(1337, '127.0.0.1');

console.log('运行于 http://127.0.0.1:1337');

```

通过  `http.createServer(app).listen(1337)`  可以得知，扩展appFn可以使用得app可以像我们想要的方向扩展。
即： 
```javascript
//app-mvc.js part
function app(req, res){
    //扩展req, res
    parseMapped();
}
```

## MVC-路由到路径的映射:
 - __手工映射__
 - __自然映射__
 通过路径解析处理相应的控制器(ctrl) 和 行为(action)，手工映射需要手动配置路由与业务逻辑，自然映射是按约定的方式自然而然地去实现路由。
 这里着重描述下自然映射。
<!--more-->

### 自然映射
根据路径找到相应的ctrl文件里的action, 比如我的示例的目录结构是：

    ├── app-mvc                 
    │   ├── ctrls               // Ctrl文件夹
    │   │   └── user.js         // user控制器
    │   ├── models              // Model文件夹
    │   │   ├── db.js           // 连接db
    │   │   └── user.js         // user数据
    │   └── views               // View文件夹
    │       ├── user-list.html  // user列表
    │       └── user-view.html  // user详情
    ├── app-mvc.js              // mvc主文件
    

```javascript
//app-mvc.js part
function parseMapped (req, res){
    // var handles = handles || {};
    var module;
    var pathname = url.parse(req.url).pathname,
        paths = pathname.split('/');

    var ctrl = paths[1] || 'index',     //controller
        action = paths[2] || 'index',   //action
        args = paths.slice(3);          //arguments
    try {
        module = require('./app-mvc/ctrls/' + ctrl);
    }catch(ex){
        handle500(req, res);
        return;
    }

    var method = module[action];
    if(method){
        method.apply(null, [req, res].concat(args));
    }else{
        handle500(req, res);
    }
}

function handle500(req, res){
    res.writeHead(500, {'Content-type': 'text/plain'});
    res.end('找不到响应的控制器\n');
}
```

解析映射的parseMapped方法会查找路由并相应执行相应ctrl的method方法，如下代码，访问:

    curl http://localhost:1337/user/view/123
会找到ctrls文件夹的user.js里的setting模块

```javascript
//user.js:
exports.view = function (req, res, others) {
    res.writeHead(200, {'Content-type': 'text/plain'});
    res.end('查看用户\n, and 参数是: ' + others);
}

exports.list = function (req, res, others) {
    res.writeHead(200, {'Content-type': 'text/plain'});
    res.end('用户列表\n');
}
```

这样就达到了自然映射的路由到相应ctrl和action的业务上；

## Ctrl 之 Action调用Model及渲染到View:
路由映射到相应ctrl和action后， action需要操作DB,然后渲染到View, 以下是基本思路：
 - Model用于DB的操作
 - View 用于按照业务逻辑的规则去显示DB的数据

### 连接到 mongoDB
    _相应的db配置需要配置好_

 ```javascript
// models/db.js
var mongo = require('mongoskin');
var dbHostPort = '127.0.0.1:27017';

var db = new mongo.db('mongodb://' + dbHostPort + '/blog', {safe:true});
db.open(function (error, dbConnetion) {
    if(error){
        console.log(error);
        process.exit(1);
    }
});

module.exports = db;
 ```
 
### user模型 读取列表 及 单个user

 ```javascript
// models/user.js
var db = require('./db');
module.exports = {
    list : function (req, res, next) {
        return db.collection('user').find({}).toArray(function(error, list){
            if(error){
                return next(error)
            }
            next(list);
        });
    },
    view : function (req, res, next) {
        return db.collection('user').findOne({name: req.name}, function(error, item){
            if(!error){
                next(item);
            }
        });
    }
}
 ```

### user控制器承(model)上且下(view)
  此处this 指向 此 action执行的对象上， action执行的对象是一个沉浸模板的方法，需要传入ctrl获取到的数据，即
  `toTmpl(data)`。

 ```javascript
 // ctrls/user.js
var userModel = require('../models/user');

exports.list = function (req, res, args) {
    var toTmpl = this;
    userModel.list(req, res, function(list){
        res.end(toTmpl(list));
    });
}

exports.view = function (req, res, args) {
    var toTmpl = this;
    req.name = args;
    return userModel.view(req, res, function(item){
        res.end(toTmpl(item));
        //return item;
    });
}

 ```

### 模板引擎及 与View相结合
 由上文调用action的语句 `method.apply(null, [req, res].concat(args));`可知，此处的null,应该要替换为toTmpl方法。
 我示例将用到[doT.js] http://olado.github.io/doT/这个模板引擎.

 ```javascript
 //app-mvc.js part
 //请求相应路由的模板文件, method【即action】执行在toTmpl这个对象上。
 var tmpl = loadfile(PATH_VIEW + ctrl + '-' + action + '.html');
    var toTmpl = dot.template(tmpl);
    if(method){
        method.apply(toTmpl , [req, res].concat(args));
    }
 ```

 ```html
<p>用户 {{=it.name }}：</p>
<pre>
是否管理员： {{=it.admin}}
用户密码： {{=it.password }}
用户邮箱：{{=it.email }}
</pre>
 ```

再次访问`curl http://localhost:1337/user/view/Joe`会看到页面显示 user name为Joe的用户

这样，由路由驱动的MVC模型基本就成立了，当中相许多需要优化及整理的地方，就不再详述，主要是记录思路。

尚需要整理点：
1. 代码结构组织
2. action应该只需要负责返回带 promise的数据结构， 
    即不需要 `res.end(toTmpl(item));` 而仅需要 `return item`;
3. 新增config.js提供全局化配置 及 环境检测(dev,test,product)

相应完善的代码地址： [jc-mvc](https://github.com/ccjoe/jc-mvc)