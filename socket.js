const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', function (socket) {
    console.log('connected');    
});
//server.listen(4000);
server.listen(4000, function(){
    console.log('Server listening on port 4000');
});