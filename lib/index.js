var fs = require("fs")
	, path = require("path")
	, crypto = require("crypto");
var db = cfg = db_data = {}
	, updatetime = -1;
db.updatetime = updatetime = Date.now();
db.config = function(options){
	cfg = options || {};
	cfg.path = path.join(cfg.path);
	if( !fs.existsSync(cfg.path) ){
		console.log("function-config: path not found");
		cfg.isExistPath = false;
	} else {
		cfg.isExistPath = true;
	}
	delete this.config;
}
db.use = function(table){
	if( !cfg.isExistPath ) return false;
	cfg.table = table;
	cfg.tablePath = path.join(cfg.path+"/"+table+".clary");
	if( fs.existsSync(cfg.tablePath) ){
		cfg.isExistTable = true;
	} else {
		console.log("function-use: table not found");
		cfg.isExistTable = false;
	}
}
db.insert = function(insertData, fn){
	if( !cfg.isExistPath ) return false;
	// if( !cfg.isExistTable ){
	// 	console.log("function-insert: 插入数据前必须先设置数据库表，请使用use函数来设置");
	// }
	if( !fs.existsSync(cfg.tablePath) ){
		var json = {};
		json.curindex = 0;
		json.data = [];
		try{
			fs.writeFileSync(cfg.tablePath, JSON.stringify(json));
			cfg.isExistTable = true;
		}
		catch(err) {
			if( typeof fn === "function" ) fn(err);
			return false;
		}
	}
	if( !(insertData instanceof Object) || (insertData instanceof Array && insertData.length <= 0) || JSON.stringify(insertData) === "{}" ){
		console.log("function-insert: 插入的数据不能为空，且必须为json对象或者json对象组成的数据。");
		return false;
	}

	fs.readFile(cfg.tablePath, "utf-8", function(err, data){
		if(err) throw err;
		data = JSON.parse(data);
		data.curindex++;
		insertData = jsonMerge({id: md5(), _id: data.curindex}, insertData);
		data.data.push(insertData);
		fs.writeFile(cfg.tablePath, JSON.stringify(data), function(err){
			if( !err ) db.updatetime = Date.now();
			if( typeof fn === "function" ) fn(err, insertData)
		})
	})

	function jsonMerge(json1, json2){
		json1 = json1 || {};
		json2 = json2 || {};
		for( var i in json2){
			json1[i] = json2[i];
		}
		return json1;
	}

	function md5(){
		var md5 = crypto.createHash("md5");
		return md5.update(Date.now()+"").digest("hex");
	}
}

db.delete = function(deleteData, fn){
	if( !cfg.isExistPath ) return false;
	if( !cfg.isExistTable ){
		console.log("function-delete: 删除数据前必须先设置数据库表，请使用use函数来设置");
		return false;
	}
	try{
		var data = JSON.parse(fs.readFileSync(cfg.tablePath, "utf-8") );
		var len = data.data.length;
		var deletedDate = [];
		if( deleteData && deleteData instanceof Object && deleteData.isDone ){
			for( var i in deleteData ){
				if( i !== "select" ){
					for( var j=0; j<data.data.length; j++ ){
						if( data.data[j][i] === deleteData[i] ){
							if( !deleteData.isDone ){
								deletedDate.push( data.data[j] );
							} else {
								deletedDate.push( data.data.splice(j,1)[0] );
								j--;
							}
						}
					}
				}
			}
		}
		if( len !== data.data.length ){
			fs.writeFile(cfg.tablePath, JSON.stringify(data), function(err){
				if( typeof fn === "function" ) fn(err, deletedDate);
			})
		} else if( typeof fn === "function" ) fn(undefined, deletedDate);
	}
	catch(err) {
		if( typeof fn === "function" ) fn(err);
	}
}

db.select = function(fn){
	if( !cfg.isExistPath ) return false;
	if( !cfg.isExistTable ){
		console.log("function-select: 查询数据前必须先设置数据库表，请使用use函数来设置");
		return false;
	}
	try{
		if( typeof fn === "function" ){
			if( db.updatetime === updatetime && !!db_data[cfg.table] ) fn(undefined, db_data[cfg.table]);
			else {
				db_data[cfg.table] = JSON.parse(fs.readFileSync(cfg.tablePath, "utf-8") ).data;
				db.updatetime = updatetime = Date.now();
				fn(undefined, db_data[cfg.table]);
			}
		} 
	}
	catch(err) {
		if( typeof fn === "function" ) fn(err);
	}
}

db.update = function(updateData, fn){
	if( !cfg.isExistPath ) return false;
	if( !cfg.isExistTable ){
		console.log("function-update: 修改数据前必须先设置数据库表，请使用use函数来设置");
		return false;
	}
	if( !(updateData instanceof Object) || (updateData instanceof Array && updateData.length <= 0) || JSON.stringify(updateData) === "{}" ){
		console.log("function-update:更新的数据不能为空，且必须为json对象或者json对象组成的数据。");
		return false;
	}
	fs.readFile(cfg.tablePath, "utf-8", function(err, data){
		if(err){
			if( typeof fn === "function" ) fn(err);
		}
		data = JSON.parse(data);
		if( updateData instanceof Array ){
			for( var i=0; i<updateData.length; i++ ){
				for( var j=0; j<data.data.length; j++ ){
					if( updateData[i]._id && updateData[i]._id === data.data[j]._id ){
						data.data[j] = updateData[i];
					}
				}
			}
		} else {
			for( var j=0; j<data.data.length; j++ ){
				if( updateData._id && updateData._id === data.data[j]._id ){
					data.data[j] = updateData;
				}
			}
		}
		fs.writeFile(cfg.tablePath, JSON.stringify(data), function(err){
			if( typeof fn === "function" ) fn(err,data.data)
		})
	})
}

module.exports = db;