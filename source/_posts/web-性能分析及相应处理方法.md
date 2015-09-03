title: web 性能分析及相应处理方法
date: 2015-08-24 16:56:39
tags: [webapp, web优化, 性能分析]
---

一个Web应用的性能分析包含服务端的性能分析及浏览器端的性能分析,这里只罗列相关浏览器端（前端）的性能分析。

>总体来讲：终端用户响应时间 
        = 页面下载时间 + 服务器响应时间 + 浏览器处理及渲染时间 
        = 页面大小 / 网络带宽 + （网络延迟 × HTTP 请求数）/ 并发度 + 服务器响应时间 + 浏览器处理及渲染时间
        http://www.ibm.com/developerworks/cn/lotus/web20-perf-2/

并行下来即有以下因素影响浏览器响应时间:

## A:页面下载时间
页面下载时间的模型涉及三方面：
- 互联网应用的网络传输行为 : 它包括这个互联网应用通过浏览器发出了多少个 HTTP 请求，页面大小（HTTP 响应的总和），同时有多少个 HTTP 连接，这个互联网应用是如何并发使用这些 HTTP 连接的，等等。
    关键点：HTTP请求，页面大小，HTTP连接并发数
- 网络参数 : 网络参数一般可以用QoS (Quality of Service)来描述，Qos包括带宽、延迟、丢包率等等一系列参数。但简化的说，带宽和网络延迟是最主要的因素。
- 页面下载时间 : 终端用户响应时间就是指从这个用户触发一个页面请求到这个页面被完全展示时，有多少时间是花费在网络传输上。

根据以上要素总结的优化点：

1. 处理页面大小（压缩html,css,js,image,svg,font..., GZIP）
2. 处理Http请求数 (合并css,js,image,svg,font...文件, 缓存http请求)
3. 处理HTTP连接并发数(尽量提高并发量，但尽量减少不同域的资源的请求及连接，即减少域名查询。)

<!-- more -->
<br><br>
## B:服务器响应时间
<br><br>
## C:页面渲染时间(脚本执行时间 + 浏览器引擎渲染时间)
<br>
### C1:脚本执行时间 
“脚本执行时间” 包含浏览器脚本执行引擎解析和执行JavaScript脚本的时间。
<br>
### C2:浏览器引擎渲染时间（加载，解析，渲染）
“浏览器引擎渲染时间” 包含浏览器引擎渲染和显示图形界面 UI 的时间。根据以上要素总结的优化要点是：
<br>
####. C2.1 优化脚本执行效率：(脚本执行中性能比较差的方法或算法)
* 分析方法所执行的时间
* 分析方法被调用的流程

<br>
####. C2.2 影响浏览器引擎渲染时间的因素（加载，解析，渲染）
![浏览器引擎渲染流程](/img/renderprocess.jpg "浏览器引擎渲染流程") 
###### 第一类：`加载时`浏览器引擎加载次序影响的渲染：如css需要放入head,js放入body尾部

###### 第二类：`解析时`浏览器引擎解析dom树,css规则,js对性能的影响，具体表现在例如：

解析包含三层的东西：
```
一个是HTML/SVG/XHTML
CSS，解析CSS会产生CSS规则树
Javascript，脚本，主要是通过DOM API和CSSOM API来操作DOM Tree和CSS Rule Tree.
```
相关解析时需要注意的或优化点是:

* dom深度过高对于解析的影响
* 内联的表现层的css与行为层js对于解析的影响
* css表达式的滥用对css规则的解析等
* 很多的通配符等。
> 注意：CSS匹配HTML元素是一个相当复杂和有性能问题的事情。所以，你就会在N多地方看到很多人都告诉你，DOM树要小，CSS尽量用id和class，千万不要过渡层叠下去，……

解析完成后浏览器引擎会通过DOM Tree 和 CSS Rule Tree 来构造 Rendering Tree，进入`渲染`

##### 第三类：`渲染时`减少”重绘“、”重新布局“的消耗：

渲染时流程：
```
计算CSS样式
构建Render Tree
Layout – 定位坐标和大小，是否换行，各种position, overflow, z-index属性 ……
正式开画  
```

渲染时的两个重要概念，一个是Reflow，另一个是Repaint:

+ Repaint——屏幕的一部分要重画，比如某个CSS的背景色变了。但是元素的几何尺寸没有变。
+ Reflow——意味着元件的几何尺寸变了，我们需要重新验证并计算Render Tree。是Render Tree的一部分或全部发生了变化。这就是Reflow，或是Layout。

所以Reflow的成本比Repaint的成本高得多的多，如下动作可能会引起reflow：

+ 当你增加、删除、修改DOM结点时，会导致Reflow或Repaint
+ 当你移动DOM的位置，或是搞个动画的时候。
+ 当你修改CSS样式的时候。
+ 当你Resize窗口的时候（移动端没有这个问题），或是滚动的时候。
+ 当你修改网页的默认字体时。

与渲染相关的优化如： 

+ js: 不要`document.write`重写dom;  把DOM离线后(脱离文档树后)修改; 不要一条一条地修改DOM的样式。与其这样，还不如预先定义好css的class，然后修改DOM的className……
+ css: `position`,为动画的HTML元件使用fixed或absoult，那么修改他们的CSS是不会reflow的;`display:none`会触发`reflow`，而`visibility:hidden`只会触发`repaint`……
+ `img`指定图像和`table`的大小……,避免使用table布局。因为可能很小的一个小改动会造成整个table的重新布局。
+ `svg,canvas`元素等等的优化处理……
  
___部分内容参考自：___
_[浏览器渲染时间分析](http://www.ibm.com/developerworks/cn/lotus/web20-perf-3/)_
_[浏览器~加载，解析，渲染](http://www.jianshu.com/p/e141d1543143)_