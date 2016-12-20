/**
*数据库操作辅助类,定义对象、数据操作方法都在这里定义
*/
var dbname='websql';/*数据库名*/
var version = '1.0'; /*数据库版本*/
var dbdesc = 'websql'; /*数据库描述*/
var dbsize = 20*1024*1024; /*数据库大小*/
var dataBase = null; /*暂存数据库对象*/
/*数据库中的表单名*/
var websqlTable = "websqlTable";

/**
 * 打开数据库
 * @returns  dataBase:打开成功   null:打开失败
 */
function websqlOpenDB(){
    /*数据库有就打开 没有就创建*/
    dataBase = window.openDatabase(dbname, version, dbdesc, dbsize,function() {});
    if (dataBase) {
        console.log("数据库创建/打开成功!");
    } else{
        alert("数据库创建/打开失败！");
    }
    return dataBase;
}

//查询有所有mac
function queryOrgs(callback,tableName) {  
    dataBase.transaction(function(tx) {  
        tx.executeSql("select distinct mac from "+tableName, [], function(tx, result) {            
            var arrayJSON = new Array();  
            for (var i = 0; i < result.rows.length; i++) {  
                var mac = result.rows.item(i).MAC;  
                arrayJSON[i]=mac;    
            } 
            callback(arrayJSON);  
        }, function(tx, error) {  
            /* alert('查询失败: ' + error.message); */  
        });  
    });  
}
//遍历已有mac,画图
function draw(arr){
	for (var i = 0; i < arr.length; i++) {
		websqlGetAData('allLines',arr[i]);
	}
	
}
/**
 * 新建数据库里面的表单
 * @param tableName:表单名
 */
function websqlCreatTable(tableName){
//  chinaAreaOpenDB();
    var creatTableSQL = 'CREATE TABLE IF  NOT EXISTS '+ tableName + ' (rowid INTEGER PRIMARY KEY AUTOINCREMENT, MAC text, ADDRESS text,LON text,LAT text,TIME int)';
    dataBase.transaction(function (ctx,result) {
        ctx.executeSql(creatTableSQL,[],function(ctx,result){
           console.log("表创建成功 " + tableName);
        },function(tx, error){ 
           mui.toast('创建表失败:' + tableName + error.message);
        });
    });
}
/**
 * 往表单里面插入数据
 * @param tableName:表单名
 * @param NAME:姓名
 * @param AGE:年龄
 * @param HEIGHT:身高
 * @param WEIGTH:体重
 */
function websqlInsterDataToTable(tableName,MAC,ADDRESS,LON,LAT,TIME){
    var insterTableSQL = 'INSERT INTO ' + tableName + ' (MAC,ADDRESS,LON,LAT,TIME) VALUES (?,?,?,?,?)';
    dataBase.transaction(function (ctx) {
        ctx.executeSql(insterTableSQL,[MAC,ADDRESS,LON,LAT,TIME],function (ctx,result){
            console.log("插入" + tableName  + ADDRESS + "成功");
        },
        function (tx, error) {
            mui.alert('插入失败: ' + error.message);
        });
    });
}
/**
 * 获取数据库一个表单里面的所有数据
 * @param tableName:表单名
 * 返回数据集合
 */
function websqlGetAllData(tableName,mac){   
    var selectALLSQL = "SELECT * FROM " + tableName +" WHERE MAC = ?";
    dataBase.transaction(function (ctx) {
        ctx.executeSql(selectALLSQL,[mac],function (ctx,result){
            console.log('查询成功: ' + tableName + result.rows.length);
            var len = result.rows.length;
            console.log(JSON.stringify(result.rows)); 
            var lostArray = [];
            for(var i = 0;i < len;i++) {
//              console.log("LON = "  + result.rows.item(i).LON);
//              console.log("LAT = "  + result.rows.item(i).LAT);
                lostArray.push(new plus.maps.Point(result.rows.item(i).LON,result.rows.item(i).LAT));
                var polylineObj = new plus.maps.Polyline(lostArray);
				map.addOverlay(polylineObj);
            }
        },
        function (tx, error) {
            mui.toast('查询失败: ' + error.message);
        });
    });
}

//獲取所有表并劃線
function websqlGetAllTable(){   
    var selectALLSQL = "SELECT name FROM [sysobjects]"; 
    dataBase.transaction(function (ctx) {
        ctx.executeSql(selectALLSQL,[],function (ctx,result){
            console.log('查询成功: ' + tableName + result.rows.length);
            var len = result.rows.length;
            console.log(JSON.stringify(result.rows)); 
            var lostArray = [];
            for(var i = 0;i < len;i++) {
//             
            }
        },
        function (tx, error) {
            mui.alert('查询失败: ' + error.message);
        });
    });
}






/**
 * 获取mac数据
 * @param tableName:表单名
 * @param name:姓名
 */
function websqlGetAData(tableName,mac){    
    var selectSQL = "SELECT *  FROM " + tableName + " WHERE MAC = ? ORDER BY TIME DESC";
    dataBase.transaction(function (ctx) {
        ctx.executeSql(selectSQL,[mac],function (ctx,result){
            console.log('mac查询成功: ' + tableName + result.rows.length);
            console.log(JSON.stringify(result.rows));
            var len = result.rows.length;
            var lost = [];
            for(var i = 0;i < len;i++) {
                //console.log("mac = "  + result.rows.item(i).MAC);
                lost[i] = new plus.maps.Point(result.rows.item(i).LON,result.rows.item(i).LAT);
            }
            var polylineObj = new plus.maps.Polyline(lost);
			map.addOverlay(polylineObj);
        },
        function (tx, error) {
            alert('查询失败: ' + error.message);
        });
    });
}
/**
 * 删除表单里的全部数据
 * @param tableName:表单名
 */
function websqlDeleteAllDataFromTable(tableName){
    var deleteTableSQL = 'DELETE FROM ' + tableName;
    localStorage.removeItem(tableName);
    dataBase.transaction(function (ctx,result) {
        ctx.executeSql(deleteTableSQL,[],function(ctx,result){
            console.log("删除表成功 " + tableName);
        },function(tx, error){ 
            alert('删除表失败:' + tableName + error.message);
        });
    });
}
/**
 * 根据name删除数据
 * @param tableName:表单名
 * @param name:数据的姓名
 */
function websqlDeleteADataFromTable(tableName,name){
    var deleteDataSQL = 'DELETE FROM ' + tableName + ' WHERE NAME = ?';
    localStorage.removeItem(tableName);
    dataBase.transaction(function (ctx,result) {
        ctx.executeSql(deleteDataSQL,[name],function(ctx,result){
            console.log("删除成功 " + tableName + name);
        },function(tx, error){ 
            alert('删除失败:' + tableName  + name + error.message);
        });
    });
}
/**
 * 根据name修改数据
 * @param tableName:表单名
 * @param name:姓名
 * @param age:年龄
 */
function websqlUpdateAData(tableName,name,age){
    var updateDataSQL = 'UPDATE ' + tableName + ' SET AGE = ? WHERE NAME = ?';
    dataBase.transaction(function (ctx,result) {
        ctx.executeSql(updateDataSQL,[age,name],function(ctx,result){
            alert("更新成功 " + tableName + name);
        },function(tx, error){ 
            alert('更新失败:' + tableName  + name + error.message);
        });
    });
}