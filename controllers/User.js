var mongo = require("mongodb");
var assert = require("assert");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
const jwt = require("jsonwebtoken");
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const details = (additionalData, res, uid) => {
	const id = additionalData.id;
	const address = additionalData.address;
	const city = additionalData.city;
	const mobile = additionalData.mobile;
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		user.updateOne(
			{ _id: id },
			{ $set: { address: address, city: city, mobile: mobile } },
			(err, result) => {
				assert.equal(null, err);
				getUser(res, uid);
			}
		);
	});
};
const getUser = (res, id) => {
	console.log("logged", id);
	var userData,
		postList = [];
	client.connect(url, function (err, db) {
		var post = db.db("Clone").collection("post");
		var database = db
			.db("Clone")
			.collection("users")
			.findOne({ id: id }, (error, user) => {
				console.log("getting user");
				assert.equal(null, error);
				console.log(user);
				userData = user;
				var cursor = post.find({ _id: { $in: user.post } }).limit(10);
				cursor.forEach(
					(c) => {
						postList.push(c);
					},
					() => {
						console.log("sent");
						res.json({ user: userData, post: postList });
					}
				);
			});
	});
};
const request = (req, res) => {
	const { userID, userName, requestName } = req.body;
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		user.updateOne(
			{ _id: objectId(userID) },
			{ $push: { pending: requestName } },
			(error1, r1) => {
				console.log(r1);
				user.updateOne(
					{ id: requestName },
					{ $push: { request: userName } },
					(error2, r2) => {
						console.log(r2);
						console.log("requested");
						res.json("requested");
						db.close();
					}
				);
			}
		);
	});
};
const cancelRequest = (req, res) => {
	console.log("in");
	const { userID, userName, requestName } = req.body;
	client.connect(url, function (err, db) {
		console.log("in");
		var user = db.db("Clone").collection("users");
		user.updateOne(
			{ _id: objectId(userID) },
			{ $pull: { pending: requestName } },
			(error1, r1) => {
				console.log("in");
				assert.equal(null, error1);
				user.updateOne(
					{ id: requestName },
					{ $pull: { request: userName } },
					(error2, r2) => {
						console.log("in");
						assert.equal(null, error2);
						console.log(
							userName + " canceled " + requestName + "'s request"
						);
						res.json("canceled");
						db.close();
					}
				);
			}
		);
	});
};
const acceptRequest = (req, res) => {
	const { userID, userName, requestName } = req.body;
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		user.updateOne(
			{ _id: objectId(userID) },
			{ $pull: { request: requestName } },
			(error1, r1) => {
				assert.equal(null, error1);
				user.updateOne(
					{ id: requestName },
					{ $pull: { pending: userName } },
					(error2, r2) => {
						assert.equal(null, error2);
						user.updateOne(
							{ _id: objectId(userID) },
							{ $push: { friends: requestName } },
							(error3, r3) => {
								assert.equal(null, error3);
								user.updateOne(
									{ id: requestName },
									{ $push: { friends: userName } },
									(error4, r4) => {
										assert.equal(null, error4);
										console.log(
											userName +
												" accepted " +
												requestName +
												"'s request"
										);
										res.json("accepted");
										db.close();
									}
								);
							}
						);
					}
				);
			}
		);
	});
};
const unfriend = (req, res) => {
	const { userID, userName, friendName } = req.body;
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		user.updateOne(
			{ _id: objectId(userID) },
			{ $pull: { friends: friendName } },
			(error1, r1) => {
				assert.equal(null, error1);
				user.updateOne(
					{ id: friendName },
					{ $pull: { friends: userName } },
					(error2, r2) => {
						assert.equal(null, error2);
						console.log(userName + " Unfriended " + friendName);
						res.json("Unfriended");
						db.close();
					}
				);
			}
		);
	});
};
const getFriends = (userid, res) => {
	console.log(userid);
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		user.findOne({ id: userid }, (error1, u) => {
			console.log(u.friends);
			res.json(u.friends);
			db.close();
		});
	});
};
module.exports = {
	details: details,
	getUser: getUser,
	request: request,
	cancelRequest: cancelRequest,
	acceptRequest: acceptRequest,
	unfriend: unfriend,
	getFriends: getFriends,
};
