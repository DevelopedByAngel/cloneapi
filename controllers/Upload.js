var mongo = require("mongodb");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var assert = require("assert");
const multer = require("multer");
const Post = require("./Post.js");
const Product = require("./Product.js");
const User = require("./User.js");
const fs = require("fs");
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
var storage = multer.diskStorage({
	destination: (req, file, callback) => {
		if (fs.existsSync("./images/user/" + req.headers.id)) {
			callback(null, "./images/user/" + req.headers.id);
		} else {
			fs.mkdir("./images/user/" + req.headers.id, (err) => {
				if (err) {
					throw err;
				}
			});
			callback(null, "./images/user/" + req.headers.id);
		}
	},
	filename: (req, file, callback) => {
		callback(
			null,
			Date.now() + "_" + req.headers.postno + "_" + file.originalname
		);
	},
});
var upload = multer({ storage: storage });
var storageDP = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "./images/DP/");
	},
	filename: (req, file, callback) => {
		callback(
			null,
			Date.now() + "_" + req.headers.id + "_" + file.originalname
		);
	},
});
var uploadDP = multer({ storage: storageDP });
var storageProduct = multer.diskStorage({
	destination: (req, file, callback) => {
		if (fs.existsSync("./images/product/" + req.headers.id)) {
			callback(null, "./images/product/" + req.headers.id);
		} else {
			fs.mkdir("./images/product/" + req.headers.id, (err) => {
				if (err) {
					throw err;
				}
			});
			callback(null, "./images/product/" + req.headers.id);
		}
	},
	filename: (req, file, callback) => {
		callback(null, Date.now() + "_" + file.originalname);
	},
});
var uploadProduct = multer({ storage: storageProduct });
const post = (req, res, next) => {
	const file = req.file;
	if (!file) {
		const error = new Error("Please upload a file");
		error.httpStatusCode = 400;
		return next(error);
	}
	console.log(file.path);
	const additionalData = JSON.parse(req.body.data);
	Post.UploadPost(
		res,
		additionalData.user,
		additionalData.caption,
		file.path
	);
};
const postDP = (req, res, next) => {
	const file = req.file;
	if (!file) {
		const error = new Error("Please upload a file");
		error.httpStatusCode = 400;
		return next(error);
	}
	const path = file.path;
	const additionalData = JSON.parse(req.body.data);
	client.connect(url, function (err, db) {
		// var id="5fc37fdf0fa17805bc4bb60a"
		var database = db.db("Clone").collection("users");
		database.updateOne(
			{ _id: objectId(additionalData.id) },
			{ $set: { path: path } },
			(error1, r1) => {
				console.log(r1);
				console.log("updated", additionalData.userid);
				User.details(additionalData, res, additionalData.userid);
			}
		);
	});
};
const postProduct = (req, res, next) => {
	const file = req.file;
	if (!file) {
		const error = new Error("Please upload a file");
		error.httpStatusCode = 400;
		return next(error);
	}
	console.log(file.path + "ok");
	const additionalData = JSON.parse(req.body.data);
	Product.UploadProduct(
		res,
		additionalData.id,
		additionalData.user,
		additionalData.name,
		additionalData.desc,
		additionalData.price,
		additionalData.qty,
		file.path
	);
};
module.exports = {
	upload: upload,
	uploadDP: uploadDP,
	uploadProduct: uploadProduct,
	post: post,
	postDP: postDP,
	postProduct: postProduct,
};
