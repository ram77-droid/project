    var user= require('./schemas.js');
    var express = require('express');   
    var app = express();
    var mongoose = require('mongoose');
    var md = require('md5');
    var body_parser = require('body-parser');
    app.use(body_parser.json());
    var jwt = require('jsonwebtoken');
    var midleware= require('./verify.js');
    var ejs = require('ejs');
    var session = require('express-session');
    app.use(body_parser.urlencoded({ extended: false }))

    var mail= /^[a-zA-Z0-9_\-]+[@][a-z]+[\.][a-z]{2,3}$/;
    var pass= /^[0-9]{4,}$/;

    var ObjectId=mongoose.Types.ObjectId;

    // sign up API for users
    app.post('/signup',function(req,res){
           
        if(mail.test(req.body.email)==false || req.body.email==' '|| req.body.email==null)
        {
            return res.json({
                message:"enter valid email."
            });
        }
       
        else
        {
                user.adminuser.findOne({email:req.body.email},function(err,result){
                if(err)
                {
                    return res.json({
                        message:err.message
                    });
                }
                else if(result)
                {
                     req.body.password=md(req.body.password);
                    obj={
                        username:req.body.username,
                        fullname:req.body.fullname,
                        email:req.body.email,
                        password:req.body.password
                    };
                   user.users.create(obj,function(err,success){
                       if(err)
                       {
                           return res.json({
                               message:err.message
                           });
                       }
                       else if(success)
                       {
                           return res.status(200).json({
                                status:200,
                               message:"signup successful"
                           });
                       }
                       else
                       {
                           return res.status(400).json({
                               status:400,
                               message:"something went wrong!!"
                           });
                       }
                   })

                }
                else
                {
                    return res.status(400).json({
                        status:400,
                        message:"email not found"
                    });
                }
            });
        }

    });

    // login API for users
    app.post('/login',function(req,res){

      if(pass.test(req.body.password)==false || req.body.password==' '|| req.body.password==null)
        {
            return res.json({
                message:"enter valid password."
            });
        }

        else
        {
            req.body.password=md(req.body.password);
            user.users.findOne({username:req.body.username,password:req.body.password},function(find_err,find_success){
                if(find_err)
                {
                    return res.json({
                        message:find_err.message
                    });
                }
                else if(find_success && find_success!=null)
                {
                    console.log('success:',find_success);
                    if(find_success.username===req.body.username && find_success.password===req.body.password)
                    {
                    obj={
                        _id:find_success._id,
                        username:find_success.username
                        }
                        jwt.sign(obj,'ram',function(err,success){
                            if(err)
                            {
                                return res.json({
                                    message:err.message
                                });
                            }
                            else if(success)
                            {
                            console.log('token:',success);
                            user.users.updateOne({_id:find_success._id},{device_token:req.body.device_token,token:success},
                            function(err,result){
                                if(err)
                                {
                                    return res.json({
                                        message:err.message
                                    });
                                }
                                if(result)
                                {
                                    obj={
                                        id: find_success._id,
                                        username: find_success.username,
                                        fullname: find_success.fullname,
                                        email:find_success.email
                                    }
                                    return res.status(200).json({

                                        token:success,
                                        data:obj,
                                        status:200,
                                        message:"login successful!!"
                                    });
                                }
                                else
                                {
                                    return res.status(400).json({
                                        status:400,
                                        message:"username or password not matched"
                                    });
                                }
                            });                              
                                                             
                            }
                        });
                       
                    }
                    else
                    {
                        return res.json({
                            message:"username or password doesn't match.."
                        });
                    }
                   
                }
                else
                {
                    return res.json({
                        message:"username or password doesn't match.."
                    });
                }
            });
        }

        
    });

    // logout API for users
    app.get('/logout',midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        console.log('token :',token);
        var vary=jwt.verify(token,'ram');
        console.log("result:",vary);
        user.users.updateOne({_id:vary._id},{device_token:null,token:null},function(err,result){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            if(result)
            {
                return res.json({
                    message:"you are logged out"
                });
            }

        });
    });

    //forget password API
    app.post('/forgetpassword',function(req,res){
        user.users.findOne({email:req.body.email},function(err,success){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            if(success)
            {
                if(req.body.email===success.email)
                {
                    return res.json({
                        message:"email found"
                    });
                }
               
            }
            else
            {
                return res.json({
                    message:"email doesn't exists"
                });
            }
        });
    });

    // new password API
    app.post('/newpassword',function(req,res){
        user.users.findOne({email:req.body.email},function(err,success){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            if(success)
            {
                console.log('success:',success);
                if(req.body.email===success.email)
                {
                  req.body.password=md(req.body.password);
                  if(req.body.password===success.password)
                  {
                    req.body.newpassword=md(req.body.newpassword);
                      user.users.updateOne({email:req.body.email},{password:req.body.newpassword},function(err,result){
                          if(err)
                          {
                              return res.json({
                                  message:err.message
                              });
                          }
                          if(result)
                          {
                              return res.json({
                                  message:'paasword updated!!'
                              });
                          }
                      });
                    }
                    else
                    {
                        return res.json({
                            message:"old password is not matched"
                        });
                    }
                   
                }
                else
                {
                    return res.json({
                        message:"email not found"
                    });
                }
               
            }
            else
            {
              return res.json({
                  message:"email not found"
              });
            }
        });
        
    });

    // profile API
    app.get('/view',midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        console.log('vary',vary._id);
        user.users.findOne({_id:vary._id},function(err,result){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            if(result)
            {
                // obj={
                //     username:result.username,
                //     fullname:result.fullname,
                //     email:result.email
                // };
                user.users.aggregate([
                    {
                        $match:
                        {
                          "_id":ObjectId(vary._id)
                        }
                     },
                 
                    
                    
            
                {
                  $lookup:
                  {
                      from:"followers",
                    //   localField:"_id",
                    //   foreignField:"user_id",
                    let:{
                        userid : "$_id",
                        status:true
                    },
                      pipeline:[
                          {
                              $match:
                              {
                                $expr:{
                                    $and:[
                                      { "$eq": [ "$$userid", "$user_id" ] ,
                                        "$eq": [ "$$status", "$status" ] 
                                      }
                                    ]
                                }
                                 
                              }
                          }
                      ],
                      as:"user_follow"
                  }
                },
                // {
                // $unwind:
                //     {
                //         path:"$user_follow",
                //         preserveNullAndEmptyArrays:true
                // }
                // },

                {
                    $lookup:
                    {
                        from:"followings",
                      //   localField:"_id",
                      //   foreignField:"user_id",
                      let:{
                          userid : "$_id",
                          status:true
                      },
                        pipeline:[
                            {
                                $match:
                                {
                                  $expr:{
                                      $and:[
                                        { "$eq": [ "$$userid", "$user_id" ],
                                        "$eq":["$$status","$status"]
                                       }
                                      ]
                                  }
                                   
                                }
                            }
                        ],
                        as:"following_user"
                    }
                  },
                //        {
                //         $unwind:
                //         {
                //             path:"$following_user",
                //         preserveNullAndEmptyArrays:true
                //        }
                //        },

                       {
                            $addFields:
                            {  
                               followers: {$size:"$user_follow"},
                               following:{$size:"$following_user"}
                            }
                        },

            
                        {

                            $lookup:
                            {
                                from:"posts",
                                // localField:"_id",
                                // foreignField:"user_id",
                                let:
                                {
                                    userid : "$_id"
                                },
                                pipeline:[
                                    {
                                        $match:
                                        {
                                          $expr:
                                          {
                                              $and:[
                                                { "$eq": [ "$$userid", "$user_id" ] }
                                              ]
                                          }
                                        }
                                    },
                                     {
                                        $project:
                                        {
                                            "caption":1,
                                            "image":1         
                                        }
                                     }
                                ],
                                as:"users_post"
        
                            }
                        },                      
                   
                   {
                       $project:
                       {
                           username:1,
                           fullname:1,
                              email:1,
                          followers:1,
                          following:1,
                           "users_post._id":1,
                           "users_post.image":1
                          // "user_follow":1,
                          // "user_follow.follower":1
                        //    "following_user":1

                       },
                       
                    }
                   
                ],function(err,result){
                    if(err)
                    {
                        return res.json({
                            message:err.message
                        });
                    }
                    else if(result)
                    {
                        return res.status(200).json({
                            status:200,
                            data:result,
                            message:"done!!"
                        });
                    }
                    else
                    {
                        return res.status(400).json({
                            status:400,
                            message:"not done!!"
                        });
                    }
                });
               
            }       
        });     
       
    });


    const multer= require('multer');
    const path= require('path');
    app.use(express.static(__dirname));
    console.log('dirname',__dirname);
    const storage= multer.diskStorage({
        destination: function(req,file,callback){
            callback(null,__dirname+'/pictures');
        },
        filename: function(req,file,callback){
            callback(null,file.fieldname+'-'+ Date.now()+ path.extname(file.originalname));
        }
    });
    const upload=multer({storage:storage});

    // post API for post collection
    app.post('/post',upload.any(),midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        obj={
            user_id:vary._id,
            caption:req.body.caption,
            image:'http://192.168.1.75:3000/pictures/'+req.files[0].filename,
            post_at:Date.now()
        };
     user.posts.create(obj,function(err,result){
         if(err)
         {
             return res.status(400).json({
                 status:400,
                 message:err.message
             });
         }
         else if(result)
         {
             return res.status(200).json({
                 status:200,
                 data:result,
                 message:"post created!!"                
             });

         }
         else
         {
            return res.status(400).json({
                status:400,
                message:"something wrong!!"                
            });
         }
     });

    });

    // comment API for comment collection
    app.post('/comment',function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        console.log("result:",vary);
        obj={
            user_id:vary._id,
            post_id:req.body.post_id,
            comment:req.body.comment,
            comment_at:Date.now()
        }
        user.comment.create(obj,function(err,result){
            if(err)
            {
                return res.status(400).json({
                    status:400,
                    message:err.message
                });
            }
            else if(result)
            {
                return res.status(200).json({
                    status:200,
                    data:result,
                    message:"comment added."
                });
            }
            else
            {
                return res.status(400).json({
                    status:400,
                    message:"something wrong"
                });
            }
        })
    });

    // like API for like collection
    app.post('/like',midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        obj={
            user_id:vary._id,
            post_id:req.body.post_id,
            like_status:req.body.like_status,
            liked_at:Date.now()
        }
        user.like.create(obj,function(err,result){
            if(err)
            {
                return res.status(400).json({
                    status:400,
                    message:err.message
                });
            }
            if(result)
            {
                if(req.body.like_status==true )
                {
                    return res.status(200).json({
                        status:200,
                        message:"liked!!"
                    });
                }
                else
                {
                    return res.status(200).json({
                        status:200,
                        message:"disliked!!"
                    });
                }
               
            }
            else
            {
                return res.status(400).json({
                    status:400,
                    data:result,
                    message:"something wron!!."
                });

            }
        });
    });

    app.get('/deleteaccount',midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        user.users.deleteOne({_id:vary._id},function(err,result){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            else if(result)
            {
                return res.json({
                    message:"your account is deleted"
                });
            }
            else
            {
                return res.json({
                    message:"token not found!!"
                });
            }
        });
    });

     //following API
    app.post('/requestfollow',midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        console.log("token:",token);
        user.users.findOne({_id:vary._id},function(err,find_success){
            console.log("success:",find_success);
            if(err)
            {
                return res.status(400).json({
                    status:400,
                    message:err.message
                });
            }
            else if(find_success)
            {
                user.following.findOne({user_id:find_success._id,following_user_id:req.body.following_user_id},function(err,result){
                    console.log("result:",result);
                    if(err)
                    {
                        return res.json({
                            message:err.message
                        });
                    }
                    else if(result)
                    {
                        if(result.status==true)
                        {
                            user.following.updateOne({_id:result._id},{status:false},function(err,success){
                                if(err)
                                {
                                    return res.json({
                                        message:err.message
                                    });
                                }
                                else if(success)
                                {
                                    return res.json({
                                        message:"unfollow successful!!"
                                    });
                                }
                            });
                        }

                        else if(result.status==false)
                        {
                            user.following.updateOne({_id:result._id},{status:true},function(err,success){
                                if(err)
                                {
                                    return res.json({
                                        message:err.message
                                    });
                                }
                                else
                                if(success)
                                {
                                    return res.json({
                                        message:"follow successful!!"
                                    });
                                }
                            });
                        }
                         else 
                         {
                            
                            return res.json({
                                message:"something wrong"
                            });
                         }

                    }
                    else 
                    {
                       obj={
                           user_id:vary._id,
                           following_user_id:req.body.following_user_id,
                           status:req.body.status
                       }
                        user.following.create(obj,function(err,result){
                            if(err)
                            {
                                return res.json({
                                    message:err.message
                                });
                            }
                            else if(result)
                            {
                                return res.json({
                                    message:"following"
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    //follower API
    app.post('/acceptfollow',midleware.check,function(req,res){
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        user.users.findOne({_id:vary._id},function(err,find_success){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            else if(find_success)
            {
                user.follow.findOne({user_id:find_success._id},function(err,success){
                   
                    if(err)
                    {
                        return res.json({
                            message:err.message
                        });
                    }
                    else if(success)
                    {
                        if(success.follower_user_id==req.body.follower_user_id && req.body.status==success.status)
                        {
                            return res.json({
                                message:"already exists "
                            });
                        }
                        else
                        {
                             return res.json({
                            message:"something wrong!!"
                             });
                        }
                    }
                    else
                    {
                       
                        obj={
                            user_id:vary._id,
                            follower_user_id:req.body.follower_user_id,
                            status:req.body.status
                        };
                        if(req.body.status==true)
                        {
                            user.follow.create(obj,function(err,result){
                                if(err)
                                {
                                    return res.json({
                                        message:err.message
                                    });
                                }
                                else if(result)
                                {
                                    return res.json({
                                        message:"new follower!!"
                                    });
                                }
                            });

                        }
                        else if(req.body.status==false)
                        {
                            user.follow.updateOne({follower_id:req.body.follower_id},{status:false},function(err,result){
                                if(err)
                                {
                                    return res.json({
                                        message:err.message
                                    });
                                }
                                else if(result)
                                {
                                    return res.json({
                                        message:"unfollowed you!!"
                                    });
                                }
                            });
                        }
                        else
                        {
                            return res.json({
                                message:"no new follower!!"
                            });
                        }
                        
                    }
                });
            }
        });
    });


    // Admin collection API
    app.post('/admin',function(req,res){
        user.admin.create(req.body,function(err,result){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            else if(result)
            {
                return res.json({
                    message:"admin created!!"
                });
            }
            else
            {
                return res.json({
                    message:"not valid!!"
                });
            }
        });
    });


    app.get('/add-user', function(req, res){
        ejs.renderFile('./adduser.ejs',{}, 
                    {}, function (err, template) {
                        // console.log("template",template);
                    if (err) {
                        throw err;
                    } else {
                        res.end(template);
                    }
                });
    });

    app.post('/save-user', function(req, res){
      console.log('req', req.body);
      user.adminuser.create(req.body,function(err,result){
          if(err)
          {
              return res.json({
                  message:err.message
              });
          }
          else if(result)
          {
              res.redirect('/save-user');
          }
          else
          {
              return res.json({
                  message:"not exists"
              });
          }
      });

    });

    //  for Admin page
  app.use(express.static(__dirname+'/pictures'));

    app.use(session({
        secret: 'thisisasecret',
        saveUninitialized: false,
        resave: false
        }));

       // app.set('view engine', 'ejs');
        app.get('/getadmin', function(req,res){     
        ejs.renderFile('./useradmin.ejs', {}, 
            {}, function (err, template) {
                // console.log("template",template);
            if (err) {
                throw err;
            } else {
                res.end(template);
            }
        });
        });

        app.post('/adminlogin', function(req, res){
            console.log('req', req.body.email);
            user.admin.findOne({email:req.body.email},{password:req.body.password},function(err,success){
                if(err)
                {
                    return res.json({
                        message:err.message
                    });
                }
                else if(success)
                {
                    sess = req.session;
                    sess.email = success.email;
                    sess.username= success.email;
    
                    //{user: sess.user}
                    res.redirect('/user-list');
                }
                else
                 {
                    return res.json({
                        message:"not exists"
                    });
                  
                }
            });
     });
    
       app.get('/user-list', function(req, res){

        user.users.find({}, function(err, users){
            console.log('users',users);
            if(users != null)
            {
                ejs.renderFile('./table.ejs', {users:users}, 
                    {}, function (err, template) {
                        // console.log("template",template);
                    if (err) {
                        throw err;
                    } else {
                        res.end(template);
                    }
                });
            }else{
    
            }
        });
             
       });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, function(){
        console.log('Server listening on port 3000');
    });