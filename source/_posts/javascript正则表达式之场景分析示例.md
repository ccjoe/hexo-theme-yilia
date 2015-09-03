title: javascript正则表达式之场景分析示例
date: 2015-08-25 12:05:46
tags: [javascript, regExp, pattern]
---

javascript常见正则匹配场景 的匹配分析。

## 从html里的string里分离出各标签元素，如图片地址

假设为`<img src="http://ccjoe.github.io/test.png">`要满足的条件应该是:
 + `<img>`标签
 + 带有src地址 
 + src地址为某域
正则是：`/<img\b[^>]*src\s*=\s*"(http:\/\/ccjoe\.github\.io\/([^>"]*))"[^>]*>/g`
其中：
 - \b 匹配单词边界
 - [^>]* 在一起表示匹配除了>以外的字符0到多次
 <!-- <img\b[^>]*src 匹配 <img空格|回车等src  -->
 - src\s*=\s*" 匹配 src = 间的多种空格情况
 - "(http:\/\/ccjoe\.github\.io\/([^>"]*))" 匹配src=""里，其中http:\/\/ccjoe\.github\.io\/指定匹配的域
 - [^>]*> 匹配标签回>前不能出现> 
 - g 全局匹配 
 所以，类似的标签匹配问题皆可以上类似的方法去实现 
<!-- more -->

## 验证Email
icareu5.joe@gmail.com 要素是： 
- 字符串开始 `^\w+`
- . - _可有或无  `[\.|\_|\-]?`
- 字符串 `\w+`
- @
- 字符串 `\w+`
- .  `\.`
- 字符串结尾 `\w+$`
正则是: `/^\w+[\.|\_|\-]?\w+@\w+\.\w+$/`

## 匹配中文字符 /[\u4e00-\u9fa5]/gm

## 匹配手机号码
规则：
- 1开头
- 13,15,17,18段
- 数字
正则是: `/^1[3|5|7|8]\d{9}$/`

## 与正则相关的一些方法
- var zipcode = RegExp("\\d{5}", g) 
\必须经过\\转义, 第二个参数可选，为正则表达式的标志，为g,i,m或其组合
- RegExp方法
1. exec()方法 其参数是以字符串为参数的RegExp方法 match()是以RegExp参数为对象的字符串
2. test()方法

- RegExp实例属性

source 存放正则表达式文本，只读
global 是否g,只读布尔值
ingoreCase 是否i,只读布尔值
multiline 是否m,只读布尔值
lastIndex 可读写的整数

- search()

`Javascript.search(/script /i)`
不支持全局检索,无匹配返回-1,有则返回位置

- replace()

对匹配字符串进行替换:
`text.replace(/javascript/gi, "JavaScript")`

对匹配的子字符串进行替换:
`var quote = /"([^"])*"/g;    text.replace(quote," '$1' ");`

对匹配进行复杂操作:
```javascript
//item为匹配的全部字符串， $1为匹配的子字符串， $2...依次
string.replace(reg, function(item, $1, $2){
   //匹配多次则执行多次 
});
```

- match();

`"1 plus 2 minus 3".match(/\d+/g)`
match();匹配的结果如果是一个数组，则第一个元素是全部，其余的为括号里的匹配

- split();
