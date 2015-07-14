
/* _______________________________________
 * | @author  >|   Joe                    |
 * | @email   >|   icareu.joe@gmail.com   |
 * | @date    >|   2014-04-16 13:51:13    |
 * | @content >|   为容器内多目录文章添加 |  
 * | @content >|   自动导航 依据h1--h6识别|
 * | @content >|   定位点与层级           |
 * |___________|__________________________|
 */
/*
 * 兼容性测试兼容到 ie7, ie6暂未测试
 */

 (function($){
  $.fn.guide = function(options){
    //混合参数
    options = options || {};
    //console.log($.fn.guide.defaults);
    opts = $.extend({},$.fn.guide.defaults,options);
    var $cont = $(this);

    //一个页面仅支持一个容器导航
    if($cont.length > 1){
      return;
    }

    var init = function(){
      //给目录增加样式
      styleGuide(opts.guideClass);

      hxArrSet = _getHxLen();
      if(!hxArrSet) return;
      // 如果存在任意h1-h6
      if(parseInt(hxArrSet.join(""),10) > 0){

        //添加目录框架
        _showFrame();

        //按目录排序 
        addAnchor("linked");

        //排序，替换
        hxSort();
        
        if(opts.isScorllShow){
          scrollShow();
        }
      }else{
        return;
      }
    },
    
    //获取h1-h6各长度值
    _getHxLen = function(){
      var num, total = 0,
          hxObj    = [],        //存放多级目录对象
          hxArr    = [];          //存放多级目录的数组
      for(var i=1; i<=6; i++){
        //hxObj.push($cont.find("h"+i));
        num = $cont.find("h"+i).length;
        total += num;
        hxArr.push(num);
      }
      //如果hx数不足 hxnum 个不显示导航
      if(total < opts.hxnum){
        return;
      }

      //返回包含hx的数据与hx长度的数据
      return hxArr;
    },  
  
    //创建容器
    _showFrame = function(){
      var $frameDom = $('<div class='+opts.guideClass.slice(1)+'><span class="switch-pos">切换显示</span></div>');
      var $placeDom = $(opts.placeDom);
      $placeDom.prepend($frameDom);
      var $guideDom = $placeDom.find(opts.guideClass);
      opts.placeDom === 'body' ?
      $guideDom.addClass('fixed').removeClass('relate') :
      $guideDom.addClass('relate').removeClass('fixed');

      $placeDom.find('.switch-pos').click(function(){
        !$guideDom.hasClass('fixed') ?
        $guideDom.addClass('fixed').removeClass('relate') :
        $guideDom.addClass('relate').removeClass('fixed');
      });
    },    


    //创建锚点 是link Or Linked
    addAnchor = function(linkOrLinked){
        //遍历h1-h6
        var thishx;
        for(var i=0; i<=5; i++){
          //存在hx的情况

          if(hxArrSet[i] > 0){
            var j=i+1;
            //对每一个hx遍历
            for(var k=0; k<hxArrSet[i]; k++){

              if(linkOrLinked === "linked"){

                //创建锚点对象并添加class hx以便hx替换后a后按序查找
                thishx = $cont.find("h"+j).eq(k).addClass("h"+j);
                thishx.attr({"name":"to"+j+k,"id":"to"+j+k});

              }else if(linkOrLinked === "link"){

                //创建锚点链接    hx被替换成a，导致无法查找，因此以class查找 
                //去掉里层链接
                thishx = $(opts.guideClass).find(".h"+j).eq(k).attr({"href":'#to'+j+k}).attr({"code-num": '#to'+j+k});
                
                //目录序号无0则+1； h2显示1,2,3... h3显示2.1,2.2,....
                var m = k+1,    //序号第二位
                    n = j-1;    //序号第一位

                if(j === 2){          
                    thishx.prepend('<span>'+ m +'. </span>');
                }else if(j > 2){
                    thishx.prepend('<span>'+ n+'.'+m +'</span>');
                }
                //替换标签后添加class以便不影响查找
                thishx.replaceWith('<a code-num="#to'+j+k+'" href="#to'+j+k+'" class="h'+ j +'">' + thishx.text()+ '</a>');
          
              }
  
            }
          }
        }         
    },
    
    //排序sort
    hxSort = function(){
      var newHxDom =$cont.find("h1,h2,h3,h4,h5,h6").clone();
      $(opts.guideClass).append(newHxDom);
      //添加锚点链接
      addAnchor("link");
    },

    //给导航添加样式 
    styleGuide = function(mainClass){
        var $styleDom = $('<style type="text/css"></style');    
        var guideFrame = 
         mainClass + '{border : 1px solid #ddd; max-height : 300px; background-color : #fff; padding : 10px;  box-shadow: 0 1px 10px #999;}' +
         mainClass + '.fixed{top:50%; right:10px;  margin-top : -150px; overflow : auto; z-index : 10000; position: fixed}' +
         mainClass + '.relate{ position: relative}' +
         mainClass + ' a { display: block; font-size: 12px; color: #333; text-decoration: none; line-height : 24px; padding-left : 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-algin: left }' +
         mainClass + ' a.active { color:green }'+
         mainClass + ' .h1{ font-size: 15px; font-weight: bold; border-bottom : 1px solid #ddd; margin-bottom: 8px; }' +
         mainClass + ' .h2{ color: #555; font-size: 13px; font-weight:bold; margin-bottom:1px;}' +
         mainClass + ' .h3{ margin-left: 15px; color: #666; font-size: 13px;  margin-bottom:2px; }' +
         mainClass + ' .h4{ margin-left: 30px; color: #777;  margin-bottom:4px;  }' +
         mainClass + ' .h5{ margin-left: 45px; color: #999;  margin-bottom:6px;  }' +
         mainClass + ' .h6{ margin-left: 60px; color: #aaa;   }' + 
         mainClass + ' .switch-pos{ position:absolute; right:10px; top: 5px; color: #fff; background-color:rgba(0,0,0,.5); padding: 0 5px; font-size:13px; line-height:25px; border-radius:2px;}';
        //ie
        if( $styleDom[0].styleSheet ){
          $styleDom[0].styleSheet.cssText = guideFrame;
        }else{
          $styleDom.text(guideFrame);
        }

        $("head").append($styleDom);
    },

    scrollShow = function(){
      //滚动时相应显示所在条目
      $(window).scroll(function(){
        $cont.find("h1,h2,h3,h4,h5,h6").each(function(i){
          while( Math.ceil( $(this).offset().top ) - $(window).scrollTop() >= 0 ){
           //找出最小的大于0的hx元素,用href查找的话在ie7以前href会自动加上域名
           $('a[code-num="#'+$(this).attr("name")+'"]').addClass("active").siblings().removeClass("active");
           return false;
          }
         
         })
      });     
    };
    //启动
    init(); 
  }

  //默认参数
  $.fn.guide.defaults = {
    guideClass   : ".guide-frame", //
    placeDom: "body",   //导航默认在body级，悬浮;
    hxnum: 5,            //如果hx数不足 hxnum 个不显示导航
    isScorllShow : true,
  }
 })(jQuery)