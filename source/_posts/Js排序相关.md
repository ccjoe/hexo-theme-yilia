title: Js排序相关...
date: 2015-08-19 15:31:56
tags: [javascript, sort]
---

##冒泡排序(BUBBLE SORT)

数组相邻位置对比大小，左<右则交换位置，
冒泡排序遍历->
第一轮最大的将冒泡至最右边, 遍历次数：arr.length
第二轮，第二大将至最右边, 遍历次数：arr.length-1
依次...

```javascript
//冒泡排序
function bubbleArr(arr){
    var i = arr.length, j, temp;
    while(i){
        for(var j=0; j<i-1; j++){
            if(arr[j] > arr[j+1]){
                temp = arr[j+1];
                arr[j+1] = arr[j];
                arr[j] = temp;
            }
            // console.log(arr, 'arrSub');
        };
        // console.log(arr, 'arr');
        i--;
    }
    return arr;
}
```

<!-- more -->

##快速排序(QUICK SORT 来源于二分查找思想)

将数组中间下标的值取出作为参考值， 将此数据与参考值比较， 小于参考值放左边，大于放右边。然后递归快速排序左右。

```javascript
//快速排序
function quickSort(arr){
    if(arr.length<=1){
        return arr;     //递归结束条件
    }
    var pivotIndex = Math.floor(arr.length/2);
    var pivot = arr.splice(pivotIndex,1)[0];    //标准对比值,arr为去除对比值后的数据
    var left = [],right = [];
    for(var i=0; i<arr.length; i++){
        if(arr[i] < pivot){
            left.push(arr[i]);
        }else{
            right.push(arr[i]);
        }
    }
    return quickSort(left).concat([pivot], quickSort(right));
}
```

## 插入排序(INSERTION SORT)
把第一个数字单独成有序数组，然后把紧跟的后面的数字插入有序数组形成二个有序数组，
然后今次把后面的数字插入前面增量的有序数组。
如此...
```javascript
function insertionSort(arr){
    var key,i;
    //第一个数字单独成有序数组
    //从第二个开始遍历，如果小于第一个则交换，则第一二个数字成有序数组
    //依次 ...
    for(var j=1; j<arr.length; j++){
        key = arr[j];                   //2   
        i = j-1;
        while(i>-1 && arr[i] > key){    //1>2
            arr[i+1] = arr[i];          //2=1
            i--;
        }
        arr[i+1] = key;                 //1=2
        //console.log(arr, 'ARR');
    }
    return arr;
}
```

## 希尔排序(SHELL SORT)

## 查找遗漏

在1-range范围内随机生成n个不重复整数的数据；

```javascript
//
// whole true 连续的
//       num  去掉num个
function genRandom(n, range){
    var rdmArr = [];
    for(var i=0; i<n; i++){
        var rdm = Math.ceil(Math.random() * range, 10);
        if(!~rdmArr.indexOf(rdm)){
            rdmArr.push(rdm);
        }else{
            i--;
        }
    }
    return rdmArr;
}
```

生成1-n整数的数组并且在里面随机去掉m个整数,不存在m则生成完整的数组
```javascript
function setArr(n, m){
    var arr = [];
    var rdmArr = genRandom(m, n);
    for (var i = 1; i <= n; i++) {
        if (!m || !rdmArr.filter(function(item,j){
            return item === i;
        }).length){
            arr.push(i)
        }
    };
    return arr;
}
```

找出【1-n整数的数组并且在里面随机去掉m个整数】，中去掉的那m个数;
```javascript
// 1.根据位置定位
function findNumByPosition(arr, n){
    var j, targetArr = [], begin=1;
    for(var i=0; i<arr.length; i++){
        //如果找到则某个位置少数则继续对应这个位置的数;
        if(arr[i] !== begin){
            targetArr.push(begin);
            i--;
        }
        begin++;
    }
    return targetArr;
}
```

[排序动画演示](http://jsdo.it/norahiko/oxIy/fullscreen)