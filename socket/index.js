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
   // socket.join(req.user_id);
    
        if(req.user_id)
        {
            console.log("user:",req.user_id);
            user.users.findOne({_id:req.user_id},function(err,result){
                if(err)
                {
                    return err;
                }
                else if(result)
                {
                    console.log("join");
                    console.log("reqqq",req.user_id);
                io.sockets.emit('join', { status: 1 , message: "Sucessfully Joined."});
                }
                else
                {
                    io.sockets.emit('join', { status: 1 , message:"something went wrong" });
                }
            });
            } 
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
        if(req.user_id)
        {
        
            user.message.find({receiver_id:req.user_id},function(err,result)
            {
                if(err)
                {
                    return err;
                }
                else if(result)
                {

                    console.log("res:",result[0].receiver_id);
                    if(req.user_id==result[0].receiver_id)
                    {

                    
                    console.log("result:",result[0].message);
                    io.sockets.emit('viewmessage',{status:1,mess:result[0].message});

                    }
                    
                }
                else
                {
                    io.sockets.emit('viewmessage',{status:1,message:"not good"});
                }
            }).sort({message:-1});
        }
        });

    socket.on('sendmessage',function(req){
        console.log("req:",req);
        // io.sockets.emit('mess',{status:1,message:"mess"});
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
                console.log('err:',err);
            }
            else if(result)
            {
                console.log("resulttt",result);
                io.sockets.emit('sendmessage',{status:1,message:"message sent"});
            }
            else
            {
                console.log("something went wrong");
            }
        });
    });
});


  server.listen(4000, function(){
    console.log('Server listening on port 4000');
});
