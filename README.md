### 简介
localDB是一个数据库操作库，它基于nodejs的fs模块开发的。  
它提供了基本的增删查改的功能。  
其数据结构如下：data是json对象所存放的数组
    
    {
        curindex: 1,
        data: []
    }
每次插入新数据的json对象都会插入id=系统配置32位，_id=最新索引
### 函数目录
+ config 数据库基本配置，目前只提供配置存放数据文件的目录
+ use 设置当前使用的数据表
+ insert 插入数据
+ delete 删除数据
+ select 查询数据
+ update 更新数据

### 基本用法
安装本模块: npm install localDB --save
##### config（必须且只能执行一次）
配置当前数据文件的存放目录  
@param {path: "\*\*\*\*"} Object
##### use（至少执行一次）
设置当前使用的数据表  
@param "" String
##### insert
往use设置的表中插入数据，并返回数据  
@param {} Object  
@param function(err,data){} function
##### delete
根据参数属性做删除，第一个参数对象必须包含 *isDone=true* 才能删除，否则的话只会输出将要删除的数据  
@param {} Object
@param function(err,data){} function
##### select
直接查询use设置的表的数据
@param function(err,data){} function
##### update
先查询出数据的id，在根据id来删除  
@param {id:\*, \*\*\*\*} Object  
@param function(err,data){} function
##### 操作实例
config

    db.config({
        path: __dirname+"/dbfile"
    });
use

    db.use("test");
insert

    db.insert({
        username: "test1001",
        password: "1+2+3"
    }, function(err, data){
        console.log(data);
    });
select

    db.select(function(err, data){
        console.log(data);
    });
update

    db.select(function(err, data){
        data[0].username = "test1002";
        db.update(data[0], 
            function(err, data){
                console.log(data);
            }
        );
    });
delete

    db.delete({
        username: "test1001"，
        isDone: true
    },function(err, data){
        console.log(data);
    });
详细请看本库下的example    
