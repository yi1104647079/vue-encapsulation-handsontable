<!--handsontable的二次封装-->
<template>
    <div class="box">
        <div class="subFeeSum" v-loading="contentLoading">
            <div style="margin-bottom: 10px;overflow:hidden">
                <el-button style="float:left" type="primary" size="medium" @click="setHeard" :icon="setFixed?'el-icon-unlock':'el-icon-lock'">{{setFixed?'解除固定':'固定表头'}}</el-button>
                <el-button style="float:left" type="primary" size="medium" icon="el-icon-plus" @click="adds">插入行</el-button>
                <div style="float: right">
                    <div style="width: 200px;display: inline-block;margin-right: 10px">
                        <el-select v-model="hotSettings.hiddenColumns.columns" multiple placeholder="请选择需要隐藏字段" size="medium" clearable @clear="subDispaly">
                            <el-option
                                    v-for="(item,index) in hotSettings.columns"
                                    :key="index"
                                    :label="item.name"
                                    :disabled="item.disabled"
                                    :value="index">
                            </el-option>
                        </el-select>
                    </div>
                    <el-button type="primary" size="medium" @click="subDispaly">确定</el-button>
                </div>
            </div>
            <div id="subFeeSum-table" :style="{'minHeight':height}" v-if="subFeeSumShow">
                <hot-table ref='textHot' :settings="hotSettings" :licenseKey="licenseKey"></hot-table>
            </div>
        </div>
    </div>
</template>
<script>
    import Vue from 'vue'
    import {HotTable} from '@handsontable/vue'

    import 'handsontable/dist/handsontable.full.css';
    import 'handsontable/languages/zh-CN';

    import ElementUI from 'element-ui';
    import 'element-ui/lib/theme-chalk/index.css';


    import { merge, spanMethod} from './mergeClass';

    Vue.component('HotTable', HotTable);
    Vue.use(ElementUI);

    export default {
        name: 'otherSum',
        data(){
            return {
                contentLoading: false, //加载
                subFeeSumShow: true, //表格显隐
                setFixed: false, //是否固定表头
                height: '400px', //固定高度
                row: 0, //当前共有多少行数据，计算高度
                merge: {}, //合并单元格
                dispalyFiled: [], //隐藏字段集合
                hotSettings: {
                    data:[], // 数据在这个里面,由数据填充表
                    minRows: 1, //最小行列
                    rowHeaders: true, //就是左边的1,2,3(官方序号)
                    columnHeaderHeight: 45, //表头高度
                    stretchH: 'all',     //last:延伸最后一列,all:延伸所有列,none默认不延伸。
                    rowHeights: 35, //行高
                    autoWrapRow: true, //自动换行
                    manualColumnResize:true,//可拖动 行表头
                    manualRowResize:true,//可拖动 列表头
                    // outsideClickDeselects: false, // 点击到表格以外，表格就失去focus
                    // startRows: 10, //初始行列数
                    // startCols: 35, //初始列数
                    // minSpareCols: 1, //列留白
                    // minSpareRows: 2, //行留白
                    // wordWrap: false, //自动换行（默认为true）
                    language: 'zh-CN',
                    colHeaders: [], //自定义列表头or 布尔值
                    className: "htCenter htMiddle", //容器单元格的class属性（htCenter，htLeft，htRight，htJustify，htTop，htMiddle，htBottom），默认值undefined，这些属性将作为容器单元格内容的对齐方式
                    // currentRowClassName: "currentRow", //为选中行添加类名，可以更改样式
                    // currentColClassName: "currentCol", //为选中列添加类名
                    autoColumnSize: true, //自适应列大小
                    manualColumnFreeze: true,
                    manualRowMove: true, //当值为true时，行可拖拽至指定行
                    columnSorting: true, //当值为true时，表示启用排序插件
                    mergeCells: [],//合并单元格
                    contextMenu: [ //菜单
                        "row_above",
                        "row_below",
                        "col_left",
                        "col_right",
                        "---------",
                        "remove_row",
                        "remove_col",
                        "---------",
                        "alignment",
                        'make_read_only',
                        "borders",
                        "copy",
                        "cut"
                    ],
                    //右键效果
                    fillHandle: true, //选中拖拽复制 possible values: true, false, "horizontal", "vertical"
                    // fixedColumnsLeft: 1, //固定左边列数
                    // fixedRowsTop: 1, //固定上边行数
                    nestedHeaders: [ //合并
                        ['', {label: '合并表头', colspan: 5}, ''],
                        ['类别', '内容','预算金额','实际金额','预算合计', '实际合计', '备注']
                    ],
                    columns: [
                        //添加每一列的数据类型和一些配置
                        // data后面跟的这个字段是上传对应的字段
                        {
                            name: '类别',
                            data: 'typeName', //绑定的字段
                            disabled: false, //是否可以隐藏字段，当stretchH为last时候，最后一个字段应该禁用，否者会出bug
                            // width: 250 设置宽度，当stretchH为all时候，最好不要设置
                            readOnly: false, //该字段只读
                        },

                        {
                            name: '内容',
                            data: 'name',
                            readOnly: false,
                        },
                        {
                            name: '预算',
                            data: 'targetMoney',
                            readOnly: false,
                        },
                        {
                            name: '实际',
                            data: 'actualMoney',
                            readOnly: false,
                        },
                        {
                            name: '预算合计',
                            data: 'budgetTotal',
                            readOnly: false,
                        },
                        {
                            name: '实际合计',
                            data: 'actualTotal',
                            readOnly: false,
                        },
                        {
                            name: '备注',
                            data: 'remark',
                            readOnly: false,
                            disabled: false
                        }
                    ],

                    hiddenColumns: {
                        // set columns that are hidden by default
                        columns: [],
                        // show where are hidden columns
                        indicators: true
                    },
                    //添加行后调用
                    afterCreateRow: (index,amount,source)=>{
                        this.row++;
                    },
                    //删除行后调用
                    afterRemoveRow: (index,amount,physicalRows,source)=>{
                        this.row -= amount;
                    },
                    afterRowResize:(col,size)=>{
                        // console.log(col)
                        // console.log(size)
                    },
                    afterChange: (changes, source) => {
                        if(changes){
                            changes.forEach(([row,prop,oldValue,newValue]) => {
                                // // 判断
                                // if(prop == 'projName' || prop == 'payType' || prop == 'billMoney' ) { //phone是我需要判断的字段

                                // }
                            })
                        }
                    },
                    //隐藏字段
                    afterGetColHeader: (col,th) => {
                        if (this.dispalyFiled.indexOf(col) != -1){
                            th.style.display='none'; // 防止拖曳标题栏，露出隐藏的列（主键）
                        }
                    }
                },
                licenseKey: "4d522-5237a-55f42-6653a-d1494",//秘钥-生成网址https://blog.csdn.net/hefeng6500/article/details/101622463
            }
        },
        created(){
            this.height = this.hotSettings.data.length*this.hotSettings.rowHeights+this.hotSettings.columnHeaderHeight+120+'px';
            this.getData();
        },
        watch:{
            row(newVal,oldVal){
                if(!this.setFixed){
                    this.height = newVal*this.hotSettings.rowHeights+this.hotSettings.columnHeaderHeight+120+'px';
                }
            }
        },
        methods:{
            /**
             * 插入行
             */
            adds(){
                this.hotSettings.data.push({});
                this.row++;
                if(!this.setFixed){
                    this.height = this.hotSettings.data.length*this.hotSettings.rowHeights+this.hotSettings.columnHeaderHeight+120+'px';
                }
            },
            /**
             * 固定表头
             */
            setHeard(){
                this.setFixed = !this.setFixed;
                this.contentLoading = true;
                this.subFeeSumShow = false;
                if(this.setFixed){
                    this.height = '400px';
                }else {
                    this.height = this.hotSettings.data.length*this.hotSettings.rowHeights+this.hotSettings.columnHeaderHeight+120+'px';
                }
                setTimeout(()=>{
                    this.contentLoading = false;
                    this.subFeeSumShow = true;
                },300)
            },
            /**
             * 隐藏字段
             */
            subDispaly(){
                this.contentLoading = true;
                this.subFeeSumShow = false;
                setTimeout(()=>{
                    this.contentLoading = false;
                    this.subFeeSumShow = true;
                },500)
            },

            /**
             * 获取数据
             */
            getData(){
                //this.processing(data)
            },
            /**
             * 计算合并
             */
            processing(data){
                //可以进行级联合并，当第二个字段受第一个字段限制时候，放入其children中
                let countField = [
                    {
                        field: 'typeName',
                    }
                ];

                this.merge = {};
                let das = this.merge;
                let merges = new merge(countField, das, data);
                merges.startCalculation();

                /**
                 * 如果涉及到三层级联，则需要在半秒后进行数据整合，为第三级以后setTimeout提供计算时间
                 */
                setTimeout(() => {
                    this.hotSettings.mergeCells = this.hotSettings.mergeCells.concat(spanMethod(this.merge.typeName,1));
                    this.hotSettings.data = JSON.parse(JSON.stringify(data));
                    this.contentLoading = false;
                },500);
            }
        }
    }
</script>
<style>
    .box{
        background-color: #ccc;
        padding: 20px 20px;
    }
    .subFeeSum{
        background-color: #fff;
        width: 100%;
        height: 100%;
        padding: 20px 20px;
        box-sizing: border-box;
    }
    .subFeeSum  #subFeeSum-table{
        overflow: hidden;
        width: 100%;
    }
    .subFeeSum .handsontable .currentRow {
        background-color: #b6bada;
    }
    .subFeeSum .handsontable .currentCol {
        background-color: #d1dfd7;
    }
    .subFeeSum #hot-display-license-info{
        display: none;
    }
    .subFeeSum .htCore thead th,.htCore tbody th{
        /*background: #FFF;*/
        vertical-align:middle;
    }
</style>
