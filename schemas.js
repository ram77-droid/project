    var v= require('./projectdatabase.js');
    var express = require('express');   
    var app = express();
    var mongoose = require('mongoose');
    var body_parser = require('body-parser');

    app.use(body_parser.json());
    const {Schema}  = mongoose;

    var user_schema= new Schema({
       username:{type:String, unique:true},
       fullname:String,
       email:{type:String, unique:true},
       password:{type:String},
       device_token:String,
       token:String
     });
     var post_schema= new Schema({
      user_id:{
          type:mongoose.Types.ObjectId,
          ref:"users"
      },
      caption:String,
      image:String,
      post_at:Date
     });

     var comment_schema= new Schema({
      user_id:{
              type:mongoose.Types.ObjectId,
              ref:"users"
          },
          post_id:{
              type:mongoose.Types.ObjectId,
              ref:"posts"
          },
          comment:String,
          comment_at:Date
        });

  var like_schema= new Schema({
   user_id:{
           type:mongoose.Types.ObjectId,
           ref:"users"
       },
       post_id:{
           type:mongoose.Types.ObjectId,
       ref:"posts"
       },
       like_status:Boolean,
       liked_at:Date
      });

      var admin_schema= new Schema(
          {
            username:String,
            email:String,
            password:String
          }
     
      );

      var adminuser_schema= new Schema(
        {        
          email:String
        }
       );

       var follower_schema= new Schema({
           user_id:mongoose.Types.ObjectId,
           follower_user_id:mongoose.Types.ObjectId,
           status:Boolean
       });

       var following_schema= new Schema({
           user_id:mongoose.Types.ObjectId,
           following_user_id:mongoose.Types.ObjectId,
           status:Boolean
       });

    var users = mongoose.model('users',user_schema);
    module.exports.users=users;

    var posts= mongoose.model('posts',post_schema);
    module.exports.posts=posts;

    var comment= mongoose.model('comments',comment_schema);
    module.exports.comment=comment;

    var like= mongoose.model('likes',like_schema);
    module.exports.like=like;

    var admin=mongoose.model('admins',admin_schema);
    module.exports.admin=admin;

    var adminuser=mongoose.model('adminusers',adminuser_schema);
    module.exports.adminuser=adminuser;

    var follow= mongoose.model('followers',follower_schema);
    module.exports.follow=follow;

    var following=mongoose.model('followings',following_schema);
    module.exports.following=following;




