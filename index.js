
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
app.use(express.static(__dirname+'/'));//file path for images 
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
var storageDP=multer.diskStorage({
	destination:(req,file,callback) =>
	{
		
		    callback(null,"./images/DP/");
	},
	filename:(req,file,callback) =>
	{
		callback(null,Date.now()+"_"+req.headers.id+"_"+file.originalname);
	}
});
var uploadDP=multer({storage:storageDP})
app.post('/uploadDP', uploadDP.single('imgUploader'), (req, res, next) => {
  const file = req.file
  console.log(req.file)
  if (!file) {
    const error = new Error('Please upload a file')
    error.httpStatusCode = 400
    return next(error)
  }
  const path = file.path
  client.connect(url,function(err,db)
	{
		// var id="5fc37fdf0fa17805bc4bb60a"
	 	var database = db.db('Clone').collection('users')
	 	database.updateOne({"_id":objectId(req.headers.id)},{$set:{path:path}},(error1,r1)=>
	 	{
	 		console.log(r1)
	 		console.log("updated",req.headers.userid)
	 		getUser(res,req.headers.userid)

	 	})
	})
  // res.json({path: file.path})
  
})
var client = mongo.MongoClient;
var objectId=mongo.ObjectId;
var url="mongodb+srv://angel:angel@cluster0.xmcvr.mongodb.net/clone?retryWrites=true&w=majority"
client.connect(url,function(err,db)
	{
		var id="5fc37fdf0fa17805bc4bb60a"

		console.log('database')
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
app.get('/search/:query',(req,res) =>
{
	const {query} = req.params
	var users=[]
	console.log(query)
	client.connect(url,function(err,db)
	{
		var database= db.db('Clone').collection('users')
		var r1=database.find({id: { $regex:'^'+query  } })
			// console.log(r1)
			r1.forEach((r)=>
			{
				users.push(r)				
			},()=>
			{
				console.log(users)
				res.json(users)
			})
	})
})







app.post('/likeComment',(req,res)=>
{
	const {postID,cmtID,userID} = req.body;
	client.connect(url,function(err,db)
	{
		assert.equal(null,err)
		var post = db.db('Clone').collection('post')
		post.updateOne({"_id":objectId(postID),"comments._id":objectId(cmtID)},{$inc: {"comments.$.likes":1}},(error1,r1) =>
		{
			post.updateOne({"_id":objectId(postID),"comments._id":objectId(cmtID)},{$push: {like:userID}},(error2,r2) =>
			{
				console.log(error1)
				assert.equal(null,error2);
				console.log("You liked this comment");
				db.close();
				res.json("done")
			})
			
		})
	})	
})
app.post('/reply',(req,res)=>
{
	const {postID,userID,cmtID,reply} = req.body;
	const rly={
		"_id":objectId(),
		"user":userID,
		"reply":reply
	}
	client.connect(url,function(err,db)
	{
		assert.equal(null,err)
		var post=db.db('Clone').collection('post')
		post.updateOne({"_id":objectId(postID),"comments._id":objectId(cmtID)},{$push:{"comments.$.replies":rly}},(error1,r1)=>
		{
			assert.equal(null,error1)
			res.json(rly)
			console.log(r1)
		})
	})
})
app.post('/comment',(req,res)=>
{
	const {postID,userID,cmt} = req.body;
	const comment={
		"_id":objectId(),
		"user":userID,
		"comment":cmt,
		"likes":0,
		"like":[],
		"replies":[]
	}
	client.connect(url,function(err,db)
	{
		assert.equal(null,err)
		var post=db.db('Clone').collection('post')
		post.updateOne({"_id":objectId(postID)},{$push:{comments:comment}},(error1,r1)=>
		{
			assert.equal(null,error1)
			console.log('done')
			res.json(comment)
		})
	})
})
app.post('/share',(req,res) =>
{
	const {postID,userID}=req.body;
	client.connect(url,function(err,db)
	{
		assert.equal(null,err)
		var post = db.db('Clone').collection('post')
		post.updateOne({"_id":objectId(postID)},{$inc: {noOfShare:1}},(error1,r1) =>
		{
			assert.equal(null,error1);
			console.log("You shared this post");
			db.close();
			res.json("done")
		})
	})	
})
app.post('/like',(req,res) =>
{
	const {postID,userID}=req.body;
	client.connect(url,function(err,db)
	{
		assert.equal(null,err)
		var post = db.db('Clone').collection('post')
		post.updateOne({"_id":objectId(postID)},{$push: {likes:userID}},(error1,r1) =>
		{
			assert.equal(null,error1);
			console.log("You liked this post");
			db.close();
			res.json("done")
		})
	})	
})
app.get("/profile/:id",(req,res) =>
{
	getUser(res,req.params.id)
})
const getFriends=(userid,res) =>
{
	console.log(userid)
	client.connect(url,function(err,db)
	{
		var user = db.db('Clone').collection('users')
		user.findOne({"id": userid},(error1,u)=>
		{
			console.log(u.friends)
			res.json(u.friends)
			db.close()
		})
	})
}
app.get('/friends',(req,res)=>
{
	getFriends(req.body.userid,res)
})
app.get("/feeds/:id",(req,res)=>
{
	const id = req.params.id;
	var postList =[]
	var noOfFriends=0
	var noOfPost=0
	client.connect(url,function(err,db)
	{
		assert.equal(null,err)
		var user = db.db('Clone').collection('users')
		var database = db.db('Clone').collection('post')
		user.findOne({"_id":objectId(id)},(error1,u)=>
		{
			assert.equal(null,error1)
			u.friends.push(u.id)
			console.log("friends",u.friends.length)
			u.friends.forEach((friend, index, array)=>
			{
				noOfFriends=noOfFriends+1
				user.findOne({"id":friend},(error2,f)=>
				{
					console.log("friend ",index,"   ",f.post.length," ",noOfPost)
					noOfPost=noOfPost+f.post.length
					f.post.forEach((p,i, array2)=>
					{

						database.findOne({"_id":objectId(p)},(error3,fp)=>
						{
							postList.push(fp)	
							if(noOfFriends===u.friends.length && noOfPost===postList.length)
							{
								console.log("posts",postList.length)
								res.json(postList)
								db.close()
							}						
						})
					})
				})				
			})
 		})
	})
})
app.post('/Unfriend',(req,res)=>
{
	const {userID,userName,friendName} = req.body;
	client.connect(url,function(err,db)
	{
		var user = db.db('Clone').collection('users')
		user.updateOne({"_id": objectId(userID)},{$pull:{friends:friendName}},(error1,r1)=>
		{
			assert.equal(null,error1)
			user.updateOne({"id": friendName},{$pull:{friends:userName}},(error2,r2)=>
			{
				assert.equal(null,error2)
				console.log(userName+" Unfriended "+friendName);
				res.json("Unfriended")
				db.close();			
			})
		})
	})
})
app.post('/acceptRequest',(req,res)=>
{
	const {userID,userName,requestName} = req.body;
	client.connect(url,function(err,db)
	{
		var user = db.db('Clone').collection('users')
		user.updateOne({"_id": objectId(userID)},{$pull:{request:requestName}},(error1,r1)=>
		{
			assert.equal(null,error1)
			user.updateOne({"id": requestName},{$pull:{pending:userName}},(error2,r2)=>
			{
				assert.equal(null,error2)
				user.updateOne({"_id": objectId(userID)},{$push:{friends:requestName}},(error3,r3)=>
				{
					assert.equal(null,error3)
					user.updateOne({"id": requestName},{$push:{friends:userName}},(error4,r4)=>
					{
						assert.equal(null,error4)
						console.log(userName+" accepted "+requestName+"'s request");
						res.json("accepted")
						db.close();
					})
				})				
			})
		})
	})
})
app.post('/cancelRequest', (req,res)=>
{
	console.log("in")
	const {userID,userName,requestName} = req.body;
	client.connect(url,function(err,db)
	{
		console.log("in")
		var user = db.db('Clone').collection('users')
		user.updateOne({"_id": objectId(userID)},{$pull:{pending:requestName}},(error1,r1)=>
		{
			console.log("in")
			assert.equal(null,error1)
			user.updateOne({"id": requestName},{$pull:{request:userName}},(error2,r2)=>
			{
				console.log("in")
				assert.equal(null,error2)
				console.log(userName+" canceled "+requestName+"'s request");
				res.json("canceled")
				db.close();
								
			})
		})
	})
})
app.post('/request',(req,res)=>
{
	const {userID,userName,requestName} = req.body;
	client.connect(url,function(err,db)
	{
		var user = db.db('Clone').collection('users')
		user.updateOne({"_id": objectId(userID)},{$push:{pending:requestName}},(error1,r1)=>
			{
				console.log(r1)
				user.updateOne({"id": requestName},{$push:{request:userName}},(error2,r2)=>
				{
					console.log(r2)
					console.log("requested");
					res.json("requested")
					db.close();
				})
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

app.get('/hashtags/:hashtag',(req,res)=>
{
	const {hashtag}=req.params;
	client.connect(url,function(err,db)
	{
		var found=[]
		var database = db.db('Clone').collection('post')
		var find=database.find({hashtags:"#"+hashtag})
		find.forEach((f,error)=>
		{
			assert.equal(null,error)
				found.push(f)
			if(found.length===10)
				res.json(found.reverse())
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
		"user":userID,
		"caption":caption,
		"hashtags":hashtags,
		"likes":[],
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
			user.updateOne({"id": userID},{$push:{post:r.insertedId}},(error2,r2)=>
			{
				console.log(r2)
				console.log("Posted");
				res.json(post)
				db.close();
			})
		})
	})
}
app.post('/getUser',(req,res)=>
{
	getUser(res,req.body.id)
})
const getUser =(res,id) =>
{
	console.log("logged");
	var userData,postList=[]
	client.connect(url,function(err,db)
	{
		var post= db.db('Clone').collection('post')
		var database = db.db('Clone').collection('users').findOne({"id":id},(error,user)=>
		{
			console.log("getting user");
			assert.equal(null,error)
			console.log(user);
			userData=user;
			var cursor=post.find({ "_id": { $in: user.post }}).limit(10)
			cursor.forEach((c)=>
			{
				postList.push(c)
			},()=>
			{
				console.log('sent')
				res.json({"user":userData,"post":postList})
			})
		})
	})
}
app.post('/login',(req,res)=>
{
	console.log('login')
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
			else
			{
				res.json({error:"Wrong credentials"})
			}
		})
	})
})
app.post('/signup',(req,res)=>
{
	console.log('in')
	const {id,email,password} = req.body;
	const hash=jwt.sign({password:password},'spindle');
	const newUser=
	{
	"id":id,
	"email":email,
	"post":[],
	"friends":[],
	"request":[],
	"pending":[]
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
					console.log('going')
					getUser(res,id)
				})
			}
		})
		
	})
	
})
app.listen(3000 || process.env.PORT );
