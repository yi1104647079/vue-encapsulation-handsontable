/**
 * 计算合并数据类
 * @param Array countField 需要合并数据字段
 * @param Object das 接收计算后的数据
 * @param Array data 需要对比计算的原始数据
 */
export class merge {
    constructor(countField, das, data){
      this.countField = countField;
      this.das = das;
      this.data = data;
    }

    /**
     * 开始计算
     */
    startCalculation(){
      this.setDefault(this.countField, this.das);
      this.setMergeLen(this.countField, this.das, this.data);
      this.secondData(this.countField, this.das, this.data);
    }

    /**
     * 循环设置默认数据
     */
    setDefault(data, targetData){
      if(data && data.length > 0){
        data.forEach(ele => {
          targetData[ele.field] = [{
            index: 0,
            len: 1
          }]
          if(ele.children && ele.children.length> 0){
            this.setDefault(ele.children, targetData)
          }
        })
      }
    }
    /**
     * 循环获取合并数据(第一层)
     */
    setMergeLen(countField, mergeList, dataList){
      for (let i = 0;i<dataList.length;i++) {
        for (let j = 0; j < countField.length; j++) {
          if (i < dataList.length - 1) {
            if (dataList[i][countField[j].field] == dataList[i + 1][countField[j].field] && dataList[i][countField[j].field] && dataList[i + 1][countField[j].field]) {
              mergeList[countField[j].field][mergeList[countField[j].field].length - 1].len++
            } else {
              let das = mergeList[countField[j].field][mergeList[countField[j].field].length - 1];
              mergeList[countField[j].field].push({
                index: das.index+ das.len,
                len: 1
              })
            }
          }
        }
      }
    }
    /**
     * 递归，从第二层开始
     */
    secondData(countField, mergeList, dataList){
      for (let i =0; i<countField.length;i++){
        if(countField[i].children && countField[i].children.length> 0){
          let children = countField[i].children;
          children.forEach(ele => {
            if(ele.children && ele.children.length > 0){
              //利用js单线程，等父级合并算好之后再计算子级
              setTimeout(() => {
                this.secondData(children, mergeList, dataList)
              },0)
            }
          });

          let list = mergeList[countField[i].field];
          for (let j = 0; j<list.length;j++){
            for (let z = 0;z<countField[i].children.length;z++){

              let filedChild = countField[i].children[z].field;
              if(mergeList[filedChild].length == 1 && mergeList[filedChild][0].index == 0 && mergeList[filedChild][0].len == 1){
                mergeList[filedChild][0].index = list[j].index;
              }else {
                mergeList[filedChild].push({
                  index: list[j].index,
                  len: 1
                })
              }
              let dataChildList = JSON.parse(JSON.stringify(dataList)).splice(list[j].index,list[j].len);
              this.setMergeLen(countField[i].children, mergeList, dataChildList);
            }
          }
        }
      }
    }
  }


  /**
   * 合并(基于handsontable合并规则)
   * @param Array arry 数据
   * @param Number col 合并所在列
   * 返回handsontable合并规则的数组
   */
  export const spanMethod = (arry, col) =>{
    let data = [];
    if (arry && arry.length>0) {
      arry.forEach(ele => {
        if(ele.len > 1){
          data.push({row:ele.index, col:col, rowspan:ele.len, colspan:1})
        }
      })
    }
    return data;
  }
