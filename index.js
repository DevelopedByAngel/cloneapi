
const express=require('express');
const app=express();
const multer=require('multer');//for file upload
const cors=require('cors');
const jwt=require('jsonwebtoken');
const bodyParser=require('body-parser');
const fs=require('fs')
var mongo = require('mongodb');
var assert=require('assert');
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname+'/images'));//file path for images 
var storage=multer.diskStorage({
	destination:(req,file,callback) =>
	{
		if (fs.existsSync("./images/user/"+req.headers.id)) 
		{
		    callback(null,"./images/user/"+req.headers.id);
		} 
		else 
		{
		    fs.mkdir("./images/user/"+req.headers.id, (err) => {
		    if (err) {
		        throw err;
		   	 }
			})
		    callback(null,"./images/user/"+req.headers.id);
		}
	},
	filename:(req,file,callback) =>
	{
		callback(null,Date.now()+"_"+req.headers.postno+"_"+file.originalname);
	}
});
var upload=multer({storage:storage})
app.post('/upload', upload.single('imgUploader'), (req, res, next) => {
  const file = req.file
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  console.log(file.path)
  UploadPost(res,req.headers.user,req.headers.caption,file.path)
  // res.json({path: file.path})
  
})
var client = mongo.MongoClient;
var objectId=mongo.ObjectId;
var url="mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority"
client.connect(url,function(err,db)
	{
		var database = db.db('Clone').collection('login')
		// database.insertOne({"ok":"ok"},(error,r)=>
		// {
		// 	assert.equal(null,error)
		// 	console.log(r)
		// })
		
	})





const get=(name,res)=>
{
	client.connect(url,function(err,db)
	{
		var items=[]
		var database = db.db('Clone').collection(name)
		assert.equal(null,err)
		var all=database.find()
		console.log(all)
		all.forEach((a,error)=>
		{
			assert.equal(null,error)
			items.push(a)
		},()=>//since foreach is  asynchronous the next will execue before all element sare in array so added end function whuch will execute after completeio
		{
			console.log(items)
			res.json({items:items})
			db.close()
		})
	})
}
app.get('/get',(req,res)=>
{
	get("first-test",res)
})
app.get('/getPost',(req,res)=>
{
	get(req.body.name,res)
})

app.post('/sign',(req,res)=>
{
	const items=req.body
	client.connect(url,function(err,db)
	{
		var existsArray=db.db('Clone').collection('first-test')
		var database = db.db('Clone').collection('first-test');
		assert.equal(null,err);
		database.insertOne(items,(error,r)=>
		{
			assert.equal(null,error);
			console.log("Items inserted");
			get(res)
			db.close();//mongodb process is asunchronous so next steps inside function
		})
	})
})
app.post('/updatepost',(req,res)=>
{
	const items=req.body.update
	const id=req.body.id
	client.connect(url,function(err,db)
	{
		var database = db.db('Clone').collection('first-test')
		assert.equal(null,err)
		database.updateOne({"_id":objectId(id)},{$set: items},(error,r) =>
			{
				assert.equal(null,error);
				console.log("Item updated successfully");
				db.close();
				get(res)
			})
	})
})








app.post('/deletePost',(req,res)=>
{
	const {id,userID}=req.body;
	client.connect(url,function(err,db)
	{
		var found=[]
		var user = db.db('Clone').collection('users')
		var database = db.db('Clone').collection('post')
		database.deleteOne({"_id":objectId(id)},(error,a)=>
		{
			assert.equal(null,error)
			user.updateOne({"_id": objectId(userID)},{$pull:{post:objectId(id)}},(error2,r2)=>
			{
				assert.equal(null,error2)
				console.log("deleted")
			})
		})
	})
})
app.get('/hashtags',(req,res)=>
{
	const {hashtag}=req.body;
	client.connect(url,function(err,db)
	{
		var found=[]
		var database = db.db('Clone').collection('post')
		var find=database.find()
		find.forEach((f,error)=>
		{
			console.log("in")
			console.log(error,f)
			assert.equal(null,error)
			if(f.hashtags.includes("#"+hashtag))
				found.push(f)
		},()=>
		{
		res.json(found.reverse())
		db.close()
		})
	})
})
const UploadPost=(res,userID,caption,path)=>
{
	console.log(caption," ok ",path)
	var captionFull = caption.split(" ")
	var hashtags=captionFull.filter((c)=>
	{
		return c[0]=='#'
	})
	const post=
	{
		"path":path,
		"caption":caption,
		"hashtags":hashtags,
		"noOfLikes":0,
		"likes":[],
		"noOfComments":0,
		"comments":[],
		"noOfShare":0
	}
	client.connect(url,function(err,db)
	{
		var user = db.db('Clone').collection('users')
		var database = db.db('Clone').collection('post');
		assert.equal(null,err);
		database.insertOne(post,(error,r)=>
		{
			assert.equal(null,error);
			user.updateOne({"_id": objectId(userID)},{$push:{post:r.insertedId}},(error2,r2)=>
			{
				console.log(r2)
				console.log("Posted");
				res.json(post)
				db.close();
			})
		})
	})
}
const getUser =(res,id) =>
{
	client.connect(url,function(err,db)
	{
		var database = db.db('Clone').collection('users').findOne({"id":id},(error,user)=>
		{
			assert.equal(null,error)
			console.log(user);
			res.json(user)
		})
	})
}
app.post('/login',(req,res)=>
{
	const {id,password} = req.body;
	client.connect(url,function(err,db)
	{
		var database = db.db('Clone').collection('login')
		var exists=database.findOne({"id":id},(error,data)=>
		{
			assert.equal(null,error);
			const valid=password===jwt.verify(data.pwd,'spindle').password;
			if(valid)
			{
				console.log("logged in");
				getUser(res,id)
			}
		})
	})
})
app.post('/signup',(req,res)=>
{
	const {id,email,password} = req.body;
	const hash=jwt.sign({password:password},'spindle');
	const newUser=
	{
	"id":id,
	"email":email,
	"post":[],
	"friends":[],
	"request":[]
	}
	const credentials=
	{
		"id":id,
		"pwd":hash,
	}
	client.connect(url,function(err,db)
	{
		var arr=[]
		var existsArray=db.db('Clone').collection('login').find({"id":id});
		existsArray.forEach((a,error)=>
		{
			assert.equal(null,error)
			arr.push(a)
		},()=>
		{
			var login = db.db('Clone').collection('login')
			console.log(arr)
			var database = db.db('Clone').collection('users')
			if(arr.length===0)
			{
				assert.equal(null,err);
				login.insertOne(credentials,(error,r)=>
				{
					assert.equal(null,error);
					console.log("Account created [Added to login]");
					//mongodb process is asunchronous so next steps inside function
				})
				console.log("ok")
				database.insertOne(newUser,(error,r)=>
				{
					assert.equal(null,error);
					console.log("Account created [Added to users]");
					db.close();//mongodb process is asunchronous so next steps inside function
					getUser(res,id)
				})
			}
		})
		
	})
	
})
app.get('/feed',(req,res)=>
{

})
app.listen(3000);
