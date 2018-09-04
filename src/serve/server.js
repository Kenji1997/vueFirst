var express = require("express");
var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/scDB";
// var url = "mongodb://bee:A123456789.@ds259111.mlab.com:59111/song";

var server = require("http").createServer(app);
server.listen(8081);
// app.set("view engine", "ejs");
// app.set("views", "./views");

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/search/:q' , (req, res)=>{
	// var data;
	let q = req.params.q;
	let replace = "^"+ q;
	let re = new RegExp(replace,"g");
	console.log(re);
	let queryStr = { query : re }
	// let queryStr = { query: "ai khóc nỗi đau này remix" }


	MongoClient.connect(url, { useNewUrlParser: true }, (err, db)=>{
		// var dbo = db.db("song");
		var dbo = db.db("scDB");
		dbo.collection("song").find( queryStr ).limit(10).toArray(function(err, result) {
		    if (err) throw err;
		    // data = result;
		    var data = JSON.stringify(result);
			res.end(data);
	    	db.close();
		});
	});
})
.get('/showAll', (req, res)=>{
	MongoClient.connect(url, { useNewUrlParser: true }, (err, db)=>{
		// var dbo = db.db("song");
		var dbo = db.db("scDB");
		dbo.collection("song").find({}, {_id: 0}).toArray(function(err, result) {
		    if (err) throw err;
		    let newArr = [];
		    result.map(ele=>{
		    	let u = ele.query;
		    	newArr.push({"query": u});
		    });
		    var data = JSON.stringify(newArr);
			res.end(data);
	    	db.close();
		});
	});	
})

console.log('im listening in port: 8081');
