title: You Dont Need jQuery
date: 2015-08-14 11:20:25
tags: [jquery, javascript]
---

## This Content is Come From http://blog.garstasio.com/you-dont-need-jquery/
在这里仅仅是翻译或是总结下常归的方法：

## 你不再需要jQuery
在许多方面很多开发者非常依赖jQuery, jQuery在保证浏览器兼容性和优雅的Api让javascript更易用，但是如果没有jQuery,一切也不会显示那么糟糕！以下是一些常见的替代方法，这更有助于理解原生的Javascript

## 元素选择
```
$ => document.querySelectorAll //IE8+
```

### Classes,Tag,属性,伪元素
jquery
```javascript
$('selector');
```

<!-- more -->

Dom API
```javascript 
document.getElementById('test');  //ID
document.getElementsByClassName('test');  //Class
document.getElementsByTagName('div');  //Tag
document.querySelectorAll('[attr="attrval"]');  //Attr
document.querySelectorAll('input:disabled');  //Pseudo Class

```

### 子集
jquery
```javascript
$('selector').children();

$('#myParent').children('[ng-click]');
```
DOM API
```javascript
//包含注释和文本节点 IE5.5+
document.querySelectorAll('selector').childNodes();
//不包含注释和文本节点 IE9+
document.querySelectorAll('selector').children;

document.querySelectorAll('#myParent [ng-click]');

```

### 排除元素
  jquery
```javascript
$('DIV').not('.ignore');
$('DIV:not(.ignore)');
```
DOM API
```javascript
//IE9+
document.querySelectorAll('DIV:not(.ignore)');
```

### 选择多个

jquery
```javascript
$('DIV, A, SCRIPT');
```
DOM API
```javascript
document.querySelectorAll('DIV, A, SCRIPT');
```

总结下来归纳像jQuery般的API即：
```
window.$ = function(selector){
    var selectorType = 'querySelectorAll';
    if(selector.indexOf('#')===0){
        selectorType = 'getElementById';
        selector = selector.substring(1);
    }
    return document[selectorType](selector);
}
```

## Dom操作

### 创建元素
jquery
```javascript
$('<div class="test">');
```
DOM API
```javascript
var div = document.createElement('div');
    //div.className = 'test';
```

### 插入元素
jquery
```javascript
$('#1').before('<div id="1.1"></div>') //1.1 #1{} 
$('#1').prepend('<div id="1.1"></div>')//#1{1.1  }
$('#1').append('<div id="1.1"></div>') //#1{  1.1}
$('#1').after('<div id="1.1"></div>')  //#1{     } 1.1
```
DOM API
```javascript
    document.getElementById('1').insertAdjacentHTML('beforebegin', '<div id="1.1"></div>');
    document.getElementById('1').insertAdjacentHTML('afterbegin', '<div id="1.1"></div>');
    document.getElementById('1').insertAdjacentHTML('beforeend', '<div id="1.1"></div>');
    document.getElementById('1').insertAdjacentHTML('afterend', '<div id="1.1"></div>');
```

### 移动元素
```javascript
    document.getElementById('1').appendChild('<div id="1.1"></div>');
    document.getElementById('1').insertBefore(document.getElementById('1.2'),'<div id="1.1"></div>');
```
### 删除元素
jQuery
```javascript
    $('1').remove();
```

DOM API
```javascript
document.getElementById('foobar').parentNode
    .removeChild(document.getElementById('foobar'));
```

### 操作样式
### 操作属性
### 操作内容

## Ajax请求

## 事件

## 工具方法
### 判断类型 isArray Object Function
jQuery
```javascript
$.isArray(arr)
$.isPlainObject(obj)
$.isFunction(fn)
```

Javascript
- isArray 
 仅现代浏览器 `Array.isArray(arr);`
 所有浏览器
```javascript
function isArray(arr){
    return Object.prototype.toString.call(arr) === '[object Array]';
}
```

- isObject
```javascript
function isObject(obj){
    return !!obj && Object.prototype.toString.call(obj) === '[object Object]';
}
```

- isFunction
`typeof fn === 'function'`

- 判断所有对象
```javascript
function classof(type){
    if(type === void 0) return 'Undefined';
    if(type === null) return 'Null';
    return Object.prototype.toString.call(type).slice(8,-1);
}
```

### 混合对象
```javascript
function extend(a, b){
    for(var i in b){
        bival = b[i];
        if(bival && Object.prototype.toString.call(bival) === '[object Object]'){
                a[i] = a[i] || {};
                extend(a[i], bival);
            }else{
                a[i] = bival;
            }
    }
    return a;
}
```

### 实现data
```javascript
// works in all browsers
var data = window.WeakMap ? new WeakMap() : (function() {
    var lastId = 0,
        store = {};

    return {
        set: function(element, info) {
            var id;
            if (element.myCustomDataTag === undefined) {
                id = lastId++;
                element.myCustomDataTag = id;
            }
            store[id] = info;
        },

        get: function(element) {
            return store[element.myCustomDataTag];
        }
    };
}());
```