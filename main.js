const express = require("express");
const bodyParser    = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }))



app.get("", function(req, res) {
	console.log(__dirname);
	  res.sendFile(__dirname + "/index.html");
	});
	
	app.get("main.html", function (req, res) {
		console.log(__dirname);
		res.send(__dirname + '/main.html');
})
	 
	
app.use(express.static(__dirname));

app.get('/response', function (req, res) {
	res.send('<div>checking functionality<div>')
})

app.post("http://localhost:8080/index.html", function(req,res){
	var userid = req.body.UserID;
	console.log("running");
	User_Query_Everything(userid, res, mongodb);
	// tweets(userid, res);
});

function User_Query_Everything(){
				res.write("<div>hello</div>")
				res.end();				
}