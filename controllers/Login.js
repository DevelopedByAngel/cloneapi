const jwt = require("jsonwebtoken");
var mongo = require("mongodb");
var assert = require("assert");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const User = require("./User.js");
const login = (req, res, client, url) => {
	console.log("login");
	const { id, password } = req.body;
	client.connect(url, function (err, db) {
		var database = db.db("Clone").collection("login");
		var exists = database.findOne({ id: id }, (error, data) => {
			assert.equal(null, error);
			const valid = password === jwt.verify(data.pwd, "spindle").password;
			if (valid) {
				console.log("logged in");
				User.getUser(res, id);
			} else {
				res.json({ error: "Wrong credentials" });
			}
		});
	});
};
module.exports = {
	login: login,
};
