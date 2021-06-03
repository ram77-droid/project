var user= require('../schemas.js');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var body_parser = require('body-parser');
app.use(body_parser.json());
 //require('events').EventEmitter.prototype._maxListeners = 0;

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
       });
    } 
});   

socket.on('visit',function(req){
    console.log("socket",req);
   
   
    io.sockets.emit('visit',{status:1, message:"hi"});
    console.log("rree",req.user_id);
});

socket.on('ram',function(req){
    console.log("rammmm");
   console.log("id",req.sender_id);
   
  
    obj={
        sender_id:req.sender_id,
        receiver_id:req.receiver_id
        //chat_id:req.chat_id,
        // message:req.message
        
    }
    console.log("req:",req);
    console.log("objjj:",obj);
    user.chat.create(obj,function(err,result){

        if(err)
        {
            console.log("error",err)
        }
        else if(result)
        {
            console.log("result:",result);
            console.log("result agya")
            io.sockets.emit('ram', { status: 1 , message:result});
          

        }
    });
});

 socket.on('mess',function(req){
     console.log("req:",req);
     io.sockets.emit('mess',{status:1,message:"mess"});
     obj={
         chat_id:req.chat_id,
         sender_id:req.sender_id,
         receiver_id:req.receiver_id,
         message:req.message
     }
     user.message.create(obj,function(err,result){
         if(err)
         {
             console.log('err:',err);
         }
         else if(result)
         {
             console.log("resulttt",result);
             io.sockets.emit('mess',{status:1,message:result.message});
         }
         else
         {
             console.log("something went wrong");
         }
     });
 });
});

//server.listen(4000);
server.listen(4000, function(){
    console.log('Server listening on port 4000');
});