var db = require("../");
db.config({
	path: __dirname+"/dbfile"
});
db.use("test");
db.insert({
	username: "test1001",
	password: "1+2+3"
}, function(err, data){
	db.select(function(err, data){
		console.log(data);
		data[0].username = "test1002";
		db.update(data[0], 
			function(err, data){
				console.log(data);
				db.delete({
					username: "test1002",
					isDone: true
				}, function(err, data){
					console.log(data);
				});
			}
		);
	});
});
// 最终结构为空数据