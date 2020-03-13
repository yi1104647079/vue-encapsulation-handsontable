# vue-encapsulation-handsontable

### 介绍
基于vue-handsontable的二次封装。

在线编辑表格组件中，handsontable功能强大，而且有免费版，但是英文版技术文档和外网官网让人一言难尽。本次封装基于vue-handsontable的二次封装（根据handsontable的属性制作简单快捷功能，如固定表头，字段显隐，合并表格。

### 效果图

![](.\case2.png)

Gif较大

![](.\gifhome_1600x780_21s.gif)

### 功能简介
#### 1.固定表头

- handsontable中规定组件父元素height必须为准确值，但是数据为动态时高度无法确定。

- 当数据数据过多时候，滚动条出现，下滑时表头无法查看，查阅起来很不方便。

  本功能可设置一个默认高度，为400px，当数据过多，滚动条出现。也可默认不固定表头，则handsontable的父元素高度为数据量计算而来，实现动态高度



#### 2.字段显隐

顾名思义，可将表头字段隐藏或者显示



#### 3.合并表格

handsontable的属性mergeCells可以进行表格合并，但需按照特定规则将所需要合并的单元格位置已数组形式存储。

```
[
	{row:0, col:2, rowspan:5, colspan:1},
	{row:0, col:5, rowspan:6, colspan:1},
]
```

当数据为调取后端时候，需要动态的计算出合并位置。所以根据此属性需要将数据重组成以下类型，才可合并。

```
//所需要合并的字段必须每一个的都需要有值，可能需要个人的数据处理
[
	{typeName: '测试1', name: '名称1', targetMoney:'10', actualMoney: '20'},
	{typeName: '测试1', name: '名称2', targetMoney:'11', actualMoney: '10'},
	{typeName: '测试1', name: '名称3', targetMoney:'1010', actualMoney: '10'},
	{typeName: '测试1', name: '名称4', targetMoney:'10', actualMoney: '10'},
	{typeName: '测试2', name: '名称1', targetMoney:'22', actualMoney: '10'},
	{typeName: '测试2', name: '名称2', targetMoney:'10', actualMoney: '10'},
]
```

合并的字段可能不为一，则需要将合并的字段组成数据

```js
//若字段需要依据某个字段的模块来合并，受限制时候，既父子关系，则需放入前一个字段的children中即可，参照效果图
let countField = [
   {
     field: 'typeName',
     children: [{
       field: 'name',
       children: [{
          field: 'targetMoney'
       }]
      }]
    }
];
```

```js
//引入工具类
import { merge, spanMethod} from './mergeClass';


//在data中声明一个对象，用来存储计算出来后的每一个需要合并的字段的规则
this.merge = {};

//利用对象的浅拷贝赋值给一个值
let das = this.merge;

//new一个对象，并将  合并字段，存储对象， 数据  格式传入
let merges = new merge(countField, das, data);

//开始计算，并得出this.merge的结果,可console.log打印出this.merge，观察数据
merges.startCalculation();



/*
* 因为数据对比较大，需要时间。且涉及到三层级联，则需要在半秒后进行数据整合，为第三级以后setTimeout提供计算时间
*/

// 根据所在handsontable合并规则计算最终合并数据
// spanMethod（合并字段计算出的规则，所在handsontable显示的索引）

let mergeCells = this.hotSettings.mergeCells;
setTimeout(() => {
    
  //每一次spanMethod后得出的都是指定字段合并规则，所以多个字段需要多次将数据拼接到mergeCells
  mergeCells = mergeCells.concat(spanMethod(this.merge.typeName,1));
  mergeCells = mergeCells.concat(spanMethod(this.merge.name,2));
  mergeCells = mergeCells.concat(spanMethod(this.merge.targetMoney,3));
  
  //需要将所有合并数据计算完成后才能将数据赋值给handsontable，否则会使布局错乱
  this.hotSettings.data = JSON.parse(JSON.stringify(data));
  
  //在获取数据时候就将loading打开，提升用户体验
  this.contentLoading = false;
    
},500);
```



### 使用建议

- handsontable使用较为复杂，不建议二次封装成组件来使用

- j建议：直接将代码复制使用

- 本源码中涵盖大部分handsontable常用属性，并标注释，可以自行查看

- 源码中使用部分element-ui的组件，可替换成你所使用的组件，保留点击事件即可

- 所开发功能大部分使用逻辑开发，可以稍微改后用于其他框架

### 注
  handsontable虽然有免费版本，但是必须设置秘钥licenseKey，否则底部会显示一行提示英文。秘钥生成网址https://blog.csdn.net/hefeng6500/article/details/101622463，按照其步骤即可。

### 开发者 & 其他

* @title handsontable的简单二次封装
* @author 遗忘
* @time 2020-03-13
* @QQ 1786787613
* @other 欢迎提交bug，请写清楚遇到问题的原因，开发环境，复显步骤。

