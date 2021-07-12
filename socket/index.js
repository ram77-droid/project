var user= require('../schemas.js');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var body_parser = require('body-parser');
app.use(body_parser.json());

// socket.on('disconnect', function () {
//     console.log('disconnected'); 
// }); 
io.on('connection', function (socket) {
    console.log('connected');   
   
    socket.on('disconnect', function () {
            console.log('disconnected'); 
        }); 
    socket.on('join', function (req) {
    socket.join(req.user_id);
    console.log("reqq",req.user_id);
    io.sockets.in(req.user_id).emit("join" , { status: 1 , message: "Sucessfully Joined."});
    
        // if(req.user_id)
        // {
        //     console.log("user:",req.user_id);
        //     user.users.findOne({_id:req.user_id},function(err,result){
        //         if(err)
        //         {
        //             return err;
        //         }
        //         else if(result)
        //         {
        //             console.log("join");
        //             console.log("reqqq",req.user_id);
        //             io.sockets.emit('join', { status: 1 , message: "Sucessfully Joined."});
        //         }
        //         else
        //         {
        //             io.sockets.emit('join', { status: 1 , message:"something went wrong" });
        //         }
        //     });
        //     } 
        });   

        socket.on('initialize',function(req){
            console.log("initialize");
            console.log("req:",req);
        
            user.chat.findOne({$or:[{sender_id:req.sender_id,receiver_id:req.receiver_id},{sender_id:req.receiver_id,receiver_id:req.sender_id}]},function(err,result)
            {
                if(err)
                {
                    io.sockets.emit('initialize', { status: 1 , message:"an error occur"});
                }
                else if(result)
                {
                    io.sockets.emit('initialize', { status: 1 , message:"chat initialized already"});
                }
                else
                {
                    obj={
                        sender_id:req.sender_id,
                        receiver_id:req.receiver_id  
                    }
                    console.log("objjj:",obj);
                    user.chat.create(obj,function(err,result){

                        if(err)
                        {
                            io.sockets.emit('initialize', { status: 1 , message:err});
                        }
                        else if(result)
                        {
                            console.log("result:",result);
                            console.log("result agya")
                            io.sockets.emit('initialize', { status: 1 , message:"chat initialized"});
                        }
                    });
                }
            });  
        });

        socket.on('viewmessage',function(req){
            user.message.find({$or:[{receiver_id:req.receiver_id},{sender_id:req.sender_id}]},function(err,result)
            {
                if(err)
                {
                    return err;
                }
                else if(result)
                {

                    console.log("res:",result[0].receiver_id);
                    if(req.receiver_id==result[0].receiver_id || req.sender_id==result[0].sender_id)
                    {

                    
                    console.log("result:",result[0].message);
                    io.sockets.emit('viewmessage',result[0].message);

                    }
                    
                }
                else
                {
                    io.sockets.emit('viewmessage',{status:1,message:"not good"});
                }
            }).sort({message:-1});
        // if(req.receiver_id || req.sender_id)
        // {
        
            
        // }
        });

    socket.on('sendmessage',function(req){
        console.log("req:",req);
        console.log("ttype",typeof(req));
        console.log("chat id",req.chat_id);
        // io.sockets.emit('mess',{status:1,message:"mess"});
       
        user.chat.findOne({_id:req.chat_id},function(err,result){
            
            if(err)
            {
                io.sockets.emit('sendmessage',{status:1,message:err.message});
            }
            else if(result)
            {
                console.log("result is",result.sender_id);
                console.log("result is",result.receiver_id);
                console.log("req sender id is",req.sender_id);
                console.log("req receiver id is",req.receiver_id);
                if(result.sender_id==req.sender_id||result.sender_id==req.receiver_id && result.receiver_id==req.sender_id||result.receiver_id==req.receiver_id)
                {
                    obj={
                            chat_id:req.chat_id,
                            sender_id:req.sender_id,
                            receiver_id:req.receiver_id,
                            message:req.message
                        }

                    console.log("object:",obj);
                    user.message.create(obj,function(err,result){
                        if(err)
                        {
                            io.sockets.emit('sendmessage',{status:1,message:err.message});
                        }
                        else if(result)
                        {
                            console.log("resulttt",result.message);
                            io.sockets.emit('sendmessage',{status:1,message:"message sent"});
                            io.sockets.in(req.receiver_id).emit('viewmessage',result.message);
                            io.sockets.in(req.sender_id).emit('viewmessage',result.message);
                        }
                        else
                        {
                            console.log("something went wrong");
                        }
                    });

                }
                else
                {
                    console.log("error");
                    io.sockets.in(req.receiver_id).emit('sendmessage',{status:1,message:"some thing went wrong!!..check the ids"});
                    io.sockets.in(req.sender_id).emit('sendmessage',{status:1,message:"some thing went wrong!!..check the ids"});

                }             
            }  
            else
            {
                console.log("soemthing went wrong");
            }
        });
       
    });
});


  server.listen(4000, function(){
    console.log('Server listening on port 4000');
});
