title: passport-local基于connect的验证流程解析
date: 2015-07-31 11:33:36
tags: [nodejs, passport]
---

## 概要
之所以是passport-local基于connect的验证流程解析，是因为个人实例时没有用到express框架，但用到了TJ大神的node-connect。 个人的MVC框架是基于自然映射，也用到了connect去引入中间件,所以passport-local基于connect的  原理与流程在此大致梳理一下。

## passport-local代码及运转流程解析

### 首先定义local验证的策略 
本地验证需要二个字段usernameField， passwordField，其值为你想定义的验证字段。
```javascript
var CB = function(name, pwd, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            user.findOne({
                name: name
            }, function(error, user){
                if(!user){
                    return done(null, false, { message: '用户名或邮箱 ' + name + ' 不存在'});
                }
                if(user.password !== pwd){
                    return done(null, false, { message: '密码不匹配' });
                }else{
                    return done(null, user, info);
                }
            });
        });
    };
passport.use(new LocalStrategy({
                // options参数，用来设置你要验证的字段名称，即usernameField
                usernameField: 'name', //如果用邮箱验证，则需要改成邮箱字段
                passwordField: 'pwd'
            }, CB));
```

<!-- more -->

### 定义session的序列化与反序列化
```javascript
//将环境中的user.id序列化到session中，即sessionID，同时它将作为凭证存储在用户cookie中。
passport.serializeUser(function(user, done) {
    console.log(user, 'user');
    done(null, user.name);
});

//将session反序列化，参数为用户提交的sessionID，若存在则从数据库中查询user并存储与req.user中
passport.deserializeUser(function(username, done) {
    console.log(username, 'username');
    findByName(username, function(err, user) {
        done(err, user);
    });
});
```

### 验证登录请求
```javascript
//验证登录请求
validAuth: function(req, res, next){
     //验证登录请求
    passport.authenticate('local', //name 验证策略名称
        /*options
          session：Boolean。设置是否需要session，默认为true
          successRedirect：String。设置当验证成功时的跳转链接
          failureRedirect：String。设置当验证失败时的跳转链接
          failureFlash：Boolean or String。设置为Boolean时，express-flash将调用use()里设置的message。设置为String时将直接调用这里的信息。
          successFlash：Boolean or String。使用方法同上。*/
        // {   session: false,
        //     successRedirect: '/',
        //     failureRedirect: '/auth/login',
        //     // failureFlash: true
        // },
        function(err, user, info) {
            if (err) return next(err);
            if (!user) {
                req.session.messages =  [info.message];
                return;
            }
            req.logIn(user, function(err) {
                if (err) return next(err);
                req.flash('success', {
                    msg: '登录成功！'
                });
            });
        }
        )(req, res, next);
    return next;
}
```

### 验证逻辑流程

1. 当path为登录页时，提交登录请求时通过validAuth去验证登录。
2. validAuth的authenticate调用new LocalStrategy:
    authenticate 为 'local'的方式触发 local验证的策略，调用new LocalStrategy的回调CB去查询DB验证用户登录信息
    options即为{
        // options参数，用来设置你要验证的字段名称，即usernameField
        usernameField: 'name', //如果用邮箱验证，则需要改成邮箱字段
        passwordField: 'pwd'
    }, verify即为new LocalStrategy的回调。
3. 回调CB根据查询情况状态返回done(err, user, info);
4. done(err, user, info) 与 passport的 authenticate(passport, name, options, callback)的callback;
passport根据这套机制可以扩展其它策略去进行登录验证。这里仅是passpory-local的验证策略
5. 验证通过之后会对user的信息进行序列化与反序列化， 序列化与反序列化的字段为传进done的信息,在以上serializeUser中为user.name

下面是部分源码解析
```javascript
Strategy(options, verify){
  // .....略
  this.name = 'local';      //策略名称
  this._verify = verify;    //verify即为new LocalStrategy的回调
  this._passReqToCallback = options.passReqToCallback;
}

Strategy.prototype.authenticate ＝ {
    //根据情况用verify去验证
    if (self._passReqToCallback) {
      this._verify(req, username, password, verified);
    } else {
      this._verify(username, password, verified);
    }
}

//验证后根据验证情况去分发处理结果
function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
}
```



## 下面是在实际应用中代码

使用大致与官方示例一致, 个人验证模块代码如下，里面有比较详情的注释。
里面BEGIN->END代码段是passport-local所依赖，其它代码为个人框架代码，在其它地方要随之变化。
```javascript

var config = require('./config'),
    jc = require('./jc'),
    auth = require('./app/models/auth'),
//BEGIN----------------------------------------------   
var passport = require('passport')
   ,LocalStrategy = require('passport-local').Strategy
   ,cookieParser = require('cookie-parser')
   ,bodyParser = require('body-parser')
   ,session = require('express-session');
//END----------------------------------------------
var app = jc.app();
//权限策略初始化
auth.init();

//BEGIN----------------------------------------------
//引入中间件
app.use(cookieParser(/*{
    name: 'session',
    keys: ['secret1', 'secret2']
}*/));
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(session({secret: "need change"}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(flash());
//END----------------------------------------------

//启动服务
jc.server(app);
```

下面在详细方法：
```javascript
var auth = {
    init: function() {
        passport.use(new LocalStrategy({
                // options参数，用来设置你要验证的字段名称，即usernameField
                usernameField: 'name', //如果用邮箱验证，则需要改成邮箱字段
                passwordField: 'pwd'
            }, auth.AuthUser));
        //将环境中的user.id序列化到session中，即sessionID，同时它将作为凭证存储在用户cookie中。
        passport.serializeUser(function(user, done) {
            done(null, user.name);
        });

        //将session反序列化，参数为用户提交的sessionID，若存在则从数据库中查询user并存储与req.user中
        passport.deserializeUser(function(id, done) {
            findById(id, function(err, user) {
                done(err, user);
            });
        });
    },
    //连接DB检查用户
    AuthUser: function(name, pwd, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            console.log(name, pwd, info, 'UNPW');
            user.findOne({
                name: name
            }, function(error, user){
                console.log(error, user, 'RUN DB');
                if(!user){
                    return done(null, false, { message: '用户名或邮箱 ' + name + ' 不存在'});
                }
                if(user.password !== pwd){
                    return done(null, false, { message: '密码不匹配' });
                }else{
                    return done(null, user, info);
                }
            });
        });
    },
    //该用户是否存在于session中（即是否已登录）
    isAuthenticated : function(req, res, next) {
      if (req.isAuthenticated()) return next();
      res.redirect('/auth/login');
    },
    //验证登录,并返回这个回调
    validAuth: function(req, res, next){
         //验证登录请求
        passport.authenticate('local', //name 验证策略名称
            /*options
              session：Boolean。设置是否需要session，默认为true
              successRedirect：String。设置当验证成功时的跳转链接
              failureRedirect：String。设置当验证失败时的跳转链接
              failureFlash：Boolean or String。设置为Boolean时，express-flash将调用use()里设置的message。设置为String时将直接调用这里的信息。
              successFlash：Boolean or String。使用方法同上。*/
            // {   session: false,
            //     successRedirect: '/',
            //     failureRedirect: '/auth/login',
            //     // failureFlash: true
            // },
            function(err, user, info) {
                if (err) return next(err);
                if (!user) {
                    req.session.messages =  [info.message];
                    return;
                }
                req.logIn(user, function(err) {
                    if (err) return next(err);
                    req.flash('success', {
                        msg: '登录成功！'
                    });
                });
            }
            )(req, res, next);
        return next;
    }
};
```

