title: 跨域的N种方法实践
date: 2015-08-18 10:32:44
tags: [ajax, iframe, cross-domain]
---

## CORS（Cross-Origin Resource Sharing） 
服务端设置跨域资源共享,比如nodejs

//设置允许的域
`res.header('Access-Control-Allow-Origin', req.headers.origin); //其值为*或具体域`
//设置允许的Header(如果有自定义的头则会发送预请求)
`res.header('Access-Control-Allow-Headers', 'X-Requested-With'); //x-requested-with XMLHttpRequest`

```javascript
//服务端设置
setHeaderRest: function(req, res, next){
    //https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS
    res.header('Access-Control-Allow-Origin', req.headers.origin); //origin参数指定一个允许向该服务器提交请求的URI.对于一个不带有credentials的请求,可以指定为'*',表示允许来自所有域的请求.
    res.header('Access-Control-Allow-Credentials', 'true'); //带上认证信息(如 cookie)
    res.header('Access-Control-Allow-Headers', 'X-Requested-With'); //x-requested-with XMLHttpRequest`, 表明是AJax异步
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Max-Age', '86400'); // 预请求的结果的有效期
    res.header('X-Powered-By', 'R_E_S_T'); //个人标记,用以区分是否resturl
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
}
```

<!-- more -->

CORS依据请求方式不同可以分为简单验证请求和预请求
### 简单请求
是指：1.只使用 GET, HEAD 或者 POST 请求方法。如果使用 POST 向服务器端传送数据，则数据类型(Content-Type)只能是 application/x-www-form-urlencoded, multipart/form-data 或 text/plain中的一种。
     2.不会使用自定义请求头（类似于 X-Modified 这种）。

### 预请求

不同于上面讨论的简单请求，“预请求”要求必须先发送一个 OPTIONS。
例：
> agent_call_list?agentId=747316  OPTIONS 200 app.sh.fangdd.test  10.0.1.81:80    545 B   6 ms        nginx/1.4.7 
> agent_call_list?agentId=747316  GET     200 app.sh.fangdd.test  10.0.1.81:80    578 B   29 ms       nginx/1.4.7 

### 附带凭证的请求
即会带上包含cookie的session, 必须为服务端设置的cookie或session才会自动带上。
需要将XMLHttpRequest的withCredentials标志设置为true。`withCredentials = true`

## JSONP
原理是：`<script>`可以跨域加载远程js文件，由服务端返回包含数据的由前端指定回调名称的js方法体。
可以利用jquery的jsonp或手动创建`<script>`去实现。
具体实现：
```
function jsonp(url, callback){
    window.myJsonpCallback = function(data){
        callback(data); 
        delete window.myJsonpCallback;
    };
    //创建script标签引入外部带data的script url
    var script = document.createElement('script');
    script.src = url+'?callback=myJsonpCallback';
    document.body.appendChild(script);
    
    script.onload = script.onreadystatechange = function() {
        if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            //解析带data的script url;     
            script.onload = script.onreadystatechange = null;
        }
    };
}
```
jsonp的返回体一般为形如：
```javascdript
myJsonpCallback({
    'name':1,
    'email':2
});
```

## 利用iframe 
### iframe + window.name实现的跨域数据传输
>   原理核心：window对象的name属性是一个很特别的属性，当该window的location变化，然后重新加载，它的name属性可以依然保持不变。
    依此原理，我们可以在页面A中用iframe加载其他域的页面B，而页面B中用JavaScript把需要传递的数据赋值给 window.name，页面A的iframe加载完成之后，页面A修改iframe的地址，将其变成同域的一个地址，然后就可以读出window.name的值了。

简单来说:利用a页面iframe加载远程页面b的window.name属性,原后将iframe的值指向同源页面localproxy.html,读取`同源页面中没有变化的 window.name`。

如下代码: 
本地页面local.html创建一个iframe，其值指向远程页面url=>data.html,获取远程url上面的window.name,所以data.html应该是这样：`指定window.name的值为数据`(window.name的值只能为字符串，为object时不能解析出里面的结构)：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>

</head>
<body>
<script>
    window.name = 'data';   
</script> 
</body>
</html>

```

```javascript
/* url:远程url,
   localproxy:本地代理文件，文件必须存在，内容可以为空;
   callback:回调 */
function getWinNameData(url, localproxy, callback){
    var state = 0;
    iframe = document.createElement('iframe');
    
    var loadfn = function(){
        if(state === 1){
            var data = iframe.contentWindow.name;   // 读取数据
            callback(JSON.parse(data));
            //获取数据以后销毁这个iframe，释放内存；这也保证了安全
            iframe.contentWindow.document.write('');
            iframe.contentWindow.close();
            document.body.removeChild(iframe);
        }else if(state === 0){
            state = 1;
            iframe.contentWindow.location = localproxy;    // 设置的代理文件
        }
    }

    iframe.src = url;
    if (iframe.attachEvent) {
        iframe.attachEvent('onload', loadfn);
    } else {
        iframe.onload  = loadfn;
    }
    document.body.appendChild(iframe);

}
```

### iframe + document.domain
原理是：将不同子域的的域名设置为主域：document.domain = 'main.com'; 原来某域文件中创建iframe,去控制iframe的contentDocument。所以仅适用于主域相同而二级域名不同的情况。
```javascript
function getSubDomainData(host, url, callback){
    document.domain = host;
    var ifr = document.createElement('iframe');
    ifr.src = url;
    ifr.style.display = 'none';
    document.body.appendChild(ifr);
    ifr.onload = function(){
        var doc = ifr.contentDocument || ifr.contentWindow.document;
        // 在这里操纵b.html
        callback(doc);
    };
}
```

### iframe + location.hash（暂略）
原理是：利用location.hash来进行传值，a.com/a.html自动创建一个隐藏iframe为b.com/b.html的页面。
缺点是：利用hash值来进行数据传递，数据直接暴露在了url中，数据容量和类型都有限。

### HTML5 postMessage
原理：页面利用html5 postMessage向iframe页面通信。
对被远程请求的页面（req.html）要求是需要加入请求方页面为iframe,并向请求方页面postMessage数据, 被请求页面监听message。
```javascript
//被远程请求的页面b.com/req.html
<script type="text/javascript">
window.onload = function(){
    sendPostMessage('http://a.com/index.html', {testObj: '1231231231'});
}
//url:允许请求数据的源， data:要发送的数据
function sendPostMessage(url, data){
    var ifr = document.createElement('iframe');
    ifr.src = url;
    document.body.appendChild(ifr);
    ifr.style.display = 'none';

     var durl = /http:\/\/([^\/]+)\//i,
         domain = url.match(durl); // domain[0]'http://b.com'; 

    ifr.onload = function(){
        ifr.contentWindow.postMessage(data, domain[0]);
    };  
}
</script>
```

然后简单封装下postMessage接收数据 main.html中接收数据
```javascript
getPostMessage('http://b.com', function(data){console.log(data)});

//urlorigin:请求方a.com/main.html,  callback，带数据的回调；
function getPostMessage(urlorigin, callback){
    window.addEventListener('message', function(event){
        if(event.origin === urlorigin){
            callback(event.data, event.source); //对被远程请求的页面index.html中window对象的引用
        }
    })
}
```

参考列表：
[JavaScript 的同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy#.E5.AE.9E.E7.8E.B0.E8.B7.A8.E5.9F.9F.E8.AE.BF.E9.97.AE)
[HTTP访问控制(CORS)](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)
[http://f2e.me/200904/cross-scripting/](http://f2e.me/200904/cross-scripting/)