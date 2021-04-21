const jwt = require("jsonwebtoken");
var mongo = require("mongodb");
var assert = require("assert");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const User = require("./User.js");
const signup = (req, res, client, url) => {
	console.log("in");
	const { id, email, password } = req.body;
	const hash = jwt.sign({ password: password }, "spindle");
	const newUser = {
		id: id,
		email: email,
		post: [],
		friends: [],
		request: [],
		pending: [],
	};
	const credentials = {
		id: id,
		pwd: hash,
	};
	client.connect(url, function (err, db) {
		var isExistsID = [];
		var existsArray = db.db("Clone").collection("login").find({ id: id });
		existsArray.forEach(
			(a, error) => {
				assert.equal(null, error);
				isExistsID.push(a);
			},
			() => {
				var login = db.db("Clone").collection("login");
				console.log(isExistsID);
				var database = db.db("Clone").collection("users");
				if (isExistsID.length === 0) {
					assert.equal(null, err);
					login.insertOne(credentials, (error, r) => {
						assert.equal(null, error);
						console.log("Account created [Added to login]");
					});
					console.log("ok");
					database.insertOne(newUser, (error, r) => {
						assert.equal(null, error);
						console.log("Account created [Added to users]");
						db.close();
						console.log("going");
						User.getUser(res, id);
					});
				} else {
					res.json({ error: "ID already exists" });
				}
			}
		);
	});
};
module.exports = {
	signup: signup,
};
