const jwt = require("jsonwebtoken");
var mongo = require("mongodb");
var assert = require("assert");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const User = require("./User.js");
const UploadPost = (res, userID, caption, img) => {
	console.log(caption, " ok ", img);
	var captionFull = caption.split(" ");
	var hashtags = captionFull.filter((c) => {
		return c[0] == "#";
	});
	const post = {
		img: img,
		user: userID,
		caption: caption,
		hashtags: hashtags,
		likes: [],
		comments: [],
		noOfShare: 0,
	};
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		var database = db.db("Clone").collection("post");
		assert.equal(null, err);
		database.insertOne(post, (error, r) => {
			assert.equal(null, error);
			user.updateOne(
				{ id: userID },
				{ $push: { post: r.insertedId } },
				(error2, r2) => {
					console.log(r2);
					console.log("Posted");
					res.json(post);
					db.close();
				}
			);
		});
	});
};
const deletePost = (req, res) => {
	const { id, userID } = req.body;
	client.connect(url, function (err, db) {
		var found = [];
		var user = db.db("Clone").collection("users");
		var database = db.db("Clone").collection("post");
		database.deleteOne({ _id: objectId(id) }, (error, a) => {
			assert.equal(null, error);
			user.updateOne(
				{ _id: objectId(userID) },
				{ $pull: { post: objectId(id) } },
				(error2, r2) => {
					assert.equal(null, error2);
					console.log("deleted");
				}
			);
		});
	});
};
const like = (req, res) => {
	const { postID, userID } = req.body;
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var post = db.db("Clone").collection("post");
		post.updateOne(
			{ _id: objectId(postID) },
			{ $push: { likes: userID } },
			(error1, r1) => {
				assert.equal(null, error1);
				console.log("You liked this post");
				db.close();
				res.json("done");
			}
		);
	});
};
const share = (req, res) => {
	const { postID, userID } = req.body;
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var post = db.db("Clone").collection("post");
		post.updateOne(
			{ _id: objectId(postID) },
			{ $inc: { noOfShare: 1 } },
			(error1, r1) => {
				assert.equal(null, error1);
				console.log("You shared this post");
				db.close();
				res.json("done");
			}
		);
	});
};
const comment = (req, res) => {
	const { postID, userID, cmt } = req.body;
	const comment = {
		_id: objectId(),
		user: userID,
		comment: cmt,
		likes: 0,
		like: [],
		replies: [],
	};
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var post = db.db("Clone").collection("post");
		post.updateOne(
			{ _id: objectId(postID) },
			{ $push: { comments: comment } },
			(error1, r1) => {
				assert.equal(null, error1);
				console.log("done");
				res.json(comment);
			}
		);
	});
};
const reply = (req, res) => {
	const { postID, userID, cmtID, reply } = req.body;
	const rly = {
		_id: objectId(),
		user: userID,
		reply: reply,
	};
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var post = db.db("Clone").collection("post");
		post.updateOne(
			{ _id: objectId(postID), "comments._id": objectId(cmtID) },
			{ $push: { "comments.$.replies": rly } },
			(error1, r1) => {
				assert.equal(null, error1);
				res.json(rly);
				console.log(r1);
			}
		);
	});
};
const likeComment = (req, res) => {
	const { postID, cmtID, userID } = req.body;
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var post = db.db("Clone").collection("post");
		post.updateOne(
			{ _id: objectId(postID), "comments._id": objectId(cmtID) },
			{ $inc: { "comments.$.likes": 1 } },
			(error1, r1) => {
				post.updateOne(
					{ _id: objectId(postID), "comments._id": objectId(cmtID) },
					{ $push: { like: userID } },
					(error2, r2) => {
						console.log(error1);
						assert.equal(null, error2);
						console.log("You liked this comment");
						db.close();
						res.json("done");
					}
				);
			}
		);
	});
};
// const updatePost =(req,res)=>
// {
// 	const items = req.body.update;
// 	const id = req.body.id;
// 	client.connect(url, function (err, db) {
// 		var database = db.db("Clone").collection("first-test");
// 		assert.equal(null, err);
// 		database.updateOne(
// 			{ _id: objectId(id) },
// 			{ $set: items },
// 			(error, r) => {
// 				assert.equal(null, error);
// 				console.log("Item updated successfully");
// 				db.close();
// 				get(res);
// 			}
// 		);
// 	});
// }
module.exports = {
	UploadPost: UploadPost,
	deletePost: deletePost,
	like: like,
	share: share,
	comment: comment,
	reply: reply,
	likeComment: likeComment,
};
