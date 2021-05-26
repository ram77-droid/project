var user= require('./schemas.js');
const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
var body_parser = require('body-parser');
app.use(body_parser.json());

io.on('connection', function (socket) {
    console.log('connected');   
    socket.on('disconnect', function () {
    console.log('disconnected'); 
}); 
socket.on('ram',function(req){
    console.log("rammmm");
    obj={
        sender_id:req.sender_id,
        receiver_id:req.receiver_id,
        chat_id:req.chat_id,
        message:req.message
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
            console.log("result agya")
        }
    });
});
});

//server.listen(4000);
server.listen(4000, function(){
    console.log('Server listening on port 4000');
});