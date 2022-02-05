const io = require("socket.io")(8900, {
    cors: {
        origin: "http://localhost:3000"
    }
})
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const removeUserWithId = (userId) => {
    users = users.filter((user) => user.userId !== userId);
  };
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };

io.on("connection", (socket) => {
    console.log("a use connected")

    socket.on('addUser',(userId)=>{
        addUser(userId, socket.id);
        console.log(userId)
        io.emit("getUsers", users);
    })
    socket.on('addRoom', (roomId) => {
        console.log(roomId)
        if (roomId) {
            socket.join(roomId)
            io.to(roomId).emit("newJoin", 'a user has join')
        }
    })
    socket.on('leaveRoom',roomId=>{
        socket.leave(roomId)
        io.to(socket.id).emit("leaveMsg",`u re leaving ${roomId}`)
    })
    socket.on('sendMessage',({senderId,conversationId,text})=>{
        socket.to(conversationId).emit('getMessage',{senderId,conversationId,text});
        
        socket.broadcast.emit("MsgNortify",{conversationId})
     })
     socket.on('CreateNewConv',(newConv)=>{
         socket.broadcast.emit('NewConvNotify',newConv)
     })
    socket.on('disconnect', () => {
        console.log("a user disconnected")
        removeUser(socket.id);

        io.emit("getUsers", users);
    })
})