title: Angular.js IN SPA 数据流
date: 2015-07-17 15:29:29
tags: [angularjs, mvc]
---

## Angular.js  IN SPA 数据流程
```
Service(Java、php、Nodejs)
                  |
                  |(Thrift:各语言数据交换的协议)
                  |
                Ajax()
                  |
                ng-service()
                  |
                ng-controller()
                  |
                  |(SCOPE)
                  |
                VIEW()
```

<!-- more -->

## Augular.js 数据流在各阶段的处理

### Ajax 阶段：
    1. thrift协议对JSON的处理
    2. HTTP Ajax拦截（reqest, response的统一处理）
    
### Service 阶段：
  1. get, post, put, del请求的构造;
  2. 请求相应的对应接口的集合，eg：House;
  
### Controller 阶段：
 1. 将相应Service注入Controller
 2. 在Controller里对数据结构根据需求进行重构
 3. Controller间的数据通信 
 
### SCOPE 阶段：
 1. scope作用域的问题
 
### VIEW 阶段
1. filter
2. directive
 