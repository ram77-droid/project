var user= require('./schemas.js');
var express = require('express');   
var app = express();
var body_parser = require('body-parser');
app.use(body_parser.json());
var jwt = require('jsonwebtoken');
module.exports.check= function check(req,res,next)
{
    if(req.headers.authorization)
    {
        token=req.headers.authorization.split(' ')[1];
        var vary=jwt.verify(token,'ram');
        user.users.findOne({token:vary.token},function(err,result){
            if(err)
            {
                return res.json({
                    message:err.message
                });
            }
            if(result)
            {
                console.log("result is:",result);
                next();               
               
            }
            else
            {
                return res.json({
                    message:"token not found!!"
                })
            }
        });
    }
    else
    {
        return res.json({
            message:"not authorized!!"
        });
    }

};