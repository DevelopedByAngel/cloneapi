const jwt = require("jsonwebtoken");
var mongo = require("mongodb");
var assert = require("assert");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const User = require("./User.js");
const UploadProduct = (res, id, userID, name, desc, price, qty, path) => {
	console.log(desc, " ok ", path);
	var currdate = new Date();
	const product = {
		path: path,
		id: id,
		user: userID,
		name: name,
		desc: desc,
		price: price,
		qty: qty,
		likes: [],
		comments: [],
		date: [currdate.getDate(), currdate.getMonth(), currdate.getYear()],
	};
	client.connect(url, function (err, db) {
		var user = db.db("Clone").collection("users");
		var database = db.db("Clone").collection("product");
		assert.equal(null, err);
		database.insertOne(product, (error, r) => {
			assert.equal(null, error);
			user.updateOne(
				{ id: userID },
				{ $push: { product: r.insertedId } },
				(error2, r2) => {
					console.log(r2);
					console.log("product Posted");
					res.json(product);
					db.close();
				}
			);
		});
	});
};
const review = (req, res) => {
	const { id, userID, cmt } = req.body;
	const comment = {
		_id: objectId(),
		user: userID,
		review: cmt,
	};
	client.connect(url, function (err, db) {
		assert.equal(null, err);
		var post = db.db("Clone").collection("product");
		post.updateOne(
			{ _id: objectId(id) },
			{ $push: { comments: comment } },
			(error1, r1) => {
				assert.equal(null, error1);
				console.log("done");
				res.json(comment);
			}
		);
	});
};
const editProduct = (req, res) => {
	const { id, name, desc, price, qty } = req.body;
	client.connect(url, function (err, db) {
		var product = db.db("Clone").collection("product");
		product.updateOne(
			{ _id: objectId(id) },
			{ $set: { name: name, desc: desc, price: price, qty: qty } },
			(error1, r1) => {
				assert.equal(null, error1);
				res.json("done");
			}
		);
	});
};
const product = (req, res) => {
	const search = req.body.search;
	console.log("ok");
	var productList = [];
	if (search == "") {
		client.connect(url, function (err, db) {
			assert.equal(null, err);
			var user = db.db("Clone").collection("users");
			var database = db.db("Clone").collection("product");
			var find = database.find();
			find.forEach(
				(f, error) => {
					assert.equal(null, error);
					productList.push(f);
				},
				() => {
					res.json(productList);
				}
			);
		});
	} else {
		client.connect(url, function (err, db) {
			assert.equal(null, err);
			var user = db.db("Clone").collection("users");
			var database = db.db("Clone").collection("product");
			var find = database.find({ name: { $regex: "^" + search } });
			find.forEach(
				(f, error) => {
					assert.equal(null, error);
					productList.push(f);
				},
				() => {
					res.json(productList);
				}
			);
		});
	}
};
const doubt = (req, res) => {
	const { id, doubt } = req.body;
	const query = {
		user: id,
		doubt: doubt,
		answers: [],
	};
	client.connect(url, function (err, db) {
		var query = db.db("Clone").collection("query");
		query.insertOne(query, (err, result) => {
			assert.equal(null, err);
			var returnQuery = {
				_id: result.insertedId,
				user: id,
				doubt: doubt,
				answers: [],
			};
			res.json(returnQuery);
		});
	});
};
const answerDoubt = (req, res) => {
	const { id, doubtID, ans } = req.body;
	const answer = {
		_id: ObjectId(),
		user: id,
		answer: ans,
	};
	client.connect(url, function (err, db) {
		var query = db.db("Clone").collection("query");
		query.updateOne(
			{ _id: doubtID },
			{ $push: { answers: comment } },
			(err, result) => {
				assert.equal(null, err);
				res.json(answer);
			}
		);
	});
};
module.exports = {
	UploadProduct: UploadProduct,
	review: review,
	editProduct: editProduct,
	product: product,
	doubt: doubt,
	answerDoubt: answerDoubt,
};
