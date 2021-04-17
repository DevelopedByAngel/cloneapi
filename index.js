const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const fs = require("fs");
var mongo = require("mongodb");
var assert = require("assert");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const Post = require("./controllers/Post.js");
const Product = require("./controllers/Product.js");
const User = require("./controllers/User.js");
const Signup = require("./controllers/Signup.js");
const Login = require("./controllers/Login.js");
const Upload = require("./controllers/Upload.js");
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + "/"));

app.post("/upload", Upload.upload.single("imgUploader"), (req, res, next) => {
	Upload.post(req, res, next);
});

app.post(
	"/uploadDP",
	Upload.uploadDP.single("imgUploader"),
	(req, res, next) => {
		Upload.postDP(req, res, next);
	}
);

app.post(
	"/uploadProduct",
	Upload.uploadProduct.single("imgUploader"),
	(req, res, next) => {
		Upload.postProduct(req, res, next);
	}
);

app.post("/updatepost", (req, res) => {
	Post.updatePost(req, res);
});
// client.connect(url, function (err, db) {
// 	console.log(err);
// 	console.log(db);
// 	var database = db.db("Clone").collection("login");
// 	var id = "5fc37fdf0fa17805bc4bb60a";

// 	console.log("database");
// });

// const get = (name, res) => {
// 	client.connect(url, function (err, db) {
// 		var items = [];
// 		var database = db.db("Clone").collection(name);
// 		assert.equal(null, err);
// 		var all = database.find();
// 		console.log(all);
// 		all.forEach(
// 			(a, error) => {
// 				assert.equal(null, error);
// 				items.push(a);
// 			},
// 			() =>
// 				//since foreach is  asynchronous the next will execue before all element sare in array so added end function whuch will execute after completeio
// 				{
// 					console.log(items);
// 					res.json({ items: items });
// 					db.close();
// 				}
// 		);
// 	});
// };
// app.get("/get", (req, res) => {
// 	get("first-test", res);
// });
// app.get("/getPost", (req, res) => {
// 	get(req.body.name, res);
// });

app.post("/likeComment", (req, res) => {
	Post.likeComment(req, res);
});
app.post("/reply", (req, res) => {
	Post.reply(req, res);
});
app.post("/comment", (req, res) => {
	Post.comment(req, res);
});
app.post("/share", (req, res) => {
	Post.share(req, res);
});
app.post("/like", (req, res) => {
	Post.like(req, res);
});
app.post("/doubt", (req, res) => {
	Product.doubt(req, res);
});
app.post("/answer", (req, res) => {
	Product.answerDoubt(req, res);
});
app.get("/profile/:id", (req, res) => {
	User.getUser(res, req.params.id);
});

app.get("/friends", (req, res) => {
	User.getFriends(req.body.userid, res);
});
app.post("/product", (req, res) => {
	Product.product(req, res);
});

app.post("/editProduct", (req, res) => {
	Product.editProduct(req, res);
});
app.post("/review", (req, res) => {
	Product.review(req, res);
});
app.post("/Unfriend", (req, res) => {
	User.unfriend(req, res);
});
app.post("/acceptRequest", (req, res) => {
	User.acceptRequest(req, res);
});
app.post("/cancelRequest", (req, res) => {
	User.cancelRequest(req, res);
});
app.post("/request", (req, res) => {
	User.request(req, res);
});
app.post("/deletePost", (req, res) => {
	Post.deletePost(req, res);
});
app.post("/getUser", (req, res) => {
	User.getUser(res, req.body.id);
});

app.post("/login", (req, res) => {
	Login.login(req, res, client, url);
});
app.post("/signup", (req, res) => {
	Signup.signup(req, res, client, url);
});
app.get("/search/:query", (req, res) => {
	const { query } = req.params;
	var users = [];
	console.log(query);
	client.connect(url, function (err, db) {
		var database = db.db("Clone").collection("users");
		var r1 = database.find({ id: { $regex: "^" + query } });
		// console.log(r1)
		r1.forEach(
			(r) => {
				users.push(r);
			},
			() => {
				console.log(users);
				res.json(users);
			}
		);
	});
});

app.get("/feeds/:id", (req, res) => {
	const id = req.params.id;
	var postList = [];
	var noOfFriends = 0;
	var noOfPost = 0;
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var user = db.db("Clone").collection("users");
		var database = db.db("Clone").collection("post");
		user.findOne({ _id: objectId(id) }, (error1, u) => {
			assert.equal(null, error1);
			u.friends.push(u.id);
			console.log("friends", u.friends.length);
			u.friends.forEach((friend, index, array) => {
				noOfFriends = noOfFriends + 1;
				user.findOne({ id: friend }, (error2, f) => {
					console.log(
						"friend ",
						index,
						"   ",
						f.post.length,
						" ",
						noOfPost
					);
					noOfPost = noOfPost + f.post.length;
					f.post.forEach((p, i, array2) => {
						database.findOne({ _id: objectId(p) }, (error3, fp) => {
							postList.push(fp);
							if (
								noOfFriends === u.friends.length &&
								noOfPost === postList.length
							) {
								console.log("posts", postList.length);
								res.json(postList);
								db.close();
							}
						});
					});
				});
			});
		});
	});
});

app.get("/hashtags/:hashtag", (req, res) => {
	const { hashtag } = req.params;
	client.connect(url, function (err, db) {
		var found = [];
		var database = db.db("Clone").collection("post");
		var find = database.find({ hashtags: "#" + hashtag });
		find.forEach((f, error) => {
			assert.equal(null, error);
			found.push(f);
			if (found.length === 10) res.json(found.reverse());
		});
	});
});

app.listen(3000 || process.env.PORT);
