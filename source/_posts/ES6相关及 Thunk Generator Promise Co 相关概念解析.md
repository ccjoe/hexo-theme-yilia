title: ES6相关及 Thunk Generator Promise Co 相关概念解析
date: 2015-07-16 11:21:33
tags: [thunk, generator, ES6, co]
---

## Thunk
Thunk是一种临时function, 被当作参数传递进另一个function, 实现function的引用传参，而不是传值传参。
其应用之一如下：
把形如 `fs.readFile(fileName, callback);`  转化为 `Thunk(fileName)(callback)`, 这样就避免了多重嵌套回调， 增加可读性与代码的组织性。

实现原理：
```javascript
var Thunk = function (fileName){
  return function (callback){
    return fs.readFile(fileName, callback); 
  };
};
```
根据此原理，可以将任何函数Thunk化。
<!--more-->
把形如 `fs.readFile(fileName, callback);` 转化为形如 `Thunk(fs.readFile)(fileName)(callback)`
```javascript
var Thunk = function(fn){   //fs.readFile
  return function (){
    var args = Array.prototype.slice.call(arguments);   //args [filePathName]
    return function (callback){
      args.push(callback);                              //args [filePathName, callback]
      return fn.apply(this, args);                      //this [node执行环境 ?]
    }
  };
};

Thunk(fs.readFile)(filePathName)(callback);
```

## Generator 
### Generator 详解
```javascript
 //Generator function标识 function*
 function* gen(){
    yield 'hello';
    yield 'world';
    return 'the end';
 }
 var g = gen();
```
该函数有二种(`yield, return`)共三个状态：hello，world和 the end, 用g.next()调用执行并且移动内部指针状态，每调用一次执行一种状态，每次返回一个对象(如下)，当执行到return时，状态done为true;
如果该函数没有return语句，则返回的对象的value属性值为undefined

```json
{
    value: val,
    done: true/false
}
```
执行时状态
```javascript
g.next()
Object {value: "hello", done: false}
g.next()
Object {value: "world", done: false}
g.next()
Object {value: "the end", done: true}
```

___注意： 当next传参数时，会将传的参数当作上一次yield时的返回值, 如下代码可以执行感受下。___

```javascript
function* gen(x) {
  var y = 2 * (yield (x + 1));
  console.log(x, y, 'xy');
  
  var z = yield (y / 3);
  console.log(x, y, z, 'xyz');
  
  return (x + y + z);
}

var g = gen(5);
g.next();
Object {value: 6, done: false}
g.next(10);
//VM1666:4 5 20 "xy"
Object {value: 6.666666666666667, done: false}
g.next(20);
//VM1666:7 5 20 20 "xyz"
Object {value: 45, done: true}
//或使用for ..of语句遍历每一个状态,此时不需要使用next()方法
for (let v of gen()) { 
  console.log(v);
}
```

### Generator yield语句解析
yield*语句: http://es6.ruanyifeng.com/#docs/generator

### Generator 应用
#### Generator与状态机
```javascript
//状态机
var clock = function*(_) {
  while (true) {    //while的作用是产生无穷多组合yield，不会done为true
    console.log('状态1');
    yield _;
    
    console.log('状态2');
    yield _;    
  }
};
```

#### Generator与异步
#### Generator与Promise

## Co 及 Co与Generator的应用

Co function 目的是将形如 fs.readFile(filePath, callback) 的异步方法
转化为形如下面的方法去使用，个人觉得在此种情形下作用与thunk方法类似(但在其它地方还要很多应用)： 
```javascript
  // 1.将异步方法重写为如下形（readFile -> readFileCo）
  function readFileCo(filePath){
    return function(callback){    //这个必须返回这个function且参数为callback
       fs.readFile(filePath, callback);
    }
  }

  // 2.使用Co 及 Generator 执行重写后的方法
  co(function* (){
    yield readFileCo(filePath)
    //yield readFileCoFn(filePath);
  })(callback);  //readfile的callback为 function(error, data){}

  
```

结合上面的示例,分析Co的执行原理及Co基本结构如下：
```javascript
//GenFunc 需要传入一个 function*
function co(GenFunc) {
  //执行co方法后返回一个方法去执行
  return function(cb) {
    //执行generator function
    var gen = GenFunc()
    next();
    //next执行（1 times）
    //next参数为callback的(err, data)
    function next(err, args) {
      if (err) {
        cb(err);
      } else {
        //如果有generator next方法
        if (gen.next) {
          //传参执行generator next，会按序触发yield语句
          var ret = gen.next(args)
          //如果generator执行状态done为true,则执行回调cb
          if (ret.done) {
            cb && cb(null, args)
          } else {
          //如果generator执行状态done不为true
          //ret.value是generator执行时yield的返回值, yield返回的是readFileCo(filePath) => 返回的是function(callback), 所以ret.value就是这个function
          //而参数next 即为此方法体
          //综合来理解，即如果没有done完的话，执行function(callback)，此时callback为 next(err, args);
            ret.value(next)
          }
        }
      }
    }
  }
}
```



## ES6 Promise

### promise 定义
```javascript
//Promise 接口表示为一个值的代理，这个值在promise创建时未必已知
new Promise(function(resolve, reject){
  //resolve 完成当前promise
  //reject  拒绝当前promise
});
```

### promise属性
Promise.length

### promise方法
Promise.all()
Promise.race()
Promise.reject()
Promise.resolve()

### promise原型 
Promise.prototype.catch()
Promise.prototype.then()


## Generator,Co,Promise相结合

总体来看 Co是为了改造Generator方便去使用，而嵌入Promise则为了更好的去控制异步及相关流程控制。
