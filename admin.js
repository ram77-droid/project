    var express = require('express');   
    var app = express();
    var body_parser = require('body-parser');
    var session = require('express-session');
    app.use(body_parser.urlencoded({ extended: false }))
    app.use(body_parser.json());
    var ejs = require('ejs');
    var user= require('./schemas.js');

    app.use(express.static(__dirname+'/pictures'));
    
    app.use(session({
        secret: 'thisisasecret',
        saveUninitialized: false,
        resave: false
        }));


    app.set('view engine', 'ejs');
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

    


    app.listen('3000', function(){
        console.log('Server listening on port 3000');
    });