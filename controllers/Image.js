var mongo = require("mongodb");
var client = mongo.MongoClient;
var objectId = mongo.ObjectId;
var assert = require("assert");
const multer = require("multer");
var binary=mongo.Binary;

const Post = require("./Post.js");
const Product = require("./Product.js");
const User = require("./User.js");
const fs = require("fs");
var url =
	"mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority";
const getImage=(req,res)=>
{
	client.connect(url,{ useNewUrlParser: true }, function (err, db) {
		if(err)
		{
			return err;
		}
		else 
		{
			var database = db.db("Clone").collection("images");
			database.find({},(err,image)=>{
				if(err)
					console.log(err);
				else
				{
					 image.forEach((f,error)=>
					{
						console.log(f.img.data.toString('base64'));
						res.json({img:f});
						db.close();
					})
				}
			})
		}
	})
}
const postImage=(req,res)=>
{
	console.log("*****************************************************************************")
	// console.log(req)

	let file={name: "req.body.name", 
	img: {
            data: binary(fs.readFileSync(req.file.path)),
            contentType: req.file.mimetype
        }}
        console.log(file)
    client.connect(url, { useNewUrlParser: true }, (err, db) => {
        if (err) {
            return err
        }
        else {
            let collection = db.db('Clone').collection('images')
            try {
                collection.insertOne(file)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            db.close()
            res.redirect('/')
        }

    })

}
module.exports = {
	getImage: getImage,
	postImage: postImage
};
